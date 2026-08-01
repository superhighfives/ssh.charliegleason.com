import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Tokens, theme } from "./theme";

const ThemeContext = createContext<Readonly<Tokens> | null>(null);

export function TuipartsThemeProvider({
  tokens,
  children,
}: {
  tokens: Readonly<Tokens>;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

/** Resolved theme snapshot; re-renders on theme and mode changes. */
export function useTheme(): Readonly<Tokens> {
  const fallback = useSyncExternalStore(theme.subscribe, theme.get);
  return useContext(ThemeContext) ?? fallback;
}
