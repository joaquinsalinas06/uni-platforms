// `net-scene`: dispositivos dibujados, cables con tasa/retardo y paquetes que
// viajan al entrar al paso. Claves estables entre pasos: un paquete que pasa
// de active a muted se apaga con transición (no se remonta); lo que
// desaparece al volver atrás se desvanece (fantasma con .net-out). El sobre
// recorre la curva con Web Animations; con prefers-reduced-motion no se anima.
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import NetFigure, { haloText, headPoints, reducedMotion, MAX_BOOST } from '../net-kit.tsx';
import { inkOf, wash } from '../net-style.ts';
import { DeviceIcon } from './icons.tsx';
import { netSceneLayout, W, H, R, ICON, PKT, type Chip, type NetFrame, type NetStep, type PacketL, type Pt } from './layout.ts';

type Step = NetStep & { note: string };
const TRAVEL = 900;

function Envelope({ travel, rest, color, dur }: { travel: Pt[]; rest: Pt; color: string; dur: number }) {
  const ref = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || reducedMotion() || travel.length < 2) return;
    ref.current.animate(travel.map((p) => ({ transform: `translate(${p.x}px, ${p.y}px)` })), { duration: dur, easing: 'cubic-bezier(.45,.05,.35,1)' });
  }, []);
  return (
    <g ref={ref} style={{ transform: `translate(${rest.x}px, ${rest.y}px)` }}>
      <rect x={-9} y={-6.5} width={18} height={13} rx={2} fill={color} stroke="var(--fill)" strokeWidth={1.5} />
      <path d="M-8,-5.2L0,1.2L8,-5.2" fill="none" stroke="var(--paper)" strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  );
}

