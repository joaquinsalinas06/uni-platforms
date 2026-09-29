import VisualizationCanvas, { type CanvasStep } from '../VisualizationCanvas';
import { dagLayout, type DagNode, type DagLink } from './layout.ts';

type Step = {
  note: string;
  nodes?: DagNode[];
  links?: DagLink[];
  highlight?: string[];
};

export default function DagVisualization({ steps }: { steps: Step[] }) {
  // `VisualizationCanvas` hace zoom-to-fit alrededor del CENTRO del canvas
  // compartido (mismo prop `width`/`height` para TODOS los pasos). `dagLayout`
  // calcula su propio ancho por paso según cuántos nodos caben en el nivel
  // más ancho — un paso con pocos nodos (p.ej. 4, o 2) devuelve un ancho bien
  // menor que el `width={640}` fijo de abajo. Eso da un zoom >1 (amplifica) y
  // como el contenido de ESE paso está centrado en SU PROPIO ancho, no en el
  // del canvas, la amplificación lo desplaza fuera del viewBox — un DAG
  // chico podía terminar invisible del todo (ver flynn-foster-pcam paso 1, 4
  // nodos). Igual que en memory-layout: se mide el ancho/alto que necesita
  // CADA paso primero, se toma el máximo, y se lo pasamos de vuelta al
  // layout para que todos los pasos compartan el mismo tamaño real — con eso
  // el zoom siempre es 1, nunca amplifica ni desplaza.
  const naturalSizes = steps.map((s) => dagLayout(s.nodes ?? [], s.links ?? []));
  const sharedWidth = Math.max(360, ...naturalSizes.map((f) => f.width));
  const sharedHeight = Math.max(140, ...naturalSizes.map((f) => f.height));

  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const frame = dagLayout(s.nodes ?? [], s.links ?? [], { width: sharedWidth });
    return {
      note: s.note,
      nodes: frame.nodes,
      edges: frame.edges,
      groups: frame.groups,
      annotations: frame.annotations,
      highlight: s.highlight ?? [],
      width: sharedWidth,
      // La altura sí puede variar libremente entre pasos sin el mismo riesgo:
      // el zoom es `Math.min(anchoCanvas/anchoPaso, altoCanvas/altoPaso)`, y
      // con el ancho ya fijo en 1:1 ese mínimo nunca supera 1 — un paso con
      // menos niveles simplemente deja aire abajo, nunca se amplifica ni se
      // desplaza (mismo razonamiento que ya usa la familia `timeline`).
      height: frame.height,
    };
  });

  return <VisualizationCanvas steps={canvasSteps} width={sharedWidth} height={sharedHeight} />;
}
