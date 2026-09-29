// Glifos de circuito, PUROS (sin JSX): los usa el layout (para medir cajas y
// evitar solapes) y el canvas (para dibujarlos). Marco local: el eje +x va del
// terminal `from` al terminal `to`, centrado en (0,0). `hl` = media longitud
// del cuerpo sobre el eje (ahí se corta el cable), `hw` = medio ancho
// perpendicular (lo que ocupa hacia los lados, para rótulos).

export type GlyphPath = {
  d: string;
  /** none = sólo trazo; stroke = relleno del color del trazo; paper = relleno del fondo. */
  fill?: 'none' | 'stroke' | 'paper';
  w?: number;
  dash?: string;
  /** Se dibuja sin rotar (la onda de la fuente AC siempre horizontal). */
  upright?: boolean;
  opacity?: number;
};
export type GlyphText = { x: number; y: number; t: string; size: number; weight?: number };
export type Glyph = { hl: number; hw: number; paths: GlyphPath[]; texts: GlyphText[] };

const circle = (r: number, cx = 0, cy = 0) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
const head = (x: number, y: number, ang: number, s = 5) => {
  // triángulo de punta en (x,y) apuntando en `ang` (rad)
  const c = Math.cos(ang), n = Math.sin(ang);
  const bx = x - c * s * 1.6, by = y - n * s * 1.6;
  return `M${x},${y} L${bx - n * s * 0.75},${by + c * s * 0.75} L${bx + n * s * 0.75},${by - c * s * 0.75} Z`;
};
export { head as arrowHead };

const ZIG = 'M-18,0 L-15,-6 L-9,6 L-3,-6 L3,6 L9,-6 L15,6 L18,0';
const DIODE_TRI = 'M-7,-8 L-7,8 L7,0 Z';
const DIODE_BAR = 'M7,-8 L7,8';

