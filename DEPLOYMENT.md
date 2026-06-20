# Deployment

So you want `ssh charliegleason.com` to work on the apex - no subdomain - while keeping HTTPS flowing to the existing site. That's the requirement this doc solves for. The repo is configured for the one approach that actually delivers it without an Enterprise Cloudflare contract; the alternatives are documented below so you know why they didn't make the cut.

## The core constraint

SSH needs port 22 (or any TCP port you pick). HTTP needs ports 80 and 443. They're different ports, so they *can* live on the same hostname - but only if the IP that hostname resolves to actually accepts both.

Cloudflare's free, Pro, and Business proxy ("orange cloud") only forwards HTTP(S). Point an A record at Cloudflare's edge and SSH traffic just times out. So the question becomes: where does the apex resolve, and can that destination handle TCP/22 *and* TCP/443?

## Option 1: Apex on Fly, `www` on Workers (the answer)

Point the apex at a Fly machine. That machine runs two listeners:

- `:22` - `@opentui/ssh`, the TUI server in this repo
- `:443` - a tiny Bun HTTP server that 301s every request to `https://www.charliegleason.com`

Cloudflare's proxy comes off the apex - it's a plain `A` record at the Fly IP, grey cloud. `www.charliegleason.com` keeps its existing Worker Custom Domain on orange cloud, untouched: full CDN, WAF, analytics, the lot. Browsers that hit the apex get bounced to `www` once, search engines consolidate on `www` as canonical, and the SSH command terminates straight at the Fly machine.

The redirect hop on apex web traffic is a single 301 with no body. Cost is negligible and only fires on the bare-domain entry point - links to `www` skip it entirely.

Both processes run inside one Bun process. No Caddy, no sidecar, no second container. `src/redirect-server.ts` is started from `src/ssh-server.tsx` right after the SSH listener binds.

### DNS

- `charliegleason.com` `A` → Fly IPv4, **grey cloud / DNS only**
- `www.charliegleason.com` → existing Worker Custom Domain, orange cloud (no change)

### How to set it up

The repo includes a Dockerfile and `fly.toml` that handles both listeners.

```bash
# 1. From the repo root, launch a Fly app
fly launch --no-deploy --copy-config

# 2. Create a 1GB volume to persist the SSH host key
fly volumes create host_keys --region lhr --size 1

# 3. Allocate a dedicated IPv4 (required for port 22 on the apex)
fly ips allocate-v4

# 4. Provision a Let's Encrypt cert for the apex
fly certs create charliegleason.com

# 5. Deploy
fly deploy

# 6. Get the IP for your DNS record
fly ips list
```

Then in Cloudflare DNS:

1. Delete the existing Spectrum-managed CNAME at the apex (see Option 2 below for why).
2. Add an `A` record: `charliegleason.com` → the Fly IPv4 address, **DNS only (grey cloud)**.
3. Leave `www.charliegleason.com` alone.

`fly certs check charliegleason.com` will tell you when the cert is issued - it needs the DNS to be pointing at Fly first. After that, `https://charliegleason.com` 301s to `https://www.charliegleason.com` and `ssh charliegleason.com` works.

Total cost on Fly: about $5.50/month for a `shared-cpu-1x` 512MB machine plus the dedicated IPv4 and 1GB volume.

### Redeploying

After the initial setup, `fly deploy` is the only command you need. Fly builds the Dockerfile on its remote builder, rolls the machine, and the volume keeps your host key persistent across restarts.

A few flags worth knowing:

- `fly logs` tails live output. `@opentui/ssh`'s built-in logging middleware emits a `connect` event per session and a `disconnect` (with duration) on teardown. The redirect server logs its bind line on boot.
- `fly status` shows the machine state, region, and last deploy.
- `fly ssh console` opens Fly's own management SSH into the running container - useful for poking at `/data/host_key` or checking processes. This is separate from the public SSH service on `:22`.
- `fly deploy --strategy immediate` skips the health-check wait if you're iterating quickly. The default rolling strategy is safer for anything user-facing.

The repo runs as a single machine by default. That means `fly deploy` is a stop-then-start with ~10-30s of downtime. If you want zero-downtime deploys, run two machines with `fly scale count 2` first; Fly will then roll them one at a time.

### How the SSH side works

