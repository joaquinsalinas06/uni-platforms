// Marco común de las familias de redes: VisualizationCanvas pone controles,
// nota, teclas y título; la familia dibuja su propia capa SVG con `draw`.
// `k` agranda el texto cuando el SVG se encoge (móvil): el viewBox escala
// todo, y un rótulo de 13 px a 0.5× ya no se lee.
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import VisualizationCanvas from '../components/VisualizationCanvas.tsx';

function Layer({ i, width, draw }: { i: number; width: number; draw: (i: number, k: number) => ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const svg = ref.current?.ownerSVGElement;
    if (!svg) return;
    const ro = new ResizeObserver(() => {
      const scale = svg.getBoundingClientRect().width / width;
      // ≥ 0.8 px por unidad: tamaño real. Más chico: compensa hasta 1.4×.
      setK(scale > 0 && scale < 0.8 ? Math.min(1.4, 0.8 / scale) : 1);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, [width]);
  return <g ref={ref}>{draw(i, k)}</g>;
}

export default function NetFigure({ notes, width, height, title, static: isStatic, draw }: {
  notes: string[];
  width: number;
  height: number;
  title?: string;
  static?: boolean;
  draw: (i: number, k: number) => ReactNode;
}) {
  const steps = notes.map((note) => ({ note, nodes: [], edges: [], highlight: [] }));
  return (
    <VisualizationCanvas
      steps={steps}
      width={width}
      height={height}
      title={title}
      static={isStatic}
      render={(i) => <Layer i={i} width={width} draw={draw} />}
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
