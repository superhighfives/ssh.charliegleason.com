// src/shaders/noise.ts
// Simplex noise implementation for procedural shaders

// Permutation table for noise
const perm = new Uint8Array(512);
const gradP: number[][] = new Array(512);

// Gradient vectors for 2D
const grad3: number[][] = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Initialize with a seed
export function seedNoise(seed: number = 0) {
  const p = new Uint8Array(256);
  
  // Initialize with values 0-255
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }
  
  // Shuffle based on seed
  let n = seed;
  for (let i = 255; i > 0; i--) {
    n = (n * 16807) % 2147483647;
    const j = n % (i + 1);
    const temp = p[i]!;
    p[i] = p[j]!;
    p[j] = temp;
  }
  
  // Extend to 512
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]!;
    gradP[i] = grad3[perm[i]! % 12]!;
  }
}

// Initialize with random seed
seedNoise(Date.now());

function dot2(g: number[], x: number, y: number): number {
  return g[0]! * x + g[1]! * y;
}

// 2D Simplex Noise
export function simplex2(x: number, y: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  // Skew input space
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine simplex
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Hash coordinates
  const ii = i & 255;
  const jj = j & 255;

  // Calculate contributions
  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    const gi0 = gradP[ii + perm[jj]!]!;
    t0 *= t0;
    n0 = t0 * t0 * dot2(gi0, x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    const gi1 = gradP[ii + i1 + perm[jj + j1]!]!;
    t1 *= t1;
    n1 = t1 * t1 * dot2(gi1, x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    const gi2 = gradP[ii + 1 + perm[jj + 1]!]!;
    t2 *= t2;
    n2 = t2 * t2 * dot2(gi2, x2, y2);
  }

  // Scale to [-1, 1]
  return 70 * (n0 + n1 + n2);
}

// Fractal Brownian Motion (layered noise)
export function fbm(x: number, y: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex2(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}
