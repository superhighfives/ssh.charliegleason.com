// src/theme.ts
//
// Two palettes, picked per session from the terminal's reported theme. The app
// never paints its own background — it lets the terminal's show through — so on
// a light terminal the dark palette's white body text would be white-on-white.
// The renderer OpenTUI hands each session detects light vs dark for us (see
// ThemeProvider); this file just holds the two colour sets it chooses between.

export type Colors = {
  yellow: string;
  white: string;
  dim: string;
  faint: string;
  border: string;
  background: string;
};

// The original dark palette, tuned for a dark terminal background.
export const dark: Colors = {
  yellow: "#FFD700",
  white: "#FFFFFF",
  dim: "#999999",
  // A quieter grey than `dim`, for ambient/background flourishes (spark field).
  faint: "#666666",
  border: "#444444",
  background: "#1a1a1a",
};

// The light-terminal counterpart. `white` (primary body text) flips to near
// black, the gold accent darkens so it's legible on white, and the greys invert
// so `faint` stays quieter than `dim` against a light background.
export const light: Colors = {
  yellow: "#9A7B00",
  white: "#1A1A1A",
  dim: "#666666",
  faint: "#BBBBBB",
  border: "#CCCCCC",
  background: "#FFFFFF",
};

export const palettes = { dark, light } as const;

// Named `colors` export kept pointing at the dark palette so non-React modules
// can still import it directly. React components should call `useColors()` so
// they follow the detected terminal theme.
export const colors = dark;

export const spacing = {
  padding: 1,
  gap: 1,
};
