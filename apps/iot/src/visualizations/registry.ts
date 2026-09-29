// Despacho de familia → componente. `satisfies` con TODAS las claves de
// VISUALIZATION_TYPES: añadir un tipo sin registrarlo aquí es error de compilación.
// `null` = familia declarada en el schema pero sin componente todavía.
import type { ComponentType } from 'react';
import { VISUALIZATION_TYPES } from '../lib/schemas';
import XyChartVisualization from './xy-chart/XyChartVisualization';
import CircuitVisualization from './circuit/CircuitVisualization';
import DagVisualization from './dag/DagVisualization';
import NetworkTopologyVisualization from './network-topology/NetworkTopologyVisualization';
import TimelineVisualization from './timeline/TimelineVisualization';
import MemoryLayoutVisualization from './memory-layout/MemoryLayoutVisualization';
import SequenceVisualization from './sequence/SequenceVisualization';
import FlowVisualization from './flow/FlowVisualization';

type Family = (typeof VISUALIZATION_TYPES)[number];

export const VISUALIZATIONS = {
  circuit: CircuitVisualization,
  sequence: SequenceVisualization,
  flow: FlowVisualization,
  'xy-chart': XyChartVisualization,
  dag: DagVisualization,
  'network-topology': NetworkTopologyVisualization,
  timeline: TimelineVisualization,
  'memory-layout': MemoryLayoutVisualization,
} satisfies Record<Family, ComponentType<{ steps: any[] }> | null>;
