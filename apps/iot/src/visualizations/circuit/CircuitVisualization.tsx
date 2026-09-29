import { useMemo } from 'react';
import VisualizationCanvas from '../../components/VisualizationCanvas.tsx';
import { circuitSteps } from './layout.ts';

type Props = {
  steps: any[];
  title?: string;
  static?: boolean;
  /** Valores que reemplazan el `value` de piezas (slider interactivo). */
  overrides?: Record<string, number>;
};

/** `circuit`: netlist → escena (layout.ts, puro) → VisualizationCanvas.
 * viewBox común a todos los pasos: los nodos nunca saltan. */
export default function CircuitVisualization({ steps, title, static: isStatic, overrides }: Props) {
  const out = useMemo(() => circuitSteps(isStatic ? steps.slice(0, 1) : steps, { overrides }), [steps, isStatic, overrides]);
  return <VisualizationCanvas steps={out.steps} width={out.width} height={out.height} title={title} static={isStatic || out.steps.length === 1} />;
}
