// src/components/AsciiTitle.tsx

import { bold, t } from "@opentui/core";
import { colors } from "../theme";

export function AsciiTitle() {
  return (
    <box flexDirection="column" justifyContent="center">
      <text fg={colors.yellow} content={t`${bold("Charlie Gleason")}`} />
      <box>
        <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
      </box>
    </box>
  );
}
