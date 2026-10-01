// Layout puro de `window`: filas de números de secuencia con un marco que
// cubre [base, base+size). La posición x de una celda depende sólo de su
// número `n` (con origen común a todos los pasos): así el marco se DESLIZA.
export type CellState = 'acked' | 'sent' | 'usable' | 'unusable' | 'buffered' | 'expected' | 'received';
export type SlidingWindow = { role: 'sender' | 'receiver'; label: string; base: number; size: number; seqSpace?: number; cells: { n: number; state: CellState }[] };
export type WindowStep = { windows?: SlidingWindow[] };

export const CELL = 40;
const GAP = 6;
const PAD = 16;
const LABEL_H = 24;
const ROW_GAP = 26;
export const PITCH = CELL + GAP;

export const CELL_LABEL: Record<CellState, string> = {
  acked: 'ACK recibido',
  sent: 'enviado, sin ACK',
  usable: 'usable, no enviado',
  unusable: 'fuera de ventana',
  buffered: 'recibido fuera de orden (buffer)',
  expected: 'esperado',
  received: 'recibido y entregado',
};
const ORDER = Object.keys(CELL_LABEL) as CellState[];

export type CellL = { n: number; text: string; state: CellState; x: number; y: number };
export type RowL = { key: string; role: string; label: string; y: number; cells: CellL[]; frame: { x: number; y: number; w: number; h: number }; marker?: { x: number; text: string } };
export type WindowFrame = { rows: RowL[]; legend: { state: CellState; label: string }[]; legendY: number; width: number; height: number };

/** Todos los pasos juntos: comparten origen, ancho, alto y leyenda. */
export function windowLayouts(steps: WindowStep[]): WindowFrame[] {
  const nRows = Math.max(0, ...steps.map((s) => s.windows?.length ?? 0));
  const lo: number[] = [], hi: number[] = [];
  for (let r = 0; r < nRows; r++) {
    const ws = steps.map((s) => s.windows?.[r]).filter((w): w is SlidingWindow => !!w);
    lo[r] = Math.min(...ws.flatMap((w) => [w.base, ...w.cells.map((c) => c.n)]));
    hi[r] = Math.max(...ws.flatMap((w) => [w.base + w.size - 1, ...w.cells.map((c) => c.n)]));
  }
  const span = Math.max(1, ...hi.map((h, r) => h - lo[r] + 1));
  const width = Math.max(320, PAD * 2 + span * PITCH - GAP);
  const used = new Set(steps.flatMap((s) => (s.windows ?? []).flatMap((w) => w.cells.map((c) => c.state))));
  const legend = ORDER.filter((s) => used.has(s)).map((state) => ({ state, label: CELL_LABEL[state] }));
  const rowH = LABEL_H + CELL + ROW_GAP;
  const legendY = 10 + nRows * rowH;
  // Leyenda en filas de ~ancho del lienzo (estimado: 6.3 px por carácter + muestra).
  let lines = 1, x = 0;
  for (const l of legend) {
    const w = 26 + l.label.length * 6.3;
    if (x + w > width - 2 * PAD && x > 0) { lines++; x = 0; }
    x += w;
  }
  const height = legendY + (legend.length ? lines * 20 + 6 : 0);

  return steps.map((s) => ({
    width,
    height,
    legend,
    legendY,
    rows: (s.windows ?? []).map((w, r) => {
      const y = 10 + r * rowH;
      const X = (n: number) => PAD + (n - lo[r]) * PITCH;
      const cy = y + LABEL_H;
      const show = (n: number) => String(w.seqSpace ? ((n % w.seqSpace) + w.seqSpace) % w.seqSpace : n);
      const exp = w.cells.find((c) => c.state === 'expected');
      return {
        key: `w${r}`,
        role: w.role,
        label: w.label,
        y,
        cells: w.cells.map((c) => ({ n: c.n, text: show(c.n), state: c.state, x: X(c.n), y: cy })),
        frame: { x: X(w.base) - 3, y: cy - 4, w: Math.max(0, w.size * PITCH - GAP + 6), h: CELL + 8 },
        marker: w.role === 'sender' ? { x: X(w.base) - 3, text: `base=${show(w.base)}` } : exp ? { x: X(exp.n), text: `esperado=${show(exp.n)}` } : undefined,
      };
    }),
  }));
}
