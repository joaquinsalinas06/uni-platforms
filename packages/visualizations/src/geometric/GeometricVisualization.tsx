// Wrapper delgado: `steps` (ya validados por visualizationSchema) →
// `geometricLayout` → VisualizationCanvas. Se re-maqueta al ancho real del
// contenedor (hasta 640) para que los ticks no se encojan con el viewBox.
import { useEffect, useRef, useState } from 'react';
import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { geometricLayout, geometry, type GeometricInput } from './layout.ts';

type Step = GeometricInput & { note: string; caption?: string };

const MAX_W = 600;

/** Dimensiones del plano de UN paso (independientes del ancho en px). */
function dims(s: GeometricInput) {
  const g = geometry(s, MAX_W);
  return { xMax: g.xMax, tMax: g.tMax };
}

export default function GeometricVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_W);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(300, Math.min(MAX_W, Math.floor(e.contentRect.width - 34)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Todos los pasos comparten ejes (xMax/tMax el mayor de todos): el plano
  // no salta ni cambia de escala entre pasos.
  const xMax = Math.max(...steps.map((s) => dims(s).xMax));
  const tMax = Math.max(...steps.map((s) => dims(s).tMax));
  const shared = steps.map((s) => ({ ...s, xMax: s.xMax ?? xMax, tMax: s.tMax ?? tMax }));
  const frames = shared.map((s) => geometricLayout(s, { width }));
  const height = Math.max(...frames.map((f) => f.height));
  const canvasSteps: CanvasStep[] = shared.map((s, i) => ({
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
