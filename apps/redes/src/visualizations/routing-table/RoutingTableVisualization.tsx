// `routing-table`: tabla D,p de Dijkstra o vectores de distancia (DV) paso a
// paso, con el grafo de `net-scene` al lado (ancho) o debajo (angosto). La
// disposición se decide por el ANCHO DEL CONTENEDOR (no por la escala del SVG,
// que cambia con la propia disposición y oscilaría).
import { useId, useLayoutEffect, useRef, useState } from 'react';
import NetFigure, { MAX_BOOST } from '../net-kit.tsx';
import { OK, wash } from '../net-style.ts';
import { NetSceneLayer } from '../net-scene/NetSceneVisualization.tsx';
import { netSceneLayout, type NetFrame } from '../net-scene/layout.ts';
import type { NodeState } from '../canvas-types.ts';
import { routingTableLayouts, FS, FS_HEAD, type RtFrame, type RtStep } from './layout.ts';

type Step = RtStep & { note: string };
/** Contenedor más angosto que esto (px): grafo debajo de la tabla. */
const WIDE_MIN = 620;

function look(state: NodeState | undefined, closed: boolean, hatch: string) {
  if (closed) return { fill: `url(#${hatch})`, stroke: 'var(--rule)', text: 'var(--faint)', weight: 500 };
  switch (state) {
    case 'active': return { fill: wash('var(--accent)', 14), stroke: 'var(--accent)', text: 'var(--accent)', weight: 700 };
    case 'marked': return { fill: wash('var(--marked)', 30), stroke: 'var(--marked)', text: 'var(--ink)', weight: 700 };
    case 'answer': return { fill: wash(OK, 16), stroke: OK, text: OK, weight: 700 };
    case 'muted': return { fill: 'var(--fill)', stroke: 'var(--rule)', text: 'var(--faint)', weight: 500 };
    default: return { fill: 'var(--paper)', stroke: 'var(--rule)', text: 'var(--ink)', weight: 500 };
  }
}

function CellBox({ x, y, w, h, text, state, closed, hatch, fs }: { x: number; y: number; w: number; h: number; text: string; state?: NodeState; closed: boolean; hatch: string; fs: number }) {
  const l = look(state, closed, hatch);
  const inf = text === '∞';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={l.fill} stroke={l.stroke} strokeWidth={state === 'active' || state === 'marked' ? 1.6 : 1} style={{ transition: 'fill 300ms, stroke 300ms' }} />
      {text && (
        <text x={x + w / 2} y={y + h / 2 + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={inf ? fs * 1.25 : fs} fontWeight={l.weight} fontFamily="var(--font-mono)" fill={inf && !state ? 'var(--muted)' : l.text} style={{ transition: 'fill 300ms' }}>
          {text}
        </text>
      )}
    </g>
  );
}

export default function RoutingTableVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(true);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWide(el.clientWidth >= WIDE_MIN));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const hatch = `rth${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const frames: RtFrame[] = routingTableLayouts(steps, wide);
  // El grafo se ve a ~½ escala: siempre con el texto agrandado de net-scene.
  const graphs: (NetFrame | undefined)[] = frames.map((f) => (f.graph ? netSceneLayout(f.graph.step, MAX_BOOST) : undefined));
  const { width, height } = frames[0];
  return (
    <div ref={box}>
      <NetFigure
        key={wide ? 'w' : 'n'}
        notes={steps.map((s) => s.note)}
        width={width}
        height={height}
        title={title}
        static={isStatic}
        draw={(i, kRaw, prev) => {
          const k = Math.min(kRaw, MAX_BOOST);
          const f = frames[i];
          const g = f.graph;
          return (
            <>
              <defs>
                <pattern id={hatch} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width={6} height={6} fill="var(--sunken)" />
                  <path d="M0,0V6" stroke="var(--faint)" strokeWidth={1.2} strokeOpacity={0.5} />
                </pattern>
              </defs>
              <g>
              <rect x={f.corner.x} y={f.corner.y} width={f.corner.w - 3} height={f.corner.h} rx={4} fill="var(--sunken)" />
              <text x={f.corner.x + 8} y={f.corner.y + f.corner.h / 2} dominantBaseline="central" fontSize={FS_HEAD * k} fontWeight={600} fontFamily="var(--font-sans)" fill="var(--muted)">
                {f.corner.text}
              </text>
              </g>
              {f.head.map((h) => (
                <g key={h.key}>
                  <rect x={h.x} y={h.y} width={h.w} height={f.corner.h} rx={4} fill="var(--sunken)" />
                  <text x={h.x + h.w / 2} y={h.y + f.corner.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={FS_HEAD * k} fontWeight={700} fontFamily="var(--font-sans)" fill="var(--ink)">
                    {h.text}
                  </text>
                </g>
              ))}
              {f.rows.map((r, ri) => (
                <g key={r.key} className={prev !== undefined && prev < i && ri >= frames[prev].rows.length ? 'net-in' : undefined}>
                  <text x={f.corner.x + 8} y={r.y + 15} dominantBaseline="central" fontSize={FS * k} fontWeight={600} fontFamily="var(--font-mono)" fill="var(--ink)">
                    {r.label}
                  </text>
                  {r.cells.map(({ key, ...c }) => <CellBox key={key} {...c} hatch={hatch} fs={FS * k} />)}
                </g>
              ))}
              {f.legend.map((l) => (
                <g key={l.key}>
                  <CellBox x={l.x} y={l.y - 7} w={16} h={14} text="" state={l.key === 'closed' ? undefined : (l.key as NodeState)} closed={l.key === 'closed'} hatch={hatch} fs={FS} />
                  {/* g propio: el rótulo va AL LADO de la muestra, no dentro. */}
                  <g><text x={l.x + 22} y={l.y} dominantBaseline="central" fontSize={10.5 * Math.min(k, 1.2)} fontFamily="var(--font-sans)" fill="var(--muted)">
                    {l.label}
                  </text></g>
                </g>
              ))}
              {g && graphs[i] && (
                <g transform={`translate(${g.x},${g.y}) scale(${g.scale})`}>
                  <NetSceneLayer frames={graphs as NetFrame[]} i={i} k={MAX_BOOST} prev={prev !== undefined && graphs[prev] ? prev : undefined} />
                </g>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
