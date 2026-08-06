// src/index.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState, useRef, useLayoutEffect, useMemo } from "react";

import { menuItems, type MenuItem } from "./data/content";
import { useContent, useContentStatus } from "./data/store";
import { MainMenu } from "./views/MainMenu";
import { AboutView } from "./views/AboutView";
import { ProjectsView } from "./views/ProjectsView";
import { WritingView } from "./views/WritingView";
import { MoreView } from "./views/MoreView";
import { ContactView } from "./views/ContactView";
import { UrlModal } from "./components/UrlModal";
import { TooSmall } from "./components/TooSmall";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { useLayout } from "./components/useLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import type { ContactMessage } from "./contact-email";
import { findDirectionalIndex, type GridDirection } from "./contact-grid";

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
  sendContactMessage: (message: ContactMessage) => Promise<void>;
};

// PageUp/PageDown jump by this many items.
const VISIBLE_ITEMS = 4;

// Arrow keys move one line at a time in the scroll views (About, More).
const SCROLL_LINE_ROWS = 1;
// PageUp/PageDown move a full page but keep one line of context so you don't
// lose your place across the jump.
const SCROLL_PAGE_OVERLAP = 1;

type LinkItem = { title: string; url: string };

// Wraps the app in the theme provider so every view follows the terminal's
// detected light/dark mode. Both entry points (SSH + local dev) render <App>,
// so the provider lives here rather than in each of them.
export function App(props: AppProps) {
  return (
    <ThemeProvider>
      <AppContent {...props} />
    </ThemeProvider>
  );
}

