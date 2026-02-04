// src/views/AboutView.tsx

import { bio } from "../data/content";
import { colors } from "../theme";

type AboutViewProps = {
  onBack: () => void;
};

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>About</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <text fg={colors.white}>{bio.full}</text>
    </box>
  );
}
