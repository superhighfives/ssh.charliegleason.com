# SSH Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an SSH portfolio at `ssh hi.charliegleason.com` using OpenTUI React with menu-driven navigation, abstract shader animations, and content from charliegleason.com.

**Architecture:** Single-page React app with state-based routing between main menu and sub-views (About, Projects, Awards, Talks, Contact). Random shader art on load with animated reveal. Two-column layout with flexbox.

**Tech Stack:** OpenTUI React, Bun, TypeScript

---

## Task 1: Project Structure & Data

**Files:**
- Create: `src/data/content.ts`
- Create: `src/data/shaders.ts`

**Step 1: Create content data file**

```typescript
// src/data/content.ts

export const bio = {
  short: "I'm a principal systems engineer at Cloudflare, working on design engineering and developer experience at the intersection of code and AI.",
  full: `I'm a principal systems engineer at Cloudflare, working on design engineering and developer experience at the intersection of code and AI.

Before that I was a staff designer at Replicate, a lead product designer at Salesforce, owned design and brand at Heroku, worked on design and front-end development for London-based crowdfunding publisher Unbound, co-founded the Melbourne-based social film site Goodfilms, and was the technical lead of the Clemenger BBDO ad agency.

I studied design and computer science, and I like the space between creativity and code. I also enjoy the blind terror of the creative process, solving difficult problems, and writing custom GLSL shaders.

I cannot skateboard. I tried, but it was a whole thing.`,
};

export const metadata = {
  location: "San Francisco, CA",
  company: "Cloudflare",
  website: "charliegleason.com",
  github: "superhighfives",
};

export const projects = [
  {
    name: "Lysterfield Lake",
    description: "An interactive AI-generated 3D fever dream",
    url: "lysterfieldlake.com",
  },
  {
    name: "Pika",
    description: "An open-source colour picker app for macOS",
    url: "superhighfives.com/pika",
  },
  {
    name: "Tweetflight",
    description: "A Twitter-powered music video",
    url: "tweetflight.wewerebrightly.com",
  },
  {
    name: "Sandpit",
    description: "An open-source creative-coding library",
    url: "sandpitjs.com",
  },
  {
    name: "Drag It Down On You",
    description: "Lyric karaoke for Ceres",
    url: "dragitdownonyou.com",
  },
  {
    name: "Rugby",
    description: "A GIF-powered music video",
    url: "rugby.wewerebrightly.com",
  },
  {
    name: "I Will Never Let You Go",
    description: "A WebGL-powered music video",
    url: "iwillneverletyougo.com",
  },
];

export const awards = [
  { year: "2024", title: "AWWWARDS, Nomination for Typography Honors, Lysterfield Lake" },
  { year: "2023", title: "AWWWARDS, Honourable Mention, Lysterfield Lake" },
  { year: "2023", title: "Salesforce TMP AI Hackathon, Winner for Overall Best Hack" },
  { year: "2023", title: "Product Hunt, Runner Up in the 2022 Golden Kitty Awards, Pika" },
  { year: "2021", title: "Product Hunt, Featured, Pika" },
  { year: "2019", title: "The Ink Award, Heroku Hanafuda Cards" },
  { year: "2017", title: "Typewolf, Site of the Day, Charlie Gleason" },
  { year: "2016", title: "The FWA, Site of the Day, Kōya" },
  { year: "2016", title: "AWWWARDS, Honourable Mention, Kōya" },
  { year: "2016", title: "Kickstarter, Projects We Love, One For Sorrow, Two For Joy" },
  { year: "2016", title: "The FWA, Site of the Day, Rugby" },
  { year: "2016", title: "AWWWARDS, Honourable Mention, Rugby" },
  { year: "2015", title: "The FWA, Site of the Day, I Will Never Let You Go" },
  { year: "2015", title: "AWWWARDS, Honourable Mention, I Will Never Let You Go" },
  { year: "2015", title: "Chrome Experiments, Tweetflight" },
  { year: "2014", title: "Futurebook Innovation Awards, Best Publisher Website, Unbound" },
  { year: "2013", title: "Google Sandbox, Tweetflight" },
  { year: "2013", title: "The FWA, Site of the Day, Tweetflight" },
  { year: "2013", title: "AWWWARDS, Site of the Day, Tweetflight" },
  { year: "2011", title: "AWWWARDS, Site of the Day, The Story of Mick Roberts" },
  { year: "2011", title: "Caples, Silver, Pop What You're Not" },
  { year: "2011", title: "Award, Bronze, Pop What You're Not" },
  { year: "2010", title: "AIMIA, Nomination for Effectiveness, Pop What You're Not" },
  { year: "2010", title: "ADMA, Bronze for Art Direction / Craft, Pop What You're Not" },
  { year: "2010", title: "ADMA, Silver for Automotive, Pop What You're Not" },
  { year: "2010", title: "MADC, Bronze for Best Microsite, Pop What You're Not" },
  { year: "2007", title: "Design Institute of Australia, Encouragement Award" },
];

export const talks = [
  { year: "2024", title: "Partner Summit: The Future of AppExchange" },
  { year: "2023", title: "Dreamforce: Designing a 5 Star Partner Listing" },
  { year: "2019", title: "Creative Coding London" },
  { year: "2017", title: "JSConf Budapest (Master of Ceremonies)" },
  { year: "2016", title: "Decompress: Blending WebGL and video" },
  { year: "2012", title: "Web Directions South: You are a developer, the internet is your friend" },
  { year: "2012", title: "What Do You Know: So, you are great (and so is Less CSS)" },
  { year: "2011", title: "What Do You Know: How to make your life more awesome with CSS3 media queries" },
];

export const contact = [
  { label: "Website", url: "charliegleason.com" },
  { label: "Writing", url: "code.charliegleason.com" },
  { label: "GitHub", url: "github.com/superhighfives" },
  { label: "Twitter", url: "twitter.com/superhighfives" },
  { label: "Dribbble", url: "dribbble.com/superhighfives" },
  { label: "Email", url: "hello@charliegleason.com" },
];

export const menuItems = ["About", "Projects", "Awards", "Talks", "Contact"] as const;
export type MenuItem = (typeof menuItems)[number];
```

