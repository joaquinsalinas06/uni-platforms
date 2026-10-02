import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import katex from 'katex';
import { SceneLayer, EquationPanel } from './CanvasScene.tsx';
import { StepControls } from './StepControls.tsx';
import {
  NODE_W,
  NODE_H,
  CELL_W,
  CELL_H,
  boxWidth,
  PORT_R,
  LINE_H,
  STATE_LABEL,
  resolveState,
  resolveEdgeState,
  nodeStyle,
  edgeStyle,
  pathColor,
  type CanvasPath,
  type NodeShape,
  type NodeVisual,
  type CanvasNode,
  type CanvasEdge,
  type CanvasGroup,
  type CanvasText,
  type CanvasStep,
} from './canvas-types.ts';

// Tipos y constantes viven en canvas-types.ts (puro, sin JSX: lo importan los
// layout.ts de cada familia, y `node --test` no puede quitar JSX de un .tsx).
// Se re-exportan aquí para que nada que ya importe de este archivo — como
// TreeVisualization.tsx — tenga que cambiar.
export type { CanvasNode, CanvasEdge, CanvasGroup, CanvasText, CanvasStep };

/** Renderiza fragmentos `$...$` de un texto plano como KaTeX real. El resto
 * del sitio usa remark-math/rehype-katex, pero `step.note` no pasa por el
 * pipeline de markdown, así que hay que invocar KaTeX a mano acá. */

function renderInlineMath(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, formula) => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: false });
    } catch {
      return `$${formula}$`;
    }
  });
}

/** Una nota de una cláusula y una de tres oraciones no merecen el mismo
 * tiempo en pantalla — 900ms de piso más ~45ms por palabra, acotado para que
 * un paso larguísimo no estanque el autoplay. */