The server uses [`@opentui/ssh`](https://www.npmjs.com/package/@opentui/ssh), which turns each incoming SSH connection into an OpenTUI `CliRenderer` wired straight to the SSH channel. One Bun process serves every client - no per-session child process, no PTY, no native build dependencies. The React tree in `src/index.tsx` mounts onto each session's renderer via `@opentui/react`'s `createRoot`.

The container runs `bun run src/ssh-server.tsx` under tini for clean signal handling. A 1GB volume mounts at `/data` to persist the ed25519 host key across deploys - first boot generates it, every boot after that loads it. Same host key means clients' `known_hosts` entries keep working through restarts.

### How the HTTP redirect works

`src/redirect-server.ts` is a ~15-line `Bun.serve` that returns a 301 to `${REDIRECT_TARGET}${path}${query}` for every request. It's started from `src/ssh-server.tsx` after the SSH listener binds, so a single Bun process owns both listeners. If either listener fails to bind, the process exits and Fly restarts the machine.

Fly's edge handles TLS termination: `:443` is configured with the `tls, http` handlers, `:80` with `http` and `force_https`. The internal listener only speaks plaintext on `8080`, which keeps the in-process server trivial. Cert issuance is automatic via Fly's Let's Encrypt integration after `fly certs create`.

### Tuning

The defaults are conservative for a kiosk-style TUI. Env vars in `fly.toml` worth knowing about:

- `SSH_MAX_CONCURRENT` - hard cap on simultaneous sessions across the server. Default 50. The in-process model uses a fraction of the memory the old PTY-spawn model needed, so this can climb if you actually see contention.
- `SSH_IDLE_TIMEOUT_MS` - drop a session after this long with no client input. Default 5 minutes.
- `SSH_SESSION_MAX_MS` - absolute lifetime cap regardless of activity. Default 30 minutes.
- `SSH_RATE_LIMIT_MAX` / `SSH_RATE_LIMIT_WINDOW_MS` - per-IP rate limit, defaults to 10 connection attempts per minute. Implemented as `@opentui/ssh` middleware in `src/ssh-server.tsx`.
- `REDIRECT_TARGET` - where the apex 301s to. Defaults to `https://www.charliegleason.com`.
- `HTTP_PORT` - internal port the redirect server binds. Defaults to 8080 and matches the `internal_port` on the HTTP service in `fly.toml`.

`fly.toml`'s `services.concurrency` limits sit one layer above these - they tell Fly's proxy when to start queueing or rejecting at the edge. Keep them above `SSH_MAX_CONCURRENT` so the app's own limits are what trip first.

## Option 2: Cloudflare Spectrum (confirmed dead-end without Enterprise)

Spectrum is the theoretical clean answer: map TCP/22 on Cloudflare's edge to a Fly origin, keep HTTPS on the same hostname flowing to the existing Worker, get DDoS protection on both. In practice it doesn't work for this setup, and I've confirmed it empirically.

- **Plan gating.** Custom SSH-on-port-22 applications need Enterprise. Business ($200/month) only covers a fixed list of well-known protocols (Minecraft, FTP) routed to Cloudflare-managed origins, not arbitrary :22 to your own machine.
- **The apex DNS record is a CNAME, and DNS forbids siblings.** Once Spectrum is configured for the apex, the record shown in Cloudflare DNS is a Spectrum-managed CNAME (using dynamic edge IPs). Per RFC 1034 you cannot have a CNAME and any other record (A, AAAA, another CNAME) at the same name. So you cannot add an `A` record for HTTP, and you cannot attach a Worker Custom Domain - the dashboard rejects both with *"A CNAME record with that host already exists."* That means `:443` to the apex has no HTTP handler and resets the connection.
- **The PREEXISTING workaround needs BYOIP.** `dns.type: PREEXISTING` lets Spectrum attach to a record you already control, but only with BYOIP (your own announced range, static edge IPs, LOA, RPKI, /24 minimum). Not a personal-site path.

I confirmed the CNAME collision on `charliegleason.com` directly - `dig +short` returns a Cloudflare edge IP, `:443` resets because no Worker is wired to it, and the dashboard refuses to add one. I've raised this with Cloudflare; without BYOIP there's no supported way to have Spectrum on the apex *and* HTTP coexisting. Treat this option as closed.

## Option 3: Subdomain (`ssh.charliegleason.com`)

Doesn't satisfy the apex requirement, but worth flagging as the standard pattern - it's what [Charm](https://charm.sh/) and [terminal.shop](https://www.terminal.shop/) do. If the apex requirement is ever relaxed, this is the cheapest, lowest-risk setup: leave the apex alone, put the SSH server on `ssh.charliegleason.com`, grey cloud, Fly IPv4. Two characters more to type and Cloudflare stays in front of the website untouched.

DNS and deploy steps are the same as Option 1, just with a `ssh` host instead of an apex `A` record - and no HTTP redirect needed.

## Option 4: Move the whole site onto Fly

Apex Fly machine serves everything: SSH on :22, the website on :443 directly (not as a redirect). No `www` split. You lose Cloudflare's CDN, free analytics, and edge WAF on HTTP. For a static personal site this is a meaningful step backwards; Fly's Anycast is fine but it isn't Cloudflare. If the site is on Cloudflare Workers with Static Assets, this option also means rewriting it for Bun/Node or proxying through to `*.workers.dev` - which adds a hop and gives up most of what made Workers attractive.

Option 1 keeps Workers and CDN where they are, which is almost always the better trade.

## Options that don't work

**SRV records.** OpenSSH ignores `_ssh._tcp.<host>` for connection routing. A few forks and older versions check SRV for `VerifyHostKeyDNS` (host key verification only), but no mainstream client will follow it to a different host. Dead end.

**Dual A records on the apex.** One A at Cloudflare's edge (orange, HTTPS), one A at Fly (grey, SSH), let clients round-robin. In practice browsers hit the Fly IP half the time with no Worker behind it, and SSH clients hit the Cloudflare IP half the time and hang until timeout. Cloudflare's proxy is per-record so you can't even cleanly mix orange and grey at the same name. Broken UX for both directions.

## Picking one

| Option | Cost | Effort | UX | Apex SSH? |
| --- | --- | --- | --- | --- |
| 1. Apex on Fly, `www` on Workers | $ | Low | Good | Yes |
| 2. Spectrum | $$$$ | N/A | N/A | No (confirmed) |
| 3. Subdomain | $ | Low | Good | No |
| 4. Whole site on Fly | $$ | High | Worse for static | Yes |
| SRV / dual A | Free | Broken | Broken | No |

Option 1 is the one. It's what this repo is set up to do.
