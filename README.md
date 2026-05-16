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

This runs the app with hot-reloading enabled via `bun run --watch`.

### Run the TUI directly

```bash
bun run src/index.tsx
```

For SSH access (how the production site is served), see [SSH Access](#ssh-access) below.

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
│   ├── index.tsx          # Main entry point with routing and keyboard handling
│   ├── ssh-server.ts      # SSH front door (ssh2 + node-pty)
│   ├── theme.ts           # Color palette and spacing constants
│   ├── components/
│   │   ├── AsciiTitle.tsx # ASCII art title header
│   │   ├── Menu.tsx       # Navigation menu component
│   │   ├── Metadata.tsx   # Sidebar with location, work, and links
│   │   └── ShaderArt.tsx  # Animated ASCII shader display
│   ├── data/
│   │   └── content.ts     # All portfolio content
│   ├── shaders/
│   │   ├── index.ts       # Shader rendering engine
│   │   └── noise.ts       # Simplex noise implementation
│   └── views/
│       ├── MainMenu.tsx   # Main landing view
│       ├── AboutView.tsx  # Full biography
│       ├── ProjectsView.tsx # Portfolio projects
│       ├── WritingView.tsx  # Blog posts
│       ├── MoreView.tsx     # Awards, talks, education, races
│       └── ContactView.tsx  # Contact information
├── Dockerfile             # Production container (Node + Bun)
├── fly.toml               # Fly.io deploy config
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

The app ships with an SSH front door (`src/ssh-server.ts`) that spawns a fresh TUI per session. The wrapper uses `ssh2` + `node-pty` and runs on Node; the TUI child runs on Bun.

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

| Variable                  | Default                  | Purpose                              |
| ------------------------- | ------------------------ | ------------------------------------ |
| `SSH_PORT`                | `2222`                   | Port to listen on                    |
| `SSH_HOST_KEY_PATH`       | `./host_key`             | Path to ed25519/rsa host key file    |
| `APP_CMD` / `APP_ARGS`    | `bun` / `src/index.tsx`  | Child process to spawn per session. `APP_ARGS` is split on spaces, so paths with spaces aren't supported. |
| `SSH_MAX_CONCURRENT`      | `25`                     | Max simultaneous sessions            |
| `SSH_IDLE_TIMEOUT_MS`     | `300000` (5 min)         | Kill session after inactivity        |
| `SSH_SESSION_MAX_MS`      | `1800000` (30 min)       | Hard cap per session                 |
| `SSH_RATE_LIMIT_MAX`      | `10`                     | Connections per IP per window        |
| `SSH_RATE_LIMIT_WINDOW_MS`| `60000` (1 min)          | Rate limit window                    |

In SSH mode (`SSH_MODE=1`, set automatically by the wrapper), the TUI doesn't run `open` on the server. URLs are still visible next to each item, so users can copy them from their terminal.

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
