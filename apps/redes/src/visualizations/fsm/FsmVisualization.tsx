// `fsm`: máquina de estados al estilo de las slides (ver layout.ts). Una
// transición `active` hace viajar una ficha de origen a destino y el destino
// se enciende al llegar; los cambios de estado se interpolan (claves estables).
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import NetFigure, { headPoints, reducedMotion, MAX_BOOST } from '../net-kit.tsx';
import { inkOf, wash } from '../net-style.ts';
import type { Pt } from '../geom.ts';
import { fsmLayout, type EdgeL, type FsmFrame, type FsmStep, type StateL } from './layout.ts';

type Step = FsmStep & { note: string };
const TRAVEL = 850;
const v = (o: Record<string, string>) => o as CSSProperties;

function Token({ pts, color }: { pts: Pt[]; color: string }) {
  const ref = useRef<SVGCircleElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (reducedMotion() || pts.length < 2) { ref.current.style.opacity = '0'; return; }
    ref.current.animate(pts.map((p) => ({ transform: `translate(${p.x}px, ${p.y}px)` })), { duration: TRAVEL, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
    ref.current.animate([{ opacity: 1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: TRAVEL + 200, fill: 'forwards' });
  }, []);
  const end = pts[pts.length - 1];
  return <circle ref={ref} r={5.5} fill={color} stroke="var(--fill)" strokeWidth={2} style={{ transform: `translate(${end.x}px, ${end.y}px)` }} />;
}

function StateView({ s, lit, i }: { s: StateL; lit: boolean; i: number }) {
  const st = s.state ?? (lit ? 'active' : undefined);
  const ink = inkOf(st);
  const on = st === 'active' || st === 'answer';
  return (
    <g opacity={ink.opacity}>
      {ink.halo && <ellipse cx={s.cx} cy={s.cy} rx={s.rx + 7} ry={s.ry + 7} fill="var(--marked)" opacity={0.18} stroke="var(--marked)" strokeOpacity={0.6} strokeWidth={1.5} />}
      <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={on ? ink.fill : 'var(--paper)'} stroke={on ? ink.stroke : 'var(--ink)'} strokeWidth={on ? 2.2 : 1.6} />
      {s.final && <ellipse cx={s.cx} cy={s.cy} rx={s.rx - 5} ry={s.ry - 5} fill="none" stroke={on ? ink.stroke : 'var(--ink)'} strokeWidth={1.2} />}
      {lit && !s.state && <ellipse key={`ping-${i}`} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="none" stroke="var(--accent)" strokeWidth={2} className="net-ping" style={v({ '--delay': `${TRAVEL}ms` })} />}
      {s.lines.map((l, j) => (
        <text key={j} x={s.cx} y={s.cy + (j - (s.lines.length - 1) / 2) * s.lh} textAnchor="middle" dominantBaseline="central" fontSize={s.fs} fontWeight={600} fontFamily="var(--font-sans)" fill={on ? ink.text : 'var(--ink)'}>
          {l}
        </text>
      ))}
    </g>
  );
}

function EdgeView({ e, i, ghost }: { e: EdgeL; i: number; ghost?: boolean }) {
  const ink = inkOf(e.state);
  const active = e.state === 'active' || e.state === 'answer';
  const muted = e.state === 'muted';
  const color = active ? ink.stroke : muted ? 'var(--faint)' : 'var(--ink)';
  const c = e.card;
  const cx = c.x + c.w / 2;
  return (
    <g className={ghost ? 'net-out' : 'net-in'} opacity={muted ? 0.6 : 1}>
      {e.state === 'marked' && <path d={e.d} fill="none" stroke="var(--marked)" strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" />}
      <path d={e.d} fill="none" stroke={color} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" />
      <polygon points={headPoints(e.head.x, e.head.y, e.head.angle, 10, 5)} fill={color} />
      {active && !ghost && <Token key={`tok-${i}`} pts={e.pts} color={color} />}
      <g>
        <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={6} fill={active ? wash(ink.stroke, 8) : 'var(--paper)'} stroke={active ? ink.stroke : 'var(--rule)'} strokeWidth={active ? 1.4 : 1} />
        {c.ev.map((l, j) => (
          <text key={`e${j}`} x={cx} y={c.y + 7 + c.lhEv * (j + 0.5)} textAnchor="middle" dominantBaseline="central" fontSize={c.fsEv} fontWeight={600} fontFamily="var(--font-mono)" fill={active ? ink.text : 'var(--ink)'}>
            {l}
          </text>
        ))}
        <path d={`M${c.x + 6},${c.y + c.rule + 2}H${c.x + c.w - 6}`} stroke={active ? ink.stroke : 'var(--muted)'} strokeWidth={1} opacity={0.7} />
        {c.ac.map((l, j) => (
          <text key={`a${j}`} x={cx} y={c.y + c.rule + 6 + c.lhAc * (j + 0.5)} textAnchor="middle" dominantBaseline="central" fontSize={c.fsAc} fontFamily="var(--font-mono)" fill="var(--muted)">
            {l}
          </text>
        ))}
      </g>
    </g>
  );
}

export default function FsmVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const sets = new Map<number, FsmFrame[]>();
  const framesFor = (kb: number) => {
    if (!sets.has(kb)) sets.set(kb, steps.map((s) => fsmLayout(s, kb)));
    return sets.get(kb)!;
  };
  // Todos los pasos comparten lienzo (el más grande), centrados.
  const size = (kb: number) => {
    const fs = framesFor(kb);
    return { width: Math.max(...fs.map((f) => f.width)), height: Math.max(...fs.map((f) => f.height)) };
  };
  const base = size(1);
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={base.width}
      height={base.height}
      size={size}
      stepSizes={(kb) => framesFor(kb).map((f) => ({ width: f.width, height: f.height }))}
      title={title}
      static={isStatic}
      draw={(i, kRaw, prev) => {
        const kb = kRaw > 1 ? MAX_BOOST : 1;
        const frames = framesFor(kb);
        const { width, height } = size(kb);
        const f = frames[i];
        const dx = (width - f.width) / 2, dy = (height - f.height) / 2;
        const lit = new Set(f.edges.filter((e) => e.state === 'active').map((e) => e.to));
        const ids = new Set(f.edges.map((e) => e.id));
        const ghosts = prev !== undefined && prev !== i ? frames[prev].edges.filter((e) => !ids.has(e.id)) : [];
        const pdx = prev !== undefined ? (width - frames[prev].width) / 2 : 0, pdy = prev !== undefined ? (height - frames[prev].height) / 2 : 0;
        return (
          <>
            <g transform={`translate(${pdx},${pdy})`}>{ghosts.map((e) => <EdgeView key={`ghost-${e.id}-${i}`} e={e} i={i} ghost />)}</g>
            <g style={{ transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 400ms cubic-bezier(.2,.7,.3,1)' }}>
              {f.init.map((x, j) => (
                <g key={`init-${j}`}>
                  <circle cx={x.from.x} cy={x.from.y} r={4.5} fill="var(--ink)" />
                  <path d={`M${x.from.x},${x.from.y}L${x.to.x},${x.to.y}`} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 3" />
                  <polygon points={headPoints(x.to.x, x.to.y, (Math.atan2(x.to.y - x.from.y, x.to.x - x.from.x) * 180) / Math.PI, 9, 4.5)} fill="var(--ink)" />
                </g>
              ))}
              {f.edges.map((e) => <EdgeView key={e.id} e={e} i={i} />)}
              {f.states.map((s) => <StateView key={`s-${s.id}`} s={s} lit={lit.has(s.id)} i={i} />)}
            </g>
          </>
        );
      }}
    />
  );
}
