import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import katex from 'katex';
import type { CanvasPanel, CanvasPath, CanvasScene, NodeState, SceneSymbol, SceneText, SceneWire } from '../visualizations/canvas-types.ts';
import { arrowHead, glyph, measure, runs, SUB_SCALE } from '../visualizations/circuit/symbols.ts';

// Capa de símbolos del canvas (familia `circuit`) + panel de ecuaciones.
// Sólo dibuja y anima lo que el layout puro ya resolvió.

const EASE = 'cubic-bezier(.2,.7,.3,1)';
const MOVE = `transform 450ms ${EASE}`;

export function colorOf(state?: NodeState | string, tone?: string): string {
  switch (state) {
    case 'active': return 'var(--accent)';
    case 'answer': return 'var(--answer)';
    case 'marked': return 'var(--marked)';
    case 'muted': return 'var(--faint)';
  }
  return tone ? `var(--tone-${tone}, var(--ink))` : 'var(--ink)';
}
const TEXT_COLOR: Record<string, string> = { ink: 'var(--ink)', muted: 'var(--muted)', faint: 'var(--faint)', ok: 'var(--verdict-ok)', bad: 'var(--verdict-bad)' };

function Glyph({ s, color, glow }: { s: SceneSymbol; color: string; glow?: string }) {
  const g = glyph(s.kind, s.variant);
  const dim = s.state === 'muted';
  return (
    <>
      {glow &&
        g.paths.map((p, i) => (
          <path key={`g${i}`} d={p.d} fill="none" stroke={glow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
        ))}
      {g.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          transform={p.upright ? `rotate(${-s.angle})` : undefined}
          fill={p.fill === 'stroke' ? color : p.fill === 'paper' ? 'var(--paper)' : 'none'}
          stroke={color}
          strokeWidth={p.w ?? 1.6}
          strokeDasharray={p.dash ?? (dim ? '3 2' : undefined)}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={p.opacity}
          style={{ transition: 'stroke 300ms, fill 300ms' }}
        />
      ))}
      {g.texts.map((t, i) => (
        <g key={`t${i}`} transform={`translate(${t.x},${t.y}) rotate(${-s.angle})`}>
          <text textAnchor="middle" dominantBaseline="central" fontSize={t.size} fontWeight={t.weight ?? 500} fontFamily="var(--font-sans)" fill={color}>
            {t.t}
          </text>
        </g>
      ))}
    </>
  );
}

/** Texto con subíndices (`I_{R2}`, `I₁`). */
export function RichText({ t, hover }: { t: SceneText; hover?: boolean }) {
  const size = t.size ?? 12;
  const fill = hover ? 'var(--accent)' : t.state && t.state !== 'idle' ? colorOf(t.state) : t.tone ? colorOf(undefined, t.tone) : TEXT_COLOR[t.color ?? 'ink'];
  const rs = runs(t.text);
  let lastSub = false;
  const w = measure(t.text, size, t.mono);
  const x0 = t.anchor === 'middle' ? -w / 2 : t.anchor === 'end' ? -w : 0;
  return (
    <g style={{ transform: `translate(${t.x}px, ${t.y}px)`, transition: MOVE }}>
      {t.chip && (
        <rect x={x0 - 6} y={-(size * 1.22 + 6) / 2} width={w + 12} height={size * 1.22 + 6} rx={4} fill="var(--paper)" stroke={fill} strokeOpacity={0.55} strokeWidth={1} />
      )}
      <text
        textAnchor={t.anchor ?? 'start'}
        dominantBaseline="central"
        fontSize={size}
        fontWeight={t.weight ?? 500}
        fontFamily={t.mono ? 'var(--font-mono)' : 'var(--font-sans)'}
        fill={fill}
        style={{ transition: 'fill 300ms' }}
      >
        {rs.map((r, i) => {
          const dy = r.sub && !lastSub ? '0.32em' : !r.sub && lastSub ? '-0.32em' : undefined;
          lastSub = !!r.sub;
          return (
            <tspan key={i} dy={dy} fontSize={r.sub ? size * SUB_SCALE : undefined}>
              {r.t}
            </tspan>
          );
        })}
      </text>
    </g>
  );
}

