// src/shaders/index.ts
// Procedural ASCII shader effects
// Supports both string output and FrameBuffer rendering

import { RGBA, type OptimizedBuffer } from "@opentui/core";
import { simplex2, fbm, seedNoise } from "./noise";

// Re-export noise utilities
export { simplex2, fbm, seedNoise } from "./noise";

// Character sets
const DENSITY_CHARS = " ·:░▒▓█";
const ARROW_CHARS = "→↗↑↖←↙↓↘"; // 8 directions

// Pre-computed colors for FrameBuffer rendering
const TRANSPARENT = RGBA.fromValues(0, 0, 0, 0);

export type ShaderType = "flowField" | "plasma" | "waves" | "metaballs" | "rings";

export interface ShaderConfig {
  width: number;
  height: number;
  time: number;
  scale?: number;
}

// --- Utility functions ---

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getDensityChar(value: number): string {
  const index = Math.floor(clamp(value, 0, 0.999) * DENSITY_CHARS.length);
  return DENSITY_CHARS[index] || " ";
}

function getArrowChar(angle: number): string {
  const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor((normalizedAngle / (Math.PI * 2)) * 8 + 0.5) % 8;
  return ARROW_CHARS[index] || "→";
}

function getIntensityColor(value: number): RGBA {
  const intensity = clamp(value, 0.2, 1.0);
  return RGBA.fromValues(1.0, 0.84 * intensity, 0.0, 1.0);
}

// --- Shader core functions (compute value at point) ---

function flowFieldAt(x: number, y: number, time: number, scale: number): { char: string; value: number } {
  const nx = x * scale;
  const ny = y * scale * 2;
  const t = time * 0.5;

  const angle = simplex2(nx + t, ny) * Math.PI * 2;
  const intensity = (simplex2(nx * 2 + 100, ny * 2 + t * 0.3) + 1) / 2;

  if (intensity > 0.3) {
    return { char: getArrowChar(angle), value: intensity };
  }
  return { char: " ", value: 0 };
}

function plasmaAt(x: number, y: number, time: number, scale: number): { char: string; value: number } {
  const nx = x * scale;
  const ny = y * scale * 2;

  let value = 0;
  value += Math.sin(nx + time);
  value += Math.sin(ny + time * 0.5);
  value += Math.sin((nx + ny + time) * 0.5);
  value += Math.sin(Math.sqrt(nx * nx + ny * ny + 1) + time);
  value = (value + 4) / 8;

  return { char: getDensityChar(value), value };
}

function wavesAt(
  x: number,
  y: number,
  time: number,
  scale: number,
  width: number,
  height: number
): { char: string; value: number } {
  const centerX = width / 2;
  const centerY = height / 2;

  const d1 = Math.sqrt((x - centerX) ** 2 + ((y - centerY) * 2) ** 2);
  const d2 = Math.sqrt((x - width * 0.2) ** 2 + ((y - height * 0.3) * 2) ** 2);
  const d3 = Math.sqrt((x - width * 0.8) ** 2 + ((y - height * 0.7) * 2) ** 2);

  let value = 0;
  value += Math.sin(d1 * scale - time * 2);
  value += Math.sin(d2 * scale * 1.5 - time * 1.5);
  value += Math.sin(d3 * scale * 0.8 - time * 2.5);
  value = (value + 3) / 6;

  return { char: getDensityChar(value), value };
}

function metaballsAt(
  x: number,
  y: number,
  time: number,
  width: number,
  height: number
): { char: string; value: number } {
  const balls = [
    { x: width * 0.5 + Math.sin(time) * width * 0.2, y: height * 0.5 + Math.cos(time * 0.7) * height * 0.3, r: 3 },
    { x: width * 0.3 + Math.cos(time * 0.8) * width * 0.15, y: height * 0.4 + Math.sin(time * 1.2) * height * 0.2, r: 2.5 },
    { x: width * 0.7 + Math.sin(time * 1.1) * width * 0.15, y: height * 0.6 + Math.cos(time * 0.9) * height * 0.2, r: 2 },
  ];

  let sum = 0;
  for (const ball of balls) {
    const dx = x - ball.x;
    const dy = (y - ball.y) * 2;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
    sum += (ball.r * ball.r) / dist;
  }

  const value = clamp(sum / 3, 0, 1);
  return { char: getDensityChar(value), value };
}

