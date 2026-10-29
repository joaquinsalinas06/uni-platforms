import { useEffect, useRef, useState } from 'react';
import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas';
import { layout, W, layersWidth, rangeTreeWidth, type RangeStep } from './layout';

/**
 * Familia "range-tree": el range tree 1D/2D y el layered range tree (arreglos
 * en capas con puentes). Único trabajo: posicionar (ver ./layout.ts). El
 * render, la línea de tiempo y la animación los pone VisualizationCanvas.
 */
export default function RangeTreeVisualization({ steps }: { steps: RangeStep[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(W);
  useEffect(() => {
    if (!box.current) return;
    const observer = new ResizeObserver(([e]) => setAvailable(Math.max(300, Math.min(W, e.contentRect.width - 34))));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  const layerWidth = Math.max(300, ...steps.filter((s) => s.mode === 'layers').map(layersWidth));
  // Mantener el mismo ancho dentro de cada representación, sin dejar media pantalla vacía.
  const treeWidth = Math.max(available, ...steps.filter((s) => s.mode !== 'layers').map(rangeTreeWidth));
  const frames = steps.map((s) => layout(s, s.mode === 'layers' ? Math.max(layerWidth, Math.min(available, W)) : treeWidth));
  const width = Math.max(...frames.map((f) => f.width ?? W));
  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    width: frames[i].width,
    highlight: s.highlight ?? [],
    nodes: frames[i].nodes,
    edges: frames[i].edges,
    groups: frames[i].groups,
    annotations: frames[i].annotations,
  }));

  const height = Math.max(...frames.map((f) => f.height), 34);
  return <div ref={box}><VisualizationCanvas steps={canvasSteps} width={width} height={height} minScale={0.9} /></div>;
}