function Mark({ p }: { p: CanvasPath }) {
  const color = colorOf(p.state, p.tone);
  return (
    <path
      d={p.d}
      fill={p.fill ? color : 'none'}
      stroke={p.fill ? 'none' : color}
      strokeWidth={p.width ?? 1.5}
      strokeDasharray={p.dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={p.opacity ?? 1}
      className="cz-fade"
      style={{ transition: 'd 450ms ' + EASE + ', stroke 300ms, fill 300ms' }}
    />
  );
}

type Ghost = SceneSymbol & { dx: number; dy: number; glow?: string };
type Ghosts = { key: number; symbols: Ghost[]; wires: SceneWire[] };

export function SceneLayer({ scene, hover, onHover }: { scene: CanvasScene; hover: string | null; onHover: (id: string | null) => void }) {
  const prev = useRef<CanvasScene | null>(null);
  const seen = useRef(false);
  const [ghosts, setGhosts] = useState<Ghosts>({ key: 0, symbols: [], wires: [] });

  // Al cambiar de paso: lo que desaparece se queda un momento como fantasma.
  // Si una pieza nueva lo lista en `mergedFrom`, el fantasma brilla en el tono
  // del grupo y colapsa hacia ella; si no, sólo se desvanece.
  useLayoutEffect(() => {
    const p = prev.current;
    prev.current = scene;
    if (!p || p === scene) return;
    const now = new Set(scene.symbols.map((s) => s.id));
    const into = new Map<string, SceneSymbol[]>();
    for (const s of scene.symbols) for (const src of s.mergedFrom ?? []) into.set(src, [...(into.get(src) ?? []), s]);
    const gs: Ghost[] = p.symbols
      .filter((s) => !now.has(s.id))
      .map((s) => {
        const t = s.part ? into.get(s.part) : undefined;
        if (!t) return { ...s, dx: 0, dy: 0 };
        const tx = t.reduce((a, q) => a + q.x, 0) / t.length;
        const ty = t.reduce((a, q) => a + q.y, 0) / t.length;
        return { ...s, dx: tx - s.x, dy: ty - s.y, glow: colorOf(undefined, t[0].mergeTone ?? 'series') };
      });
    const wnow = new Set(scene.wires.map((w) => w.id));
    const gw = p.wires.filter((w) => !wnow.has(w.id));
    setGhosts((g) => ({ key: g.key + 1, symbols: gs, wires: gw }));
    const t = setTimeout(() => setGhosts((g) => ({ ...g, symbols: [], wires: [] })), 1100);
    return () => clearTimeout(t);
  }, [scene]);
  useLayoutEffect(() => {
    seen.current = true;
  }, []);

  const merged = useMemo(() => new Set(scene.symbols.filter((s) => s.mergedFrom?.length).map((s) => s.part)), [scene]);
  const wide = scene.variant === 'breadboard' || scene.variant === 'wiring';
  const { x: ox, y: oy } = scene.origin;

  return (
    <g transform={`translate(${-ox}, ${-oy})`}>
      {scene.board && (
        <g>
          <defs>
            <pattern id="cz-holes" width={10} height={10} patternUnits="userSpaceOnUse">
              <circle cx={5} cy={5} r={1.3} fill="var(--faint)" opacity={0.45} />
            </pattern>
          </defs>
          <rect x={scene.board.x} y={scene.board.y} width={scene.board.w} height={scene.board.h} rx={10} fill="color-mix(in srgb, var(--sunken) 70%, var(--paper))" stroke="var(--rule)" />
          <rect x={scene.board.x + 8} y={scene.board.y + 8} width={scene.board.w - 16} height={scene.board.h - 16} rx={4} fill="url(#cz-holes)" />
          <line x1={scene.board.x + 10} x2={scene.board.x + scene.board.w - 10} y1={scene.board.y + 5} y2={scene.board.y + 5} stroke="var(--verdict-bad)" strokeWidth={1.2} />
          <line x1={scene.board.x + 10} x2={scene.board.x + scene.board.w - 10} y1={scene.board.y + scene.board.h - 5} y2={scene.board.y + scene.board.h - 5} stroke="var(--tone-series)" strokeWidth={1.2} />
        </g>
      )}

      {scene.halos.map((h) => {
        const c = colorOf(undefined, h.tone);
        return (
          <g key={h.id} className="cz-fade">
            <path d={h.d} fill={c} stroke={c} strokeWidth={2 * h.pad + 3} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} style={{ transition: `d 450ms ${EASE}` }} />
            <path
              d={h.d}
              fill={`color-mix(in srgb, ${c} 9%, var(--fill))`}
              stroke={`color-mix(in srgb, ${c} 9%, var(--fill))`}
              strokeWidth={2 * h.pad}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ transition: `d 450ms ${EASE}` }}
            />
          </g>
        );
      })}

      {scene.walker && (
        <path
          key={scene.walker.id}
          d={scene.walker.d}
          pathLength={1}
          fill="none"
          stroke={colorOf(undefined, scene.walker.tone)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${scene.walker.frac} 2`}
          opacity={0.25}
          style={{ transition: `stroke-dasharray 600ms ${EASE}` }}
        />
      )}

      {ghosts.wires.map((w) => (
        <path key={`gw${ghosts.key}-${w.id}`} d={w.d} fill="none" stroke="var(--ink)" strokeWidth={1.6} className="cz-out" />
      ))}
      {scene.wires.map((w) => (
        <path
          key={w.id}
          d={w.d}
          fill="none"
          stroke={colorOf(w.state, w.tone)}
          strokeWidth={w.width ?? (wide ? 2.6 : 1.6)}
          strokeDasharray={w.dash ?? (w.state === 'muted' ? '3 3' : undefined)}
          strokeLinejoin="round"
          strokeLinecap={wide ? 'round' : 'square'}
          className={merged.has(w.id) ? 'cz-merge-in-fade' : 'cz-fade'}
          style={{ transition: `d 450ms ${EASE}, stroke 300ms` }}
        />
      ))}

      {scene.marks.map((m) => (
        <Mark key={m.id} p={m} />
      ))}

      {ghosts.symbols.map((s) => (
        <g key={`g${ghosts.key}-${s.id}`} className={s.glow ? 'cz-ghost-move' : undefined} style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px` } as CSSProperties}>
          <g transform={`translate(${s.x}, ${s.y}) rotate(${s.angle})`}>
            <g className={s.glow ? 'cz-ghost' : 'cz-out'}>
              <Glyph s={s} color={s.glow ?? colorOf(s.state, s.tone)} glow={s.glow} />
            </g>
          </g>
        </g>
      ))}

      {scene.symbols.map((s) => {
        const hot = hover != null && s.part === hover;
        return (
          <g
            key={s.id}
            style={{ transform: `translate(${s.x}px, ${s.y}px) rotate(${s.angle}deg)`, transition: MOVE }}
            onMouseEnter={s.part ? () => onHover(s.part!) : undefined}
            onMouseLeave={s.part ? () => onHover(null) : undefined}
          >
            <g className={s.mergedFrom?.length ? 'cz-merge-in' : 'cz-in'}>
              <Glyph s={s} color={hot ? 'var(--accent)' : colorOf(s.state, s.tone)} />
              {/* zona de toque más grande que el trazo */}
              {s.part && <rect x={-16} y={-12} width={32} height={24} fill="transparent" />}
            </g>
          </g>
        );
      })}

      {scene.dots.map((d) =>
        d.ring ? (
          <circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill="none" stroke="var(--answer)" strokeWidth={1.6} className="cz-in" />
        ) : (
          <circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill={d.hollow ? 'var(--paper)' : 'var(--ink)'} stroke="var(--ink)" strokeWidth={d.hollow ? 1.4 : 0} className="cz-fade" />
        ),
      )}

      {scene.walker && (
        <g
          key={`${scene.walker.id}:head`}
          style={{ transform: `translate(${scene.walker.head.x}px, ${scene.walker.head.y}px) rotate(${scene.walker.head.angle}deg)`, transition: `transform 600ms ${EASE}` }}
        >
          <path d={arrowHead(6, 0, 0, 5.5)} fill={colorOf(undefined, scene.walker.tone)} stroke="var(--paper)" strokeWidth={1.2} />
        </g>
      )}

      {scene.texts.map((t) => (
        <RichText key={t.id} t={t} hover={hover != null && t.part === hover} />
      ))}
    </g>
  );
}

