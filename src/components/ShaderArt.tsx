// src/components/ShaderArt.tsx
// Real-time procedural ASCII shader effects

import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { renderShader, SHADER_TYPES, type ShaderType } from "../shaders";
import { colors } from "../theme";

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
}

export function ShaderArt({
  width = 24,
  height = 6,
  minHeight = 3,
  maxHeight = 16,
  chromeRows = 18,
  type,
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

	return (
		<box flexDirection="column" width={width}>
			<text fg={colors.yellow} content={shaderOutput} />
			<box
				flexDirection="row"
				justifyContent="space-between"
				width={width}
				marginBottom={1}
			>
				<text fg={colors.border} content={`Shader: ${shaderType}`} />
				<text fg={colors.border} content="n to cycle  •  ctrl+c to quit" />
			</box>
		</box>
	);
}
