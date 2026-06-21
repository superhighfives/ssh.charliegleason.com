// src/shaders/index.ts
// Procedural ASCII shader effects
// Supports both string output and FrameBuffer rendering

import { RGBA, type OptimizedBuffer } from "@opentui/core";
import { simplex2, fbm, seedNoise } from "./noise";

// Re-export noise utilities
export { simplex2, fbm, seedNoise } from "./noise";

// Character sets
const DENSITY_CHARS = " .·¿±";

// Pre-computed colors for FrameBuffer rendering
const TRANSPARENT = RGBA.fromValues(0, 0, 0, 0);

export type ShaderType =
  | "plasma"
  | "field"
  | "particles"
  | "waves"
  | "metaballs"
  | "rings"
  | "tunnel"
  | "starfield"
  | "spiral"
  | "lava"
  | "matrix"
  | "fire"
  | "confetti"
  | "orbit"
  | "lissajous"
  | "bars"
  | "snow"
  | "ripples"
  | "waveform"
  | "heart"
  | "helix"
  | "swirl"
  | "moire"
  | "rain";

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

function getIntensityColor(value: number): RGBA {
  const intensity = clamp(value, 0.2, 1.0);
  return RGBA.fromValues(1.0, 0.84 * intensity, 0.0, 1.0);
}

// --- Shader core functions (compute value at point) ---

// 8-way arrows. Indexed by angle bucket starting from east (→) and going CCW.
// 0=→ 1=↗ 2=↑ 3=↖ 4=← 5=↙ 6=↓ 7=↘
const FLOW_CHARS = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"];

function plasmaAt(x: number, y: number, time: number, scale: number): { char: string; value: number } {
  const nx = x * scale;
  const ny = y * scale * 2;

  // Slow circular time evolution — the field breathes in place rather than drifting.
  const tx = Math.cos(time * 0.06) * 0.5;
  const ty = Math.sin(time * 0.06) * 0.5;

  // Two fbm samples form a 2D flow vector at this cell.
  const qx = fbm(nx + tx, ny + ty, 3);
  const qy = fbm(nx + tx + 5.2, ny + ty + 1.3, 3);

  const mag = Math.sqrt(qx * qx + qy * qy);
  const value = clamp(mag * 1.4, 0, 1);

  // atan2 → full -π..π; quantize into 8 directional buckets.
  // Negate qy because screen-y grows downward but we want ↑ to mean "field pointing up".
  let angle = Math.atan2(-qy, qx); // -π..π
  if (angle < 0) angle += 2 * Math.PI; // 0..2π
  const idx = Math.round((angle / (2 * Math.PI)) * 8) % 8;
  return { char: FLOW_CHARS[idx]!, value };
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
  value += Math.sin(d1 * scale - time * 0.2);
  value += Math.sin(d2 * scale * 1.5 - time * 0.15);
  value += Math.sin(d3 * scale * 0.8 - time * 0.25);
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

export function plasma(config: ShaderConfig): string {
  const { width, height, time, scale = 0.005 } = config;
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

// --- Field: domain-warped scalar fbm rendered with the density ramp.
// Quieter than plasma's arrows — just the magnitude of the flow vector.
export function field(config: ShaderConfig): string {
  const { width, height, time, scale = 0.1 } = config;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const nx = x * scale;
      const ny = y * scale * 2;
      const tx = Math.cos(time * 0.06) * 0.5;
      const ty = Math.sin(time * 0.06) * 0.5;
      const qx = fbm(nx + tx, ny + ty, 3);
      const qy = fbm(nx + tx + 5.2, ny + ty + 1.3, 3);
      const raw = fbm(nx + qx * 1.5, ny + qy * 1.5, 3);
      line += getDensityChar(clamp((raw + 1) * 0.5, 0, 1));
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// --- Particles: ~120 dots advected through the fbm flow field, leaving fading trails.
// Persistent state across frames — we accumulate trail intensity in a buffer that
// decays each tick. Module-scoped because there's only ever one ShaderArt instance.

const TRAIL_CHARS = " .·:•●";
const PARTICLE_COUNT = 120;
const TRAIL_DECAY = 0.86;
const STEP_SIZE = 0.6;

type ParticleState = {
  width: number;
  height: number;
  positions: { x: number; y: number }[];
  buffer: Float32Array;
};

let particleState: ParticleState | null = null;

function ensureParticleState(width: number, height: number): ParticleState {
  if (particleState && particleState.width === width && particleState.height === height) {
    return particleState;
  }
  const positions = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
  }));
  particleState = { width, height, positions, buffer: new Float32Array(width * height) };
  return particleState;
}

