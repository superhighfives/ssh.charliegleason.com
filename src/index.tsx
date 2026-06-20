// src/index.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState, useRef, useEffect, useMemo } from "react";

import { menuItems, projects, writing, contact, type MenuItem } from "./data/content";
import { MainMenu } from "./views/MainMenu";
import { AboutView } from "./views/AboutView";
import { ProjectsView } from "./views/ProjectsView";
import { WritingView } from "./views/WritingView";
import { MoreView } from "./views/MoreView";
import { ContactView } from "./views/ContactView";
import { UrlModal } from "./components/UrlModal";
import { TooSmall } from "./components/TooSmall";
import { useLayout } from "./components/useLayout";

type View = "main" | MenuItem;

export type OpenUrl = (url: string) => void;

export type AppProps = {
  // Close just this session. In SSH mode this ends the SSH channel; in local
  // dev it terminates the process.
  onExit: () => void;
  // How to open a URL. The SSH server omits this (running `open` would launch
  // a browser on the *server*); local dev passes a real launcher. When it's
  // missing we show a modal with the URL instead so remote users can copy it.
  openUrl?: OpenUrl;
};

// Approximate number of items visible in the list views before scrolling kicks
// in. PageUp/PageDown jump by this many items.
const VISIBLE_ITEMS = 4;
// Rows per item in each list view, used for scroll math.
const ROWS_PER_ITEM: Record<string, number> = {
  Projects: 3,
  Writing: 3,
  Contact: 4,
};

// How far PageUp/PageDown move the scroll views (About, More). Roughly one
// terminal page of body content.
const SCROLL_PAGE_ROWS = 10;
const SCROLL_LINE_ROWS = 3;

type LinkItem = { title: string; url: string };

export function App({ onExit, openUrl }: AppProps) {
  const [currentView, setCurrentView] = useState<View>("main");
  const [menuIndex, setMenuIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [visibleStart, setVisibleStart] = useState(0);
  const [linkModal, setLinkModal] = useState<LinkItem | null>(null);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { termWidth, termHeight, tooSmall } = useLayout();

  const list: LinkItem[] = useMemo(() => {
    if (currentView === "Projects") return projects.map((p) => ({ title: p.name, url: p.url }));
    if (currentView === "Writing") return writing.map((w) => ({ title: w.title, url: w.url }));
    if (currentView === "Contact") return contact.map((c) => ({ title: c.label, url: c.url }));
    return [];
  }, [currentView]);

  const openLink = (item: LinkItem) => {
    if (openUrl) {
      openUrl(item.url);
      return;
    }
    // No real launcher (SSH) — surface the URL so the user can copy it.
    setLinkModal(item);
  };

  // Move the list selection to a new index, scrolling the viewport so the
  // selection stays visible.
  const moveSelection = (newIndex: number) => {
    const clamped = Math.max(0, Math.min(list.length - 1, newIndex));
    const rowsPerItem = ROWS_PER_ITEM[currentView] ?? 3;

    let newStart = visibleStart;
    if (clamped < newStart) {
      newStart = clamped;
    } else if (clamped >= newStart + VISIBLE_ITEMS) {
      newStart = clamped - VISIBLE_ITEMS + 1;
    }

    if (newStart !== visibleStart) {
      setVisibleStart(newStart);
      scrollRef.current?.scrollTo(newStart * rowsPerItem);
    }
    setSubIndex(clamped);
  };

  useKeyboard((key) => {
    // Modal owns the keyboard while open.
    if (linkModal) return;

    if (key.ctrl && key.name === "c") {
      onExit();
      return;
    }
    // `q` quits only from the main menu. Inside sub-views it would feel
    // surprising — backspace/escape already back out.
    if (currentView === "main" && key.name === "q") {
      onExit();
      return;
    }

    if (currentView !== "main" && (key.name === "escape" || key.name === "backspace")) {
      setCurrentView("main");
      return;
    }

    // Scroll-only views (About, More): plain vertical scroll.
    if (currentView === "About" || currentView === "More") {
      const sb = scrollRef.current;
      if (!sb) return;
      switch (key.name) {
        case "up":
          sb.scrollBy(-SCROLL_LINE_ROWS);
          break;
        case "down":
          sb.scrollBy(SCROLL_LINE_ROWS);
          break;
        case "pageup":
          sb.scrollBy(-SCROLL_PAGE_ROWS);
          break;
        case "pagedown":
          sb.scrollBy(SCROLL_PAGE_ROWS);
          break;
        case "home":
          sb.scrollTo(0);
          break;
        case "end":
          sb.scrollTo(sb.scrollHeight);
          break;
      }
      return;
    }

    if (currentView === "main") {
      if (key.name === "up") {
        setMenuIndex((i) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        setMenuIndex((i) => Math.min(menuItems.length - 1, i + 1));
      } else if (key.name === "home") {
        setMenuIndex(0);
      } else if (key.name === "end") {
        setMenuIndex(menuItems.length - 1);
      } else if (key.name === "return") {
        const selectedItem = menuItems[menuIndex];
        if (selectedItem) {
          setSubIndex(0);
          setVisibleStart(0);
          setCurrentView(selectedItem);
        }
      }
      return;
    }

    // List views: Projects, Writing, Contact
    switch (key.name) {
      case "return": {
        const item = list[subIndex];
        if (item) openLink(item);
        break;
      }
      case "up":
        moveSelection(subIndex - 1);
        break;
      case "down":
        moveSelection(subIndex + 1);
        break;
      case "pageup":
        moveSelection(subIndex - VISIBLE_ITEMS);
        break;
      case "pagedown":
        moveSelection(subIndex + VISIBLE_ITEMS);
        break;
      case "home":
        moveSelection(0);
        break;
      case "end":
        moveSelection(list.length - 1);
        break;
    }
  });

  // Reset scroll position when view changes. (Selection state is reset when
  // entering a sub-view from the main menu.)
  useEffect(() => {
    if (currentView !== "main") {
      scrollRef.current?.scrollTo(0);
    }
  }, [currentView]);

  if (tooSmall) {
    return <TooSmall width={termWidth} height={termHeight} />;
  }

  return (
    <box flexGrow={1} alignItems="center">
      {currentView === "main" && <MainMenu selectedIndex={menuIndex} />}
      {currentView === "About" && <AboutView scrollRef={scrollRef} />}
      {currentView === "Projects" && (
        <ProjectsView selectedIndex={subIndex} scrollRef={scrollRef} />
      )}
      {currentView === "Writing" && (
        <WritingView selectedIndex={subIndex} scrollRef={scrollRef} />
      )}
      {currentView === "More" && <MoreView scrollRef={scrollRef} />}
      {currentView === "Contact" && (
        <ContactView selectedIndex={subIndex} scrollRef={scrollRef} />
      )}
      {linkModal && (
        <UrlModal
          title={linkModal.title}
          url={linkModal.url}
          onClose={() => setLinkModal(null)}
        />
      )}
    </box>
  );
}
