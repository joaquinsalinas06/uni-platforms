// Wrapper delgado: pasos → arrayLayout (ancho de celda y lienzo compartidos
// entre pasos para que nada salte) → VisualizationCanvas.
import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { arrayLayout, sharedCellWidth, type ArrayInput } from './layout.ts';

type Step = ArrayInput & { note: string; highlight?: string[] };

export default function ArrayVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const cellW = sharedCellWidth(steps);
  const labelLens = steps.flatMap((s) => (s.rows ?? []).map((r) => (r.label ?? '').length));
  const labelW = labelLens.some((n) => n > 0) ? Math.min(150, Math.max(...labelLens) * 7 + 12) : 0;
  const width = Math.max(520, ...steps.map((s) => arrayLayout(s, { cellW, labelW }).width));
  const frames = steps.map((s) => arrayLayout(s, { cellW, labelW, width }));
  const height = Math.max(...frames.map((f) => f.height));
  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    nodes: frames[i].nodes,
    edges: frames[i].edges,
    groups: frames[i].groups,
    annotations: frames[i].annotations,
    highlight: s.highlight ?? [],
    width,
    height,
  }));
  return <VisualizationCanvas steps={canvasSteps} width={width} height={height} title={title} static={isStatic ?? steps.length === 1} />;
}
