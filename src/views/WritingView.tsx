// src/views/WritingView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { useLayout } from "../components/useLayout";
import { ViewHeader } from "../components/ViewHeader";

type WritingViewProps = {
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function WritingView({ selectedIndex, scrollRef }: WritingViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  const { writing } = useContent();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="Writing" hint="↑/↓ · pgup/pgdn · home/end  •  Enter to open" />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
          // Keep every item laid out so selection-scroll can read real offsets.
          viewportCulling={false}
        >
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
