// src/views/WritingView.tsx

import { writing } from "../data/content";
import { colors } from "../theme";

type WritingViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

export function WritingView({ selectedIndex, onBack }: WritingViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Writing</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column">
        {writing.map((article, index) => {
          const isSelected = index === selectedIndex;
          return (
            <box key={article.url} flexDirection="column" marginBottom={1}>
              <box flexDirection="row">
                <text fg={isSelected ? colors.yellow : colors.white}>
                  {isSelected ? "> " : "  "}
                </text>
                <text fg={isSelected ? colors.yellow : colors.white}>{article.title}</text>
              </box>
              <text fg={colors.dim}>    {article.description}</text>
              <text fg={colors.dim}>    {article.url}</text>
            </box>
          );
        })}
      </box>
    </box>
  );
}
