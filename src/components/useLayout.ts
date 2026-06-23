// src/components/useLayout.ts
//
// Tiny responsive-layout hook shared by every view. Returns the effective
// (width, height) we can actually paint into, plus a `tooSmall` flag for when
// the terminal is below the floor where things look broken. Views budget for
// the outer padding={1} that wraps each one.

import { useTerminalDimensions } from "@opentui/react";

// Design width. Long-form prose reads better capped around this; views won't
// stretch wider even if the terminal does. Height isn't capped — sub-views
// take all available rows so the scroll area fills the window.
export const PREFERRED_WIDTH = 80;

// Below these we render a "resize me" screen instead of trying to fit. At
// MIN_HEIGHT the menu still fits once the shader is dropped (see below).
export const MIN_WIDTH = 40;
export const MIN_HEIGHT = 20;

// The main menu shows its shader at/above this height; between MIN_HEIGHT and
// here the shader is hidden (now-playing still shows) so the bio/menu box stays
// fully visible.
export const SHADER_BREAKPOINT = 24;

// Outer padding budget (the `padding={1}` wrapper around every view).
const OUTER_PADDING = 2;

// On the main menu we switch to a single-column layout below this width. The
// two-column (bio + metadata) layout needs around this many cells to not feel
// cramped.
export const STACK_BREAKPOINT = 70;
// Below this width the help-hint line (Scroll keys, etc.) gets dropped so the
// title isn't crowded out by it.
export const COMPACT_BREAKPOINT = 60;

export function useLayout() {
  const { width, height } = useTerminalDimensions();
  return {
    termWidth: width,
    termHeight: height,
    contentWidth: Math.min(PREFERRED_WIDTH, Math.max(0, width - OUTER_PADDING)),
    contentHeight: Math.max(0, height - OUTER_PADDING),
    isStacked: width < STACK_BREAKPOINT,
    isCompact: width < COMPACT_BREAKPOINT,
    showShader: height >= SHADER_BREAKPOINT,
    tooSmall: width < MIN_WIDTH || height < MIN_HEIGHT,
  };
}
