// src/views/AboutView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { bio } from "../data/content";
import { colors } from "../theme";

type AboutViewProps = {
  onBack: () => void;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

const MAX_WIDTH = 80;
const MAX_HEIGHT = 24;

export function AboutView({ onBack, scrollRef }: AboutViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={MAX_WIDTH} height={MAX_HEIGHT}>
        <text fg={colors.dim} content="← Back (esc)  •  Scroll: ↑/↓" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="About" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            <text fg={colors.white} content={bio.full} />
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
