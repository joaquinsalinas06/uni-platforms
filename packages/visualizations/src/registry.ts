import type { ComponentType } from 'react';

// Family imports
import TreeVisualization from './tree/TreeVisualization';
import PersistentVisualization from './persistent/PersistentVisualization';
import RangeTreeVisualization from './range-tree/RangeTreeVisualization';
import CircuitVisualization from './circuit/CircuitVisualization';
import DagVisualization from './dag/DagVisualization';
import FlowVisualization from './flow/FlowVisualization';
import MemoryLayoutVisualization from './memory-layout/MemoryLayoutVisualization';
import NetworkTopologyVisualization from './network-topology/NetworkTopologyVisualization';
import SequenceVisualization from './sequence/SequenceVisualization';
import TimelineVisualization from './timeline/TimelineVisualization';
import XyChartVisualization from './xy-chart/XyChartVisualization';

import { ALL_VISUALIZATION_TYPES, type VisualizationType } from './schemas';

export type VisualizationFamily = VisualizationType;

export const VISUALIZATIONS: Record<VisualizationFamily, ComponentType<any>> = {
  tree: TreeVisualization,
  persistent: PersistentVisualization,
  'range-tree': RangeTreeVisualization,
  circuit: CircuitVisualization,
  dag: DagVisualization,
  flow: FlowVisualization,
  'memory-layout': MemoryLayoutVisualization,
  'network-topology': NetworkTopologyVisualization,
  sequence: SequenceVisualization,
  timeline: TimelineVisualization,
  'xy-chart': XyChartVisualization,
};