function tex(s: string, display = false): string {
  try {
    return katex.renderToString(s, { throwOnError: false, displayMode: display });
  } catch {
    return s;
  }
}

/** Panel de ecuaciones: cada término/fila ligado a su pieza. */
export function EquationPanel({ panel, hover, onHover }: { panel?: CanvasPanel; hover: string | null; onHover: (id: string | null) => void }) {
  const rows = panel?.rows ?? [];
  const closed = rows.some((x) => x.id.startsWith('kvlclosed'));
  return (
    <div className="flex flex-col gap-1.5 text-[0.875rem] leading-snug" aria-live="polite">
      {rows.length === 0 && <p className="text-[var(--faint)]">—</p>}
      {rows.map((r) => {
        const hot = hover != null && (r.parts ?? []).includes(hover);
        const toneBar = r.tone ? colorOf(undefined, r.tone) : 'transparent';
        if (r.kind === 'head')
          return (
            <p key={r.id} className="tag mt-2 first:mt-0" style={{ color: r.tone ? toneBar : undefined }}>
              {r.tex}
            </p>
          );
        if (r.kind === 'note')
          return (
            <p key={r.id} className="text-[0.8125rem]" style={{ color: r.verdict === 'bad' ? 'var(--verdict-bad)' : 'var(--muted)' }}>
              {r.verdict === 'bad' && <span className="mr-1 font-semibold">✗</span>}
              {r.tex}
            </p>
          );
        return (
          <div
            key={r.id}
            className="rounded px-2 py-1 transition-colors"
            style={{
              borderLeft: `3px solid ${toneBar}`,
              background: hot ? 'var(--accent-wash)' : r.state === 'answer' ? 'color-mix(in srgb, var(--answer) 7%, transparent)' : undefined,
              overflowX: 'auto',
            }}
            onMouseEnter={r.parts?.length === 1 ? () => onHover(r.parts![0]) : undefined}
            onMouseLeave={r.parts?.length === 1 ? () => onHover(null) : undefined}
          >
            {r.terms ? (
              <span className="flex flex-wrap items-baseline gap-x-1">
                {r.terms.map((t) => {
                  const on = t.active || hover === t.part;
                  return (
                    <span
                      key={t.part + t.tex}
                      className="rounded px-0.5 transition-colors"
                      style={{ background: on ? 'var(--accent-wash)' : undefined, color: on ? 'var(--accent)' : undefined, boxShadow: on ? 'inset 0 -2px 0 var(--accent)' : undefined }}
                      onMouseEnter={() => onHover(t.part)}
                      onMouseLeave={() => onHover(null)}
                      dangerouslySetInnerHTML={{ __html: tex(t.tex) }}
                    />
                  );
                })}
                {!closed && <span className="text-[var(--faint)]">⋯</span>}
              </span>
            ) : (
              <span className="flex items-baseline justify-between gap-2">
                <span dangerouslySetInnerHTML={{ __html: tex(r.tex ?? '') }} />
                {r.verdict && (
                  <span className="font-semibold" style={{ color: r.verdict === 'ok' ? 'var(--verdict-ok)' : 'var(--verdict-bad)' }} aria-label={r.verdict === 'ok' ? 'hipótesis válida' : 'hipótesis falsa'}>
                    {r.verdict === 'ok' ? '✓' : '✗'}
                  </span>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
