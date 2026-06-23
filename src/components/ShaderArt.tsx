// src/components/ShaderArt.tsx
// Real-time procedural ASCII shader effects

import { bold, t } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import type { NowPlaying } from "../data/live";
import { renderShader, SHADER_TYPES, type ShaderType } from "../shaders";
import { colors } from "../theme";

// Build the now-playing caption, keeping the track and artist bold even when the
// line must be truncated to `room` columns. Walks the segments (plain prefix,
// bold name, plain " by ", bold artist), taking characters until the budget runs
// out and appending an ellipsis. bold("") renders nothing, so partial cuts are
// safe.
function nowPlayingContent(song: NowPlaying, room: number) {
	const head = `♪ ${song.isNowPlaying ? "Listening to" : "Last played"} `;
	const mid = " by ";
	if (head.length + song.name.length + mid.length + song.artist.length <= room) {
		return t`${head}${bold(song.name)}${mid}${bold(song.artist)}`;
	}
	let budget = Math.max(0, room - 1); // leave a column for the ellipsis
	const take = (s: string) => {
		const part = s.slice(0, budget);
		budget -= part.length;
		return part;
	};
	const h = take(head);
	const n = take(song.name);
	const m = take(mid);
	const a = take(song.artist);
	return t`${h}${bold(n)}${m}${bold(a)}…`;
}

interface ShaderArtProps {
	width?: number;
	// Preferred height. Used when the terminal is comfortably tall.
	height?: number;
	// Min/max bounds for adaptive sizing on short terminals. The visual will
	// shrink down to `minHeight` lines on a cramped 24-row terminal and grow up
	// to `maxHeight` when there's room. `height` acts as the upper bound when
	// `maxHeight` isn't provided.
	minHeight?: number;
	maxHeight?: number;
	// Approximate non-shader rows above + below this component, used to figure
	// out how much vertical space is left for the visual.
	chromeRows?: number;
	type?: ShaderType;
	// Optional now-playing track, shown on the left of the caption row.
	song?: NowPlaying | null;
}

export function ShaderArt({
  width = 24,
  height = 6,
  minHeight = 3,
  maxHeight = 16,
  chromeRows = 18,
  type,
  song,
}: ShaderArtProps) {
	const startIdx = type ? Math.max(0, SHADER_TYPES.indexOf(type)) : 0;
	const [shaderIdx, setShaderIdx] = useState(startIdx);
	const shaderType = SHADER_TYPES[shaderIdx]!;

	const { height: termHeight } = useTerminalDimensions();

	useKeyboard((key) => {
		if (key.name === "n") {
			setShaderIdx((i) => (i + 1) % SHADER_TYPES.length);
		}
	});

	const [time, setTime] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setTime((t) => t + 0.05);
		}, 30);

		return () => clearInterval(interval);
	}, []);

	// Clamp the preferred height into [minHeight, maxHeight], then shrink further
	// if the terminal can't fit it. We allow at most (termHeight - chromeRows)
	// rows of shader, never less than minHeight.
	const upper = Math.min(maxHeight, height);
	const available = Math.max(minHeight, termHeight - chromeRows);
	const effectiveHeight = Math.max(minHeight, Math.min(upper, available));

	const shaderOutput = useMemo(() => {
		return renderShader(shaderType, { width, height: effectiveHeight, time });
	}, [shaderType, width, effectiveHeight, time]);

	// Caption row: song on the left, shader name + controls on the right. Below
	// ~50 cols the controls hint is dropped (just the shader name remains) so the
	// song keeps room; the keys still work regardless.
	const showHint = width >= 50;
	const shaderName = shaderType.charAt(0).toUpperCase() + shaderType.slice(1);
	const controls = showHint
		? `${shaderName} (n to cycle • ctrl+c to quit)`
		: shaderName;

	// Reserve room for the controls plus a 2-col gap; the song truncates (with an
	// ellipsis, keeping track/artist bold) into whatever's left.
	const songRoom = Math.max(0, width - controls.length - 2);

	return (
		<box flexDirection="column" width={width}>
			<text fg={colors.yellow} content={shaderOutput} />
			<box
				flexDirection="row"
				justifyContent="space-between"
				width={width}
				marginBottom={1}
			>
				<text
					fg={colors.dim}
					content={song ? nowPlayingContent(song, songRoom) : ""}
				/>
				<text fg={colors.border} content={controls} />
			</box>
		</box>
	);
}
