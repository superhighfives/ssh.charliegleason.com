/** @jsxImportSource @opentui/react */

import { Input as InputPrimitive } from "@tuiparts/react/input";
import { useTheme } from "./use-theme";

export interface InputProps extends InputPrimitive.Props {}

/** Consumer-owned React Input recipe with editable visual defaults. */
export function Input(props: InputProps) {
  const tokens = useTheme();
  return (
    <InputPrimitive
      backgroundColor="transparent"
      cursorColor={tokens.colors.focus}
      focusedBackgroundColor="transparent"
      focusedTextColor={tokens.colors.foreground}
      placeholderColor={tokens.colors.mutedForeground}
      textColor={tokens.colors.foreground}
      {...props}
    />
  );
}
