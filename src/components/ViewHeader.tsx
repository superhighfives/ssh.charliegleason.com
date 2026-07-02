// src/components/ViewHeader.tsx
//
// Shared page template for every sub-view: the brand name, the page title, the
// "← Back" help line, and the rule below. Centralizes spacing so every view
// looks the same and hides the help line on compact terminals where it'd crowd
// things out.

import { bold, t } from "@opentui/core";
import { colors } from "../theme";
import { Divider } from "./Divider";
import { useLayout } from "./useLayout";

type ViewHeaderProps = {
	title: string;
	// Right-hand portion of the help line (after "← Back (esc)  •  "). Hidden
	// on compact terminals.
	hint: string;
	// Drop the blank row below the rule so the next element butts right against
	// it. About uses this so its spark band can touch the header rule.
	flush?: boolean;
};

export function ViewHeader({ title, hint, flush = false }: ViewHeaderProps) {
	const { contentWidth, isCompact } = useLayout();
	// Layout: "brand / page title" (brand quiet, title bold) / controls, then a
	// blank, the rule, and — unless `flush` — a trailing blank before the content.
	// flexShrink={0} keeps the blank rows from being collapsed by flex.
	return (
		<box flexDirection="column" flexShrink={0}>
			<text fg={colors.yellow} content={t`Charlie Gleason / ${bold(title)}`} />
			<text
				fg={colors.dim}
				content={isCompact ? "← Back (esc)" : `← Back (esc) · ${hint}`}
			/>
			<box height={1} flexShrink={0} />
			{/* One column short of full width so the rule clears the scrollbar
          gutter of the content below it. */}
			<Divider width={contentWidth - 1} />
			{!flush && <box height={1} flexShrink={0} />}
		</box>
	);
}
