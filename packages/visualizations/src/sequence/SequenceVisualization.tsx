// Wrapper delgado: `steps` → `sequenceLayout` → VisualizationCanvas. Todos
// los pasos comparten alto (las líneas de vida se alargan) para que las
// cabeceras no salten; un paso que EXTIENDE al anterior pinta `active` sólo
// sus mensajes nuevos.
import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { sequenceLayout, newFromPrev, type SeqActor, type SeqMsg } from './layout.ts';

type Step = { note: string; actors?: SeqActor[]; msgs?: SeqMsg[]; highlight?: string[] };

export default function SequenceVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const opts = steps.map((s, i) => ({ highlight: s.highlight, newFrom: i > 0 ? newFromPrev(steps[i - 1].msgs, s.msgs ?? []) : undefined }));
  const draft = steps.map((s, i) => sequenceLayout(s.actors ?? [], s.msgs ?? [], opts[i]));
  const height = Math.max(...draft.map((f) => f.height));
  const width = Math.max(...draft.map((f) => f.width ?? 0));
  const canvasSteps: CanvasStep[] = steps.map((s, i) => {
    const f = sequenceLayout(s.actors ?? [], s.msgs ?? [], { ...opts[i], minHeight: height });
    return { note: s.note, nodes: f.nodes, edges: [], paths: f.paths, annotations: f.annotations, highlight: s.highlight ?? [], width: f.width, height };
  });
  return <VisualizationCanvas steps={canvasSteps} width={width} height={height} title={title} static={isStatic} minScale={0.7} />;
}
