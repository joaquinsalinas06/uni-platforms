import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas.tsx';
import { timelineLayout, type TlLane, type TlEvent, type TlMessage } from './layout.ts';

type Step = {
  note: string;
  lanes?: TlLane[];
  events?: TlEvent[];
  messages?: TlMessage[];
  highlight?: string[];
};

export default function TimelineVisualization({ steps }: { steps: Step[] }) {
  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const frame = timelineLayout(s.lanes ?? [], s.events ?? [], s.messages ?? []);
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

  return <VisualizationCanvas steps={canvasSteps} width={560} height={240} />;
}
