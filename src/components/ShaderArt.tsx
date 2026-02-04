// src/components/ShaderArt.tsx

import { useEffect, useState, useMemo } from "react";
import { getRandomShader } from "../data/shaders";
import { colors } from "../theme";

export function ShaderArt() {
  const shader = useMemo(() => getRandomShader(), []);
  const [frame, setFrame] = useState(0);

  // Continuous animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => f + 1);
    }, 150); // Update every 150ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Create animated version of shader with pulsing/shifting effect
  const animatedShader = useMemo(() => {
    const chars = shader.split("");
    const densityChars = ["·", ":", "░", "▒", "▓", "█"];
    
    return chars
      .map((char, i) => {
        if (char === " " || char === "\n") return char;
        
        // Find the density level of this character
        const charIndex = densityChars.indexOf(char);
        if (charIndex === -1) return char;
        
        // Create a wave effect based on position and frame
        const wave = Math.sin((i * 0.3) + (frame * 0.2));
        const shift = Math.round(wave * 1.5);
        
        // Shift the density up or down
        const newIndex = Math.max(0, Math.min(densityChars.length - 1, charIndex + shift));
        return densityChars[newIndex];
      })
      .join("");
  }, [shader, frame]);

  return (
    <box justifyContent="center">
      <text fg={colors.yellow}>{animatedShader}</text>
    </box>
  );
}
