// `window`: ventana deslizante (GBN / SR). El marco carmesí se desliza entre
// pasos con una transición CSS sobre `transform`.
import { useId } from 'react';
import NetFigure from '../net-kit.tsx';
import { OK, wash } from '../net-style.ts';
import { windowLayouts, CELL, type CellState, type WindowStep } from './layout.ts';

type Step = WindowStep & { note: string };
const SLIDE = 'transform 550ms cubic-bezier(.2,.7,.3,1)';
const BLUE = 'var(--tone-series)';

function cellLook(state: CellState, hatch: string): { fill: string; stroke: string; text: string; dash?: string; width?: number } {
  switch (state) {
    case 'acked': return { fill: wash(OK, 16), stroke: OK, text: OK };
    case 'received': return { fill: wash(OK, 42), stroke: OK, text: 'var(--ink)', width: 1.6 };
    case 'sent': return { fill: wash('var(--marked)', 32), stroke: 'var(--marked)', text: 'var(--ink)' };
    case 'buffered': return { fill: wash(BLUE, 24), stroke: BLUE, text: 'var(--ink)' };
    case 'expected': return { fill: 'var(--paper)', stroke: 'var(--accent)', text: 'var(--accent)', dash: '4 3', width: 1.8 };
    case 'unusable': return { fill: `url(#${hatch})`, stroke: 'var(--rule)', text: 'var(--faint)' };
    default: return { fill: 'var(--paper)', stroke: 'var(--muted)', text: 'var(--ink)' };
  }
}

function Cell({ x, y, state, text, hatch, size = CELL, fs = 15 }: { x: number; y: number; state: CellState; text?: string; hatch: string; size?: number; fs?: number }) {
  const l = cellLook(state, hatch);
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)` }}>
      <rect width={size} height={size} rx={size / 7} fill={l.fill} stroke={l.stroke} strokeWidth={l.width ?? 1.2} strokeDasharray={l.dash} style={{ transition: 'fill 300ms, stroke 300ms' }} />
      {text !== undefined && (
        <text x={size / 2} y={size / 2 + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={600} fontFamily="var(--font-mono)" fill={l.text}>
          {text}
        </text>
      )}
      {text !== undefined && state === 'acked' && (
        <path d={`M${size - 11},${6}l2.5,2.5l4.5,-4.5`} fill="none" stroke={OK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
}

export default function WindowVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const frames = windowLayouts(steps);
  const hatch = `hatch${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { width, height } = frames[0];
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={width}
      height={height}
      title={title}
      static={isStatic}
      draw={(i, k) => {
        const f = frames[i];
        let lx = 16, ly = f.legendY + 12;
        const legend = f.legend.map((l) => {
          const w = 26 + l.label.length * 6.3;
          if (lx + w > width - 16 && lx > 16) { lx = 16; ly += 20; }
          const at = { x: lx, y: ly };
          lx += w;
          return { ...l, ...at };
        });
        return (
          <>
            <defs>
              <pattern id={hatch} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width={6} height={6} fill="var(--sunken)" />
                <path d="M0,0V6" stroke="var(--faint)" strokeWidth={1.4} strokeOpacity={0.55} />
              </pattern>
            </defs>
            {f.rows.map((r) => (
              <g key={r.key}>
                <text x={16} y={r.y + 12} fontSize={12.5 * k} fontWeight={650} fontFamily="var(--font-sans)" fill="var(--ink)">
                  {r.label}
                </text>
                {r.cells.map((c) => <Cell key={`${r.key}-${c.n}`} x={c.x} y={c.y} state={c.state} text={c.text} hatch={hatch} fs={15 * Math.min(k, 1.25)} />)}
                <rect
                  width={r.frame.w}
                  height={r.frame.h}
                  rx={7}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  style={{ transform: `translate(${r.frame.x}px, ${r.frame.y}px)`, transition: SLIDE }}
                />
                {r.marker && (
                  <text
                    x={0}
                    y={0}
                    fontSize={10.5 * Math.min(k, 1.25)}
                    fontWeight={600}
                    fontFamily="var(--font-mono)"
                    fill="var(--accent)"
                    textAnchor={r.marker.x > width - 90 ? 'end' : 'start'}
                    style={{ transform: `translate(${r.marker.x + (r.marker.x > width - 90 ? r.frame.w : 0)}px, ${r.frame.y + r.frame.h + 12}px)`, transition: SLIDE }}
                  >
                    {r.marker.text}
                  </text>
                )}
              </g>
            ))}
            {legend.map((l) => (
              <g key={l.state}>
                <Cell x={l.x} y={l.y - 7} state={l.state} hatch={hatch} size={14} />
                <text x={l.x + 19} y={l.y} dominantBaseline="central" fontSize={10.5 * Math.min(k, 1.2)} fontFamily="var(--font-sans)" fill="var(--muted)">
                  {l.label}
                </text>
              </g>
            ))}
          </>
        );
      }}
    />
  );
}
