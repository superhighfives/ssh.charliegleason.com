// src/views/AboutView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { bio } from "../data/content";
import { colors } from "../theme";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";
import { Metadata } from "../components/Metadata";

type AboutViewProps = {
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function AboutView({ scrollRef }: AboutViewProps) {
  const { contentWidth, contentHeight, isStacked } = useLayout();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <text fg={colors.dim} content="← Back (esc)  •  Scroll: ↑/↓ · pgup/pgdn · home/end" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="About" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <Divider width={contentWidth} />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
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
