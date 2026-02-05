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
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ Navigate  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Writing" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
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
                <text fg={colors.dim} marginLeft={2} content={article.description} />
              </box>
            );
          })}
        </box>
      </box>
    </box>
  );
}
