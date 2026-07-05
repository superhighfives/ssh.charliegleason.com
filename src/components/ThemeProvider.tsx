// src/components/ThemeProvider.tsx
//
// Chooses the light or dark palette for the session and exposes it via
// `useColors()`, plus a manual override via `useThemeControl()`.
//
// Auto-detect: the renderer OpenTUI wires to each SSH session watches the
// terminal's colour-scheme reports (DSR mode 2031 / OSC colour queries) and
// exposes the result as `renderer.themeMode` ("dark" | "light" | null). `null`
// means the terminal never told us — either the query is still in flight or the
// terminal doesn't speak the protocol (e.g. Apple Terminal.app). It re-emits
// "theme_mode" if the user flips their terminal theme mid-session, so this
// follows live.
//
// Manual override: because plenty of terminals don't self-report, `cycle()`
// steps through auto → light → dark → auto. An explicit choice always wins over
// detection; "auto" hands control back to the terminal.

import { useRenderer } from "@opentui/react";
import type { ThemeMode } from "@opentui/core";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { palettes, dark, type Colors } from "../theme";

// null override === "auto" (follow the terminal).
type Override = ThemeMode | null;

type ThemeControl = {
  // The palette actually in use, after applying any override.
  mode: ThemeMode;
  // The user's explicit choice, or null when following the terminal.
  override: Override;
  // What the terminal reported, or null if it never did.
  detected: ThemeMode | null;
  // Step auto → light → dark → auto.
  cycle: () => void;
};

const ColorsContext = createContext<Colors>(dark);
const ThemeControlContext = createContext<ThemeControl>({
  mode: "dark",
  override: null,
  detected: null,
  cycle: () => {},
});

export function useColors(): Colors {
  return useContext(ColorsContext);
}

export function useThemeControl(): ThemeControl {
  return useContext(ThemeControlContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const renderer = useRenderer();
  const [detected, setDetected] = useState<ThemeMode | null>(() => renderer.themeMode);
  const [override, setOverride] = useState<Override>(null);

  useEffect(() => {
    // The query may have resolved before this mounted; grab it, then follow any
    // later flips of the terminal's theme.
    setDetected(renderer.themeMode);
    const onThemeMode = (next: ThemeMode) => setDetected(next);
    renderer.on("theme_mode", onThemeMode);
    return () => {
      renderer.off("theme_mode", onThemeMode);
    };
  }, [renderer]);

  const control = useMemo<ThemeControl>(() => {
    // Explicit choice wins; otherwise follow the terminal; default dark when the
    // terminal stayed silent (matches the app's original look).
    const mode: ThemeMode = override ?? detected ?? "dark";
    const cycle = () =>
      setOverride((prev) => (prev === null ? "light" : prev === "light" ? "dark" : null));
    return { mode, override, detected, cycle };
  }, [override, detected]);

  const colors = palettes[control.mode];

  return (
    <ThemeControlContext.Provider value={control}>
      <ColorsContext.Provider value={colors}>{children}</ColorsContext.Provider>
    </ThemeControlContext.Provider>
  );
}
