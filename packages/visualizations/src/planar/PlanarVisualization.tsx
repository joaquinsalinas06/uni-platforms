import { useEffect, useRef, useState, type PointerEvent } from 'react';
import VisualizationCanvas from '../VisualizationCanvas';
import { planarLayout, planarResult, planeGeometry, type PlanarInput } from './layout.ts';

type Step = { note: string; caption?: string; planar: PlanarInput };
export default function PlanarVisualization({ steps }: { steps: Step[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [index, setIndex] = useState(0);
  const [exploring, setExploring] = useState(false);
  const [custom, setCustom] = useState<PlanarInput | null>(null);
  useEffect(() => {
    if (!box.current) return;
    const observer = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.min(760, Math.floor(e.contentRect.width - 34)))));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  const current = steps[Math.min(index, steps.length - 1)];
  const plane = custom ?? current.planar;
  const [x0,y0,x1,y1] = plane.bounds;
  // A plain status is outside the SVG: long results wrap instead of crossing the plot.
  const frames = steps.map(s => ({ ...planarLayout(s.planar, width), note: s.note, highlight: [] }));
  const exploreFrame = planarLayout(plane, width);
  const update = (values: Partial<PlanarInput>) => setCustom({ ...plane, ...values });
  const position = plane.query ?? (plane.range ? { x: (plane.range[0]+plane.range[2])/2, y: (plane.range[1]+plane.range[3])/2 } : null);
  const move = (x: number, y: number) => {
    if (plane.query) update({ query: { x, y } });
    else if (plane.range) {
      const hw=(plane.range[2]-plane.range[0])/2, hh=(plane.range[3]-plane.range[1])/2;
      const cx=Math.max(x0+hw,Math.min(x1-hw,x)), cy=Math.max(y0+hh,Math.min(y1-hh,y));
      update({ range: [cx-hw,cy-hh,cx+hw,cy+hh] });
    }
  };
  const explorable = (p: PlanarInput) => !!p.query || !!p.range || p.mode === 'sweep';
  const exploration = explorable(current.planar) ? current.planar : steps.find(s => explorable(s.planar))?.planar;
  const initial = () => ({ ...exploration!, mode: exploration!.mode ?? (exploration!.polygons?.length ? 'parity' : exploration!.segments?.length ? 'ray' : undefined), showHits: true, showRay: true } as PlanarInput);
  const drag = (e: PointerEvent<SVGRectElement>) => {
    if (!exploring || (e.type === 'pointermove' && !e.currentTarget.hasPointerCapture(e.pointerId))) return;
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    const matrix = e.currentTarget.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const g = planeGeometry(plane.bounds, width);
    const x = Math.max(x0, Math.min(x1, x0 + (p.x - g.left) / g.scale));
    const y = Math.max(y0, Math.min(y1, y1 - (p.y - g.top) / g.scale));
    if (plane.mode === 'sweep') update({ sweepX: +x.toFixed(2), sweepAfter: false });
    else move(+x.toFixed(2), +y.toFixed(2));
  };
  const canExplore = !!exploration;
  return <div ref={box} data-planar="true">
    {canExplore && <div className="flex flex-wrap items-center gap-3 text-sm" style={{ marginTop: 24 }}>
      <button type="button" aria-pressed={exploring} className="rounded border border-[var(--rule)] px-3 py-2 hover:text-[var(--accent)] focus-visible:outline-2" onClick={() => { setCustom(initial()); setExploring(!exploring); }}>
        {exploring ? 'Volver a los pasos' : 'Explorar el plano'}
      </button>
      {exploring && <button type="button" className="underline underline-offset-4" onClick={() => setCustom(initial())}>Restablecer</button>}
    </div>}
    {exploring ? <>
      <p className="text-sm" style={{ marginTop: 12 }}>Arrastra en el plano o usa los controles. El resultado se calcula con tu consulta.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginTop: 12 }}>
        <label style={{ flex: '1 1 180px' }}>{plane.mode === 'sweep' ? 'Barrido x' : `${plane.xLabel ?? 'x'} ${plane.range && !plane.query ? 'del centro' : 'de Q'}`}: {(plane.sweepX ?? position?.x ?? x0).toFixed(2)}
          <input style={{ display: 'block', width: '100%', accentColor: 'var(--accent)' }} type="range" min={x0} max={x1} step={(x1-x0)/200} value={plane.mode === 'sweep' ? plane.sweepX ?? x0 : position?.x ?? x0} onChange={e => plane.mode === 'sweep' ? update({ sweepX: +e.target.value, sweepAfter: false }) : move(+e.target.value, position!.y)} />
        </label>
        {position && <label style={{ flex: '1 1 180px' }}>{plane.yLabel ?? 'y'} {plane.range && !plane.query ? 'del centro' : 'de Q'}: {position.y.toFixed(2)}
          <input style={{ display: 'block', width: '100%', accentColor: 'var(--accent)' }} type="range" min={y0} max={y1} step={(y1-y0)/200} value={position.y} onChange={e => move(position!.x, +e.target.value)} />
        </label>}
      </div>
      <VisualizationCanvas steps={[{ ...exploreFrame, highlight: [], note: planarResult(plane).summary }]} width={width} height={exploreFrame.height} static render={() => <rect x={0} y={0} width={width} height={exploreFrame.height} fill="transparent" style={{ touchAction: 'none', cursor: 'crosshair' }} onPointerDown={drag} onPointerMove={drag} onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} />} />
    </> : <>
      <VisualizationCanvas steps={frames} width={width} height={Math.max(...frames.map(f => f.height))} onStepChange={setIndex} />
      {current.planar.showHits !== false && planarResult(current.planar).summary && <p role="status" className="font-mono text-sm" style={{ marginTop: -24, marginBottom: 24, overflowWrap: 'anywhere' }}>{planarResult(current.planar).summary}</p>}
    </>}
  </div>;
}
