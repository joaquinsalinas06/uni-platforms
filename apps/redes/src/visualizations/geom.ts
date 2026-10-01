// Geometría pura compartida por los layouts de redes y por el auditor de
// solapes (scripts/audit-viz-overlap.mjs). Sin DOM.
export type Pt = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
/** Caja con nombre: lo que el auditor compara. `owner` = dispositivo/elemento al que pertenece. */
export type Tagged = Rect & { kind: string; id: string; owner?: string };

export const rect = (cx: number, cy: number, w: number, h: number): Rect => ({ x: cx - w / 2, y: cy - h / 2, w, h });

export function overlaps(a: Rect, b: Rect, pad = 0): boolean {
  return a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
}

/** Área de intersección (0 si no se tocan). */
export function overlapArea(a: Rect, b: Rect): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export const inside = (a: Rect, b: Rect) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
export const grow = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
export function union(rs: Rect[]): Rect {
  const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** ¿El segmento p→q corta el rectángulo? (Liang–Barsky) */
export function segHitsRect(p: Pt, q: Pt, r: Rect): boolean {
  let t0 = 0, t1 = 1;
  const dx = q.x - p.x, dy = q.y - p.y;
  const tests: [number, number][] = [[-dx, p.x - r.x], [dx, r.x + r.w - p.x], [-dy, p.y - r.y], [dy, r.y + r.h - p.y]];
  for (const [pp, qq] of tests) {
    if (pp === 0) { if (qq < 0) return false; continue; }
    const t = qq / pp;
    if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}

/** Punto de la cuadrática s–c–e en t. */
export const quadAt = (s: Pt, c: Pt, e: Pt, t: number): Pt => ({
  x: (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t ** 2 * e.x,
  y: (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t ** 2 * e.y,
});
/** Polilínea de muestras de la cuadrática (para tests de choque y la animación). */
export const quadSamples = (s: Pt, c: Pt, e: Pt, n = 16): Pt[] => Array.from({ length: n + 1 }, (_, i) => quadAt(s, c, e, i / n));
export function polyHitsRect(pts: Pt[], r: Rect): boolean {
  for (let i = 1; i < pts.length; i++) if (segHitsRect(pts[i - 1], pts[i], r)) return true;
  return false;
}

/** Caja orientada (rótulo girado): centro, tamaño y ángulo en grados. */
export type OBox = { cx: number; cy: number; w: number; h: number; angle: number };
export const obox = (r: Rect): OBox => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, w: r.w, h: r.h, angle: 0 });
function corners(b: OBox): Pt[] {
  const a = (b.angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => ({ x: b.cx + (i * b.w * c) / 2 - (j * b.h * s) / 2, y: b.cy + (i * b.w * s) / 2 + (j * b.h * c) / 2 }));
}
/** ¿Se cortan dos cajas orientadas? (ejes separadores; `pad` las encoge). */
export function oOverlap(A: OBox, B: OBox, pad = 1): boolean {
  const a = { ...A, w: Math.max(0, A.w - pad), h: Math.max(0, A.h - pad) }, b = { ...B, w: Math.max(0, B.w - pad), h: Math.max(0, B.h - pad) };
  const ca = corners(a), cb = corners(b);
  for (const box of [ca, cb])
    for (let i = 0; i < 2; i++) {
      const ax = { x: box[i + 1].x - box[i].x, y: box[i + 1].y - box[i].y };
      const pa = ca.map((p) => p.x * ax.x + p.y * ax.y), pb = cb.map((p) => p.x * ax.x + p.y * ax.y);
      if (Math.max(...pa) <= Math.min(...pb) || Math.max(...pb) <= Math.min(...pa)) return false;
    }
  return true;
}
