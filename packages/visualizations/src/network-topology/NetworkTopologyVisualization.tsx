import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { networkTopologyLayout, type NtProcess, type NtDataFlow } from './layout.ts';

type Step = {
  note: string;
  processes?: NtProcess[];
  dataFlow?: NtDataFlow[];
  highlight?: string[];
};

export default function NetworkTopologyVisualization({ steps }: { steps: Step[] }) {
  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const frame = networkTopologyLayout(s.processes ?? [], s.dataFlow ?? []);
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

  return <VisualizationCanvas steps={canvasSteps} width={460} height={260} />;
}
