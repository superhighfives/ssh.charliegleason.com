import {
  type ColorInput,
  parseColor,
  RGBA,
  type ThemeMode,
} from "@opentui/core";
import { colors, type Colors } from "../../theme";

/** Semantic token contract shared by every installed recipe. Extend freely. */
export interface Tokens {
  colors: {
    background: ColorInput;
    surface: ColorInput;
    foreground: ColorInput;
    mutedForeground: ColorInput;
    border: ColorInput;
    focus: ColorInput;
    primary: ColorInput;
    primaryForeground: ColorInput;
    destructive: ColorInput;
    destructiveForeground: ColorInput;
    success: ColorInput;
    successForeground: ColorInput;
    warning: ColorInput;
    warningForeground: ColorInput;
    disabled: ColorInput;
    disabledForeground: ColorInput;
  };
  glyphs: {
    check: string;
    radio: string;
    thumb: string;
    track: string;
  };
  borders: {
    style: "single" | "rounded" | "double" | "heavy";
  };
  density: {
    paddingX: number;
    comfortablePaddingX: number;
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends RGBA
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** A named theme: shared overrides plus optional per-mode overlays. */
export interface ThemeDefinition {
  tokens?: DeepPartial<Tokens>;
  dark?: DeepPartial<Tokens>;
  light?: DeepPartial<Tokens>;
}

export type ThemeModeSetting = ThemeMode | "system";

/** Structural slice of CliRenderer consumed by `follow`. */
export interface ThemeModeSource {
  readonly themeMode: ThemeMode | null;
  on(event: "theme_mode", listener: (mode: ThemeMode) => void): unknown;
  off(event: "theme_mode", listener: (mode: ThemeMode) => void): unknown;
}

export interface ThemeStoreConfig {
  base: Tokens;
  themes?: Record<string, ThemeDefinition>;
  active?: string;
  mode?: ThemeModeSetting;
}

export interface ThemeStore {
  get(): Readonly<Tokens>;
  subscribe(listener: () => void): () => void;
  setActive(name: string): boolean;
  setMode(mode: ThemeModeSetting): void;
  override(tokens: DeepPartial<Tokens> | undefined): void;
  register(name: string, definition: ThemeDefinition): void;
  follow(source: ThemeModeSource): () => void;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepMerge<T>(base: T, layer: DeepPartial<T>): T {
  const merged: Record<string, unknown> = { ...(base as object) };
  for (const [key, value] of Object.entries(layer as object)) {
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value)
        ? deepMerge(current, value)
        : value;
  }
  return merged as T;
}

/** Frozen deep copy; never freezes the caller's object, so `base` stays writable. */
function deepFrozen<T>(value: T): Readonly<T> {
  if (!isPlainObject(value)) return value;
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value))
    copy[key] = deepFrozen(child);
  return Object.freeze(copy) as Readonly<T>;
}

/**
 * Resolves `base ⊕ active.tokens ⊕ active[mode] ⊕ override` eagerly into one
 * frozen snapshot that stays referentially stable until the next change.
 */
export function createThemeStore(config: ThemeStoreConfig): ThemeStore {
  const themes = new Map(Object.entries(config.themes ?? {}));
  const listeners = new Set<() => void>();
  let active = config.active ?? "";
  let mode: ThemeModeSetting = config.mode ?? "system";
  let detected: ThemeMode | undefined;
  let overrides: DeepPartial<Tokens> | undefined;
  let snapshot: Readonly<Tokens>;

  const resolvedMode = (): ThemeMode =>
    mode === "system" ? (detected ?? "dark") : mode;

  const resolve = () => {
    const definition = themes.get(active);
    const layers = [
      definition?.tokens,
      definition?.[resolvedMode()],
      overrides,
    ];
    snapshot = deepFrozen(
      layers.reduce<Tokens>(
        (tokens, layer) => (layer ? deepMerge(tokens, layer) : tokens),
        config.base,
      ),
    );
  };
  resolve();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    get: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setActive(name) {
      if (!themes.has(name)) return false;
      if (name !== active) {
        active = name;
        resolve();
        notify();
      }
      return true;
    },
    setMode(next) {
      if (next === mode) return;
      const before = resolvedMode();
      mode = next;
      if (resolvedMode() !== before) {
        resolve();
        notify();
      }
    },
    override(tokens) {
      overrides = tokens;
      resolve();
      notify();
    },
    register(name, definition) {
      themes.set(name, definition);
      if (name === active) {
        resolve();
        notify();
      }
    },
    follow(source) {
      const apply = (next: ThemeMode) => {
        if (next === detected) return;
        const before = resolvedMode();
        detected = next;
        if (mode === "system" && resolvedMode() !== before) {
          resolve();
          notify();
        }
      };
      if (source.themeMode) apply(source.themeMode);
      const listener = (next: ThemeMode) => apply(next);
      source.on("theme_mode", listener);
      return () => {
        source.off("theme_mode", listener);
      };
    },
  };
}

/** Blend `overlay` into `base` by `alpha` (0–1); indexed and default-intent colors blend via their RGB snapshot. */
export function tint(
  base: ColorInput,
  overlay: ColorInput,
  alpha: number,
): RGBA {
  const from = parseColor(base);
  const to = parseColor(overlay);
  const channel = (a: number, b: number) =>
    Math.round((a + (b - a) * alpha) * 255);
  return RGBA.fromInts(
    channel(from.r, to.r),
    channel(from.g, to.g),
    channel(from.b, to.b),
    Math.round(from.a * 255),
  );
}

/** Map the app's active light/dark palette onto every tuiparts semantic token. */
export function tokensForColors(colors: Colors): Tokens {
  return {
    colors: {
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
    },
    glyphs: {
      check: "✓",
      radio: ">",
      thumb: "●",
      track: "─",
    },
    borders: { style: "single" },
    density: { paddingX: 1, comfortablePaddingX: 2 },
  };
}

export const terminal = tokensForColors(colors);

/** App-wide theme store; register presets here and switch with `setActive`. */
export const theme = createThemeStore({
  base: terminal,
  themes: { terminal: {} },
  active: "terminal",
  mode: "system",
});