**Step 2: Create shader art data file**

```typescript
// src/data/shaders.ts

export const shaders = [
  // 1. Radial Burst
  `                    ░
              ░     █     ░
         ·    ▒    ▓█▓    ▒    ·
       ░  ▒  ▓  ▓██████▓  ▓  ▒  ░
         ·    ▒    ▓█▓    ▒    ·
              ░     █     ░
                    ░`,

  // 2. Horizontal Waves
  `    ░░░▒▒▒▓▓▓███▓▓▓▒▒▒░░░
       ░░░▒▒▓▓███▓▓▒▒░░░
    ░░▒▒▒▓▓▓██████▓▓▓▒▒▒░░
         ░░▒▒▓███▓▒▒░░
    ░░░▒▒▓▓████████▓▓▒▒░░░`,

  // 3. Diamond Pulse
  `              ░
            ░▒█▒░
          ░▒▓███▓▒░
        ░▒▓██▓▓▓██▓▒░
          ░▒▓███▓▒░
            ░▒█▒░
              ░`,

  // 4. Signal Wave
  `                          ▓█▓
    ░▒▓█▓▒░          ░▒▓██▓██▓▒░
    ▓█████▓░      ░▒▓██▓▒░  ░▒▓▓
    ░▒▓█▓▒░   ░▒▓██▓▒░
              ▓█▓▒░`,

  // 5. Starburst
  `         ░      ▓      ░
           ▒   ▓█▓   ▒
       ░ ▒ ▓ ▓█████▓ ▓ ▒ ░
     ░▒▓▓████████████████▓▓▒░
       ░ ▒ ▓ ▓█████▓ ▓ ▒ ░
           ▒   ▓█▓   ▒
         ░      ▓      ░`,
];

export function getRandomShader(): string {
  return shaders[Math.floor(Math.random() * shaders.length)];
}
```

**Step 3: Commit**

```bash
git add src/data/content.ts src/data/shaders.ts
git commit -m "feat: add content data and shader art"
```