function ChipView({ c, fs, fill, stroke, color, weight, className }: { c: Chip; fs: number; fill: string; stroke: string; color: string; weight: number; className?: string }) {
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
  const lh = fs * 1.2;
  return (
    <g className={className}>
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={Math.min(c.h / 2, 9)} fill={fill} stroke={stroke} strokeWidth={1} />
      {c.lines.map((l, j) => (
        <text key={j} x={cx} y={cy + (j - (c.lines.length - 1) / 2) * lh} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={weight} fontFamily="var(--font-mono)" fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
}

function Packet({ p, k, i, ghost }: { p: PacketL; k: number; i: number; ghost?: boolean }) {
  const ink = inkOf(p.state);
  const muted = p.state === 'muted';
  const moving = !ghost && (p.state === 'active' || p.state === 'answer');
  const color = p.state === undefined || p.state === 'idle' || p.state === 'marked' ? 'var(--ink)' : ink.stroke;
  return (
    <g opacity={muted ? 0.75 : 1} className={ghost ? 'net-out' : undefined}>
      {p.state === 'marked' && <path d={p.d} fill="none" stroke="var(--marked)" strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" />}
      {/* El trazo se dibuja al montarse (primera vez que aparece el paquete). */}
      <path d={p.d} stroke={color} strokeWidth={moving ? 2.2 : muted ? 1.3 : 1.6} strokeDasharray={muted ? '5 4' : 1} fill="none" strokeLinecap="round" className="net-draw-once" pathLength={muted ? undefined : 1} style={{ '--dur': `${TRAVEL}ms` } as CSSProperties} />
      {!p.lost && <polygon points={headPoints(p.e.x, p.e.y, p.angle, 9, 4.5)} fill={color} className="net-late" style={{ '--delay': `${TRAVEL}ms` } as CSSProperties} />}
      {p.badge && p.order !== undefined && (
        <g transform={`translate(${p.badge.x},${p.badge.y})`}>
          <circle r={8.5 * Math.min(k, 1.2)} fill={muted ? 'var(--faint)' : color} stroke="var(--fill)" strokeWidth={2} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10 * Math.min(k, 1.2)} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--paper)">
            {p.order}
          </text>
        </g>
      )}
      {p.chip && (
        <ChipView c={p.chip} fs={PKT * k} fill={muted ? 'var(--fill)' : moving ? ink.fill : 'var(--paper)'} stroke={muted ? 'var(--rule)' : color} color={muted ? 'var(--faint)' : color} weight={moving ? 600 : 500} className="net-in" />
      )}
      {/* El sobre sí se remonta en cada visita al paso: vuelve a viajar. */}
      {moving && <Envelope key={`env-${i}`} travel={p.travel} rest={p.rest} color={color} dur={p.lost ? TRAVEL / 2 : TRAVEL} />}
      {p.lost && (
        <path d={`M${p.e.x - 7},${p.e.y - 7}l14,14m0,-14l-14,14`} stroke="var(--verdict-bad)" strokeWidth={3} strokeLinecap="round" className="net-late" style={{ '--delay': `${TRAVEL / 2}ms` } as CSSProperties} />
      )}
    </g>
  );
}

export default function NetSceneVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  // Dos juegos de fotogramas: texto normal y texto agrandado de móvil (el auditor revisa ambos).
  const sets = new Map<number, NetFrame[]>();
  const framesFor = (kb: number) => {
    if (!sets.has(kb)) sets.set(kb, steps.map((s) => netSceneLayout(s, kb)));
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
        const arriving = new Set(f.packets.filter((p) => !p.lost && (p.state === 'active' || p.state === 'answer')).map((p) => p.to));
        const ids = new Set(f.packets.map((p) => p.id));
        const ghosts = prev !== undefined && prev !== i ? frames[prev].packets.filter((p) => !ids.has(p.id)) : [];
        return (
          <>
            {f.zones.map((z) => (
              <g key={`z-${z.label}`} className="net-in">
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} fill="color-mix(in srgb, var(--muted) 7%, transparent)" stroke="var(--rule)" strokeWidth={1.2} />
                <text x={z.x + 12} y={z.y + 14} fontSize={10 * k} fontFamily="var(--font-mono)" letterSpacing="0.06em" fill="var(--muted)" style={{ textTransform: 'uppercase' }}>
                  {z.label}
                </text>
              </g>
            ))}
            {f.cables.map((c) => {
              const ink = inkOf(c.state);
              return <path key={c.id} d={`M${c.a.x},${c.a.y}L${c.b.x},${c.b.y}`} stroke={c.state ? ink.stroke : 'var(--muted)'} strokeWidth={c.state === 'active' ? 2.5 : 2} opacity={ink.opacity} strokeLinecap="round" className="net-in" />;
            })}
            {f.devices.map((d) => {
              const ink = inkOf(d.state);
              const lit = d.state === 'active' || d.state === 'answer';
              return (
                <g key={`d-${d.id}`} className="net-pop-in" opacity={ink.opacity}>
                  <g style={{ transform: `translate(${d.cx}px, ${d.cy}px)`, transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }}>
                    <circle r={R + 6} fill="var(--marked)" opacity={ink.halo ? 0.2 : 0} stroke="var(--marked)" strokeOpacity={ink.halo ? 0.6 : 0} strokeWidth={1.5} />
                    <circle r={R - 2} fill={lit ? ink.fill : 'var(--fill)'} stroke={lit ? ink.stroke : 'var(--fill)'} strokeWidth={1.5} />
                    {arriving.has(d.id) && <circle key={`ping-${i}`} r={R - 2} fill="none" stroke={ink.stroke === 'var(--ink)' ? 'var(--accent)' : ink.stroke} strokeWidth={2} className="net-ping" style={{ '--delay': `${TRAVEL}ms` } as CSSProperties} />}
                    <g transform={`scale(${ICON})`}>
                      <DeviceIcon kind={d.kind} stroke={ink.stroke} fill="var(--paper)" screen={lit ? wash(ink.stroke, 22) : 'var(--sunken)'} />
                    </g>
                  </g>
                  {d.lines.map((l, j) => (
                    <text
                      key={j}
                      x={d.block.x + d.block.w / 2}
                      y={l.y}
                      textAnchor="middle"
                      fontSize={l.size}
                      fontWeight={l.sub ? 400 : 650}
                      fontFamily={l.sub ? 'var(--font-mono)' : 'var(--font-sans)'}
                      fill={l.sub ? 'var(--muted)' : lit ? ink.text : 'var(--ink)'}
                      style={haloText}
                    >
                      {l.text}
                    </text>
                  ))}
                </g>
              );
            })}
            {f.cables.map((c) => c.chip && <ChipView key={`${c.id}-chip`} c={c.chip} fs={10.5 * k} fill="var(--paper)" stroke="var(--rule)" color="var(--muted)" weight={400} />)}
            {ghosts.map((p) => <Packet key={`ghost-${p.id}-${i}`} p={p} k={k} i={i} ghost />)}
            {/* Orden estable: reordenar nodos del DOM reinicia sus animaciones. */}
            {f.packets.map((p) => <Packet key={p.id} p={p} k={k} i={i} />)}
          </>
        );
      }}
    />
  );
}
