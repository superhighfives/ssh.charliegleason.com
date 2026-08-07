// src/components/ThemeProvider.tsx
//
// Detects whether the client terminal is light or dark and exposes the matching
// palette to the tree via `useColors()`.
//
// The renderer OpenTUI wires to each SSH session watches the terminal's
// colour-scheme reports (DSR mode 2031 / OSC colour queries) and exposes the
// result as `renderer.themeMode` ("dark" | "light" | null). `null` means the
// query is still in flight or the terminal doesn't speak the protocol — we fall
// back to dark, which matches the app's original look. The renderer re-emits
// "theme_mode" if the user flips their terminal theme mid-session, so this
// follows live.

import { useRenderer } from "@opentui/react";
import type { ThemeMode } from "@opentui/core";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { palettes, dark, type Colors } from "../theme";
import { tokensForColors } from "./ui/theme";
import { TuipartsThemeProvider } from "./ui/use-theme";

const ColorsContext = createContext<Colors>(dark);

export function useColors(): Colors {
  return useContext(ColorsContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const renderer = useRenderer();
  const [mode, setMode] = useState<ThemeMode | null>(() => renderer.themeMode);

  useEffect(() => {
    // The query may have resolved before this mounted; grab it, then follow any
    // later flips of the terminal's theme.
    setMode(renderer.themeMode);
    const onThemeMode = (next: ThemeMode) => setMode(next);
    renderer.on("theme_mode", onThemeMode);
    return () => {
      renderer.off("theme_mode", onThemeMode);
    };
  }, [renderer]);

  const colors = palettes[mode ?? "dark"];

  return (
    <ColorsContext.Provider value={colors}>
      <TuipartsThemeProvider tokens={tokensForColors(colors)}>
        {children}
      </TuipartsThemeProvider>
    </ColorsContext.Provider>
  );
}