function ringsAt(
  x: number,
  y: number,
  time: number,
  scale: number,
  width: number,
  height: number
): { char: string; value: number } {
  const centerX = width / 2;
  const centerY = height / 2;

  const dx = x - centerX;
  const dy = (y - centerY) * 2;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const ring = Math.sin(dist * scale - time * 2);
  const noise = simplex2(x * 0.1 + time * 0.2, y * 0.2) * 0.3;
  const value = clamp((ring + noise + 1.3) / 2.6, 0, 1);

  return { char: getDensityChar(value), value };
}

// --- String rendering (returns multiline string) ---

export function flowField(config: ShaderConfig): string {
  const { width, height, time, scale = 0.15 } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += flowFieldAt(x, y, time, scale).char;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function plasma(config: ShaderConfig): string {
  const { width, height, time, scale = 0.2 } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += plasmaAt(x, y, time, scale).char;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function waves(config: ShaderConfig): string {
  const { width, height, time, scale = 0.15 } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += wavesAt(x, y, time, scale, width, height).char;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function metaballs(config: ShaderConfig): string {
  const { width, height, time } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += metaballsAt(x, y, time, width, height).char;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function rings(config: ShaderConfig): string {
  const { width, height, time, scale = 0.3 } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += ringsAt(x, y, time, scale, width, height).char;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// String shader registry
const stringShaders: Record<ShaderType, (config: ShaderConfig) => string> = {
  flowField,
  plasma,
  waves,
  metaballs,
  rings,
};

/** Render shader to string */
export function renderShader(type: ShaderType, config: ShaderConfig): string {
  return stringShaders[type](config);
}

// --- FrameBuffer rendering (writes directly to OptimizedBuffer) ---

export function renderFlowFieldToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
  scale: number = 0.15
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { char, value } = flowFieldAt(x, y, time, scale);
      const color = value > 0 ? getIntensityColor(value) : TRANSPARENT;
      fb.setCell(x, y, char, color, TRANSPARENT);
    }
  }
}

export function renderPlasmaToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
  scale: number = 0.2
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { char, value } = plasmaAt(x, y, time, scale);
      fb.setCell(x, y, char, getIntensityColor(value), TRANSPARENT);
    }
  }
}

export function renderWavesToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
  scale: number = 0.15
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { char, value } = wavesAt(x, y, time, scale, width, height);
      fb.setCell(x, y, char, getIntensityColor(value), TRANSPARENT);
    }
  }
}

export function renderMetaballsToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { char, value } = metaballsAt(x, y, time, width, height);
      fb.setCell(x, y, char, getIntensityColor(value), TRANSPARENT);
    }
  }
}

export function renderRingsToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
  scale: number = 0.3
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { char, value } = ringsAt(x, y, time, scale, width, height);
      fb.setCell(x, y, char, getIntensityColor(value), TRANSPARENT);
    }
  }
}

// FrameBuffer shader registry
const bufferShaders: Record<ShaderType, (fb: OptimizedBuffer, w: number, h: number, t: number) => void> = {
  flowField: renderFlowFieldToBuffer,
  plasma: renderPlasmaToBuffer,
  waves: renderWavesToBuffer,
  metaballs: renderMetaballsToBuffer,
  rings: renderRingsToBuffer,
};

/** Render shader to FrameBuffer */
export function renderShaderToBuffer(
  type: ShaderType,
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number
): void {
  bufferShaders[type](fb, width, height, time);
}

// --- Utilities ---

/** Get a random shader type */
export function getRandomShaderType(): ShaderType {
  const types: ShaderType[] = ["flowField", "plasma", "waves", "metaballs", "rings"];
  return types[Math.floor(Math.random() * types.length)]!;
}

/** Re-seed the noise generator */
export function reseedShader(seed?: number): void {
  seedNoise(seed ?? Date.now());
}
