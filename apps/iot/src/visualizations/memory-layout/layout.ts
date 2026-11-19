// Layout puro de `memory-layout`. Tira horizontal de rectángulos: cada
// `block` posicionado por su `offset`, ancho proporcional a su tamaño (en
// `unit`: B por defecto, o "sím", "bit"…), con una regla de offsets arriba.
// Un hueco entre `offset + bytes` de un bloque y el `offset` del siguiente
// (padding) se ve como espacio en blanco — no hace falta un tipo "gap".
//
// Escala: hasta 48 px por unidad, pero nunca más ancha que `opts.width` (el
// ancho real del contenedor): una trama de 3980 B no puede medir 64 000 px.
// Un bloque chico al lado de uno enorme (cabecera de 20 B junto a 1480 B)
// conserva un ancho mínimo visible; por eso las posiciones se acumulan
// bloque a bloque en vez de ser `offset × escala`.
import { boxWidth, charW, type CanvasNode, type CanvasText, type Frame } from '../canvas-types.ts';

export type MlBlock = { id: string; label: string; bytes: number; offset: number; state?: CanvasNode['state'] };
export type MlOpts = {
  /** Ancho disponible (px). Default 640. */
  width?: number;
  /** Unidad del rótulo de tamaño. Default 'B'. */
  unit?: string;
  /** Total compartido entre pasos (misma escala en todos). */
  total?: number;
};

const MAX_SCALE = 48; // px por unidad: un paquete de pocos campos llena el ancho en vez de quedar en una esquina
const MIN_W = 30; // ancho mínimo visible de un bloque
const BLOCK_H = 40;
const RULER_Y = 14;
const ROW0_Y = 30;
const ROW_H = 14;
const LEFT_PAD = 24;

const textW = (s: string, size: number) => s.length * charW(size);

export function memoryLayoutLayout(blocks: MlBlock[], opts: MlOpts = {}): Frame {
  const unit = opts.unit ?? 'B';
  const sorted = [...blocks].sort((a, b) => a.offset - b.offset);
  const total = Math.max(opts.total ?? 0, ...sorted.map((b) => b.offset + b.bytes), 0);
  const target = opts.width ?? 640;
  const avail = Math.max(200, target - 2 * LEFT_PAD);

  // px/unidad: los bloques que quedarían bajo MIN_W se fijan en MIN_W y el
  // resto se reparte el espacio que queda (punto fijo, converge en pocas vueltas).
  let k = total ? Math.min(MAX_SCALE, avail / total) : MAX_SCALE;
  for (let it = 0; it < 8 && total; it++) {
    const small = sorted.filter((b) => b.bytes * k < MIN_W);
    const rest = total - small.reduce((s, b) => s + b.bytes, 0);
    const room = avail - small.length * MIN_W;
    const nk = rest > 0 && room > 0 ? Math.min(MAX_SCALE, room / rest) : k;
    if (Math.abs(nk - k) < 1e-9) break;
    k = nk;
  }

  // Posiciones acumuladas: hueco proporcional, bloque con ancho mínimo.
  const xAt = new Map<number, number>();
  const geo = new Map<string, { x0: number; w: number }>();
  let cursor = LEFT_PAD, prevEnd = sorted.length ? sorted[0].offset : 0;
  for (const b of sorted) {
    cursor += Math.max(0, b.offset - prevEnd) * k;
    const w = Math.max(MIN_W, b.bytes * k);
    if (!xAt.has(b.offset)) xAt.set(b.offset, cursor);
    geo.set(b.id, { x0: cursor, w });
    cursor += w;
    xAt.set(b.offset + b.bytes, cursor);
    prevEnd = Math.max(prevEnd, b.offset + b.bytes);
  }
  // Un nombre más ancho que la tira ensancha el lienzo (el canvas lo encoge) en vez de cortarse.
  const width = Math.max(target, cursor + LEFT_PAD, ...sorted.map((b) => textW(b.label, 10) + 4));

  // Nombres de campo arriba, en tantas filas como haga falta: cada nombre va
  // a la primera fila donde no choca con el anterior de esa fila.
  const rowRight: number[] = [];
  const nameAnn: CanvasText[] = [];
  for (const b of sorted) {
    const g = geo.get(b.id)!;
    const half = textW(b.label, 10) / 2;
    const x = Math.min(Math.max(g.x0 + g.w / 2, half + 2), width - half - 2);
    let row = rowRight.findIndex((r) => x - half >= r + 6);
    if (row === -1) { row = rowRight.length; rowRight.push(-Infinity); }
    rowRight[row] = x + half;
    nameAnn.push({ id: `label-${b.id}`, text: b.label, x, y: ROW0_Y + row * ROW_H, anchor: 'middle', size: 10 });
  }
  const stripTop = ROW0_Y + Math.max(2, rowRight.length) * ROW_H;
  const stripY = stripTop + BLOCK_H / 2;
  const stripBottom = stripTop + BLOCK_H;

  // Tamaño adentro si entra; si no, debajo del bloque (rótulo exterior).
  const outside: CanvasText[] = [];
  const nodes: CanvasNode[] = sorted.map((b) => {
    const g = geo.get(b.id)!;
    const size = `${b.bytes} ${unit}`;
    const fits = g.w >= boxWidth(size, 12, 0);
    if (!fits) outside.push({ id: `size-${b.id}`, text: size, x: g.x0 + g.w / 2, y: stripBottom + 14, anchor: 'middle', size: 10, weight: 600 });
    return { id: b.id, label: fits ? size : '', shape: 'cell', x: g.x0 + g.w / 2, y: stripY, w: g.w, h: BLOCK_H, state: b.state };
  });

  // Regla: un tick por límite de bloque; se salta el que chocaría con el anterior.
  const ticks: CanvasText[] = [];
  let lastRight = -Infinity;
  for (const [offset, x] of [...xAt].sort((a, b) => a[0] - b[0])) {
    const txt = String(offset), w = textW(txt, 10);
    if (x - w / 2 < lastRight + 4) continue;
    lastRight = x + w / 2;
    ticks.push({ id: `tick-${offset}`, text: txt, x, y: RULER_Y, anchor: 'middle', size: 10 });
  }

  return { nodes, edges: [], groups: [], annotations: [...ticks, ...nameAnn, ...outside], width, height: stripBottom + (outside.length ? 20 : 0) + 4 };
}
