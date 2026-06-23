// src/views/AboutView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";
import { Metadata } from "../components/Metadata";
import { ViewHeader } from "../components/ViewHeader";

type AboutViewProps = {
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function AboutView({ scrollRef }: AboutViewProps) {
  const { contentWidth, contentHeight, isStacked } = useLayout();
  const { bio } = useContent();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="About" hint="Scroll: ↑/↓ · pgup/pgdn · home/end" />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
        >
          <box flexDirection="column">
            {/* On narrow terminals the main menu hides its metadata column.
                Surface it at the top of About so the info is still reachable. */}
            {isStacked && (
              <box flexDirection="column" marginBottom={1}>
                <Metadata />
                <box marginTop={1}>
                  <Divider width={contentWidth} />
                </box>
              </box>
            )}
            <text fg={colors.white} content={bio.full} />
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
