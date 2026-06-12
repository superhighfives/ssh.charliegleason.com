# Deployment

So you want to run an SSH-accessible TUI on your own domain. There are a few ways to do this, and the right one depends on what's already living at your apex domain and how much you're willing to spend.

This doc covers five approaches, from "actually viable" to "don't do this." If you just want to skip to the working setup, see Option 2.

## The core constraint

SSH needs port 22 (or any TCP port you pick). HTTP needs ports 80 and 443. They're different ports, so they *can* live on the same hostname - but only if the IP that hostname resolves to actually accepts both.

Cloudflare's free and Pro proxy ("orange cloud") only forwards HTTP(S). Point an A record at Cloudflare's edge and SSH traffic just times out. So the question becomes: where does your apex resolve, and can that destination handle TCP/22?

## Option 1: Cloudflare Spectrum

Cloudflare Spectrum is the official answer to "I want both HTTP and arbitrary TCP on the same hostname." It maps a TCP port on Cloudflare's edge to an origin you control. Port 22 → your Fly machine; ports 80/443 → your existing Worker. Same hostname, no compromises, full Cloudflare DDoS protection on both.

**The catch:** SSH on port 22 as a custom Spectrum application requires the Enterprise plan. The Business plan ($200/month) only supports Spectrum for a handful of well-known protocols (Minecraft, FTP, etc.), not arbitrary port 22 to your own origin. For a personal site this is wildly disproportionate.

If you're a company already on Enterprise this is the clean answer. Otherwise, skip.

### How to set it up

1. Be on a Cloudflare Enterprise contract.
2. In the Cloudflare dashboard: **Spectrum → Create an application**.
3. Pick `SSH` as the protocol, set the edge port to `22`, point the origin at `your-fly-ip:22` (or whatever your origin runs on).
4. Done. `ssh yourdomain.com` works while HTTPS keeps flowing to your Worker.

## Option 2: Different hostnames, branded as a feature

Leave the apex alone. Put the SSH server on a subdomain. Make the SSH command visible on the website.

- `yourdomain.com` - existing web setup (Worker, Pages, whatever)
- `ssh.yourdomain.com` - Fly machine running the SSH server, grey cloud

