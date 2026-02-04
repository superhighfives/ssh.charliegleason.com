// src/components/AsciiTitle.tsx

import { colors } from "../theme";

export function AsciiTitle() {
  return (
    <box flexDirection="column">
      <ascii-font font="tiny" text="Charlie Gleason" fg={colors.yellow} />
      <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
    </box>
  );
}
