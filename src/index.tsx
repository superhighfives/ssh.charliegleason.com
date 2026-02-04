// src/index.tsx

import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState } from "react";
import { exec } from "child_process";

import { menuItems, projects, writing, contact, type MenuItem } from "./data/content";
import { MainMenu } from "./views/MainMenu";
import { AboutView } from "./views/AboutView";
import { ProjectsView } from "./views/ProjectsView";
import { WritingView } from "./views/WritingView";
import { MoreView } from "./views/MoreView";
import { ContactView } from "./views/ContactView";

type View = "main" | MenuItem;

// Open URL in default browser
function openUrl(url: string) {
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  // Use 'open' on macOS, 'xdg-open' on Linux, 'start' on Windows
  const command = process.platform === "darwin" 
    ? `open "${fullUrl}"` 
    : process.platform === "win32" 
    ? `start "${fullUrl}"` 
    : `xdg-open "${fullUrl}"`;
  exec(command);
}

function App() {
  const [currentView, setCurrentView] = useState<View>("main");
  const [menuIndex, setMenuIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);

  const handleOpenUrl = (url: string) => {
    openUrl(url);
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0);
    }

    // Back navigation (works in all sub-views)
    if (currentView !== "main" && (key.name === "escape" || key.name === "backspace")) {
      setCurrentView("main");
      return;
    }

    if (currentView === "main") {
      if (key.name === "up") {
        setMenuIndex((i) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        setMenuIndex((i) => Math.min(menuItems.length - 1, i + 1));
      } else if (key.name === "return") {
        const selectedItem = menuItems[menuIndex];
        if (selectedItem) {
          setSubIndex(0);
          setCurrentView(selectedItem);
        }
      }
    } else if (currentView === "About" || currentView === "More") {
      // About and More views - no navigation, let scrollbox handle keys
      // (only escape/backspace handled above)
    } else {
      // Projects, Writing, Contact - handle selection navigation
      if (key.name === "return") {
        // Open URL for the selected item
        if (currentView === "Projects" && projects[subIndex]) {
          openUrl(projects[subIndex].url);
        } else if (currentView === "Writing" && writing[subIndex]) {
          openUrl(writing[subIndex].url);
        } else if (currentView === "Contact" && contact[subIndex]) {
          openUrl(contact[subIndex].url);
        }
      } else if (key.name === "up") {
        setSubIndex((i) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        let maxIndex = 0;
        if (currentView === "Projects") {
          maxIndex = projects.length - 1;
        } else if (currentView === "Writing") {
          maxIndex = writing.length - 1;
        } else if (currentView === "Contact") {
          maxIndex = contact.length - 1;
        }
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
        <ProjectsView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} />
      )}
      {currentView === "Writing" && (
        <WritingView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} />
      )}
      {currentView === "More" && (
        <MoreView onBack={handleBack} />
      )}
      {currentView === "Contact" && (
        <ContactView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} />
      )}
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
