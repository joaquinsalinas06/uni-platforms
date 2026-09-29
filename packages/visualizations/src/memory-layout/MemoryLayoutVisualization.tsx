import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { memoryLayoutLayout, type MlBlock } from './layout.ts';

type Step = {
  note: string;
  blocks?: MlBlock[];
  highlight?: string[];
};

export default function MemoryLayoutVisualization({ steps }: { steps: Step[] }) {
  // `VisualizationCanvas` hace zoom-to-fit alrededor del CENTRO del canvas
  // compartido (mismo `width` en los props para todos los pasos). Si cada
  // paso calculara su propio ancho "natural" y ese ancho variara entre pasos
  // (un ejemplo de 3 bloques vs. uno con padding y 5), el zoom escala el
  // contenido de un paso angosto alrededor de un centro que no es el suyo —
  // lo saca del viewBox por la izquierda. Por eso se mide el ancho que
  // necesita CADA paso primero, se toma el máximo, y se lo pasamos de vuelta
  // al layout para que todos los pasos compartan el mismo `width` real (no
  // sólo el mismo prop del canvas) — con eso el zoom siempre es 1.
  const naturalWidths = steps.map((s) => memoryLayoutLayout(s.blocks ?? []).width);
  const sharedWidth = Math.max(520, ...naturalWidths);

  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const frame = memoryLayoutLayout(s.blocks ?? [], { width: sharedWidth });
    return {
      note: s.note,
      nodes: frame.nodes,
      edges: frame.edges,
      groups: frame.groups,
      annotations: frame.annotations,
      highlight: s.highlight ?? [],
      width: frame.width,
      height: frame.height,
    };
  });

  return <VisualizationCanvas steps={canvasSteps} width={sharedWidth} height={140} />;
}
