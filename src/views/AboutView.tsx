// src/views/AboutView.tsx

import { TextAttributes } from "@opentui/core";
import { bio } from "../data/content";
import { colors } from "../theme";

type AboutViewProps = {
  onBack: () => void;
};

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={80}>
        <text fg={colors.dim} content="← Back (esc)" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="About" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <text fg={colors.white} content={bio.full} />
      </box>
    </box>
  );
}