export function particles(config: ShaderConfig): string {
  const { width, height, time, scale = 0.08 } = config;
  const state = ensureParticleState(width, height);
  const { positions, buffer } = state;

  // Decay existing trails.
  for (let i = 0; i < buffer.length; i++) buffer[i] = buffer[i]! * TRAIL_DECAY;

  // Slow circular drift on the noise sample so the field swirls rather than runs.
  const tx = Math.cos(time * 0.05) * 0.5;
  const ty = Math.sin(time * 0.05) * 0.5;

  for (const p of positions) {
    const nx = p.x * scale + tx;
    const ny = p.y * scale + ty;
    const vx = fbm(nx, ny, 3);
    const vy = fbm(nx + 5.2, ny + 1.3, 3);

    p.x += vx * STEP_SIZE;
    // Multiply y step to compensate for terminal cell aspect (chars are taller than wide).
    p.y += vy * STEP_SIZE * 0.5;

    // Wrap so particles don't escape and the field stays populated.
    if (p.x < 0) p.x += width;
    if (p.x >= width) p.x -= width;
    if (p.y < 0) p.y += height;
    if (p.y >= height) p.y -= height;

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);
    const idx = iy * width + ix;
    buffer[idx] = Math.min(1, buffer[idx]! + 0.6);
  }

  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const v = buffer[y * width + x]!;
      const ci = Math.floor(clamp(v, 0, 0.999) * TRAIL_CHARS.length);
      line += TRAIL_CHARS[ci];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// --- 20 more shaders -------------------------------------------------------
// Kept tight on purpose. Stateful ones use module-scoped state guarded by
// (width, height) — fine for the single ShaderArt instance in this app.

type Drop = { x: number; y: number; v: number };

function initDrops(n: number, w: number, h: number, vRange = 1): Drop[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    v: 0.3 + Math.random() * vRange,
  }));
}

