// src/views/WritingView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { writing } from "../data/content";
import { colors } from "../theme";

type WritingViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

const MAX_WIDTH = 80;
const MAX_HEIGHT = 24;

export function WritingView({ selectedIndex, onBack, onOpenUrl, scrollRef }: WritingViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={MAX_WIDTH} height={MAX_HEIGHT}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ Navigate  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Writing" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {writing.map((article, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === writing.length - 1;
              const prefix = isSelected ? "> " : "  ";
              return (
                <box key={article.url} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <text 
                    fg={isSelected ? colors.yellow : colors.white} 
                    content={`${prefix}${article.title}`} 
                  />
                  <text fg={colors.dim} marginLeft={2} content={article.description} />
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