function autoplayDelay(note?: string): number {
  const words = (note ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.min(3200, Math.max(900, 900 + words * 45));
}

type Props = {
  steps: CanvasStep[];
  height?: number;
  width?: number;
  /** Título corto sobre la figura. */
  title?: string;
  /** Figura de un solo paso: sin barra de progreso, sin controles, sin autoplay. */
  static?: boolean;
  /** Escala mínima (0..1) antes de pasar a scroll horizontal: un diagrama
   * ancho (sequence de 6 actores, bloques) no se encoge hasta ser ilegible. */
  minScale?: number;
  /** Capa SVG propia de la familia (iconos, animaciones): se dibuja encima
   * de todo, dentro del viewBox, con el índice del paso actual. */
  render?: (index: number) => ReactNode;
};

/** Extremo de una arista recortado contra el borde de la caja destino, para
 * que una punta de flecha no quede enterrada bajo el nodo. Sólo se usa si la
 * arista pide `arrow` — las aristas de árbol siguen yendo centro a centro,
 * exactamente como hoy. */
function trimToBox(from: { x: number; y: number }, to: CanvasNode): { x: number; y: number } {
  const w = (to.w ?? NODE_W) / 2;
  const h = (to.h ?? NODE_H) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return { x: to.x, y: to.y };
  const scale = 1 / Math.max(Math.abs(dx) / w, Math.abs(dy) / h);
  return { x: to.x - dx * scale, y: to.y - dy * scale };
}

const FLOW_SHAPES = new Set<NodeShape>(['ellipse', 'diamond', 'parallelogram', 'circle', 'rounded', 'rect']);

/** Símbolos de flujo/FSM/bloques (ver NodeShape). Centrados en (0,0); el
 * texto va en `lines` o en `label` partido por '\n'. En reposo el contorno
 * usa --muted (no --rule): un diagrama de flujo es sólo contornos. */
function FlowShape({ n, w, h, visual, idle }: { n: CanvasNode; w: number; h: number; visual: NodeVisual; idle: boolean }) {
  const shape = n.shape;
  const common = {
    fill: visual.fill,
    stroke: idle ? 'var(--muted)' : visual.stroke,
    strokeWidth: visual.strokeWidth,
    strokeDasharray: visual.dash,
    opacity: visual.opacity,
    style: { transition: 'fill 300ms, stroke 300ms, opacity 300ms' },
  };
  const s = Math.min(14, h * 0.35);
  const lines = n.lines ?? String(n.label ?? '').split('\n');
  return (
    <>
      {shape === 'ellipse' && <ellipse rx={w / 2} ry={h / 2} {...common} />}
      {shape === 'circle' && <circle r={w / 2} {...common} />}
      {shape === 'circle' && visual.double && <circle r={w / 2 - 4} fill="none" stroke={visual.stroke} strokeWidth={1} />}
      {shape === 'diamond' && <polygon points={`0,${-h / 2} ${w / 2},0 0,${h / 2} ${-w / 2},0`} {...common} />}
      {shape === 'parallelogram' && (
        <polygon points={`${-w / 2 + s},${-h / 2} ${w / 2},${-h / 2} ${w / 2 - s},${h / 2} ${-w / 2},${h / 2}`} {...common} />
      )}
      {(shape === 'rounded' || shape === 'rect') && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={shape === 'rect' ? 2 : 8} {...common} />}
      {lines.map((line, idx) => (
        <text
          key={idx}
          y={(idx - (lines.length - 1) / 2) * LINE_H}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
          fontFamily="var(--font-mono)"
          fill={visual.text}
          opacity={visual.opacity}
          style={{ transition: 'fill 300ms' }}
        >
          {line}
        </text>
      ))}
    </>
  );
}

/** Capa de trazos libres (CanvasPath). */
function PathLayer({ paths, arrowId }: { paths: CanvasPath[]; arrowId: string }) {
  return (
    <>
      {paths.map((p) => {
        const color = pathColor(p);
        return (
          <path
            key={p.id}
            d={p.d}
            fill={p.fill ? color : 'none'}
            fillOpacity={p.fill ? (p.opacity ?? 0.16) : undefined}
            stroke={p.fill ? 'none' : color}
            strokeWidth={p.width ?? 1.5}
            strokeDasharray={p.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={p.fill ? undefined : p.opacity}
            markerEnd={p.arrow ? `url(#${arrowId}-ctx)` : undefined}
            style={{ transition: 'd 450ms cubic-bezier(.2,.7,.3,1), stroke 300ms, fill 300ms, opacity 300ms' }}
          />
        );
      })}
    </>
  );
}

/**
 * Base compartida de todas las familias de visualización (árboles, grafos,
 * persistentes, range trees). No sabe qué está dibujando: recibe nodos ya
 * posicionados y los anima entre pasos.
 *
 * El movimiento sale gratis: cada nodo conserva su elemento del DOM entre pasos
 * (React lo reusa por `key`), así que basta una transición CSS sobre `transform`
 * para que se deslice a su posición nueva en vez de saltar.
 */
// Literales completos: Tailwind sólo genera las clases que ve escritas.
// ancho de figura ≥ 0.96·width + 19rem (panel) + 2rem (padding).
const SIDE = [
  { row: '@min-[39rem]:flex', main: '@min-[39rem]:flex-1', aside: '@min-[39rem]:w-[19rem] @min-[39rem]:shrink-0 @min-[39rem]:border-t-0 @min-[39rem]:border-l' },
  { row: '@min-[48rem]:flex', main: '@min-[48rem]:flex-1', aside: '@min-[48rem]:w-[19rem] @min-[48rem]:shrink-0 @min-[48rem]:border-t-0 @min-[48rem]:border-l' },
  { row: '@min-[59rem]:flex', main: '@min-[59rem]:flex-1', aside: '@min-[59rem]:w-[19rem] @min-[59rem]:shrink-0 @min-[59rem]:border-t-0 @min-[59rem]:border-l' },
];

export default function VisualizationCanvas({ steps, width = 640, height = 260, title, static: isStatic = false, minScale, render }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Circuito más ancho que la pantalla: scroll horizontal + pista "desliza →"
  // mientras quede dibujo a la derecha.
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const checkMore = useCallback(() => {
    const el = scroller.current;
    if (el) setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  }, []);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(checkMore);
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkMore]);
  const arrowId = useId();
  // Pieza bajo el mouse: la escena y el panel de ecuaciones se iluminan juntos.
  const [hover, setHover] = useState<string | null>(null);
  const [minNoteHeight, setMinNoteHeight] = useState<number>(0);
  const noteMeasurerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      if (!noteMeasurerRef.current || !box.current) return;
      noteMeasurerRef.current.style.width = `${box.current.clientWidth}px`;
      const children = Array.from(noteMeasurerRef.current.children) as HTMLElement[];
      if (children.length === 0) return;
      const maxH = Math.max(...children.map((c) => c.offsetHeight));
      if (maxH > 0) {
        setMinNoteHeight(maxH);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [steps]);

  const hasPanel = steps.some((s) => (s.panel?.rows.length ?? 0) > 0);
  // Un dibujo ancho no comparte fila con el panel: el panel va debajo. El
  // panel (19rem) sólo va al lado si a la figura le queda sitio para el dibujo
  // al ≥ 96 %: umbral por container query de la <figure>, en tres tramos.
  const panelSide = hasPanel && width <= 620;
  const side = width <= 300 ? SIDE[0] : width <= 440 ? SIDE[1] : SIDE[2];

  const last = steps.length - 1;
  const step = steps[Math.min(i, last)];

  const go = useCallback(
    (n: number) => setI((prev) => Math.max(0, Math.min(last, prev + n))),
    [last],
  );

  // Inicialmente en pausa (no autoplay): el usuario decide cuándo reproducir con el botón Play.

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    // Una nota de una cláusula y una de tres oraciones no merecen el mismo
    // tiempo en pantalla — 900ms de piso más ~45ms por palabra, acotado para
    // que un paso larguísimo no estanque el autoplay.
    const t = setTimeout(() => setI((p) => p + 1), autoplayDelay(step.note));
    return () => clearTimeout(t);
  }, [playing, i, last, step.note]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Home') { e.preventDefault(); setPlaying(false); setI(0); }
    if (e.key === 'End') { e.preventDefault(); setPlaying(false); setI(last); }
    // Espacio sobre un botón ya lo activa el navegador: no alternar dos veces.
    if ((e.key === ' ' || e.key === 'Spacebar') && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      if (i >= last && !playing) { setI(0); setPlaying(true); } else setPlaying((p) => !p);
    }
  };

  const pos = new Map(step.nodes.map((n) => [n.id, n]));
  const groups = step.groups ?? [];
  const annotations = step.annotations ?? [];
  // Un paso con menos contenido que el más grande (p.ej. un registro de nodo
  // gordo recién empezado, o uno con un solo nodo angosto) se ve más CHICO
  // si no se hace nada — el `viewBox` (fijo en `width`/`height`, el paso más
  // grande de todos) le deja de sobra alrededor. Se corrige con un zoom
  // real: un único `<g transform="scale(...)">` alrededor de TODO el
  // dibujo, centrado en el punto medio del lienzo. `transform` en un `<g>`
  // es exactamente lo mismo que ya anima cada nodo (`translate` con
  // `transition: transform`) — mismo mecanismo, sin re-render ni
  // remontaje, sólo que aquí escala el grupo entero en vez de mover un nodo
  // suelto.
  //
  // El zoom se calcula por AMBOS ejes (`Math.min`, "contain") y no sólo por
  // ancho: si sólo importara el ancho, un paso angosto pero con contenido
  // alto (un registro de varias líneas, un tag, un caption cerca del borde)
  // recibía un zoom pensado para caber a lo ancho que en el eje vertical lo
  // sacaba del viewBox — el layout ya centra ese contenido en `width`/
  // `height` compartidos (ver PersistentVisualization), así que sólo falta
  // no escalarlo más de lo que el eje más corto tolera.
  const stepWidth = step.width ?? width;
  const stepHeight = step.height ?? height;
  const zoom = Math.min(width / stepWidth, height / stepHeight);
  const cx = width / 2;
  const cy = height / 2;
  const zoomTransform = `translate(${cx}, ${cy}) scale(${zoom}) translate(${-cx}, ${-cy})`;

  return (
    <figure
      ref={box}
      tabIndex={0}
      onKeyDown={onKey}
      className={`@container ${isStatic ? 'my-8' : 'my-12'} overflow-hidden rounded-lg border border-[var(--rule)] focus:outline-none focus-visible:border-[var(--accent)]`}
      aria-label="Visualización paso a paso. Usa las flechas izquierda y derecha."
    >
      {title && <div className="tag border-b border-[var(--rule)] px-4 py-2">{title}</div>}

      <div className={panelSide ? side.row : undefined}>

      <div className={`relative min-w-0 ${panelSide ? side.main : ''}`}>
      <div
        ref={scroller}
        onScroll={checkMore}
        className={`flex h-full min-w-0 overflow-x-auto px-4 ${isStatic ? 'py-4' : 'py-6'}`}
        style={{
          justifyContent: 'safe center',
          background: 'var(--fill)',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted) 22%, transparent) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          // Un circuito ancho no se encoge hasta volverse ilegible: en móvil
          // no baja de su tamaño real (rótulos ≥ 10 px) y en escritorio del
          // 96 % (≥ 11 px); si no cabe, el contenedor hace scroll horizontal.
          // y uno chico se amplía un poco (hasta 1.4×, sin pasar de ~520 px de alto).
          style={{
            maxWidth: step.scene ? width * Math.max(1, Math.min(1.4, 520 / height)) : width,
            minWidth: step.scene ? undefined : minScale ? Math.min(width, Math.max(300, width * minScale)) : undefined,
            ...(step.scene && { '--mw': `${width}px`, '--mw-lg': `${Math.min(width, Math.max(300, width * 0.96))}px` }),
          } as CSSProperties}
          className={`block w-full ${step.scene ? 'min-w-(--mw) lg:min-w-(--mw-lg)' : ''}`}
          role="img"
          aria-label={step.note}
        >
          <defs>
            <marker
              id={`${arrowId}-ink`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
            </marker>
            <marker
              id={`${arrowId}-accent`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
            {/* Punta del color del trazo que la usa (CanvasPath con `arrow`). */}
            <marker
              id={`${arrowId}-ctx`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>

          <g
            transform={zoomTransform}
            style={{ transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }}
          >
          {groups.map((g) => (
            // La transición va en los atributos que de verdad cambian (x/y/
            // width/height en el rect, x/y en el label) — antes estaba en el
            // `<g>` envolvente, que nunca lleva `transform`, así que nunca
            // disparaba: un panel que se movía o cambiaba de tamaño entre
            // pasos (Union de heaps, versiones de path-copying, paneles
            // secundarios de range-tree) tele-transportaba en vez de deslizar.
            <g key={g.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={6}
                fill={g.style === 'ghost' ? 'transparent' : 'color-mix(in srgb, var(--muted) 6%, transparent)'}
                stroke="var(--rule)"
                strokeWidth={1}
                strokeDasharray={g.style === 'ghost' ? '3 3' : undefined}
                style={{ transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1), width 450ms cubic-bezier(.2,.7,.3,1), height 450ms cubic-bezier(.2,.7,.3,1)' }}
              />
              {g.label && (
                <text
                  x={g.x + 8}
                  y={g.y + 14}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.06em"
                  fill="var(--faint)"
                  style={{
                    textTransform: 'uppercase',
                    transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)',
                  }}
                >
                  {g.label}
                </text>
              )}
            </g>
          ))}

          {step.paths && <PathLayer paths={step.paths} arrowId={arrowId} />}
          {step.scene && <SceneLayer scene={step.scene} hover={hover} onHover={setHover} />}

          {step.edges.map((e) => {
            const aRaw = pos.get(e.from);
            const bRaw = pos.get(e.to);
            if (!aRaw || !bRaw) return null;
            const state = resolveEdgeState(e, step.highlight);
            const visual = edgeStyle(e.kind ?? 'tree', state);
            const a = e.arrowStart ? trimToBox(bRaw, aRaw) : aRaw;
            const b = e.arrow ? trimToBox(a, bRaw) : bRaw;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            // `pointer` sin `curve` explícito ya no es una línea recta: dos
            // punteros opuestos entre el mismo par de nodos (el `left` de
            // uno = el `right` del otro) se dibujaban exactamente encima,
            // ilegibles. Un default FIJO (20px) se notaba entre nodos
            // lejanos pero se perdía entre nodos pegados (poco ángulo real
            // → las dos flechas casi se pisan) — ahora escala con la
            // distancia, con un piso más alto, así el par siempre queda
            // visiblemente separado sin que el autor tenga que adivinar.
            const curve = e.curve ?? (e.kind === 'pointer' ? Math.max(26, len * 0.24) : 0);
            // Entre dos HERMANOS (misma fila: `dy` ~0) la arista siempre se
            // curva hacia ABAJO, nunca hacia arriba — antes el signo salía
            // de `dx/dy`, que se invertía con la dirección del puntero, así
            // que el anillo de un padre con 3+ hijos (todos adyacentes entre
            // sí) mandaba el arco de "vuelta" (último → primero) hacia
            // arriba, atravesando la fila del padre y su propio puntero
            // `child`. Fuera de una fila (padre↔hijo) se deja el cálculo de
            // siempre: ahí no hay ambigüedad de signo que resolver.
            const sameRow = Math.abs(dy) < 1;
            const cx = sameRow ? mx : mx - (dy / len) * curve;
            const cy = sameRow ? my + Math.abs(curve) : my + (dx / len) * curve;
            const d = curve === 0 ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`;
            const edgeKey = e.id ?? `${e.from}-${e.to}`;
            const pathId = `flow-path-${edgeKey}`;
            return (
              <g key={edgeKey}>
                <path
                  id={pathId}
                  d={d}
                  fill="none"
                  stroke={visual.stroke}
                  strokeWidth={visual.strokeWidth}
                  strokeDasharray={visual.dash}
                  markerStart={e.arrowStart ? `url(#${state === 'active' ? `${arrowId}-accent` : `${arrowId}-ink`})` : undefined}
                  markerEnd={e.arrow ? `url(#${state === 'active' ? `${arrowId}-accent` : `${arrowId}-ink`})` : undefined}
                  // `d` explícito (no `all`): `all` también intentaba transicionar
                  // `marker-end`/`fill`, que no son animables o no deben, y en
                  // navegadores sin soporte de interpolación de `d` (Safari
                  // &lt;16.4) degradaba de "no transiciona una cosa" a "no
                  // transiciona nada" por el shorthand.
                  style={{ transition: 'd 450ms cubic-bezier(.2,.7,.3,1), stroke 300ms, stroke-width 300ms' }}
                />
                {e.flow && state === 'active' && (
                  // Partícula de flujo: sólo existe mientras la arista está
                  // activa — React la desmonta al cambiar de paso, así la
                  // animación SMIL nunca corre fuera de contexto.
                  <circle r={3.5} fill="var(--accent)">
                    <animateMotion dur="1.1s" repeatCount="indefinite">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
                {e.label && (
                  // `label` existía en el schema desde siempre pero nunca se
                  // pintaba — sin esto no hay forma de distinguir en el
                  // dibujo "este es el puntero left" de "este es right"
                  // cuando dos aristas `pointer` van entre el mismo par de
                  // nodos en direcciones opuestas. El chip de fondo evita que
                  // el texto se pierda encima de otra línea que cruza justo
                  // por el punto medio de la curva.
                  <g style={{ transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }} transform={`translate(${cx}, ${cy})`}>
                    <rect
                      x={-(e.label.length * 3.4 + 4)}
                      y={-6.5}
                      width={e.label.length * 6.8 + 8}
                      height={13}
                      rx={3}
                      fill="var(--paper)"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={10}
                      fontWeight={600}
                      fontFamily="var(--font-mono)"
                      fill={visual.stroke}
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {step.nodes.map((n) => {
            const state = resolveState(n, step.highlight);
            const visual = nodeStyle(state);
            const shape = n.shape ?? 'box';
            const [defaultW, defaultH] = shape === 'cell' ? [CELL_W, CELL_H] : [NODE_W, NODE_H];
            // La caja crece con su texto. Sin esto, una etiqueta larga
            // ("ins(3) <- se inserta aqui") se desborda de un recuadro de 38px.
            const w = n.w ?? boxWidth(String(n.label ?? ''), shape === 'cell' ? 11 : 13, defaultW);
            const h = n.h ?? defaultH;

            return (
              <g
                key={n.id}
                // El nombre accesible va en aria-label, NO en un <title>: React
                // 19 trata cualquier <title> como metadato de documento y lo iza
                // al <head> (está pensado para el título de la página, no para
                // el de un elemento SVG). El servidor lo vaciaba de su <g> y el
                // cliente no, lo que provocaba el "Minified React error #418" —
                // un desajuste de hidratación — en TODAS las páginas con
                // visualización. El escape hatch `itemProp` no lo evitaba dentro
                // del namespace SVG. aria-label da el mismo nombre accesible sin
                // crear ningún nodo que React pueda izar.
                role="img"
                aria-label={`${n.label} — ${STATE_LABEL[state]}`}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)',
                }}
              >
                {shape === 'subtree' ? (
                  // Convención de los libros para "esto es un subárbol
                  // entero, no un nodo suelto": triángulo, vértice hacia el
                  // padre (arriba), base ancha abajo. El estado (idle/active/
                  // …) sigue viniendo de nodeStyle, igual que una caja.
                  <>
                    <polygon
                      points={`0,${-h / 2} ${-w / 2},${h / 2} ${w / 2},${h / 2}`}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    <text
                      x={0}
                      y={h / 2 - 11}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={500}
                      fontFamily="var(--font-mono)"
                      fill={visual.text}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms' }}
                    >
                      {n.label}
                    </text>
                  </>
                ) : shape === 'port' ? (
                  <>
                    <circle
                      r={PORT_R}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {n.label && (
                      <text
                        x={0}
                        y={-PORT_R - 6}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={500}
                        fontFamily="var(--font-mono)"
                        fill={visual.text}
                        opacity={visual.opacity}
                        style={{ transition: 'fill 300ms' }}
                      >
                        {n.label}
                      </text>
                    )}
                  </>
                ) : FLOW_SHAPES.has(shape) ? (
                  <FlowShape n={n} w={w} h={h} visual={visual} idle={state === 'idle'} />
                ) : shape === 'record' ? (
                  <>
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx={4}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {visual.double && (
                      <rect
                        x={-w / 2 + 3}
                        y={-h / 2 + 3}
                        width={w - 6}
                        height={h - 6}
                        rx={2}
                        fill="none"
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                    {(n.lines ?? [n.label]).map((line, idx) => (
                      <text
                        key={idx}
                        x={0}
                        y={-h / 2 + LINE_H * (idx + 0.5)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontFamily="var(--font-mono)"
                        fill={visual.text}
                      >
                        {line}
                      </text>
                    ))}
                    {n.divider !== undefined && (
                      <line
                        x1={-w / 2 + 4}
                        x2={w / 2 - 4}
                        y1={-h / 2 + LINE_H * (n.divider + 1)}
                        y2={-h / 2 + LINE_H * (n.divider + 1)}
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx={shape === 'cell' ? 2 : 5}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {visual.double && (
                      <rect
                        x={-w / 2 + 3}
                        y={-h / 2 + 3}
                        width={w - 6}
                        height={h - 6}
                        rx={2}
                        fill="none"
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={shape === 'cell' ? 12 : 14}
                      fontWeight={500}
                      fontFamily="var(--font-mono)"
                      fill={visual.text}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms' }}
                    >
                      {n.label}
                    </text>
                  </>
                )}
                {n.tag && (
                  // Nombre de variable/puntero arriba de la caja — "p" sobre
                  // "8", no sólo "8" solo. Sin esto, una nota que dice "p(8)"
                  // no tenía ninguna pista visual de cuál caja era `p`.
                  <text
                    x={0}
                    y={-h / 2 - 7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="var(--font-mono)"
                    fill="var(--muted)"
                    style={{ transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)' }}
                  >
                    {n.tag}
                  </text>
                )}
              </g>
            );
          })}

          {annotations.map((a) => {
            const size = a.size ?? 12;
            const text = (
              <text
                key={a.id}
                x={a.x}
                y={a.y}
                textAnchor={a.anchor ?? 'start'}
                fontSize={size}
                fontWeight={a.weight}
                fontFamily="var(--font-mono)"
                fill={a.color ?? (a.state === 'active' ? 'var(--accent)' : a.state === 'muted' ? 'var(--faint)' : 'var(--muted)')}
                style={{ transition: 'fill 300ms, x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)' }}
              >
                {a.text}
              </text>
            );
            if (!a.bg) return text;
            // Chip papel detrás: mismo ancho estimado que usan los layouts (charW).
            const tw = a.text.length * size * 0.6 + 6;
            const x0 = a.anchor === 'middle' ? a.x - tw / 2 : a.anchor === 'end' ? a.x - tw + 3 : a.x - 3;
            return (
              <g key={a.id}>
                <rect x={x0} y={a.y - size * 0.82} width={tw} height={size * 1.1} rx={2} fill={typeof a.bg === 'string' ? a.bg : 'var(--fill)'} />
                {text}
              </g>
            );
          })}
          {render?.(Math.min(i, last))}
          </g>
        </svg>
      </div>
      {more && (
        <span className="tag pointer-events-none absolute right-2 bottom-1.5 rounded bg-[var(--paper)] px-1.5 py-0.5 text-[var(--muted)]" aria-hidden="true">
          desliza →
        </span>
      )}
      </div>
      {(panelSide || (step.panel?.rows.length ?? 0) > 0) && (
        <aside className={`border-t border-[var(--rule)] bg-[var(--paper)] px-4 py-3 ${panelSide ? side.aside : ''}`} aria-label="Ecuaciones del paso">
          <EquationPanel panel={step.panel} hover={hover} onHover={setHover} />
        </aside>
      )}
      </div>

      <figcaption className="border-t border-[var(--rule)]">
        {/* Medidor invisible fuera de pantalla para calcular la altura máxima de las notas y evitar saltos (Layout Shift) */}
        <div
          ref={noteMeasurerRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
            left: '-9999px',
            top: '-9999px',
            width: '100%',
          }}
        >
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="px-5 py-3.5 text-[0.9375rem] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderInlineMath(s.note ?? ''),
              }}
            />
          ))}
        </div>

        {/* Única nota visible: sólo la del paso activo 'step.note' */}
        <div
          hidden={isStatic && !step.note}
          style={{
            minHeight: minNoteHeight > 0 ? `${Math.min(minNoteHeight, 92)}px` : '3.5rem',
          }}
          className="flex flex-col justify-center px-5 py-3 text-[0.9375rem] leading-relaxed"
          aria-live="polite"
        >
          {/* Remontada por paso: entra con un fundido corto (ver StepControls). */}
          <div key={i} className={isStatic ? undefined : 'vc-note-in'} dangerouslySetInnerHTML={{ __html: renderInlineMath(step.note ?? '') }} />
        </div>

        {!isStatic && (
          <StepControls
            i={Math.min(i, last)}
            n={steps.length}
            playing={playing}
            delay={autoplayDelay(step.note)}
            onGo={(d) => { setPlaying(false); go(d); }}
            onSet={(k) => { setPlaying(false); setI(k); }}
            onToggle={() => {
              if (i >= last) { setI(0); setPlaying(true); } else setPlaying((p) => !p);
            }}
          />
        )}
      </figcaption>
    </figure>
  );
}
