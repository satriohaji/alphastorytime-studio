// motion.ts
// Remotion-native motion engine adapted from rossark-motion-skill.
// Pure deterministic math driven by Remotion frame/fps (time in milliseconds).
// Principles: never teleport, calm easing by default, arcs & pivots, overlap/follow-through,
// asymmetric blink timing, volume-preserving squash & stretch, height-reactive shadows.

export type CubicBezierPoints = readonly [number, number, number, number];

/** Solve cubic bezier y(x) for unit p in [0, 1] via Newton-Raphson + bisection fallback. */
export function makeBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (p: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(u) - x;
      if (Math.abs(err) < 1e-6) break;
      const d = sampleDX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    if (u < 0 || u > 1 || Number.isNaN(u)) {
      let lo = 0;
      let hi = 1;
      u = x;
      for (let i = 0; i < 14; i++) {
        const xm = sampleX(u);
        if (Math.abs(xm - x) < 1e-6) break;
        if (x > xm) lo = u;
        else hi = u;
        u = 0.5 * (lo + hi);
      }
    }
    return sampleY(Math.min(1, Math.max(0, u)));
  };
}

/** Things that travel (gaze, sway, camera slide, lid closing). */
export const EASE_IN_OUT = makeBezier(0.77, 0, 0.175, 1);
/** Things that open or arrive (mouth, lid reopening, prop arriving, card reveal). */
export const EASE_OUT = makeBezier(0.23, 1, 0.32, 1);
/** Things falling away or exiting fast. */
export const EASE_IN = makeBezier(0.55, 0, 1, 0.45);

/** Convert Remotion frame to milliseconds for clock-based recipes. */
export const frameToMs = (frame: number, fps = 30): number => (frame / fps) * 1000;

export type Key = readonly [number, number, 'out'?];
export type Keys = readonly Key[];

/**
 * Single move or periodic lid/blink track. Stops smoothly at each keyframe.
 * Use modular time `loopMs(t, period)` when driving continuous periodic tracks.
 */
export function track(t: number, keys: Keys): number {
  if (keys.length === 0) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (t <= k1[0]) {
      const k0 = keys[i - 1];
      const span = k1[0] - k0[0];
      const p = span > 0 ? (t - k0[0]) / span : 1;
      const e = k1[2] === 'out' ? EASE_OUT(p) : EASE_IN_OUT(p);
      return k0[1] + (k1[1] - k0[1]) * e;
    }
  }
  return keys[keys.length - 1][1];
}

export type FlowKey = readonly [number, number];

/**
 * Monotone cubic interpolation across acting key poses (Fritsch-Carlson).
 * Passes smoothly through every key pose without stopping like a robot and without overshoot.
 */
export function flow(t: number, k: readonly FlowKey[]): number {
  const n = k.length;
  if (n === 0) return 0;
  if (n === 1) return k[0][1];
  if (t <= k[0][0]) return k[0][1];
  if (t >= k[n - 1][0]) return k[n - 1][1];

  let i = 0;
  while (i < n - 2 && k[i + 1][0] < t) i++;

  const slope = (j: number): number => {
    const dt = k[j + 1][0] - k[j][0];
    return dt === 0 ? 0 : (k[j + 1][1] - k[j][1]) / dt;
  };

  const tangent = (j: number): number => {
    if (j === 0 || j === n - 1) return 0;
    const a = slope(j - 1);
    const b = slope(j);
    if (a * b <= 0) return 0;
    const h0 = k[j][0] - k[j - 1][0];
    const h1 = k[j + 1][0] - k[j][0];
    const w0 = 2 * h1 + h0;
    const w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  };

  const h = k[i + 1][0] - k[i][0];
  if (h <= 0) return k[i][1];
  const s = (t - k[i][0]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * k[i][1] +
    (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * k[i + 1][1] +
    (s3 - s2) * h * tangent(i + 1)
  );
}

/** 0 -> 1 inside window [a, b] ms (eased), clamped outside. */
export function seg(
  t: number,
  a: number,
  b: number,
  curve: 'out' | 'inOut' | 'in' = 'out'
): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const p = (t - a) / Math.max(1e-6, b - a);
  if (curve === 'out') return EASE_OUT(p);
  if (curve === 'in') return EASE_IN(p);
  return EASE_IN_OUT(p);
}

