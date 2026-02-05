// src/components/ShaderArt.tsx
// Real-time procedural ASCII shader effects

import { useEffect, useState, useMemo } from "react";
import { renderShader, getRandomShaderType, reseedShader, type ShaderType } from "../shaders";
import { colors } from "../theme";

interface ShaderArtProps {
  width?: number;
  height?: number;
  type?: ShaderType;
}

export function ShaderArt({ width = 24, height = 8, type }: ShaderArtProps) {
  // Pick a random shader type on mount if not specified
  const shaderType = useMemo(() => {
    reseedShader(); // New random seed each time
    return type ?? getRandomShaderType();
  }, [type]);

  const [time, setTime] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50); // ~20fps for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Render the shader
  const shaderOutput = useMemo(() => {
    return renderShader(shaderType, {
      width,
      height,
      time,
    });
  }, [shaderType, width, height, time]);

  return (
    <box>
      <text fg={colors.yellow} content={shaderOutput} />
    </box>
  );
}