function AppContent({ onExit, openUrl, sendContactMessage }: AppProps) {
  const [currentView, setCurrentView] = useState<View>("main");
  const [contactMode, setContactMode] = useState<"options" | "form">("options");
  // Once a message has been sent this session the form can't be resubmitted,
  // so it's taken out of keyboard/mouse navigation entirely.
  const [contactSent, setContactSent] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [linkModal, setLinkModal] = useState<LinkItem | null>(null);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { termWidth, termHeight, tooSmall } = useLayout();
  const { projects, writing, contact } = useContent();
  const status = useContentStatus();

  const list: LinkItem[] = useMemo(() => {
    if (currentView === "Projects") return projects.map((p) => ({ title: p.name, url: p.url }));
    if (currentView === "Writing") return writing.map((w) => ({ title: w.title, url: w.url }));
    return [];
  }, [currentView, projects, writing]);

  const openLink = (item: LinkItem) => {
    if (openUrl) {
      openUrl(item.url);
      return;
    }
    // No real launcher (SSH) — surface the URL so the user can copy it.
    setLinkModal(item);
  };

  // Move the list selection, then scroll the viewport by the selected item's
  // actual measured offset so it stays visible and the scrollbar stays in sync.
  // (Items have variable heights as descriptions/URLs wrap, so a fixed per-item
  // estimate drifts; the list scrollboxes disable viewport culling so every
  // item's position is readable.)
  const moveSelection = (newIndex: number, itemCount = list.length) => {
    const clamped = Math.max(0, Math.min(itemCount - 1, newIndex));
    setSubIndex(clamped);

    const sb = scrollRef.current;
    const items = sb?.content?.getChildren()[0]?.getChildren() ?? [];
    const item = items[clamped];
    const first = items[0];
    if (!sb || !item || !first) return;

    const top = item.y - first.y;
    const bottom = top + item.height;
    const viewHeight = sb.viewport.height;
    const scrollTop = sb.scrollTop;
    if (top < scrollTop) sb.scrollTo(top);
    else if (bottom > scrollTop + viewHeight) sb.scrollTo(bottom - viewHeight);
  };

  const moveContactSelection = (newIndex: number) => {
    const min = contactSent ? 1 : 0;
    const clamped = Math.max(min, Math.min(contact.length, newIndex));
    setSubIndex(clamped);

    const sb = scrollRef.current;
    if (clamped === 0) {
      sb?.scrollTo(0);
      return;
    }
    const item = sb?.findDescendantById(`contact-option-${clamped}`);
    const first =
      sb?.findDescendantById("contact-option-0") ??
      sb?.findDescendantById("contact-option-1");
    if (!sb || !item || !first) return;

    const top = item.y - first.y;
    const bottom = top + item.height;
    if (top < sb.scrollTop) sb.scrollTo(top);
    else if (bottom > sb.scrollTop + sb.viewport.height) {
      sb.scrollTo(bottom - sb.viewport.height);
    }
  };

  const moveContactDirection = (direction: GridDirection) => {
    const sb = scrollRef.current;
    if (!sb) return;
    const items = Array.from({ length: contact.length + 1 }, (_, index) =>
      sb.findDescendantById(`contact-option-${index}`),
    );
    if (items.some((item) => !item)) return;

    const nextIndex = findDirectionalIndex(
      items.map((item) => ({
        x: item?.x ?? 0,
        y: item?.y ?? 0,
        width: item?.width ?? 0,
        height: item?.height ?? 0,
      })),
      subIndex,
      direction,
    );
    moveContactSelection(nextIndex);
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

    if (currentView === "Contact") {
      if (contactMode === "form") {
        if (key.name === "escape") setContactMode("options");
        return;
      }

      if (key.name === "escape" || key.name === "backspace") {
        setCurrentView("main");
      } else if (key.name === "return") {
        if (subIndex === 0) {
          if (!contactSent) setContactMode("form");
        } else {
          const item = contact[subIndex - 1];
          if (item) openLink({ title: item.label, url: item.url });
        }
      } else if (key.name === "tab" && subIndex === 0) {
        if (!contactSent) setContactMode("form");
      } else if (key.name === "up") {
        moveContactDirection("up");
      } else if (key.name === "down") {
        moveContactDirection("down");
      } else if (key.name === "left") {
        moveContactDirection("left");
      } else if (key.name === "right") {
        moveContactDirection("right");
      } else if (key.name === "pageup") {
        moveContactSelection(subIndex - VISIBLE_ITEMS);
      } else if (key.name === "pagedown") {
        moveContactSelection(subIndex + VISIBLE_ITEMS);
      } else if (key.name === "home") {
        moveContactSelection(0);
      } else if (key.name === "end") {
        moveContactSelection(contact.length);
      }
      return;
    }

    if (
      currentView !== "main" &&
      (key.name === "escape" || key.name === "backspace")
    ) {
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
          sb.scrollBy(-Math.max(1, sb.viewport.height - SCROLL_PAGE_OVERLAP));
          break;
        case "pagedown":
          sb.scrollBy(Math.max(1, sb.viewport.height - SCROLL_PAGE_OVERLAP));
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
          setContactMode("options");
          setCurrentView(selectedItem);
        }
      }
      return;
    }

    // List views: Projects and Writing.
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

  // Reset scroll position when the scroll view (re)mounts, and suppress the
  // scrollbar flash. On mount the scrollbox derives bar visibility from a
  // still-settling layout: for the first frame the viewport is a row short
  // while the space reserved for the (hidden) scrollbars is reclaimed, so a
  // text area that actually fits briefly "overflows" and the vertical bar
  // flashes on then off. Force the bar hidden while the layout settles, then
  // hand control back to the scrollbox's own auto-visibility.
  //
  // This MUST be a layout effect: @opentui/react only *schedules* the paint
  // (resetAfterCommit → requestRender), so a passive effect would run after the
  // first paint and the bar would already have flashed. useLayoutEffect runs
  // synchronously during commit, before that scheduled paint, so the bar is
  // hidden before it can appear. Keyed on the size too, since a resize remounts
  // the view (and its scrollbox) via the parent `key`. (Selection state is
  // reset separately when entering from the menu.)
  useLayoutEffect(() => {
    if (currentView === "main") return;
    const sb = scrollRef.current;
    if (!sb) return;
    sb.scrollTo(0);
    sb.verticalScrollBar.visible = false;
    // Give the layout a few frames to settle before restoring auto-visibility.
    // The SSH renderer runs at 30fps (~33ms/frame) and the transient off-by-one
    // viewport clears on the next layout pass, so wait ~3 frames to be safe. The
    // only cost is the bar appearing ~100ms late on genuinely scrollable views —
    // imperceptible, and far better than the flash on views that fit.
    const settle = setTimeout(() => {
      scrollRef.current?.verticalScrollBar.resetVisibilityControl();
    }, 100);
    return () => clearTimeout(settle);
  }, [currentView, termWidth, termHeight]);

  if (tooSmall) {
    return <TooSmall width={termWidth} height={termHeight} />;
  }

  // Cold start: nothing fetched yet. Show a sparse full-screen loader, or a
  // full-screen error if that first fetch failed. Once we've been ready, the
  // store keeps last-known-good content and never returns to these states.
  if (status === "loading") {
    return <LoadingScreen />;
  }
  if (status === "error") {
    return <ErrorScreen />;
  }

  return (
    // Keying on the terminal size remounts the content on resize, forcing the
    // renderer to drop and redraw every renderable. Without this, shrinking the
    // terminal can leave a stale frame (e.g. the bio box border drawn at the old
    // width) until a full subtree swap happens. App state lives above this box,
    // so the current view and selection survive the remount.
    <box
      key={`${termWidth}x${termHeight}`}
      flexGrow={1}
      alignItems="center"
    >
      {currentView === "main" && (
        <MainMenu
          selectedIndex={menuIndex}
          onSelectedIndexChange={setMenuIndex}
        />
      )}
      {currentView === "About" && <AboutView scrollRef={scrollRef} />}
      {currentView === "Projects" && (
        <ProjectsView selectedIndex={subIndex} scrollRef={scrollRef} />
      )}
      {currentView === "Writing" && (
        <WritingView selectedIndex={subIndex} scrollRef={scrollRef} />
      )}
      {currentView === "More" && <MoreView scrollRef={scrollRef} />}
      {currentView === "Contact" && (
        <ContactView
          mode={contactMode}
          contact={contact}
          selectedIndex={subIndex}
          scrollRef={scrollRef}
          onSubmit={async (message) => {
            await sendContactMessage(message);
            setContactSent(true);
            setContactMode("options");
            moveContactSelection(1);
          }}
          onActivateForm={() => {
            if (contactSent) return;
            setSubIndex(0);
            setContactMode("form");
          }}
        />
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
