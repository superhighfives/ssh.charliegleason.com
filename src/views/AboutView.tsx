// src/views/AboutView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import { type RefObject, useRef } from "react";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { useLayout } from "../components/useLayout";
import { Metadata } from "../components/Metadata";
import { SparkField, type SparkFieldHandle } from "../components/SparkField";
import { ViewHeader } from "../components/ViewHeader";

type AboutViewProps = {
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

// Supplementary bio prose. The main bio (bio.full) is pulled live from the
// website; this trailing colour is static and rendered in the subtle grey
// beneath it. Links from the web version become plain text — paragraph copy
// isn't clickable in the terminal (URLs open from the list views instead).
const EXTRA_BIO = [
  "In my spare time I like to work on micro projects, from AI-powered and tweet-based music videos, to design-focused macOS apps. I also sometimes write about development, contribute to open source, and share resources.",
  "My work has been featured by Google's Creative Sandbox, and has received numerous awards, including from Awwwards and the FWA.",
  "I believe there are few things more comforting than good documentation.",
].join("\n\n");

export function AboutView({ scrollRef }: AboutViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  const { bio } = useContent();
  const sparkRef = useRef<SparkFieldHandle>(null);

  // Reflow the details grid with the available width: 2×2 when there's room,
  // stacked (1×4) when narrow.
  const metaColumns = contentWidth >= 48 ? 2 : 1;
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="About" hint="Scroll: ↑/↓ · pgup/pgdn · home/end (⌘↑/↓)" />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
          onMouseScroll={() => sparkRef.current?.burst()}
        >
          <box flexDirection="column">
            <text fg={colors.white} content={bio.full} />
            <box marginTop={1}>
              <text fg={colors.dim} wrapMode="word" content={EXTRA_BIO} />
            </box>
            {/* About details sit at the end of the content for every viewport
                size (the main menu only surfaces them in its side column on wide
                terminals). No divider — just spacing above. The grid reflows
                2×2 → 1×4 with the width. */}
            <box marginTop={2}>
              <Metadata columns={metaColumns} />
            </box>
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
