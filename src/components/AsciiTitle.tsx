// src/components/AsciiTitle.tsx

import { colors } from "../theme";

export function AsciiTitle() {
  return (
    <box flexDirection="column">
      <text fg={colors.yellow}>
        <ascii-font font="tiny" text="Charlie Gleason" />
      </text>
      <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
    </box>
  );
}
