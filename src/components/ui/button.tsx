/** @jsxImportSource @opentui/react */

import { TextAttributes } from "@opentui/core";
import { Button as ButtonPrimitive } from "@tuiparts/react/button";
import { useTheme } from "./use-theme";

export interface ButtonProps extends Omit<ButtonPrimitive.Props, "children"> {
  intent?: "neutral" | "primary";
  label: string;
  size?: "compact" | "comfortable";
}

/** Consumer-owned React recipe installed on packaged Button behavior. */
export function Button({
  intent = "primary",
  label,
  size = "compact",
  disabled,
  ...props
}: ButtonProps) {
  const tokens = useTheme();
  return (
    <ButtonPrimitive
      backgroundColor="transparent"
      disabled={disabled}
      {...props}
    >
      {(state) => (
        <box
          backgroundColor={
            state.disabled
              ? tokens.colors.disabled
              : intent === "primary"
                ? tokens.colors.primary
                : tokens.colors.surface
          }
          paddingX={
            size === "comfortable"
              ? tokens.density.comfortablePaddingX
              : tokens.density.paddingX
          }
          paddingY={size === "comfortable" ? 1 : 0}
        >
          <text
            content={label}
            attributes={
              (state.focused ? TextAttributes.BOLD : 0) |
              (state.pressed ? TextAttributes.UNDERLINE : 0)
            }
            fg={
              state.disabled
                ? tokens.colors.disabledForeground
                : intent === "primary"
                  ? tokens.colors.primaryForeground
                  : tokens.colors.foreground
            }
          />
        </box>
      )}
    </ButtonPrimitive>
  );
}
