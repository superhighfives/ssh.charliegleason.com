// src/components/ViewHeader.tsx
//
// Shared header for every sub-view: the "← Back" help line, the page title,
// and the full-width divider. Centralizes spacing so every view looks the
// same and hides the help line on compact terminals where it'd crowd things
// out.

import { TextAttributes } from "@opentui/core";
import { colors } from "../theme";
import { Divider } from "./Divider";
import { useLayout } from "./useLayout";

type ViewHeaderProps = {
  title: string;
  // Right-hand portion of the help line (after "← Back (esc)  •  "). Hidden
  // on compact terminals.
  hint: string;
};

export function ViewHeader({ title, hint }: ViewHeaderProps) {
  const { contentWidth, isCompact } = useLayout();
  return (
    <box flexDirection="column">
      <text
        fg={colors.dim}
        content={isCompact ? "← Back (esc)" : `← Back (esc)  •  ${hint}`}
      />
      <box height={1} />
      <text fg={colors.yellow} attributes={TextAttributes.BOLD} content={title} />
      <box height={1} />
      <Divider width={contentWidth} />
      <box height={1} />
    </box>
  );
}
