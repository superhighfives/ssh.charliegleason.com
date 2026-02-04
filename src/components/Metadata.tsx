// src/components/Metadata.tsx

import { metadata } from "../data/content";
import { colors } from "../theme";

export function Metadata() {
  return (
    <box flexDirection="column" gap={1}>
      <text fg={colors.white}>{metadata.location}</text>
      <text fg={colors.white}>{metadata.company}</text>
      <text fg={colors.white}>{metadata.website}</text>
      <text fg={colors.white}>{metadata.github}</text>
    </box>
  );
}