Users type `ssh ssh.yourdomain.com`. Two characters more than the apex version. This is how [Charm](https://charm.sh/), [terminal.shop](https://www.terminal.shop/), and similar sites handle it. They don't fight the constraint - they make the SSH command part of the brand.

This is what this repo is configured for.

### How it works

The server uses [`@opentui/ssh`](https://www.npmjs.com/package/@opentui/ssh), which turns each incoming SSH connection into an OpenTUI `CliRenderer` wired straight to the SSH channel. One Bun process serves every client - no per-session child process, no PTY, no native build dependencies. The React tree in `src/index.tsx` mounts onto each session's renderer via `@opentui/react`'s `createRoot`.

The container runs `bun run src/ssh-server.tsx` under tini for clean signal handling. A 1GB volume mounts at `/data` to persist the ed25519 host key across deploys - first boot generates it, every boot after that loads it. Same host key means clients' `known_hosts` entries keep working through restarts.

### How to set it up

The repo includes a Dockerfile and fly.toml that does most of the work.

```bash
# 1. From the repo root, launch a Fly app
fly launch --no-deploy --copy-config

# 2. Create a 1GB volume to persist the SSH host key
fly volumes create host_keys --region lhr --size 1

# 3. Allocate a dedicated IPv4 (required for port 22)
fly ips allocate-v4

# 4. Deploy
fly deploy

# 5. Get the IP for your DNS record
fly ips list
```

Then in Cloudflare DNS:

- Add an `A` record: `ssh` → the Fly IPv4 address
- **Proxy status: DNS only (grey cloud)**. Orange cloud will silently drop SSH traffic.

That's it. `ssh ssh.yourdomain.com` works. Total cost on Fly: about $5.50/month for a `shared-cpu-1x` 512MB machine plus the dedicated IPv4 and 1GB volume.

If you want to make the command discoverable, add it somewhere prominent on your website. A copy-to-clipboard button beside `ssh ssh.yourdomain.com` is plenty.

### Redeploying

After the initial setup, `fly deploy` is the only command you need. Fly builds the Dockerfile on its remote builder, rolls the machine, and the volume keeps your host key persistent across restarts.

A few flags worth knowing:

- `fly logs` tails live output. `@opentui/ssh`'s built-in logging middleware emits a `connect` event per session and a `disconnect` (with duration) on teardown.
- `fly status` shows the machine state, region, and last deploy.
- `fly ssh console` opens Fly's own management SSH into the running container - useful for poking at `/data/host_key` or checking processes. This is separate from the public SSH service on `:22`.
- `fly deploy --strategy immediate` skips the health-check wait if you're iterating quickly. The default rolling strategy is safer for anything user-facing.

The repo runs as a single machine by default. That means `fly deploy` is a stop-then-start with ~10-30s of downtime. If you want zero-downtime deploys, run two machines with `fly scale count 2` first; Fly will then roll them one at a time.

### Tuning

The defaults are conservative for a kiosk-style TUI. A few env vars in `fly.toml` are worth knowing about:

- `SSH_MAX_CONCURRENT` - hard cap on simultaneous sessions across the server. Default 50. The in-process model uses a fraction of the memory the old PTY-spawn model needed, so this can climb if you actually see contention.
- `SSH_IDLE_TIMEOUT_MS` - drop a session after this long with no client input. Default 5 minutes.
- `SSH_SESSION_MAX_MS` - absolute lifetime cap regardless of activity. Default 30 minutes.
- `SSH_RATE_LIMIT_MAX` / `SSH_RATE_LIMIT_WINDOW_MS` - per-IP rate limit, defaults to 10 connection attempts per minute. Implemented as `@opentui/ssh` middleware in `src/ssh-server.tsx`.

`fly.toml`'s `services.concurrency` limits sit one layer above these - they tell Fly's proxy when to start queueing or rejecting at the edge. Keep them above `SSH_MAX_CONCURRENT` so the app's own limits are what trip first.

## Option 3: Move the whole site to a Fly origin

If you absolutely need `ssh yourdomain.com` (no subdomain) and don't have Enterprise Spectrum money, you have to move your website off Cloudflare Workers / Pages onto something that gives you a real origin server. Then point the apex at that origin's IP, and run SSH on the same machine.

This works because:

- Fly (or any VPS) gives you a public IP that handles arbitrary ports
- Port 22 → your SSH server, port 443 → your web server, same IP
- DNS for the apex is just an `A` record at that IP, grey cloud (or no Cloudflare at all)

You lose Cloudflare's edge CDN, free analytics, and WAF for HTTP traffic. You'd typically add Cloudflare back in front *of* your origin via the proxy, but that puts you back where you started for SSH - so you'd run a split setup, which gets complicated fast.

For a static site this is a meaningful step backwards in performance and reliability. For a server-rendered app this might be a wash. For an OpenTUI portfolio, it's probably not worth it.

### How to set it up

1. Pick a host that gives you a real origin: Fly, Hetzner, Railway, Render, whatever.
2. Migrate your website there. For a static site that's mostly `npm run build && rsync` or equivalent. For a Worker you'd need to port the JS to Node or Bun.
3. Run both your web server and SSH server on the same machine, on different ports. Use nginx/Caddy/Traefik as a reverse proxy for HTTP if your web framework doesn't bind to 443 directly.
4. DNS: apex `A` record → that machine's IP. Grey cloud.
5. Set up TLS for HTTPS (Caddy does this automatically with Let's Encrypt; on Fly the platform handles it).

If your site is on Cloudflare Workers with Static Assets, this option means rewriting it. Almost never worth it.

## Option 4: SRV records

A nice idea that doesn't actually work for SSH.

DNS SRV records let you say "for service X on host Y, try server Z on port P." XMPP and SIP clients honor them. SSH does not. Mainstream OpenSSH ignores `_ssh._tcp.yourdomain.com` entirely - it just resolves the hostname and tries port 22 directly.

A few SSH forks and older OpenSSH versions check SRV records as part of `VerifyHostKeyDNS`, but only for host key verification, not connection routing. So even if you set them up perfectly, `ssh yourdomain.com` won't follow them to a different host.

Don't bother.

## Option 5: Dual A records on the apex

You can put multiple `A` records on a single hostname. DNS resolvers return them all, and most clients try them in round-robin order.

So in theory: one `A` record points at Cloudflare's edge (orange cloud, serves HTTPS), one `A` record points at your Fly IP (grey cloud, accepts SSH). Browsers round-robin, SSH clients round-robin, eventually everyone gets where they need to go.

In practice this is fragile and bad UX:

- About half the time, browsers hit your Fly IP directly with no Cloudflare in front. No CDN, no edge TLS termination, no caching. If your Worker isn't reachable at that IP (it isn't, Workers don't have public IPs), they get a connection error.
- About half the time, SSH clients try the Cloudflare-proxied IP first. Cloudflare doesn't accept TCP/22, so the connection hangs until timeout. The client *might* retry the second IP, depending on the SSH client and OS. Most users will see a confusing timeout and give up.
- Cloudflare's per-record proxy setting means you can't mix orange and grey on the same hostname cleanly without one of them being broken for half its traffic.

If you have specific clients that handle this gracefully and you're OK with a lot of users seeing weirdness, you can experiment. For a public site, no.

## Picking one

| Option | Cost | Effort | UX | Recommended for |
| --- | --- | --- | --- | --- |
| 1. Spectrum | $$$$ | Low | Best | Enterprise users only |
| 2. Subdomain | $ | Low | Good | Everyone else |
| 3. Move site to Fly | $$ | High | Best | Sites already using a real origin |
| 4. SRV records | Free | Doesn't work | N/A | Nobody |
| 5. Dual A records | Free | Low | Broken | Nobody |

For most people setting up a TUI on a personal domain, Option 2 is the right call. It's cheap, it works, and the SSH command becomes part of how you present the site rather than something to hide.
