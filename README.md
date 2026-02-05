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

### Production

```bash
bun run src/index.tsx
```

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

To make this portfolio accessible via SSH, you can deploy it using:

- A cloud VM with SSH access
- [Wish](https://github.com/charmbracelet/wish) - SSH server library
- Docker container with SSH enabled

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