export function tunnel(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = (y - height / 2) * 2;
      const r = Math.sqrt(dx * dx + dy * dy) + 0.5;
      const a = Math.atan2(dy, dx);
      const v = Math.sin(8 / r + time * 2) * 0.5 + Math.sin(a * 5 + time) * 0.5;
      line += getDensityChar((v + 1) / 2);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

let starfieldState: { width: number; height: number; stars: Drop[] } | null = null;
export function starfield(c: ShaderConfig): string {
  const { width, height } = c;
  if (!starfieldState || starfieldState.width !== width || starfieldState.height !== height) {
    starfieldState = { width, height, stars: initDrops(80, width, height, 0.4) };
  }
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (const s of starfieldState.stars) {
    s.x -= s.v;
    if (s.x < 0) {
      s.x = width;
      s.y = Math.random() * height;
    }
    const ix = Math.floor(s.x);
    const iy = Math.floor(s.y);
    const row = grid[iy];
    if (row && ix >= 0 && ix < width) {
      row[ix] = s.v < 0.4 ? "·" : s.v < 0.55 ? "•" : "●";
    }
  }
  return grid.map((r) => r.join("")).join("\n");
}

export function spiral(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = (y - height / 2) * 2;
      const r = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx);
      const v = Math.sin(a * 3 + r * 0.5 - time * 2);
      line += getDensityChar((v + 1) / 2);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function lava(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const v = fbm(x * 0.1, y * 0.2 - time * 0.5, 4);
      line += getDensityChar((v + 1) / 2);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

const MATRIX_CHARS = "0123456789ABCDEF#@$%&*";
type MatrixCol = { y: number; len: number; speed: number };
let matrixState: { width: number; height: number; cols: MatrixCol[]; tick: number } | null = null;
export function matrix(c: ShaderConfig): string {
  const { width, height } = c;
  if (!matrixState || matrixState.width !== width || matrixState.height !== height) {
    matrixState = {
      width,
      height,
      cols: Array.from({ length: width }, () => ({
        y: Math.random() * height,
        len: 3 + Math.floor(Math.random() * 5),
        speed: 0.3 + Math.random() * 0.5,
      })),
      tick: 0,
    };
  }
  matrixState.tick += 1;
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (let x = 0; x < width; x++) {
    const col = matrixState.cols[x]!;
    col.y += col.speed;
    if (col.y - col.len > height) {
      col.y = -col.len;
      col.len = 3 + Math.floor(Math.random() * 5);
      col.speed = 0.3 + Math.random() * 0.5;
    }
    const head = Math.floor(col.y);
    for (let k = 0; k < col.len; k++) {
      const yy = head - k;
      const row = grid[yy];
      if (row) row[x] = MATRIX_CHARS[(yy + matrixState.tick + x + MATRIX_CHARS.length * 100) % MATRIX_CHARS.length]!;
    }
  }
  return grid.map((r) => r.join("")).join("\n");
}

export function fire(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const n = fbm(x * 0.15, y * 0.2 - time * 1.2, 3);
      const heat = clamp(((n + 1) * 0.5) * ((height - y) / height) * 1.5, 0, 1);
      line += getDensityChar(heat);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

let confettiState: { width: number; height: number; tick: number } | null = null;
export function confetti(c: ShaderConfig): string {
  const { width, height } = c;
  if (!confettiState || confettiState.width !== width || confettiState.height !== height) {
    confettiState = { width, height, tick: 0 };
  }
  confettiState.tick += 1;
  const chars = " .·:•●";
  const t = confettiState.tick;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const seed = (x * 73856093) ^ (y * 19349663) ^ (t * 83492791);
      const u = ((seed >>> 0) % 1000) / 1000;
      const v = Math.sin(u * 10 + t * 0.1);
      line += v > 0.7 ? chars[Math.min(chars.length - 1, Math.floor(((v - 0.7) / 0.3) * chars.length))]! : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function orbit(c: ShaderConfig): string {
  const { width, height, time } = c;
  const orbs = [
    { x: width / 2 + Math.cos(time) * width * 0.3, y: height / 2 + Math.sin(time) * height * 0.4, r: 2.5 },
    { x: width / 2 + Math.cos(time * 1.3) * width * 0.2, y: height / 2 + Math.sin(time * 0.8) * height * 0.3, r: 2 },
    { x: width / 2 + Math.cos(time * 0.6 + Math.PI) * width * 0.35, y: height / 2 + Math.sin(time * 1.1) * height * 0.35, r: 1.5 },
  ];
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      let v = 0;
      for (const o of orbs) {
        const dx = x - o.x;
        const dy = (y - o.y) * 2;
        v += o.r / (Math.sqrt(dx * dx + dy * dy) + 0.5);
      }
      line += getDensityChar(clamp(v / 3, 0, 1));
    }
    lines.push(line);
  }
  return lines.join("\n");
}

let lissajousState: { width: number; height: number; buffer: Float32Array } | null = null;
export function lissajous(c: ShaderConfig): string {
  const { width, height, time } = c;
  if (!lissajousState || lissajousState.width !== width || lissajousState.height !== height) {
    lissajousState = { width, height, buffer: new Float32Array(width * height) };
  }
  const buf = lissajousState.buffer;
  for (let i = 0; i < buf.length; i++) buf[i] = buf[i]! * 0.85;
  for (let t = 0; t < 30; t++) {
    const s = time + t * 0.03;
    const x = Math.floor((Math.sin(s * 3) * 0.5 + 0.5) * width);
    const y = Math.floor((Math.sin(s * 2) * 0.5 + 0.5) * height);
    if (x >= 0 && x < width && y >= 0 && y < height) buf[y * width + x] = 1;
  }
  const chars = " .·:•●";
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const v = buf[y * width + x]!;
      line += chars[Math.floor(clamp(v, 0, 0.999) * chars.length)]!;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function bars(c: ShaderConfig): string {
  const { width, height, time } = c;
  const heights: number[] = [];
  for (let x = 0; x < width; x++) {
    heights.push((Math.sin(x * 0.3 + time * 2) + Math.sin(x * 0.7 + time * 3) + 2) / 4);
  }
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    const cutoff = (height - y) / height;
    for (let x = 0; x < width; x++) {
      const h = heights[x]!;
      line += h > cutoff ? "█" : h > cutoff - 0.1 ? "▄" : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

let snowState: { width: number; height: number; flakes: Drop[] } | null = null;
export function snow(c: ShaderConfig): string {
  const { width, height } = c;
  if (!snowState || snowState.width !== width || snowState.height !== height) {
    snowState = { width, height, flakes: initDrops(40, width, height, 0.4) };
  }
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (const f of snowState.flakes) {
    f.y += f.v;
    f.x += Math.sin(f.y * 0.3) * 0.1;
    if (f.y >= height) {
      f.y = 0;
      f.x = Math.random() * width;
    }
    if (f.x < 0) f.x += width;
    if (f.x >= width) f.x -= width;
    const ix = Math.floor(f.x);
    const iy = Math.floor(f.y);
    const row = grid[iy];
    if (row && ix >= 0 && ix < width) row[ix] = f.v < 0.4 ? "·" : "•";
  }
  return grid.map((r) => r.join("")).join("\n");
}

export function ripples(c: ShaderConfig): string {
  const { width, height, time } = c;
  const sources = [
    { x: width * 0.3, y: height * 0.4, t: 0 },
    { x: width * 0.7, y: height * 0.6, t: 1.5 },
  ];
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      let v = 0;
      for (const s of sources) {
        const dx = x - s.x;
        const dy = (y - s.y) * 2;
        const r = Math.sqrt(dx * dx + dy * dy);
        v += Math.sin(r * 0.5 - (time + s.t) * 3) / (1 + r * 0.1);
      }
      line += getDensityChar(clamp((v + 1) * 0.5, 0, 1));
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function waveform(c: ShaderConfig): string {
  const { width, height, time } = c;
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (let x = 0; x < width; x++) {
    const v = Math.sin(x * 0.2 - time * 3) * 0.5 + Math.sin(x * 0.1 + time) * 0.3;
    const y = Math.floor(height / 2 + v * (height / 2 - 1));
    if (grid[y]) grid[y]![x] = "─";
    if (grid[y - 1]) grid[y - 1]![x] = "·";
    if (grid[y + 1]) grid[y + 1]![x] = "·";
  }
  return grid.map((r) => r.join("")).join("\n");
}

export function heart(c: ShaderConfig): string {
  const { width, height, time } = c;
  const pulse = 1 + Math.sin(time * 3) * 0.1;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const nx = (x - width / 2) / (width / 4) / pulse;
      const ny = -(y - height / 2) / (height / 3) / pulse;
      const a = nx * nx + ny * ny - 1;
      const v = a * a * a - nx * nx * ny * ny * ny;
      line += v <= 0 ? "█" : v < 0.5 ? "·" : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function helix(c: ShaderConfig): string {
  const { width, height, time } = c;
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (let y = 0; y < height; y++) {
    const phase = y * 0.4 - time * 2;
    const x1 = Math.floor(width / 2 + Math.sin(phase) * width * 0.3);
    const x2 = Math.floor(width / 2 + Math.sin(phase + Math.PI) * width * 0.3);
    const row = grid[y]!;
    if (x1 >= 0 && x1 < width) row[x1] = "●";
    if (x2 >= 0 && x2 < width) row[x2] = "○";
    if (y % 2 === 0) {
      const a = Math.min(x1, x2);
      const b = Math.max(x1, x2);
      for (let xi = a + 1; xi < b; xi++) if (row[xi] === " ") row[xi] = "·";
    }
  }
  return grid.map((r) => r.join("")).join("\n");
}

export function swirl(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = (y - height / 2) * 2;
      const r = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx) + r * 0.1 + time * 0.5;
      const nx = Math.cos(a) * r * 0.1;
      const ny = Math.sin(a) * r * 0.1;
      line += getDensityChar((fbm(nx, ny, 3) + 1) * 0.5);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function moire(c: ShaderConfig): string {
  const { width, height, time } = c;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const dx1 = x - width * 0.4;
      const dy1 = (y - height / 2) * 2;
      const dx2 = x - width * 0.6;
      const dy2 = (y - height / 2) * 2;
      const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const v = (Math.sin(r1 - time * 2) + Math.sin(r2 + time * 2)) * 0.5;
      line += getDensityChar((v + 1) * 0.5);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

type RainDrop = Drop & { len: number };
let rainState: { width: number; height: number; drops: RainDrop[] } | null = null;
export function rain(c: ShaderConfig): string {
  const { width, height } = c;
  if (!rainState || rainState.width !== width || rainState.height !== height) {
    rainState = {
      width,
      height,
      drops: Array.from({ length: 30 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        v: 0.8 + Math.random() * 1.2,
        len: 2 + Math.floor(Math.random() * 3),
      })),
    };
  }
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
  for (const d of rainState.drops) {
    d.y += d.v;
    if (d.y - d.len > height) {
      d.y = -d.len;
      d.x = Math.random() * width;
    }
    const ix = Math.floor(d.x);
    const head = Math.floor(d.y);
    for (let k = 0; k < d.len; k++) {
      const yy = head - k;
      const row = grid[yy];
      if (row && ix >= 0 && ix < width) row[ix] = k === 0 ? "│" : "·";
    }
  }
  return grid.map((r) => r.join("")).join("\n");
}

// String shader registry
const stringShaders: Record<ShaderType, (config: ShaderConfig) => string> = {
  plasma,
  field,
  particles,
  waves,
  metaballs,
  rings,
  tunnel,
  starfield,
  spiral,
  lava,
  matrix,
  fire,
  confetti,
  orbit,
  lissajous,
  bars,
  snow,
  ripples,
  waveform,
  heart,
  helix,
  swirl,
  moire,
  rain,
};

/** Render shader to string */
export function renderShader(type: ShaderType, config: ShaderConfig): string {
  return stringShaders[type](config);
}

// --- FrameBuffer rendering (writes directly to OptimizedBuffer) ---

export function renderPlasmaToBuffer(
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
  scale: number = 0.1
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

// Generic string-to-buffer adapter for shaders without a dedicated FB path.
function stringShaderToBuffer(
  fn: (config: ShaderConfig) => string,
  fb: OptimizedBuffer,
  width: number,
  height: number,
  time: number,
): void {
  const out = fn({ width, height, time }).split("\n");
  for (let y = 0; y < height; y++) {
    const row = out[y] ?? "";
    for (let x = 0; x < width; x++) {
      fb.setCell(x, y, row[x] ?? " ", getIntensityColor(0.8), TRANSPARENT);
    }
  }
}

// FrameBuffer shader registry
const bufferShaders: Record<ShaderType, (fb: OptimizedBuffer, w: number, h: number, t: number) => void> = {
  plasma: renderPlasmaToBuffer,
  field: (fb, w, h, t) => stringShaderToBuffer(field, fb, w, h, t),
  particles: (fb, w, h, t) => stringShaderToBuffer(particles, fb, w, h, t),
  waves: renderWavesToBuffer,
  metaballs: renderMetaballsToBuffer,
  rings: renderRingsToBuffer,
  tunnel: (fb, w, h, t) => stringShaderToBuffer(tunnel, fb, w, h, t),
  starfield: (fb, w, h, t) => stringShaderToBuffer(starfield, fb, w, h, t),
  spiral: (fb, w, h, t) => stringShaderToBuffer(spiral, fb, w, h, t),
  lava: (fb, w, h, t) => stringShaderToBuffer(lava, fb, w, h, t),
  matrix: (fb, w, h, t) => stringShaderToBuffer(matrix, fb, w, h, t),
  fire: (fb, w, h, t) => stringShaderToBuffer(fire, fb, w, h, t),
  confetti: (fb, w, h, t) => stringShaderToBuffer(confetti, fb, w, h, t),
  orbit: (fb, w, h, t) => stringShaderToBuffer(orbit, fb, w, h, t),
  lissajous: (fb, w, h, t) => stringShaderToBuffer(lissajous, fb, w, h, t),
  bars: (fb, w, h, t) => stringShaderToBuffer(bars, fb, w, h, t),
  snow: (fb, w, h, t) => stringShaderToBuffer(snow, fb, w, h, t),
  ripples: (fb, w, h, t) => stringShaderToBuffer(ripples, fb, w, h, t),
  waveform: (fb, w, h, t) => stringShaderToBuffer(waveform, fb, w, h, t),
  heart: (fb, w, h, t) => stringShaderToBuffer(heart, fb, w, h, t),
  helix: (fb, w, h, t) => stringShaderToBuffer(helix, fb, w, h, t),
  swirl: (fb, w, h, t) => stringShaderToBuffer(swirl, fb, w, h, t),
  moire: (fb, w, h, t) => stringShaderToBuffer(moire, fb, w, h, t),
  rain: (fb, w, h, t) => stringShaderToBuffer(rain, fb, w, h, t),
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
export const SHADER_TYPES: ShaderType[] = [
  "plasma",
  "field",
  "particles",
  "waves",
  "metaballs",
  "rings",
  "tunnel",
  "starfield",
  "spiral",
  "lava",
  "matrix",
  "fire",
  "confetti",
  "orbit",
  "lissajous",
  "bars",
  "snow",
  "ripples",
  "waveform",
  "heart",
  "helix",
  "swirl",
  "moire",
  "rain",
];

export function getRandomShaderType(): ShaderType {
  return SHADER_TYPES[Math.floor(Math.random() * SHADER_TYPES.length)]!;
}

/** Re-seed the noise generator */
export function reseedShader(seed?: number): void {
  seedNoise(seed ?? Date.now());
}
