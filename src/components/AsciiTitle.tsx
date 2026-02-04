// src/components/AsciiTitle.tsx

import { colors } from "../theme";

export function AsciiTitle() {
  return (
    <box flexDirection="column" justifyContent="center">
      <ascii-font font="tiny" text="Charlie Gleason" />
      <box marginTop={1}>
        <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
      </box>
    </box>
  );
}
