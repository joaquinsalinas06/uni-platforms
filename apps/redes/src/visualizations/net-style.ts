// Tinta por estado, compartida por las familias de redes (net-scene,
// spacetime, window, packet). Puro: lo importan layouts y componentes.
// Sólo tokens de global.css: claro/oscuro sale solo.
import type { NodeState } from './canvas-types.ts';

export const OK = 'var(--verdict-ok)';
export const wash = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--paper))`;

export type Ink = { stroke: string; fill: string; text: string; opacity: number; halo?: boolean };

export function inkOf(state?: NodeState): Ink {
  switch (state) {
    case 'active': return { stroke: 'var(--accent)', fill: wash('var(--accent)', 10), text: 'var(--accent)', opacity: 1 };
    case 'answer': return { stroke: OK, fill: wash(OK, 12), text: OK, opacity: 1 };
    case 'marked': return { stroke: 'var(--ink)', fill: 'var(--paper)', text: 'var(--ink)', opacity: 1, halo: true };
    case 'muted': return { stroke: 'var(--faint)', fill: 'var(--fill)', text: 'var(--faint)', opacity: 0.6 };
    default: return { stroke: 'var(--ink)', fill: 'var(--paper)', text: 'var(--ink)', opacity: 1 };
  }
}

/** Ancho estimado de texto (IBM Plex: mono 0.6em, sans ~0.56em). */
export const textW = (s: string, size: number, mono = true) => s.length * size * (mono ? 0.6 : 0.56);

/** Número con coma decimal, sin ceros de cola: 0.008 → "0,008". */
export const fmtNum = (v: number) => String(Number(v.toPrecision(6))).replace('.', ',');

/** Redondeo a centésimas: Math.atan2/hypot pueden diferir en el último bit
 * entre Node (SSR) y el navegador, y React acusa un hydration mismatch. */
export const r2 = (v: number) => Math.round(v * 100) / 100;
