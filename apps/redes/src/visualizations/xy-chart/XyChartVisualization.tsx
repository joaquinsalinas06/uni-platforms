// Wrapper delgado: `steps` (ya validados por visualizationSchema) →
// `xyChartLayout` → VisualizationCanvas. El gráfico se re-maqueta al ancho
// real del contenedor (hasta 640): en un móvil de 375 px los ticks y rótulos
// quedan a su tamaño en vez de encogerse con el viewBox.
import { useEffect, useRef, useState } from 'react';
import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas.tsx';
import { xyChartLayout, type XyChartInput } from './layout.ts';

type Step = XyChartInput & { note: string };

const MAX_W = 640;

export default function XyChartVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_W);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // 34 = padding horizontal del lienzo (px-4) + bordes.
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(300, Math.min(MAX_W, Math.floor(e.contentRect.width - 34)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Todos los pasos comparten alto: el eje no salta entre pasos.
  let frames = steps.map((s) => xyChartLayout(s, { width }));
  const height = Math.max(...frames.map((f) => f.height));
  if (frames.some((f) => f.height !== height)) frames = steps.map((s) => xyChartLayout(s, { width, height }));
  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    nodes: [],
    edges: [],
    paths: frames[i].paths,
    annotations: frames[i].annotations,
    highlight: s.highlight ?? [],
    width,
    height,
  }));

  return (
    <div ref={box}>
      <VisualizationCanvas steps={canvasSteps} width={width} height={height} title={title} static={isStatic} />
    </div>
  );
}
