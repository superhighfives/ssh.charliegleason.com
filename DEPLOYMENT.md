# Deployment

`ssh charliegleason.com` and the website at `https://www.charliegleason.com` run
side by side on one domain. Here's how the pieces fit together.

## Overview

Two names, two homes:

- **`www.charliegleason.com` → Cloudflare.** The website is a Cloudflare Workers
  app on a Custom Domain (orange cloud): full CDN, WAF, analytics, and edge
  caching. This is the canonical site and where every browser ends up.
- **`charliegleason.com` (apex) → Fly.** One small Fly machine in London runs two
  listeners inside a single Bun process:
  - `:22` — the SSH TUI ([`@opentui/ssh`](https://www.npmjs.com/package/@opentui/ssh)),
    what you reach with `ssh charliegleason.com`.
  - `:80` / `:443` — a tiny redirect server that 301s every web request to
    `https://www.charliegleason.com`.

The apex is a plain `A` record pointed straight at Fly, DNS-only (grey cloud).
Everything a browser cares about still lives on Cloudflare via `www`; the apex
exists to make the bare `ssh charliegleason.com` command work and to bounce apex
web hits to the canonical `www`.

### Why the apex points at Fly

SSH needs a raw TCP port (`:22`) at the apex. Cloudflare's HTTP proxy (orange
cloud) forwards HTTP(S), so the apex stays DNS-only and resolves straight to the
Fly machine, which answers both `:22` and `:443`. The website stays on Cloudflare,
where the proxy earns its keep. Cloudflare *can* put SSH on the edge — see
[Why not Spectrum?](#why-not-spectrum) — it's just not the right tier for a
personal apex.

### DNS

| Name                     | Type | Target                | Proxy                     |
| ------------------------ | ---- | --------------------- | ------------------------- |
| `charliegleason.com`     | `A`  | Fly IPv4              | DNS only (grey)           |
| `www.charliegleason.com` | —    | Workers Custom Domain | Proxied (orange) — as-is  |

## Setup

The repo's `Dockerfile` and `fly.toml` stand up both listeners.

```bash
# 1. Launch the Fly app (don't deploy yet)
fly launch --no-deploy --copy-config

# 2. Persist the SSH host key on a volume
fly volumes create host_keys --region lhr --size 1

# 3. Dedicated IPv4 (required for :22 at the apex)
fly ips allocate-v4

# 4. Apex TLS cert (Let's Encrypt via Fly)
fly certs create charliegleason.com

# 5. Deploy
fly deploy

# 6. Grab the IP for DNS
fly ips list
```

Then in Cloudflare DNS, add `charliegleason.com` `A` → the Fly IPv4,
**DNS only (grey cloud)**, and leave `www` untouched. `fly certs check
charliegleason.com` reports when the apex cert issues (it needs DNS pointing at
Fly first). After that, `https://charliegleason.com` 301s to `www` and
`ssh charliegleason.com` drops you into the TUI.

Running cost is about $5.50/month: a `shared-cpu-1x` 512MB machine, the dedicated
IPv4, and the 1GB volume.

## Redeploying

`fly deploy` is the only command for updates — Fly builds the Dockerfile on its
remote builder, rolls the machine, and the volume keeps the host key stable
across restarts.

- `fly logs` — live output. `@opentui/ssh`'s logging middleware emits a `connect`
  per session and a `disconnect` (with duration) on teardown; the redirect server
  logs its bind line on boot.
- `fly status` — machine state, region, last deploy.
- `fly ssh console` — Fly's own management SSH into the container (e.g. to inspect
  `/data/host_key`). Separate from the public `:22` service.
- `fly deploy --strategy immediate` — skip the health-check wait when iterating;
  the default rolling strategy is safer for user-facing changes.

One machine by default, so `fly deploy` is a stop-then-start with ~10–30s of
downtime. `fly scale count 2` gives you zero-downtime rolling deploys.

## How it runs

**SSH.** [`@opentui/ssh`](https://www.npmjs.com/package/@opentui/ssh) turns each
connection into an OpenTUI `CliRenderer` wired straight to the SSH channel. One
Bun process serves every client — no per-session child process, no PTY, no native
build deps. The React tree in `src/index.tsx` mounts onto each session's renderer
via `@opentui/react`. The container runs `bun run src/ssh-server.tsx` under tini;
the 1GB volume at `/data` persists the ed25519 host key so clients' `known_hosts`
survive deploys.

**HTTP redirect.** `src/redirect-server.ts` is a ~15-line `Bun.serve` returning a
301 to `${REDIRECT_TARGET}${path}${query}`. It starts from `src/ssh-server.tsx`
after the SSH listener binds, so one process owns both ports; if either fails to
bind, the process exits and Fly restarts it. Fly's edge terminates TLS (`:443` =
`tls, http`, `:80` = `http` + `force_https`); the in-process server only speaks
plaintext on `:8080`.

## Tuning

Env vars in `fly.toml`:

- `SSH_MAX_CONCURRENT` — server-wide session cap (default 50). The in-process model
  is light on memory, so this has headroom if you ever see contention.
- `SSH_IDLE_TIMEOUT_MS` — drop a session after this idle time (default 5 min).
- `SSH_SESSION_MAX_MS` — absolute session lifetime (default 30 min).
- `SSH_RATE_LIMIT_MAX` / `SSH_RATE_LIMIT_WINDOW_MS` — per-IP limit (default 10/min),
  implemented as `@opentui/ssh` middleware in `src/ssh-server.tsx`.
- `REDIRECT_TARGET` — apex 301 target (default `https://www.charliegleason.com`).
- `HTTP_PORT` — internal redirect port (default 8080; matches `internal_port` in
  `fly.toml`).

`fly.toml`'s `services.concurrency` limits sit above these at Fly's edge — keep
them above `SSH_MAX_CONCURRENT` so the app's own limits trip first.

---

## Why not Spectrum?

[Cloudflare Spectrum](https://developers.cloudflare.com/spectrum/) is the
Cloudflare-native way to bring arbitrary TCP — SSH included — onto the edge with
DDoS protection in front. It's a great fit for production platforms; it just isn't
the right tier for a personal apex, for two reasons:

- **Custom ports are an Enterprise capability.** Spectrum on lower plans covers a
  fixed set of well-known applications; arbitrary `:22` to your own origin is
  Enterprise. Sensible gating for an edge-L4 product aimed at platforms.
- **A Spectrum apex is a CNAME, so the name can't be shared.** With Spectrum (or a
  Worker) fronting the apex, the apex resolves through a Cloudflare-managed CNAME.
  DNS won't let a CNAME coexist with another record at the same name (RFC 1034), so
  you can't *also* add the `A` record that points `:22` at Fly — you'd have a CNAME
  for `:443` and no way to attach an `A` for `:22`. It's one or the other at the
  apex, so the apex goes to Fly with a plain `A` and Cloudflare keeps `www`.

If the bare-apex `ssh` were ever optional, the textbook pattern is a subdomain —
`ssh.charliegleason.com`, grey cloud, `A` at Fly — which is what
[Charm](https://charm.sh/) and [terminal.shop](https://www.terminal.shop/) do, and
leaves Cloudflare fully in front of the site.
