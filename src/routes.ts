/** Prototype route geometry (normalised 0..1 map coordinates). Swap for Google Directions later. */
export type Pt = { x: number; y: number };

export const START: Pt = { x: 0.78, y: 0.15 };
export const END: Pt = { x: 0.18, y: 0.88 };

export type Alt = { name: string; tag: string; pts: Pt[]; minPerKm: number };

const P = (x: number, y: number): Pt => ({ x, y });

export const ALTS: Alt[] = [
  { name: 'Outer Ring Rd', tag: 'Fastest', minPerKm: 3.2, pts: [START, P(0.62, 0.3), P(0.5, 0.32), P(0.38, 0.5), P(0.3, 0.7), END] },
  { name: 'Old Airport Rd', tag: 'Shorter', minPerKm: 3.7, pts: [START, P(0.7, 0.46), P(0.5, 0.6), P(0.3, 0.78), END] },
  { name: 'Service Rd', tag: 'No tolls', minPerKm: 3.0, pts: [START, P(0.92, 0.42), P(0.72, 0.7), P(0.45, 0.88), END] },
];

export const MAX_VIA = 5;
export const LANDMARKS = ['Silk Board Jn', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Marathahalli'];

// Virtual map size used for distances so the numbers do not depend on screen size.
const VW = 360, VH = 500, PX_PER_KM = 40;
const d = (a: Pt, b: Pt) => Math.hypot((a.x - b.x) * VW, (a.y - b.y) * VH);

function distToSeg(p: Pt, a: Pt, b: Pt) {
  const ax = a.x * VW, ay = a.y * VH, bx = b.x * VW, by = b.y * VH, px = p.x * VW, py = p.y * VH;
  const dx = bx - ax, dy = by - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** The chosen alternative, bent through each waypoint (inserted where it adds the least detour). */
export function buildPath(alt: number, via: Pt[]): Pt[] {
  let path = [...ALTS[alt].pts];
  for (const w of via) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const v = distToSeg(w, path[i], path[i + 1]);
      if (v < bd) { bd = v; best = i; }
    }
    path = [...path.slice(0, best + 1), w, ...path.slice(best + 1)];
  }
  return path;
}

export function stats(alt: number, via: Pt[]) {
  const path = buildPath(alt, via);
  let px = 0;
  for (let i = 0; i < path.length - 1; i++) px += d(path[i], path[i + 1]);
  const km = Math.round((px / PX_PER_KM) * 10) / 10;
  return { km, min: Math.round(km * ALTS[alt].minPerKm + via.length * 2) };
}

/** Distance in virtual px from a point to the nearest alternative (with waypoints applied). */
export function nearestAlt(p: Pt, via: Pt[]) {
  let best = -1, bd = Infinity;
  ALTS.forEach((_, k) => {
    const path = buildPath(k, via);
    for (let i = 0; i < path.length - 1; i++) {
      const v = distToSeg(p, path[i], path[i + 1]);
      if (v < bd) { bd = v; best = k; }
    }
  });
  return { alt: best, dist: bd };
}