/** Smooth sine oscillator [-1, 1] with phase in [0, 1). */
export function wave(t: number, period: number, phase = 0): number {
  return Math.sin((t / period + phase) * Math.PI * 2);
}

/** Linear 0 -> 1 loop progress with normalized phase offset. */
export function loop(t: number, period: number, phase = 0): number {
  const p = (t / period + phase) % 1;
  return p < 0 ? p + 1 : p;
}

/** Milliseconds within a loop of `period` ms. */
export function loopMs(t: number, period: number, offsetMs = 0): number {
  const m = (t + offsetMs) % period;
  return m < 0 ? m + period : m;
}

/** Smooth 0 -> 1 -> 0 envelope over p in [0, 1] (fade in/out vapor, bokeh, wisps). */
export function bell(p: number): number {
  return Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
}

/** Deterministic pseudo-random float in [0, 1) for particle i. */
export function seeded(i: number, salt = 0): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Volume-preserving width multiplier for vertical scale sy: sx = 1 / sy^0.6. */
export function preserveVolumeX(sy: number): number {
  return 1 / Math.pow(Math.max(0.5, sy), 0.6);
}

/**
 * Asymmetric realistic eye blink in [0..1] (0 = open, 1 = closed).
 * ~110ms close (ease-in-out), ~45ms hold closed, ~190ms open (ease-out).
 * Never snaps in 1 binary frame!
 */
export function computeBlinkLid(
  tMs: number,
  periodMs = 3400,
  offsetMs = 0,
  doubleBlinkEveryCycles = 3
): number {
  const cycleIndex = Math.floor((tMs + offsetMs) / periodMs);
  const localT = loopMs(tMs, periodMs, offsetMs);
  // Primary blink at [180..525] ms
  if (localT >= 180 && localT <= 525) {
    return track(localT, [
      [180, 0],
      [290, 1],
      [335, 1],
      [525, 0, 'out'],
    ]);
  }
  // Occasional natural double-blink on every Nth cycle at [620..920] ms
  if (doubleBlinkEveryCycles > 0 && cycleIndex % doubleBlinkEveryCycles === 1) {
    if (localT >= 620 && localT <= 920) {
      return track(localT, [
        [620, 0],
        [720, 0.96],
        [750, 0.96],
        [920, 0, 'out'],
      ]);
    }
  }
  return 0;
}

/**
 * Smooth pupil glide offset in pixels/SVG units (glides between listener, subject, and viewer).
 */
export function computePupilGaze(
  tMs: number,
  baseX = 0,
  baseY = 0,
  amplitude = 3.2,
  phase = 0
): {x: number; y: number} {
  const cyc = loopMs(tMs, 5600, phase * 5600);
  const gx =
    track(cyc, [
      [0, baseX],
      [1400, baseX],
      [1900, baseX + amplitude, 'out'],
      [3200, baseX + amplitude],
      [3700, baseX - amplitude * 0.55, 'out'],
      [4800, baseX - amplitude * 0.55],
      [5600, baseX],
    ]);
  const gy =
    track(cyc, [
      [0, baseY],
      [1600, baseY - amplitude * 0.25],
      [2800, baseY + amplitude * 0.35],
      [4400, baseY],
      [5600, baseY],
    ]);
  return {x: gx, y: gy};
}

/**
 * Compute continuous spring-free follow-through delay (parent value at t - delayMs).
 */
export function followThroughDelta(
  sampleParent: (t: number) => number,
  tMs: number,
  delayMs = 100,
  gain = 0.45
): number {
  return gain * (sampleParent(tMs - delayMs) - sampleParent(tMs));
}

/**
 * Depth-of-field rack-focus calculator for Spatial Rooms.
 * Computes proportional optical blur (in px) for a layer relative to active focal plane.
 */
export function depthBlurPx(
  layerDepth: number, // 0 = far sky/wall, 1 = midground props, 2 = card plane, 3 = foreground characters, 4 = near lens bokeh
  focusDepth: number,
  apertureBlur = 3.0,
  rackSettling = 0 // additional momentary focus pull during arrival
): number {
  const dist = Math.abs(layerDepth - focusDepth);
  const raw = dist * dist * apertureBlur * 0.65 + rackSettling;
  return Math.min(9.0, Math.max(0, Math.round(raw * 10) / 10));
}
