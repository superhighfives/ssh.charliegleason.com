// src/components/TooSmall.tsx
//
// Rendered when the terminal drops below MIN_WIDTH x MIN_HEIGHT. Avoids the
// broken-looking truncation you get when an 80-column layout meets a 40-column
// terminal.

import { colors } from "../theme";
import { MIN_HEIGHT, MIN_WIDTH } from "./useLayout";

type TooSmallProps = {
  width: number;
  height: number;
};

export function TooSmall({ width, height }: TooSmallProps) {
  return (
    <box flexGrow={1} justifyContent="center" alignItems="center" padding={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={colors.yellow} content="Terminal's a bit small." />
        <text fg={colors.dim} content={`Currently ${width}x${height}.`} />
        <text fg={colors.dim} content={`Resize to ${MIN_WIDTH}x${MIN_HEIGHT} or more.`} />
        <box marginTop={1}>
          <text fg={colors.dim} content="(Or visit charliegleason.com)" />
        </box>
      </box>
    </box>
  );
}