---

## Task 2: Theme Constants

**Files:**
- Create: `src/theme.ts`

**Step 1: Create theme file with colors**

```typescript
// src/theme.ts

export const colors = {
  yellow: "#FFD700",
  white: "#FFFFFF",
  dim: "#888888",
  border: "#444444",
  background: "#1a1a1a",
};

export const spacing = {
  padding: 1,
  gap: 1,
};
```

**Step 2: Commit**

```bash
git add src/theme.ts
git commit -m "feat: add theme constants"
```

---

## Task 3: ASCII Title Component

**Files:**
- Create: `src/components/AsciiTitle.tsx`

**Step 1: Create ASCII title component**

```typescript
// src/components/AsciiTitle.tsx

import { colors } from "../theme";

export function AsciiTitle() {
  return (
    <box flexDirection="column">
      <ascii-font font="tiny" text="Charlie Gleason" fg={colors.yellow} />
      <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
    </box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/AsciiTitle.tsx
git commit -m "feat: add ASCII title component"
```

---

## Task 4: Shader Art Component with Animation

**Files:**
- Create: `src/components/ShaderArt.tsx`

**Step 1: Create shader art component with dissolve animation**

```typescript
// src/components/ShaderArt.tsx

import { useEffect, useState, useMemo } from "react";
import { useTimeline } from "@opentui/react";
import { getRandomShader } from "../data/shaders";
import { colors } from "../theme";

export function ShaderArt() {
  const shader = useMemo(() => getRandomShader(), []);
  const [revealProgress, setRevealProgress] = useState(0);

  const timeline = useTimeline({
    duration: 1500,
    loop: false,
  });

  useEffect(() => {
    timeline.add(
      { progress: 0 },
      {
        progress: 1,
        duration: 1500,
        ease: "easeOut",
        onUpdate: (animation) => {
          setRevealProgress(animation.targets[0].progress);
        },
      }
    );
  }, []);

  // Create revealed version of shader based on progress
  const revealedShader = useMemo(() => {
    const chars = shader.split("");
    const totalChars = chars.filter((c) => c !== " " && c !== "\n").length;
    const charsToShow = Math.floor(totalChars * revealProgress);

    let shown = 0;
    return chars
      .map((char) => {
        if (char === " " || char === "\n") return char;
        if (shown < charsToShow) {
          shown++;
          return char;
        }
        // Random noise character for unrevealed
        const noise = ["·", ":", "░", " "];
        return revealProgress > 0.1 ? noise[Math.floor(Math.random() * noise.length)] : " ";
      })
      .join("");
  }, [shader, revealProgress]);

  return (
    <box>
      <text fg={colors.yellow}>{revealedShader}</text>
    </box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ShaderArt.tsx
git commit -m "feat: add shader art component with dissolve animation"
```

---

## Task 5: Menu Component

**Files:**
- Create: `src/components/Menu.tsx`

**Step 1: Create menu component with selection state**

```typescript
// src/components/Menu.tsx

import { menuItems, type MenuItem } from "../data/content";
import { colors } from "../theme";

type MenuProps = {
  selectedIndex: number;
  onSelect: (item: MenuItem) => void;
};

export function Menu({ selectedIndex, onSelect }: MenuProps) {
  return (
    <box flexDirection="column">
      {menuItems.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <text key={item} fg={isSelected ? colors.yellow : colors.dim}>
            {isSelected ? "> " : "  "}
            {item}
          </text>
        );
      })}
    </box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Menu.tsx
git commit -m "feat: add menu component"
```

---

## Task 6: Metadata Sidebar Component

**Files:**
- Create: `src/components/Metadata.tsx`

**Step 1: Create metadata component**

```typescript
// src/components/Metadata.tsx

import { metadata } from "../data/content";
import { colors } from "../theme";

export function Metadata() {
  return (
    <box flexDirection="column" gap={1}>
      <text fg={colors.white}>{metadata.location}</text>
      <text fg={colors.white}>{metadata.company}</text>
      <text fg={colors.white}>{metadata.website}</text>
      <text fg={colors.white}>{metadata.github}</text>
    </box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Metadata.tsx
git commit -m "feat: add metadata sidebar component"
```

