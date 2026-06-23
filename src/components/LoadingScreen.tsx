// src/components/LoadingScreen.tsx
//
// Full-screen cold-start state, shown while the first content fetch from
// charliegleason.com is still in flight (see ../data/store). Keeps the brand in
// the top-left corner and floats a quiet braille spinner in the dead centre, so
// the empty terminal reads as "working on it" rather than broken.

import { useEffect, useState } from "react";
import { colors } from "../theme";
import { AsciiTitle } from "./AsciiTitle";

// Braille dots cycle smoothly and feel at home in a terminal — sparser and less
// noisy than a spinning slash.
const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const FRAME_MS = 80;

function useSpinner(): string {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, []);
  return FRAMES[frame] ?? "⠋";
}

export function LoadingScreen() {
  const spinner = useSpinner();
  return (
    <box flexGrow={1} flexDirection="column" padding={1}>
      <AsciiTitle />
      {/* Eat the rest of the screen and centre the spinner in it. */}
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <box flexDirection="row">
          <text fg={colors.dim} content={spinner} />
          <text fg={colors.dim} content=" Loading..." />
        </box>
      </box>
    </box>
  );
}
