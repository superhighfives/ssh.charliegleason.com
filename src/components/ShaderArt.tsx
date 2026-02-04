// src/components/ShaderArt.tsx

import { useEffect, useState, useMemo } from "react";
import { useTimeline } from "@opentui/react";
import { getRandomShader } from "../data/shaders";
import { colors } from "../theme";

export function ShaderArt() {
  const shader = useMemo(() => getRandomShader(), []);
  const [revealProgress, setRevealProgress] = useState(0);

  const timeline = useTimeline({
    duration: 1500,
    loop: false,
  });

  useEffect(() => {
    timeline.add(
      { progress: 0 },
      {
        progress: 1,
        duration: 1500,
        ease: "outExpo",
        onUpdate: (animation) => {
          setRevealProgress(animation.targets[0].progress);
        },
      }
    );
  }, []);

  // Create revealed version of shader based on progress
  const revealedShader = useMemo(() => {
    const chars = shader.split("");
    const totalChars = chars.filter((c) => c !== " " && c !== "\n").length;
    const charsToShow = Math.floor(totalChars * revealProgress);

    let shown = 0;
    return chars
      .map((char) => {
        if (char === " " || char === "\n") return char;
        if (shown < charsToShow) {
          shown++;
          return char;
        }
        // Random noise character for unrevealed
        const noise = ["·", ":", "░", " "];
        return revealProgress > 0.1 ? noise[Math.floor(Math.random() * noise.length)] : " ";
      })
      .join("");
  }, [shader, revealProgress]);

  return (
    <box>
      <text fg={colors.yellow}>{revealedShader}</text>
    </box>
  );
}