---

## Task 7: Main Menu View

**Files:**
- Create: `src/views/MainMenu.tsx`

**Step 1: Create main menu view combining all header components**

```typescript
// src/views/MainMenu.tsx

import { bio, menuItems, type MenuItem } from "../data/content";
import { colors } from "../theme";
import { AsciiTitle } from "../components/AsciiTitle";
import { ShaderArt } from "../components/ShaderArt";
import { Menu } from "../components/Menu";
import { Metadata } from "../components/Metadata";

type MainMenuProps = {
  selectedIndex: number;
  onNavigate: (item: MenuItem) => void;
};

export function MainMenu({ selectedIndex, onNavigate }: MainMenuProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header: Shader + Title */}
      <box flexDirection="row" gap={2} marginBottom={1}>
        <ShaderArt />
        <box flexDirection="column">
          <AsciiTitle />
        </box>
      </box>

      {/* Main content: Two columns */}
      <box flexDirection="row" flexGrow={1} gap={2}>
        {/* Left column: Bio + Menu */}
        <box
          flexDirection="column"
          border
          borderColor={colors.border}
          padding={1}
          flexGrow={1}
        >
          <text fg={colors.white}>{bio.short}</text>
          <box marginTop={1} marginBottom={1}>
            <text fg={colors.border}>──────────────────────────────────────</text>
          </box>
          <Menu selectedIndex={selectedIndex} onSelect={onNavigate} />
        </box>

        {/* Right column: Metadata */}
        <box
          flexDirection="column"
          border
          borderColor={colors.border}
          padding={1}
          width={28}
        >
          <Metadata />
        </box>
      </box>
    </box>
  );
}
```

**Step 2: Commit**

```bash
git add src/views/MainMenu.tsx
git commit -m "feat: add main menu view"
```

---

## Task 8: Sub-view Components

**Files:**
- Create: `src/views/AboutView.tsx`
- Create: `src/views/ProjectsView.tsx`
- Create: `src/views/AwardsView.tsx`
- Create: `src/views/TalksView.tsx`
- Create: `src/views/ContactView.tsx`

**Step 1: Create About view**

```typescript
// src/views/AboutView.tsx

import { bio } from "../data/content";
import { colors } from "../theme";

type AboutViewProps = {
  onBack: () => void;
};

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>About</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <text fg={colors.white}>{bio.full}</text>
    </box>
  );
}
```

**Step 2: Create Projects view**

```typescript
// src/views/ProjectsView.tsx

import { projects } from "../data/content";
import { colors } from "../theme";

type ProjectsViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

export function ProjectsView({ selectedIndex, onBack }: ProjectsViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Projects</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column" gap={1}>
        {projects.map((project, index) => {
          const isSelected = index === selectedIndex;
          return (
            <box key={project.name} flexDirection="column">
              <text fg={isSelected ? colors.yellow : colors.white}>
                {isSelected ? "> " : "  "}
                {project.name}
              </text>
              <text fg={colors.dim}>    {project.description}</text>
              <text fg={colors.dim}>    {project.url}</text>
            </box>
          );
        })}
      </box>
    </box>
  );
}
```

**Step 3: Create Awards view**

```typescript
// src/views/AwardsView.tsx

import { awards } from "../data/content";
import { colors } from "../theme";

type AwardsViewProps = {
  onBack: () => void;
};

export function AwardsView({ onBack }: AwardsViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Awards</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <scrollbox flexGrow={1}>
        <box flexDirection="column">
          {awards.map((award, index) => (
            <text key={index} fg={colors.white}>
              <text fg={colors.yellow}>{award.year}</text>  {award.title}
            </text>
          ))}
        </box>
      </scrollbox>
    </box>
  );
}
```

**Step 4: Create Talks view**

