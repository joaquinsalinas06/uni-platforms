// Layout puro de `memory-layout` — mpi-derived-datatypes. Tira horizontal de
// rectángulos: cada `block` posicionado por su `offset` (proporcional a
// bytes → ancho en px), con una regla numérica de offsets arriba. Un hueco
// entre `offset + bytes` de un bloque y el `offset` del siguiente (padding
// de alineación) sale gratis: si nadie dibuja nada ahí, se ve el espacio en
// blanco — no hace falta un tipo "gap" separado.
import { boxWidth, type CanvasNode, type CanvasText, type Frame } from '../canvas-types.ts';

export type MlBlock = { id: string; label: string; bytes: number; offset: number; state?: CanvasNode['state'] };

const SCALE = 16; // px por byte — a 8 los tags de campos de 1-4 bytes (char/int/padding) se superponían entre sí en un struct real
const BLOCK_H = 40;
const STRIP_Y = 78;
const RULER_Y = 14;
const TAG_ROW_Y = [30, 44]; // dos filas alternadas — ver más abajo
const LEFT_PAD = 24;

export function memoryLayoutLayout(blocks: MlBlock[], opts: { width?: number } = {}): Frame {
  const totalBytes = blocks.length ? Math.max(...blocks.map((b) => b.offset + b.bytes)) : 0;
  const natural = LEFT_PAD * 2 + Math.max(totalBytes * SCALE, 200);
  // Si el llamador (el wrapper, que ve TODOS los pasos) impone un ancho
  // compartido más grande que el que este paso necesita por sí solo, los
  // bloques se quedan anclados a la izquierda (siempre arrancan en offset 0)
  // en vez de recentrarse — el offset 0 de una struct siempre cae en el
  // mismo lugar visual entre pasos, y evita el desajuste de zoom que
  // `VisualizationCanvas` aplica alrededor del centro del canvas COMPARTIDO:
  // si este layout centrara el contenido en `natural` en vez de en `width`,
  // un paso angosto quedaría centrado en un punto distinto al centro del
  // canvas grande, y el zoom-to-fit lo escurriría fuera del viewBox.
  const width = Math.max(opts.width ?? 0, natural);

  // El ancho es proporcional a bytes a propósito (es la lectura visual que
  // importa acá) — pero un bloque de pocos bytes ("char", 1 byte) es más
  // angosto que cualquier etiqueta legible. Adentro sólo va el tamaño en
  // bytes (si entra); el nombre completo ("char", "padding"...) se dibuja
  // como anotación arriba de la caja, no como `n.tag` — con varios campos
  // chicos y contiguos (un struct real con padding) dos tags vecinos de
  // `n.tag` se superponían sin remedio porque esa etiqueta siempre va en la
  // MISMA fila. Como anotación libre sí podemos turnarla entre dos alturas
  // (ver más abajo) para separar vecinos que chocarían.
  const nodes: CanvasNode[] = blocks.map((b) => {
    const w = Math.max(2, b.bytes * SCALE);
    const shortLabel = `${b.bytes}B`;
    const label = w >= boxWidth(shortLabel, 12, 0) ? shortLabel : '';
    return {
      id: b.id,
      label,
      shape: 'cell',
      x: LEFT_PAD + (b.offset + b.bytes / 2) * SCALE,
      y: STRIP_Y,
      w,
      h: BLOCK_H,
      state: b.state,
    };
  });

  // Regla: un tick por cada límite de bloque (inicio y fin) — suficiente
  // para leer offsets y huecos sin saturar de números un tipo derivado con
  // muchos bloques.
  const boundaries = new Set<number>();
  blocks.forEach((b) => {
    boundaries.add(b.offset);
    boundaries.add(b.offset + b.bytes);
  });

  const annotations: CanvasText[] = [...boundaries].sort((a, b) => a - b).map((offset) => ({
    id: `tick-${offset}`,
    text: String(offset),
    x: LEFT_PAD + offset * SCALE,
    y: RULER_Y,
    anchor: 'middle',
    size: 10,
  }));

  // Nombres de campo por turnos entre 2 filas: se recorren de izquierda a
  // derecha llevando el borde derecho ocupado de CADA fila; un nombre que
  // chocaría con el último de su fila (típico: "char" de 1 byte seguido de
  // "padding" de 3) pasa a la otra fila en vez de superponerse. Con campos
  // reales (pocos bytes, muchos vecinos) dos filas alcanzan casi siempre —
  // un choque a 3 vecinos de distancia es un caso patológico que no vale la
  // pena resolver con más filas a costa de una diagrama más alto.
  const rowRightEdge = [-Infinity, -Infinity];
  for (const b of [...blocks].sort((a, b) => a.offset - b.offset)) {
    const x = LEFT_PAD + (b.offset + b.bytes / 2) * SCALE;
    const halfW = boxWidth(b.label, 10, 0) / 2;
    // Fila 0 si cabe; si no, fila 1; si tampoco (3 vecinos angostos
    // seguidos, caso raro), vuelve a la fila 0 y acepta el roce.
    const row = x - halfW >= rowRightEdge[0] + 4 ? 0 : x - halfW >= rowRightEdge[1] + 4 ? 1 : 0;
    rowRightEdge[row] = x + halfW;
    annotations.push({ id: `label-${b.id}`, text: b.label, x, y: TAG_ROW_Y[row], anchor: 'middle', size: 10 });
  }

  return { nodes, edges: [], groups: [], annotations, width, height: STRIP_Y + BLOCK_H };
}
