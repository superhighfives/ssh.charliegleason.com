// src/views/AwardsView.tsx

import { awards } from "../data/content";
import { colors } from "../theme";

type AwardsViewProps = {
  onBack: () => void;
};

export function AwardsView({ onBack }: AwardsViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Awards</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <scrollbox flexGrow={1}>
        <box flexDirection="column">
          {awards.map((award, index) => (
            <text key={index} fg={colors.white}>
              <text fg={colors.yellow}>{award.year}</text>  {award.title}
            </text>
          ))}
        </box>
      </scrollbox>
    </box>
  );
}
