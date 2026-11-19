// Wrapper: mide el ancho real del contenedor (como xy-chart) y maqueta todos
// los pasos a ese ancho, con la misma escala (`total` compartido) y el mismo
// alto: el zoom de VisualizationCanvas queda en 1 y el offset 0 nunca salta.
// En un móvil de 390 px los rótulos quedan a su tamaño en vez de encogerse.
import { useEffect, useRef, useState } from 'react';
import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas.tsx';
import { memoryLayoutLayout, type MlBlock } from './layout.ts';

type Step = {
  note: string;
  blocks?: MlBlock[];
  highlight?: string[];
};

const MAX_W = 640;

export default function MemoryLayoutVisualization({ steps, unit, title, static: isStatic }: { steps: Step[]; unit?: string; title?: string; static?: boolean }) {
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

  const total = Math.max(0, ...steps.flatMap((s) => (s.blocks ?? []).map((b) => b.offset + b.bytes)));
  const frames = steps.map((s) => memoryLayoutLayout(s.blocks ?? [], { width, unit, total }));
  const w = Math.max(...frames.map((f) => f.width));
  const h = Math.max(...frames.map((f) => f.height));

  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    nodes: frames[i].nodes,
    edges: frames[i].edges,
    groups: frames[i].groups,
    annotations: frames[i].annotations,
    highlight: s.highlight ?? [],
    width: w,
    height: h,
  }));

  return (
    <div ref={box}>
      <VisualizationCanvas steps={canvasSteps} width={w} height={h} title={title} static={isStatic} />
    </div>
  );
}
