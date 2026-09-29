// Wrapper delgado: `steps` → `flowLayout` → VisualizationCanvas. Todos los
// pasos comparten lienzo (el más grande) para que las formas no salten.
import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { flowLayout, type FlowShapeIn, type FlowArrowIn } from './layout.ts';

type Step = { note: string; shapes?: FlowShapeIn[]; arrows?: FlowArrowIn[]; highlight?: string[]; mode?: string };

export default function FlowVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const frames = steps.map((s) => flowLayout(s.shapes ?? [], s.arrows ?? [], { mode: s.mode, highlight: s.highlight }));
  const width = Math.max(...frames.map((f) => f.width ?? 0));
  const height = Math.max(...frames.map((f) => f.height));
  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    nodes: frames[i].nodes,
    edges: [],
    paths: frames[i].paths,
    annotations: frames[i].annotations,
    highlight: s.highlight ?? [],
    width,
    height,
  }));
  return <VisualizationCanvas steps={canvasSteps} width={width} height={height} title={title} static={isStatic} minScale={0.7} />;
}
