// `spacetime`: diagrama espacio-tiempo con escala real (ver layout.ts).
// Claves estables por envío: un envío nuevo se DIBUJA (borde superior y luego
// relleno), uno que pasa a muted se apaga con transición, y lo que deja de
// estar al volver atrás se desvanece.
import type { CSSProperties } from 'react';
import NetFigure, { haloText, headPoints, MAX_BOOST } from '../net-kit.tsx';
import { inkOf, textW, wash } from '../net-style.ts';
import { spacetimeLayout, W, H, SEND_FS, SPAN_FS, type SendL, type SpanL, type StStep } from './layout.ts';

type Step = StStep & { note: string };
const DRAW = 650;
const colorOf = (state?: string) => (!state || state === 'idle' || state === 'marked' ? 'var(--ink)' : inkOf(state as never).stroke);
const v = (o: Record<string, string>) => o as CSSProperties;

function Send({ s, k, ghost }: { s: SendL; k: number; ghost?: boolean }) {
  const c = colorOf(s.state);
  const muted = s.state === 'muted';
  const lit = s.state === 'active' || s.state === 'answer';
  const [a, b] = s.pts;
  const line = `M${a.x},${a.y}L${b.x},${b.y}`;
  return (
    <g opacity={muted ? 0.7 : 1} className={ghost ? 'net-out' : undefined}>
      {s.state === 'marked' && (
        <path d={`M${s.pts.map((p) => `${p.x},${p.y}`).join('L')}${s.kind === 'data' ? 'Z' : ''}`} fill="none" stroke="var(--marked)" strokeOpacity={0.4} strokeWidth={10} strokeLinejoin="round" />
      )}
      {s.kind === 'data' ? (
        <>
          <polygon
            points={s.pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={muted ? 'var(--sunken)' : lit ? wash(c, 40) : wash('var(--ink)', 22)}
            stroke={muted ? 'var(--faint)' : c}
            strokeWidth={lit ? 1.6 : 1.2}
            strokeLinejoin="round"
            className="net-late"
            style={v({ '--delay': `${DRAW * 0.6}ms` })}
          />
          {/* El primer bit viaja: el borde superior se traza antes del relleno. */}
          <path d={line} stroke={muted ? 'var(--faint)' : c} strokeWidth={lit ? 2 : 1.4} fill="none" pathLength={1} strokeDasharray={1} className="net-draw-once" style={v({ '--dur': `${DRAW}ms` })} />
        </>
      ) : (
        <>
          <path d={line} stroke={muted ? 'var(--faint)' : c} strokeWidth={lit ? 2 : 1.4} fill="none" pathLength={1} strokeDasharray={1} className="net-draw-once" style={v({ '--dur': `${DRAW}ms` })} />
          {!s.lost && <polygon points={headPoints(s.tip.x, s.tip.y, s.angle, 9, 4.2)} fill={muted ? 'var(--faint)' : c} className="net-late" style={v({ '--delay': `${DRAW}ms` })} />}
        </>
      )}
      {s.lost && <path d={`M${s.tip.x - 6},${s.tip.y - 6}l12,12m0,-12l-12,12`} stroke="var(--verdict-bad)" strokeWidth={2.8} strokeLinecap="round" className="net-late" style={v({ '--delay': `${DRAW}ms` })} />}
      {s.lab && s.label && (
        <text
          transform={`translate(${s.lab.cx},${s.lab.cy}) rotate(${s.lab.angle})`}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={SEND_FS * k}
          fontWeight={lit ? 650 : 500}
          fontFamily="var(--font-mono)"
          fill={muted ? 'var(--faint)' : c}
          style={{ ...haloText, ...v({ '--delay': `${DRAW * 0.5}ms` }) }}
          className="net-late"
        >
          {s.label}
        </text>
      )}
    </g>
  );
}

function Span({ s, k, ghost }: { s: SpanL; k: number; ghost?: boolean }) {
  const c = s.state && s.state !== 'idle' ? colorOf(s.state) : 'var(--muted)';
  const timeout = s.kind === 'timeout';
  const t = 5 * -s.side;
  return (
    <g className={ghost ? 'net-out' : 'net-in'}>
      <path d={`M${s.x + t},${s.y0}H${s.x}V${s.y1}H${s.x + t}`} fill="none" stroke={c} strokeWidth={1.5} strokeDasharray={timeout ? '3 3' : undefined} />
      {timeout && (
        <g transform={`translate(${s.x},${s.y0 - 9})`} stroke={c} fill="var(--paper)" strokeWidth={1.4} strokeLinecap="round">
          <circle r={6} />
          <path d="M0,-3.4V0L2.4,1.6" fill="none" />
        </g>
      )}
      <text transform={`translate(${s.lab.cx},${s.lab.cy}) rotate(${s.lab.angle})`} textAnchor="middle" dominantBaseline="central" fontSize={SPAN_FS * k} fontWeight={600} fontFamily="var(--font-mono)" fill={c} style={haloText}>
        {s.label}
      </text>
    </g>
  );
}

export default function SpacetimeVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const all = steps.flatMap((s) => s.spans ?? []);
  const sets = new Map<number, ReturnType<typeof spacetimeLayout>[]>();
  const framesFor = (kb: number) => {
    if (!sets.has(kb)) sets.set(kb, steps.map((s) => spacetimeLayout(s, all, kb)));
    return sets.get(kb)!;
  };
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={W}
      height={H}
      title={title}
      static={isStatic}
      draw={(i, kRaw, prev) => {
        const k = kRaw > 1 ? MAX_BOOST : 1;
        const frames = framesFor(k);
        const f = frames[i];
        const ax = f.axisX + 6;
        const old = prev !== undefined && prev !== i ? frames[prev] : undefined;
        const sendIds = new Set(f.sends.map((s) => s.id)), spanIds = new Set(f.spans.map((s) => s.id));
        return (
          <>
            {f.ticks.map((t) => (
              <g key={`t-${t.t}`}>
                <path d={`M${ax},${t.y}H${W - 10}`} stroke="var(--rule)" strokeWidth={1} />
                <path d={`M${ax - 4},${t.y}H${ax}`} stroke="var(--muted)" strokeWidth={1.2} />
                <text x={ax - 7} y={t.y} textAnchor="end" dominantBaseline="central" fontSize={10.5 * k} fontFamily="var(--font-mono)" fill="var(--muted)">
                  {t.text}
                </text>
              </g>
            ))}
            <path d={`M${ax},${f.plotTop - 6}V${f.plotBottom + 10}`} stroke="var(--muted)" strokeWidth={1.2} />
            <polygon points={headPoints(ax, f.plotBottom + 14, 90, 7, 3.5)} fill="var(--muted)" />
            <text x={4} y={f.plotTop - 16} textAnchor="start" fontSize={10.5 * k} fontFamily="var(--font-mono)" fill="var(--muted)">
              t ({f.unit})
            </text>
            {f.columns.map((c) => {
              const w = textW(c.label, 12.5 * k, false) + 18;
              return (
                <g key={`c-${c.id}`}>
                  <path d={`M${c.x},${f.plotTop}V${f.plotBottom + 8}`} stroke="var(--ink)" strokeWidth={1.6} />
                  <rect x={c.x - w / 2} y={f.plotTop - 40} width={w} height={24} rx={6} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.2} />
                  <text x={c.x} y={f.plotTop - 28} textAnchor="middle" dominantBaseline="central" fontSize={12.5 * k} fontWeight={650} fontFamily="var(--font-sans)" fill="var(--ink)">
                    {c.label}
                  </text>
                  <path d={`M${c.x},${f.plotTop - 16}V${f.plotTop}`} stroke="var(--ink)" strokeWidth={1.6} />
                </g>
              );
            })}
            {old?.sends.filter((s) => !sendIds.has(s.id)).map((s) => <Send key={`ghost-${s.id}-${i}`} s={s} k={k} ghost />)}
            {f.sends.map((s) => <Send key={s.id} s={s} k={k} />)}
            {old?.spans.filter((s) => !spanIds.has(s.id)).map((s) => <Span key={`ghost-${s.id}-${i}`} s={s} k={k} ghost />)}
            {f.spans.map((s) => <Span key={s.id} s={s} k={k} />)}
          </>
        );
      }}
    />
  );
}
