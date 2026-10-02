// Marco común de las familias de redes: VisualizationCanvas pone controles,
// nota, teclas y título; la familia dibuja su propia capa SVG con `draw`.
// `k` agranda el texto cuando el SVG se encoge (móvil): el viewBox escala
// todo, y un rótulo de 13 px a 0.5× ya no se lee.
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import VisualizationCanvas from '../components/VisualizationCanvas.tsx';

/** El paso anterior (para que una familia desvanezca lo que ya no está). */
function usePrevious(i: number): number | undefined {
  const cur = useRef(i), prev = useRef<number | undefined>(undefined);
  if (cur.current !== i) { prev.current = cur.current; cur.current = i; }
  return prev.current;
}

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tope del agrandado de texto en móvil. El auditor de solapes revisa también este tamaño. */
export const MAX_BOOST = 1.25;

type Draw = (i: number, k: number, prev?: number) => ReactNode;

function Layer({ i, width, draw, onK }: { i: number; width: number; draw: Draw; onK?: (kb: number) => void }) {
  const ref = useRef<SVGGElement>(null);
  const [k, setK] = useState(1);
  const prev = usePrevious(i);
  useLayoutEffect(() => {
    const svg = ref.current?.ownerSVGElement;
    if (!svg) return;
    const ro = new ResizeObserver(() => {
      const scale = svg.getBoundingClientRect().width / width;
      // ≥ 0.8 px por unidad: tamaño real. Más chico: compensa hasta MAX_BOOST.
      const k = scale > 0 && scale < 0.8 ? Math.min(MAX_BOOST, 0.8 / scale) : 1;
      setK(k);
      onK?.(k > 1 ? MAX_BOOST : 1);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, [width]);
  return <g ref={ref} className="net-layer">{draw(i, k, prev)}</g>;
}

export default function NetFigure({ notes, width: w0, height: h0, size, stepSizes, title, static: isStatic, draw }: {
  notes: string[];
  width: number;
  height: number;
  /** Lienzo que depende del texto (k = 1 o MAX_BOOST): la familia re-encuadra en móvil. */
  size?: (kb: number) => { width: number; height: number };
  /** Tamaño de cada paso: uno más chico que el lienzo se amplía (zoom del canvas) en vez de quedar diminuto. */
  stepSizes?: (kb: number) => { width: number; height: number }[];
  title?: string;
  static?: boolean;
  draw: Draw;
}) {
  const [kb, setKb] = useState(1);
  const sz = stepSizes?.(kb);
  const steps = notes.map((note, i) => ({ note, nodes: [], edges: [], highlight: [], ...(sz ? sz[i] : {}) }));
  const { width, height } = size ? size(kb) : { width: w0, height: h0 };
  return (
    <VisualizationCanvas
      steps={steps}
      width={width}
      height={height}
      title={title}
      static={isStatic}
      render={(i) => <Layer i={i} width={width} draw={draw} onK={size ? setKb : undefined} />}
    />
  );
}

/** Triángulo de punta de flecha con la punta en (x,y) apuntando en `deg`. */
export function headPoints(x: number, y: number, deg: number, len = 8, half = 4.2): string {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const bx = x - c * len, by = y - s * len;
  return `${x},${y} ${bx - s * half},${by + c * half} ${bx + s * half},${by - c * half}`;
}

/** Texto legible sobre líneas: halo del color del lienzo detrás de la tinta. */
export const haloText = { paintOrder: 'stroke', stroke: 'var(--fill)', strokeWidth: 4, strokeLinejoin: 'round' } as const;