```typescript
// src/views/TalksView.tsx

import { talks } from "../data/content";
import { colors } from "../theme";

type TalksViewProps = {
  onBack: () => void;
};

export function TalksView({ onBack }: TalksViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Talks</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column">
        {talks.map((talk, index) => (
          <text key={index} fg={colors.white}>
            <text fg={colors.yellow}>{talk.year}</text>  {talk.title}
          </text>
        ))}
      </box>
    </box>
  );
}
```

**Step 5: Create Contact view**

```typescript
// src/views/ContactView.tsx

import { contact } from "../data/content";
import { colors } from "../theme";

type ContactViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

export function ContactView({ selectedIndex, onBack }: ContactViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Contact</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column" gap={1}>
        {contact.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <text key={item.label} fg={isSelected ? colors.yellow : colors.white}>
              {isSelected ? "> " : "  "}
              {item.label.padEnd(14)} {item.url}
            </text>
          );
        })}
      </box>
    </box>
  );
}
```

**Step 6: Commit**

```bash
git add src/views/AboutView.tsx src/views/ProjectsView.tsx src/views/AwardsView.tsx src/views/TalksView.tsx src/views/ContactView.tsx
git commit -m "feat: add all sub-view components"
```

---

## Task 9: Main App with Navigation

**Files:**
- Modify: `src/index.tsx`

**Step 1: Update main app with routing and keyboard navigation**

```typescript
// src/index.tsx

import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState } from "react";

import { menuItems, projects, contact, type MenuItem } from "./data/content";
import { MainMenu } from "./views/MainMenu";
import { AboutView } from "./views/AboutView";
import { ProjectsView } from "./views/ProjectsView";
import { AwardsView } from "./views/AwardsView";
import { TalksView } from "./views/TalksView";
import { ContactView } from "./views/ContactView";

type View = "main" | MenuItem;

function App() {
  const [currentView, setCurrentView] = useState<View>("main");
  const [menuIndex, setMenuIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);

  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0);
    }

    if (currentView === "main") {
      if (key.name === "up") {
        setMenuIndex((i) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        setMenuIndex((i) => Math.min(menuItems.length - 1, i + 1));
      } else if (key.name === "return") {
        setSubIndex(0);
        setCurrentView(menuItems[menuIndex]);
      }
    } else {
      // In sub-view
      if (key.name === "escape" || key.name === "backspace") {
        setCurrentView("main");
      } else if (key.name === "up") {
        setSubIndex((i) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        const maxIndex =
          currentView === "Projects"
            ? projects.length - 1
            : currentView === "Contact"
            ? contact.length - 1
            : 0;
        setSubIndex((i) => Math.min(maxIndex, i + 1));
      }
    }
  });

  const handleNavigate = (item: MenuItem) => {
    setSubIndex(0);
    setCurrentView(item);
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  return (
    <box flexGrow={1}>
      {currentView === "main" && (
        <MainMenu selectedIndex={menuIndex} onNavigate={handleNavigate} />
      )}
      {currentView === "About" && <AboutView onBack={handleBack} />}
      {currentView === "Projects" && (
        <ProjectsView selectedIndex={subIndex} onBack={handleBack} />
      )}
      {currentView === "Awards" && <AwardsView onBack={handleBack} />}
      {currentView === "Talks" && <TalksView onBack={handleBack} />}
      {currentView === "Contact" && (
        <ContactView selectedIndex={subIndex} onBack={handleBack} />
      )}
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
```

**Step 2: Commit**

```bash
git add src/index.tsx
git commit -m "feat: add main app with navigation and keyboard controls"
```

---

## Task 10: Test & Polish

**Step 1: Run the app**

```bash
bun dev
```

**Step 2: Test all navigation**
- Arrow up/down on main menu
- Enter to select each menu item
- Escape/Backspace to go back
- q to quit
- Verify shader animation plays on load

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete SSH portfolio implementation"
```

---

## Future Enhancements (out of scope for initial build)

1. **Copy to clipboard** - In Contact view, Enter copies selected URL
2. **Open URL** - Launch browser for selected project/contact
3. **Responsive layout** - Adapt to terminal size with `useTerminalDimensions`
4. **SSH server setup** - Deploy with Wish or similar SSH server framework
