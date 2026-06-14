// src/components/ShaderArt.tsx
// Real-time procedural ASCII shader effects

import { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { renderShader, SHADER_TYPES, type ShaderType } from "../shaders";
import { colors } from "../theme";

interface ShaderArtProps {
  width?: number;
  height?: number;
  type?: ShaderType;
}

export function ShaderArt({ width = 24, height = 8, type }: ShaderArtProps) {
  const startIdx = type ? Math.max(0, SHADER_TYPES.indexOf(type)) : 0;
  const [shaderIdx, setShaderIdx] = useState(startIdx);
  const shaderType = SHADER_TYPES[shaderIdx]!;

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

  const shaderOutput = useMemo(() => {
    return renderShader(shaderType, { width, height, time });
  }, [shaderType, width, height, time]);

  return (
    <box flexDirection="column">
      <text fg={colors.yellow} content={shaderOutput} />
      <text fg={colors.border}>shader: {shaderType} (press n to cycle)</text>
    </box>
  );
}
