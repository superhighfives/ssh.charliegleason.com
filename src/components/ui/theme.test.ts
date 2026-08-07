import { describe, expect, test } from "bun:test";
import { dark, light } from "../../theme";
import { tokensForColors } from "./theme";

describe("tokensForColors", () => {
  test.each([dark, light])("maps tuiparts to the app palette", (colors) => {
    const tokens = tokensForColors(colors);

    expect(tokens.colors).toEqual({
      background: colors.background,
      surface: colors.background,
      foreground: colors.white,
      mutedForeground: colors.dim,
      border: colors.border,
      focus: colors.yellow,
      primary: colors.yellow,
      primaryForeground: colors.accentForeground,
      destructive: colors.error,
      destructiveForeground: colors.background,
      success: colors.yellow,
      successForeground: colors.accentForeground,
      warning: colors.yellow,
      warningForeground: colors.accentForeground,
      disabled: colors.background,
      disabledForeground: colors.dim,
    });
    expect(tokens.borders.style).toBe("single");
    expect(tokens.density).toEqual({ paddingX: 1, comfortablePaddingX: 2 });
  });
});
