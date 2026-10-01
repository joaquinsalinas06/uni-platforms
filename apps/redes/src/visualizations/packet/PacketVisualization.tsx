// `packet`: cabeceras en rejilla de bits y encapsulamiento por capas.
import NetFigure from '../net-kit.tsx';
import { inkOf, textW, wash } from '../net-style.ts';
import { packetLayouts, W, type Box, type PacketStep } from './layout.ts';

type Step = PacketStep & { note: string };
const TONES = ['var(--tone-series)', 'var(--tone-parallel)', 'var(--tone-bridge)', 'var(--tone-mesh3)', 'var(--marked)'];

function look(b: Box): { fill: string; stroke: string; text: string; width: number; opacity: number } {
  if (b.state && b.state !== 'idle') {
    const ink = inkOf(b.state);
    if (b.state === 'marked') return { fill: wash('var(--marked)', 22), stroke: 'var(--marked)', text: 'var(--ink)', width: 2, opacity: 1 };
    return { fill: b.state === 'muted' ? ink.fill : wash(ink.stroke, 16), stroke: ink.stroke, text: b.state === 'muted' ? ink.text : 'var(--ink)', width: b.state === 'muted' ? 1.2 : 2, opacity: ink.opacity };
  }
  if (b.kind === 'header' || b.kind === 'trailer' || b.kind === 'layer') {
    const t = TONES[(b.tone ?? 0) % TONES.length];
    return { fill: wash(t, b.kind === 'layer' ? 10 : 22), stroke: t, text: 'var(--ink)', width: 1.3, opacity: 1 };
  }
  return { fill: 'var(--paper)', stroke: 'var(--ink)', text: 'var(--ink)', width: 1.2, opacity: 1 };
}

function BoxView({ b, k, anim }: { b: Box; k: number; anim?: string }) {
  // Un campo de pie no se agranda en móvil: ya ocupa todo su ancho.
  if (b.vertical) k = 1;
  const l = look(b);
  // El agrandado de móvil nunca saca el rótulo de su caja.
  const lw = Math.max(...b.lines.map((t) => textW(t, b.fs, b.kind === 'header' || b.kind === 'trailer')));
  const fs = b.fs * Math.max(1, Math.min(k, 1.3, (b.w - 6) / lw));
  const lh = fs * 1.2;
  const block = b.lines.length * lh + (b.value ? 15 : 0);
  const y0 = b.y + b.h / 2 - block / 2 + lh / 2;
  return (
    <g className={anim} opacity={l.opacity}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.kind === 'field' ? 0 : 4} fill={l.fill} stroke={l.stroke} strokeWidth={l.width} style={{ transition: 'fill 300ms, stroke 300ms' }} />
      {b.vertical && (
        <text transform={`translate(${b.x + b.w / 2},${b.y + b.h / 2}) rotate(-90)`} textAnchor="middle" dominantBaseline="central" fontSize={b.fs} fontWeight={500} fontFamily="var(--font-sans)" fill={l.text}>
          {b.lines[0]}
        </text>
      )}
      {!b.vertical && b.lines.map((line, j) => (
        <text key={j} x={b.x + b.w / 2} y={y0 + j * lh} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={b.kind === 'field' ? 500 : 650} fontFamily={b.kind === 'header' || b.kind === 'trailer' ? 'var(--font-mono)' : 'var(--font-sans)'} fill={l.text}>
          {line}
        </text>
      ))}
      {b.value && (
        <text x={b.x + b.w / 2} y={y0 + b.lines.length * lh + 2} textAnchor="middle" dominantBaseline="central" fontSize={11.5 * Math.min(k, 1.3)} fontWeight={600} fontFamily="var(--font-mono)" fill={b.state === 'active' ? 'var(--accent)' : 'var(--muted)'}>
          {b.value}
        </text>
      )}
      {b.kind === 'field' && b.bits !== undefined && b.w > 56 && (
        <text x={b.x + b.w - 4} y={b.y + 10} textAnchor="end" fontSize={8.5 * Math.min(k, 1.2)} fontFamily="var(--font-mono)" fill="var(--faint)">
          {b.bits}b
        </text>
      )}
    </g>
  );
}

export default function PacketVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const frames = packetLayouts(steps);
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={W}
      height={frames[0].height}
      title={title}
      static={isStatic}
      draw={(i, k, prev) => {
        const f = frames[i];
        const keys = new Set(f.boxes.map((b) => b.key));
        const ghosts = prev !== undefined && prev !== i ? frames[prev].boxes.filter((b) => !keys.has(b.key)) : [];
        return (
          <>
            {f.ticks && <path d={f.ticks} stroke="var(--muted)" strokeWidth={1} />}
            {f.texts.map((t) => (
              <text key={t.key} x={t.x} y={t.y} textAnchor={t.anchor} dominantBaseline="central" fontSize={t.size * Math.min(k, 1.3)} fontWeight={t.key.startsWith('t') ? 600 : 500} fontFamily="var(--font-mono)" fill={t.state === 'active' ? 'var(--accent)' : t.key.startsWith('t') ? 'var(--ink)' : 'var(--muted)'}>
                {t.text}
              </text>
            ))}
            {ghosts.map((b) => <BoxView key={`ghost-${b.key}-${i}`} b={b} k={k} anim="net-out" />)}
            {f.boxes.map((b) => {
              // Al aparecer una capa nueva su cabecera entra deslizándose; el resto de la fila, con fundido.
              const [j, row] = b.key.slice(b.kind === 'trailer' ? 2 : 1).split('-');
              const anim = b.kind === 'header' || b.kind === 'trailer' ? (j === row ? 'net-slide' : 'net-in') : b.kind === 'payload' ? 'net-in' : undefined;
              return <BoxView key={b.key} b={b} k={k} anim={anim} />;
            })}
          </>
        );
      }}
    />
  );
}
