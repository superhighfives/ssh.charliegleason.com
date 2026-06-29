# ssh.charliegleason.com

A terminal-based portfolio application built with [OpenTUI](https://opentui.dev) and React. Experience an interactive, SSH-accessible portfolio featuring animated ASCII shader art, menu-driven navigation, and a beautifully styled terminal interface.

```
  ___ _            _ _        ___ _
 / __| |_  __ _ _ | (_)___   / __| |___ __ _ ___ ___ _ _
| (__| ' \/ _` | '_| | / -_) | (_ | / -_) _` (_-</ _ \ ' \
 \___|_||_\__,_|_| |_|_\___|  \___|_\___\__,_/__/\___/_||_|

Designer, developer, creative coder, and musician.
```

## Features

- **Interactive Menu Navigation** - Arrow key navigation through sections
- **Animated ASCII Shader Art** - Real-time procedural animations with multiple shader types (plasma, waves, metaballs, rings)
- **Multi-View Architecture** - About, Projects, Writing, Awards/Talks, and Contact sections
- **URL Opening** - Press Enter to open links directly in your default browser
- **Scrollable Content** - Support for extensive content with keyboard scrolling
- **Cross-Platform** - Works on macOS, Windows, and Linux

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed

### Setup

```bash
# Clone the repository
git clone https://github.com/superhighfives/ssh.charliegleason.com.git
cd ssh.charliegleason.com

# Install dependencies
bun install
```

## Usage

### Development

```bash
bun dev
```

Runs the TUI directly in your terminal (no SSH) with hot-reloading via `bun run --watch` — the fastest way to iterate on views and shaders.

### Run the SSH server locally

```bash
bun ssh
```

Starts the full SSH front door on port 2222 — the same path the production site is served over. See [SSH Access](#ssh-access) below.

## Keyboard Controls

| Key                    | Action                                 |
| ---------------------- | -------------------------------------- |
| `↑` / `↓`              | Navigate menu items / scroll content   |
| `Enter`                | Select menu item / open URL in browser |
| `Escape` / `Backspace` | Go back to previous view               |
| `q`                    | Quit the application                   |

## Project Structure

```
ssh.charliegleason.com/
├── src/
│   ├── index.tsx           # App component: routing + keyboard handling
│   ├── dev.tsx             # Local dev entry — runs the TUI directly (no SSH)
│   ├── ssh-server.tsx      # SSH front door (@opentui/ssh, one renderer per session)
│   ├── redirect-server.ts  # Apex HTTP server that 301s to www
│   ├── theme.ts            # Color palette and spacing constants
│   ├── components/         # AsciiTitle, Menu, Metadata, ShaderArt,
│   │                       # LoadingScreen, ErrorScreen, UrlModal, …
│   ├── data/
│   │   ├── content.ts      # Bundled fallback portfolio content
│   │   ├── store.ts        # Pulls + caches content from charliegleason.com
│   │   ├── live.ts         # Live now-playing / presence data
│   │   └── sessions.ts     # Active SSH session counter
│   ├── shaders/
│   │   ├── index.ts        # Shader rendering engine
│   │   └── noise.ts        # Simplex noise implementation
│   └── views/              # MainMenu, About, Projects, Writing, More, Contact
├── patches/                # bun patch for @opentui/ssh (Ghostty terminfo)
├── Dockerfile              # Production container (Bun)
├── fly.toml                # Fly.io deploy config
├── DEPLOYMENT.md           # Apex-on-Fly / www-on-Workers deployment guide
├── package.json
└── tsconfig.json
```

## Views

### Main Menu

The landing screen featuring:

- ASCII art title
- Animated shader background
- Navigation menu
- Metadata sidebar (location, work, web, GitHub)

### About

Full biography detailing professional background and interests.

### Projects

Portfolio of notable work including:

- **Pika** - The open-source macOS color picker
- **Sandpit** - Creative coding library
- **Goodfilms** - Social film recommendation platform
- And more...

### Writing

Collection of blog posts and articles covering design, development, and creative coding.

### More

Comprehensive view containing:

- **Awards** - AWWWARDS, FWA, Product Hunt, and more
- **Talks** - Conference presentations (JSConf, Decompress, Web Directions)
- **Education** - Academic background
- **Certifications** - Professional certifications
- **Volunteering** - Community involvement
- **Races** - Athletic achievements (marathons, triathlons, ultras)

### Contact

Social links and contact methods including Twitter, GitHub, LinkedIn, Threads, Bluesky, and email.

## Technology Stack

| Technology                               | Purpose               |
| ---------------------------------------- | --------------------- |
| [OpenTUI](https://opentui.dev)           | Terminal UI framework |
| [React 19](https://react.dev)            | Component-based UI    |
| [Bun](https://bun.sh)                    | JavaScript runtime    |
| [TypeScript](https://typescriptlang.org) | Type-safe development |

## Customization

### Theme

Edit `src/theme.ts` to customize colors:

```typescript
export const colors = {
  yellow: "#FFD700", // Primary accent
  white: "#FFFFFF", // Main text
  dim: "#999999", // Secondary text
  border: "#444444", // Borders
  background: "#1a1a1a", // Background
};
```

### Content

All portfolio content lives in `src/data/content.ts`. Update this file to customize:

- Bio text
- Projects list
- Writing entries
- Awards and achievements
- Contact information

### Shaders

Four shader types are available in `src/shaders/index.ts`:

- `plasma` - Sine wave interference patterns
- `waves` - Ripple patterns from multiple sources
- `metaballs` - Organic blob animations
- `rings` - Expanding circular patterns with simplex noise

The shader type is randomly selected on each launch. Character density mapping uses: ` ·:░▒▓█`

## SSH Access

The app ships with an SSH front door (`src/ssh-server.tsx`) built on [`@opentui/ssh`](https://opentui.dev). Each session gets a `CliRenderer` wired straight to the SSH channel, and the React tree is mounted onto it with `@opentui/react` — there's no child process or PTY per session, so a single Bun process holds many concurrent connections cheaply.

### Try it locally

```bash
bun ssh
# in another terminal:
ssh -p 2222 anyone@localhost
```

The server generates a host key on first run if `./host_key` doesn't exist. Any username works - the server accepts unauthenticated sessions, since this is a public kiosk. The host key stays on your machine (it's in `.gitignore`).

### Deploy to Fly.io

This repo includes a `Dockerfile` and `fly.toml` configured for a tiny machine in London running the SSH server on port 22. The host key is auto-generated on first boot and persisted to a 1GB volume.

```bash
# 1. Launch the app, but don't deploy yet
fly launch --no-deploy --copy-config

# 2. Create the volume that will hold the host key
fly volumes create host_keys --region lhr --size 1

# 3. Allocate a dedicated IPv4 (required for port 22)
fly ips allocate-v4

# 4. Deploy
fly deploy

# 5. Get the IP to point DNS at
fly ips list
```

Then in Cloudflare DNS, add an `A` record for `ssh` pointing at the Fly IPv4. **Make sure the proxy is OFF (grey cloud)** - Cloudflare's HTTP proxy doesn't forward SSH.

Expected cost on Fly: ~$5.45/month (`shared-cpu-1x` 512MB + dedicated IPv4 + 1GB volume).

### Connecting

```bash
ssh ssh.charliegleason.com
```

The first connection prompts to trust the host key. After that it goes straight into the TUI.

### Configuration

The SSH server reads these env vars (all optional, sensible defaults):

| Variable                   | Default       | Purpose                                |
| -------------------------- | ------------- | -------------------------------------- |
| `SSH_PORT`                 | `2222`        | Port to listen on                      |
| `SSH_BIND`                 | `0.0.0.0`     | Address to bind                        |
| `SSH_HOST_KEY_PATH`        | `./host_key`  | Path to the host key (generated if absent) |
| `SSH_MAX_CONCURRENT`       | `100`         | Max simultaneous sessions across the server |
| `SSH_MAX_PER_CONNECTION`   | `1`           | Max sessions on a single connection    |
| `SSH_IDLE_TIMEOUT_MS`      | `300000`      | Disconnect after inactivity (5 min)    |
| `SSH_SESSION_MAX_MS`       | `1800000`     | Hard cap per session (30 min)          |
| `SSH_RATE_LIMIT_MAX`       | `10`          | Connections per IP per window          |
| `SSH_RATE_LIMIT_WINDOW_MS` | `60000`       | Rate-limit window (1 min)              |

The portfolio content and live data are pulled over HTTP, and the same process runs the apex redirect server:

| Variable           | Default                          | Purpose                                       |
| ------------------ | -------------------------------- | --------------------------------------------- |
| `CONTENT_API_BASE` | `https://www.charliegleason.com` | Origin to pull content + live data from       |
| `HTTP_PORT`        | `8080`                           | Port for the apex→www redirect server         |
| `HTTP_BIND`        | `::`                             | Address the redirect server binds             |
| `REDIRECT_TARGET`  | `https://www.charliegleason.com` | Where apex web traffic is 301'd               |

Over SSH the app isn't given an `openUrl` handler, so it never shells out to `open` on the server. URLs stay visible next to each item (and in the URL modal) for users to copy into their own terminal.

### Ghostty terminfo

Connecting from [Ghostty](https://ghostty.org) with `ssh-terminfo` enabled runs `infocmp`/`tic` over an SSH `exec` channel to install its terminfo. `@opentui/ssh` doesn't answer `exec`, which makes Ghostty stall on _"Setting up xterm-ghostty terminfo…"_. A small `bun patch` in `patches/` answers terminfo `exec` requests so the connection proceeds — a stopgap until the Ghostty-side fix ships.

## Credits

Built with [OpenTUI](https://opentui.dev) - the terminal UI framework for building beautiful command-line interfaces with React.

Created using `bun create tui` via [create-tui](https://git.new/create-tui).

## License

MIT

## Author

**Charlie Gleason**

- Web: [charliegleason.com](https://charliegleason.com)
- GitHub: [@superhighfives](https://github.com/superhighfives)
- Twitter: [@superhighfives](https://twitter.com/superhighfives)
