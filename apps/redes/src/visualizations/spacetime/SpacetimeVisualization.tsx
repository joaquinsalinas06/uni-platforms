// `spacetime`: diagrama espacio-tiempo con escala real (ver layout.ts).
import NetFigure, { haloText, headPoints } from '../net-kit.tsx';
import { inkOf, textW, wash } from '../net-style.ts';
import { spacetimeLayout, W, H, type SendL, type SpanL, type StStep } from './layout.ts';

type Step = StStep & { note: string };

const colorOf = (state?: string) => (!state || state === 'idle' || state === 'marked' ? 'var(--ink)' : inkOf(state as never).stroke);

function Send({ s, k }: { s: SendL; k: number }) {
  const c = colorOf(s.state);
  const muted = s.state === 'muted';
  const lit = s.state === 'active' || s.state === 'answer';
  const up = s.angle > 90 || s.angle < -90 ? s.angle + 180 : s.angle;
  const thick = s.kind === 'data' ? s.pts[3].y - s.pts[0].y : 0;
  const fs = 11 * k;
  const label = s.label && (
    <g transform={`translate(${s.mid.x},${s.mid.y}) rotate(${up}) translate(0,${-thick / 2 - (s.kind === 'data' ? 7 : 6)})`}>
      <text textAnchor="middle" fontSize={fs} fontWeight={lit ? 650 : 500} fontFamily="var(--font-mono)" fill={muted ? 'var(--faint)' : c} style={haloText}>
        {s.label}
      </text>
    </g>
  );
  return (
    <g className={lit ? 'net-in' : undefined} opacity={muted ? 0.7 : 1}>
      {s.state === 'marked' && (
        <path d={`M${s.pts.map((p) => `${p.x},${p.y}`).join('L')}${s.kind === 'data' ? 'Z' : ''}`} fill="none" stroke="var(--marked)" strokeOpacity={0.4} strokeWidth={10} strokeLinejoin="round" />
      )}
      {s.kind === 'data' ? (
        <polygon
          points={s.pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={muted ? 'var(--sunken)' : lit ? wash(c, 40) : wash('var(--ink)', 22)}
          stroke={muted ? 'var(--faint)' : c}
          strokeWidth={lit ? 1.6 : 1.2}
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path d={`M${s.pts[0].x},${s.pts[0].y}L${s.pts[1].x},${s.pts[1].y}`} stroke={muted ? 'var(--faint)' : c} strokeWidth={lit ? 2 : 1.4} />
          {!s.lost && <polygon points={headPoints(s.tip.x, s.tip.y, s.angle, 9, 4.2)} fill={muted ? 'var(--faint)' : c} />}
        </>
      )}
      {s.lost && <path d={`M${s.tip.x - 6},${s.tip.y - 6}l12,12m0,-12l-12,12`} stroke="var(--verdict-bad)" strokeWidth={2.8} strokeLinecap="round" />}
      {label}
    </g>
  );
}

function Span({ s, k }: { s: SpanL; k: number }) {
  const c = s.state && s.state !== 'idle' ? colorOf(s.state) : 'var(--muted)';
  const timeout = s.kind === 'timeout';
  const t = 5 * -s.side;
  const my = (s.y0 + s.y1) / 2;
  const lx = s.x + s.side * 10;
  // Corchete corto (d_trans de 2 ms): el rótulo vertical no cabe → horizontal, al costado.
  const vertical = s.y1 - s.y0 >= textW(s.label, 11 * k) + 8;
  return (
    <g className={s.state === 'active' ? 'net-in' : undefined}>
      <path d={`M${s.x + t},${s.y0}H${s.x}V${s.y1}H${s.x + t}`} fill="none" stroke={c} strokeWidth={1.5} strokeDasharray={timeout ? '3 3' : undefined} />
      {timeout && (
        <g transform={`translate(${s.x},${s.y0 - 9})`} stroke={c} fill="var(--paper)" strokeWidth={1.4} strokeLinecap="round">
          <circle r={6} />
          <path d="M0,-3.4V0L2.4,1.6" fill="none" />
        </g>
      )}
      <text
        transform={vertical ? `translate(${lx},${my}) rotate(-90)` : `translate(${s.x + s.side * 8},${my})`}
        textAnchor={vertical ? 'middle' : s.side > 0 ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11 * k} fontWeight={600} fontFamily="var(--font-mono)" fill={c} style={haloText}>
        {s.label}
      </text>
    </g>
  );
}

export default function SpacetimeVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const all = steps.flatMap((s) => s.spans ?? []);
  const frames = steps.map((s) => spacetimeLayout(s, all));
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={W}
      height={H}
      title={title}
      static={isStatic}
      draw={(i, k) => {
        const f = frames[i];
        const ax = f.axisX + 6;
        return (
          <>
            {/* Eje de tiempo y rejilla */}
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
            {/* Columnas */}
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
            {/* Muted debajo; los del paso encima. Un envío activo se remonta: vuelve a entrar. */}
            {[...f.sends].sort((a, b) => Number(b.state === 'muted') - Number(a.state === 'muted')).map((s) => (
              <Send key={s.state === 'active' ? `${s.id}-${i}` : s.id} s={s} k={k} />
            ))}
            {f.spans.map((s) => <Span key={s.id} s={s} k={k} />)}
          </>
        );
      }}
    />
  );
}
