// Wrapper delgado: transforma `steps` (ya validados por visualizationSchema)
// en `CanvasStep[]` vía `xyChartLayout` y se lo pasa a VisualizationCanvas.
// No reimplementa nada del canvas.
import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas.tsx';
import { xyChartLayout } from './layout.ts';

type Step = {
  note: string;
  series?: { id: string; label: string; points: [number, number][] }[];
  highlight?: string[];
};

export default function XyChartVisualization({ steps }: { steps: Step[] }) {
  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const frame = xyChartLayout({ series: s.series ?? [], highlight: s.highlight });
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

  return <VisualizationCanvas steps={canvasSteps} width={640} height={300} />;
}
