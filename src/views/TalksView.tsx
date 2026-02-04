// src/views/TalksView.tsx

import { talks } from "../data/content";
import { colors } from "../theme";

type TalksViewProps = {
  onBack: () => void;
};

export function TalksView({ onBack }: TalksViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Talks</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column">
        {talks.map((talk, index) => (
          <text key={index} fg={colors.white}>
            <text fg={colors.yellow}>{talk.year}</text>  {talk.title}
          </text>
        ))}
      </box>
    </box>
  );
}
