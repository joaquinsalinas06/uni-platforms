// Despacho de familia → componente. `satisfies` con TODAS las claves de
// VISUALIZATION_TYPES: añadir un tipo a ese enum sin registrar su componente
// aquí es error de compilación, no un fallo silencioso en runtime (que es lo
// que pasaba con `graph` antes de este archivo).
import type { ComponentType } from 'react';
import { VISUALIZATION_TYPES } from '../lib/schemas';
import TreeVisualization from './tree/TreeVisualization';
import PersistentVisualization from './persistent/PersistentVisualization';
import RangeTreeVisualization from './range-tree/RangeTreeVisualization';

type Family = (typeof VISUALIZATION_TYPES)[number];

// `graph` está declarado en el knowledge map como familia futura (semana 3,
// grafos) pero ningún tema lo usa todavía — se deja explícitamente en null
// en vez de omitirlo, así el `satisfies` de abajo sigue exigiendo que quien
// añada su primer uso registre aquí el componente.
export const VISUALIZATIONS = {
  tree: TreeVisualization,
  persistent: PersistentVisualization,
  'range-tree': RangeTreeVisualization,
  graph: null,
} satisfies Record<Family, ComponentType<{ steps: any[] }> | null>;
