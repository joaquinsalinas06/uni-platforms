// Despacho de familia → componente. `satisfies` con TODAS las claves de
// VISUALIZATION_TYPES: añadir un tipo a ese enum sin registrar su componente
// aquí es error de compilación, no un fallo silencioso en runtime.
//
// Las 5 familias de este curso (xy-chart, dag, network-topology, timeline,
// memory-layout) no existen todavía — cada una se registra aquí en cuanto
// su layout.ts + componente estén listos, siguiendo el mismo patrón que
// EDA-Platform usó para `graph` mientras no tenía implementación.
import type { ComponentType } from 'react';
import { VISUALIZATION_TYPES } from '../lib/schemas';
import XyChartVisualization from './xy-chart/XyChartVisualization';
import DagVisualization from './dag/DagVisualization';
import NetworkTopologyVisualization from './network-topology/NetworkTopologyVisualization';
import TimelineVisualization from './timeline/TimelineVisualization';
import MemoryLayoutVisualization from './memory-layout/MemoryLayoutVisualization';

type Family = (typeof VISUALIZATION_TYPES)[number];

export const VISUALIZATIONS = {
  'xy-chart': XyChartVisualization,
  dag: DagVisualization,
  'network-topology': NetworkTopologyVisualization,
  timeline: TimelineVisualization,
  'memory-layout': MemoryLayoutVisualization,
} satisfies Record<Family, ComponentType<{ steps: any[] }> | null>;
