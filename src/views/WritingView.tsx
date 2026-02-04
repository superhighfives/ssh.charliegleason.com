// src/views/WritingView.tsx

import { TextAttributes } from "@opentui/core";
import { writing } from "../data/content";
import { colors } from "../theme";

type WritingViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
};

export function WritingView({ selectedIndex, onBack, onOpenUrl }: WritingViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={80}>
        <text fg={colors.dim} content="← Back (esc)" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Writing" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox flexGrow={1} focused>
          <box flexDirection="column">
            {writing.map((article, index) => {
              const isSelected = index === selectedIndex;
              const prefix = isSelected ? "> " : "  ";
              return (
                <box key={article.url} flexDirection="column" marginBottom={1}>
                  <text 
                    fg={isSelected ? colors.yellow : colors.white} 
                    content={`${prefix}${article.title}`} 
                  />
                  <text fg={colors.dim} content={`    ${article.description}`} />
                  <text fg={colors.dim} content={`    ${article.url}  ${isSelected ? "[Enter to open]" : ""}`} />
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
