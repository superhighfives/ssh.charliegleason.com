// src/views/WritingView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { writing } from "../data/content";
import { colors } from "../theme";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";

type WritingViewProps = {
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function WritingView({ selectedIndex, scrollRef }: WritingViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ · pgup/pgdn · home/end  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Writing" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <Divider width={contentWidth} />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {writing.map((article, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === writing.length - 1;
              return (
                <box key={article.url} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <box flexDirection="row">
                    <box width={2}>
                      <text fg={isSelected ? colors.yellow : colors.white} content={isSelected ? "> " : "  "} />
                    </box>
                    <box flexGrow={1}>
                      <text
                        fg={isSelected ? colors.yellow : colors.white}
                        wrapMode="word"
                        content={article.title}
                      />
                    </box>
                  </box>
                  <box flexDirection="row">
                    <box width={2} />
                    <box flexGrow={1}>
                      <text fg={colors.dim} wrapMode="word" content={article.description} />
                    </box>
                  </box>
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
