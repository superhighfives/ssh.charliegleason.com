// src/index.tsx

import { createCliRenderer, type ScrollBoxRenderable } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState, useRef, useEffect } from "react";
import { exec } from "child_process";

import { menuItems, projects, writing, contact, type MenuItem } from "./data/content";
import { MainMenu } from "./views/MainMenu";
import { AboutView } from "./views/AboutView";
import { ProjectsView } from "./views/ProjectsView";
import { WritingView } from "./views/WritingView";
import { MoreView } from "./views/MoreView";
import { ContactView } from "./views/ContactView";

type View = "main" | MenuItem;

// In SSH mode, running `open` would launch a browser on the *server*, which
// is wrong. URLs are already visible next to each item in the lists, so
// remote users can copy them from the terminal. Locally we still launch the
// user's default browser.
const SSH_MODE = process.env.SSH_MODE === "1";

function openUrl(url: string) {
  if (SSH_MODE) return;

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  const command = process.platform === "darwin"
    ? `open "${fullUrl}"`
    : process.platform === "win32"
    ? `start "${fullUrl}"`
    : `xdg-open "${fullUrl}"`;
  exec(command);
}

// Approximate number of items visible in scrollable list views
const VISIBLE_ITEMS = 4;
// Rows per item (for scroll calculation) - varies by view
const ROWS_PER_ITEM: Record<string, number> = {
  Projects: 3,
  Writing: 3,
  Contact: 4,
};

function App() {
  const [currentView, setCurrentView] = useState<View>("main");
  const [menuIndex, setMenuIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [visibleStart, setVisibleStart] = useState(0); // Track which item is at top of visible area
  const scrollRef = useRef<ScrollBoxRenderable>(null);

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

    // For About and More views, manually scroll the scrollbox
    if (currentView === "About" || currentView === "More") {
      if (key.name === "up") {
        scrollRef.current?.scrollBy(-3);
      } else if (key.name === "down") {
        scrollRef.current?.scrollBy(3);
      }
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
        if (subIndex > 0) {
          const newIndex = subIndex - 1;
          setSubIndex(newIndex);
          // Scroll up only if selection moves above visible area
          if (newIndex < visibleStart) {
            setVisibleStart(newIndex);
            const rowsPerItem = ROWS_PER_ITEM[currentView] ?? 3;
            scrollRef.current?.scrollBy(-rowsPerItem);
          }
        }
      } else if (key.name === "down") {
        let maxIndex = 0;
        if (currentView === "Projects") {
          maxIndex = projects.length - 1;
        } else if (currentView === "Writing") {
          maxIndex = writing.length - 1;
        } else if (currentView === "Contact") {
          maxIndex = contact.length - 1;
        }
        if (subIndex < maxIndex) {
          const newIndex = subIndex + 1;
          setSubIndex(newIndex);
          // Scroll down only if selection moves below visible area
          if (newIndex >= visibleStart + VISIBLE_ITEMS) {
            setVisibleStart(newIndex - VISIBLE_ITEMS + 1);
            const rowsPerItem = ROWS_PER_ITEM[currentView] ?? 3;
            scrollRef.current?.scrollBy(rowsPerItem);
          }
        }
      }
    }
  });

  // Reset scroll position when view changes
  useEffect(() => {
    if (currentView !== "main") {
      scrollRef.current?.scrollTo(0);
    }
  }, [currentView]);

  const handleNavigate = (item: MenuItem) => {
    setSubIndex(0);
    setVisibleStart(0);
    setCurrentView(item);
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  return (
    <box flexGrow={1} justifyContent="center" alignItems="center">
      {currentView === "main" && (
        <MainMenu selectedIndex={menuIndex} onNavigate={handleNavigate} />
      )}
      {currentView === "About" && <AboutView onBack={handleBack} scrollRef={scrollRef} />}
      {currentView === "Projects" && (
        <ProjectsView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} scrollRef={scrollRef} />
      )}
      {currentView === "Writing" && (
        <WritingView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} scrollRef={scrollRef} />
      )}
      {currentView === "More" && (
        <MoreView onBack={handleBack} scrollRef={scrollRef} />
      )}
      {currentView === "Contact" && (
        <ContactView selectedIndex={subIndex} onBack={handleBack} onOpenUrl={handleOpenUrl} scrollRef={scrollRef} />
      )}
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
