// src/components/AsciiTitle.tsx

import { bold, t } from "@opentui/core";
import type { ReactNode } from "react";
import { colors } from "../theme";

type AsciiTitleProps = {
  // Optional element pinned to the right of the name row (e.g. "Also here").
  // It sits opposite the name only — the tagline below always spans full width,
  // so a long tagline never gets squished against the aside.
  aside?: ReactNode;
};

export function AsciiTitle({ aside }: AsciiTitleProps) {
  return (
    <box flexDirection="column" justifyContent="center">
      <box flexDirection="row" justifyContent="space-between">
        <text fg={colors.yellow} content={t`${bold("Charlie Gleason")}`} />
        {aside}
      </box>
      <box>
        <text fg={colors.white}>Designer, developer, creative coder, and musician.</text>
      </box>
    </box>
  );
}
