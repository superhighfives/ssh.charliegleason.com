// src/components/Divider.tsx
//
// Horizontal rule that stretches to a given width. Views hand us their inner
// content width so the line sits flush against the right edge instead of
// stopping at an arbitrary 76 characters.

import { colors } from "../theme";

type DividerProps = {
  width: number;
};

export function Divider({ width }: DividerProps) {
  return <text fg={colors.border} content={"─".repeat(Math.max(0, width))} />;
}