/** variant: 'off' (diodo abierto), 'open' (interruptor abierto). */
export function glyph(kind: string, variant?: string): Glyph {
  switch (kind) {
    case 'resistor':
      return { hl: 18, hw: 7, paths: [{ d: ZIG }], texts: [] };
    case 'pot':
      return {
        hl: 18,
        hw: 12,
        paths: [{ d: ZIG }, { d: 'M-12,11 L10,-9' }, { d: head(13, -11.7, -0.74, 3.6), fill: 'stroke' }],
        texts: [],
      };
    case 'vsource':
      return { hl: 14, hw: 14, paths: [{ d: circle(14), fill: 'paper' }], texts: [{ x: 7, y: 0, t: '+', size: 12, weight: 600 }, { x: -7, y: 0, t: '−', size: 12, weight: 600 }] };
    case 'ac-source':
      return {
        hl: 14,
        hw: 14,
        paths: [{ d: circle(14), fill: 'paper' }, { d: 'M-8,0 C-5,-9 -3,-9 0,0 C3,9 5,9 8,0', upright: true }],
        texts: [],
      };
    case 'isource':
      return { hl: 14, hw: 14, paths: [{ d: circle(14), fill: 'paper' }, { d: 'M-8,0 L4,0' }, { d: head(9, 0, 0, 3.4), fill: 'stroke' }], texts: [] };
    case 'diode':
      if (variant === 'off')
        return {
          hl: 8,
          hw: 9,
          paths: [
            { d: DIODE_TRI, fill: 'none', dash: '2 2', opacity: 0.45 },
            { d: DIODE_BAR, dash: '2 2', opacity: 0.45 },
            { d: circle(2.2, -9, 0), fill: 'paper' },
            { d: circle(2.2, 9, 0), fill: 'paper' },
          ],
          texts: [],
        };
      return { hl: 8, hw: 9, paths: [{ d: 'M-8,0 L-7,0' }, { d: DIODE_TRI, fill: 'paper' }, { d: DIODE_BAR }], texts: [] };
    case 'led':
      return {
        hl: 8,
        hw: 17,
        paths: [
          { d: 'M-8,0 L-7,0' },
          { d: DIODE_TRI, fill: variant === 'off' ? 'none' : 'paper', dash: variant === 'off' ? '2 2' : undefined },
          { d: DIODE_BAR },
          { d: 'M-1,-10 L3,-16' },
          { d: head(4.6, -18.4, -0.98, 2.6), fill: 'stroke' },
          { d: 'M4,-9 L8,-15' },
          { d: head(9.6, -17.4, -0.98, 2.6), fill: 'stroke' },
        ],
        texts: [],
      };
    case 'vdrop':
      // Equivalente de un diodo ON: fuente de Vγ, placa larga (+) en el ánodo.
      return { hl: 4, hw: 11, paths: [{ d: 'M-4,0 L-3,0 M-3,-11 L-3,11' }, { d: 'M3,-6 L3,6', w: 3 }, { d: 'M3,0 L4,0' }], texts: [{ x: -10, y: -8, t: '+', size: 10, weight: 600 }] };
    case 'capacitor':
      return { hl: 4, hw: 11, paths: [{ d: 'M-4,0 L-3,0 M-3,-11 L-3,11 M3,-11 L3,11 M3,0 L4,0' }], texts: [] };
    case 'switch':
      return {
        hl: 14,
        hw: 10,
        paths: [
          { d: 'M-14,0 L-11,0 M11,0 L14,0' },
          { d: variant === 'open' ? 'M-9,-1 L9,-10' : 'M-9,-1 L9,-2' },
          { d: circle(2, -11, 0), fill: 'paper' },
          { d: circle(2, 11, 0), fill: 'paper' },
        ],
        texts: [],
      };
    case 'button':
      return {
        hl: 13,
        hw: 14,
        paths: [
          { d: 'M-13,0 L-10,0 M10,0 L13,0' },
          { d: circle(2, -10, 0), fill: 'paper' },
          { d: circle(2, 10, 0), fill: 'paper' },
          { d: variant === 'open' ? 'M-11,-7 L11,-7 M0,-7 L0,-13 M-4,-13 L4,-13' : 'M-11,-3 L11,-3 M0,-3 L0,-11 M-4,-11 L4,-11' },
        ],
        texts: [],
      };
    case 'ammeter':
    case 'voltmeter':
    case 'galvanometer':
      return {
        hl: 12,
        hw: 12,
        paths: [{ d: circle(12), fill: 'paper' }],
        texts: [{ x: 0, y: 0, t: kind === 'ammeter' ? 'A' : kind === 'voltmeter' ? 'V' : 'G', size: 12, weight: 600 }],
      };
    case 'lamp':
      return { hl: 11, hw: 11, paths: [{ d: circle(11), fill: 'paper' }, { d: 'M-7.8,-7.8 L7.8,7.8 M-7.8,7.8 L7.8,-7.8' }], texts: [] };
    case 'motor':
      return { hl: 13, hw: 13, paths: [{ d: circle(13), fill: 'paper' }], texts: [{ x: 0, y: 0, t: 'M', size: 12, weight: 600 }] };
    case 'relay':
      // Bobina en el eje + contacto conmutado (COM → NO/NC) al costado.
      return {
        hl: 14,
        hw: 34,
        paths: [
          { d: 'M-14,-7 L14,-7 L14,7 L-14,7 Z', fill: 'paper' },
          { d: 'M-14,7 L14,-7' },
          { d: 'M0,-7 L0,-17', dash: '2 2' },
          { d: 'M-12,-24 L8,-30' },
          { d: circle(1.8, -12, -24), fill: 'stroke' },
          { d: circle(1.8, 12, -31), fill: 'paper' },
          { d: circle(1.8, 12, -20), fill: 'paper' },
        ],
        texts: [],
      };
    case 'open':
      return { hl: 7, hw: 3, paths: [{ d: circle(2.4, -7, 0), fill: 'paper' }, { d: circle(2.4, 7, 0), fill: 'paper' }], texts: [] };
    case 'ground':
      // Desde el nodo (0,0) hacia +x.
      return { hl: 0, hw: 9, paths: [{ d: 'M0,0 L10,0 M10,-9 L10,9 M13.5,-5.5 L13.5,5.5 M17,-2 L17,2' }], texts: [] };
    default:
      return { hl: 0, hw: 0, paths: [], texts: [] };
  }
}

// ─────────────── texto: subíndices mínimos y medida ───────────────

export type TextRun = { t: string; sub?: boolean };
const SUBS: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

/** "I_{R2}" / "V_a" / "I₁" → corridas normal/subíndice. No es TeX: sólo `_`. */
export function runs(text: string): TextRun[] {
  const out: TextRun[] = [];
  const s = text.replace(/[₀-₉]+/g, (m) => `_{${[...m].map((c) => SUBS[c]).join('')}}`);
  let buf = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '_' && i + 1 < s.length) {
      if (buf) out.push({ t: buf }), (buf = '');
      if (s[i + 1] === '{') {
        const j = s.indexOf('}', i + 2);
        const end = j < 0 ? s.length : j;
        out.push({ t: s.slice(i + 2, end), sub: true });
        i = end;
      } else {
        out.push({ t: s[i + 1], sub: true });
        i++;
      }
    } else buf += s[i];
  }
  if (buf) out.push({ t: buf });
  return out.map((r) => ({ ...r, t: r.t.replace(/\\,/g, ' ').replace(/[{}\\]/g, '') }));
}

export const SUB_SCALE = 0.72;
/** Ancho aproximado (px). IBM Plex Mono = 0.6 em; Plex Sans ≈ 0.58 em de media. */
export function measure(text: string, size: number, mono = false): number {
  const k = mono ? 0.6 : 0.6;
  return runs(text).reduce((w, r) => w + [...r.t].length * size * k * (r.sub ? SUB_SCALE : 1), 0);
}
