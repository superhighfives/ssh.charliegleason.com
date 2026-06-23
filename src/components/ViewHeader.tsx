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
  // Layout: Controls / blank / Title / blank / rule / blank / (content follows).
  // flexShrink={0} keeps each blank row from being collapsed by flex.
  return (
    <box flexDirection="column" flexShrink={0}>
      <text
        fg={colors.dim}
        content={isCompact ? "← Back (esc)" : `← Back (esc)  •  ${hint}`}
      />
      <box height={1} flexShrink={0} />
      <text fg={colors.yellow} attributes={TextAttributes.BOLD} content={title} />
      <box height={1} flexShrink={0} />
      {/* One column short of full width so the rule clears the scrollbar
          gutter of the content below it. */}
      <Divider width={contentWidth - 1} />
      <box height={1} flexShrink={0} />
    </box>
  );
}
