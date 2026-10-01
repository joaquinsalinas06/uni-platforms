// `net-scene`: dispositivos dibujados, cables con tasa/retardo y paquetes que
// viajan al entrar al paso (CSS: global.css apaga la animación con
// prefers-reduced-motion y el sobre queda ya en destino).
import type { CSSProperties } from 'react';
import NetFigure, { haloText, headPoints } from '../net-kit.tsx';
import { inkOf, wash, textW } from '../net-style.ts';
import { DeviceIcon } from './icons.tsx';
import { netSceneLayout, W, H, R, ICON, LABEL, SUB, PKT, type NetStep, type PacketL } from './layout.ts';

type Step = NetStep & { note: string };
const TRAVEL = 900;

function Packet({ p, k }: { p: PacketL; k: number }) {
  const ink = inkOf(p.state);
  const muted = p.state === 'muted';
  const moving = p.state === 'active' || p.state === 'answer';
  const color = p.state === undefined || p.state === 'idle' || p.state === 'marked' ? 'var(--ink)' : ink.stroke;
  const fs = PKT * k;
  const cw = textW(p.label, fs) + 12;
  return (
    <g opacity={muted ? 0.75 : 1}>
      {p.state === 'marked' && <path d={`M${p.s.x},${p.s.y}L${p.e.x},${p.e.y}`} stroke="var(--marked)" strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" />}
      <path
        d={`M${p.s.x},${p.s.y}L${p.e.x},${p.e.y}`}
        stroke={color}
        strokeWidth={moving ? 2.2 : muted ? 1.3 : 1.6}
        strokeDasharray={muted ? '5 4' : moving ? 1 : undefined}
        pathLength={moving ? 1 : undefined}
        fill="none"
        strokeLinecap="round"
        className={moving ? 'net-draw' : undefined}
        style={{ '--dur': `${TRAVEL}ms` } as CSSProperties}
      />
      {!p.lost && <polygon points={headPoints(p.e.x, p.e.y, p.angle, 9, 4.5)} fill={color} className={moving ? 'net-late' : undefined} style={{ '--delay': `${TRAVEL}ms` } as CSSProperties} />}
      {p.badge && p.order !== undefined && (
        <g transform={`translate(${p.badge.x},${p.badge.y})`}>
          <circle r={8.5 * Math.min(k, 1.2)} fill={muted ? 'var(--faint)' : color} stroke="var(--fill)" strokeWidth={2} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10 * Math.min(k, 1.2)} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--paper)">
            {p.order}
          </text>
        </g>
      )}
      {p.chip && p.label && (
        <g transform={`translate(${p.chip.x},${p.chip.y})`} className={moving ? 'net-in' : undefined}>
          <rect x={-cw / 2} y={-fs * 0.85} width={cw} height={fs * 1.7} rx={fs * 0.85} fill={muted ? 'var(--fill)' : moving ? ink.fill : 'var(--paper)'} stroke={muted ? 'var(--rule)' : color} strokeWidth={1} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={moving ? 600 : 500} fontFamily="var(--font-mono)" fill={muted ? 'var(--faint)' : color}>
            {p.label}
          </text>
        </g>
      )}
      {moving && (
        // El sobre: su `transform` final es el destino; la animación parte del origen.
        <g
          className="net-travel"
          style={{ transform: `translate(${p.rest.x}px, ${p.rest.y}px)`, '--x0': `${p.s.x}px`, '--y0': `${p.s.y}px`, '--dur': `${p.lost ? TRAVEL / 2 : TRAVEL}ms` } as CSSProperties}
        >
          <rect x={-9} y={-6.5} width={18} height={13} rx={2} fill={color} stroke="var(--fill)" strokeWidth={1.5} />
          <path d="M-8,-5.2L0,1.2L8,-5.2" fill="none" stroke="var(--paper)" strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      )}
      {p.lost && (
        <path
          d={`M${p.e.x - 7},${p.e.y - 7}l14,14m0,-14l-14,14`}
          stroke="var(--verdict-bad)"
          strokeWidth={3}
          strokeLinecap="round"
          className={moving ? 'net-late' : undefined}
          style={{ '--delay': `${TRAVEL / 2}ms` } as CSSProperties}
        />
      )}
    </g>
  );
}

export default function NetSceneVisualization({ steps, title, static: isStatic }: { steps: Step[]; title?: string; static?: boolean }) {
  const frames = steps.map(netSceneLayout);
  return (
    <NetFigure
      notes={steps.map((s) => s.note)}
      width={W}
      height={H}
      title={title}
      static={isStatic}
      draw={(i, k) => {
        const f = frames[i];
        const arriving = new Set(f.packets.filter((p) => !p.lost && (p.state === 'active' || p.state === 'answer')).map((p) => p.to));
        return (
          <>
            {f.zones.map((z) => (
              <g key={`z-${z.label}`}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} fill="color-mix(in srgb, var(--muted) 7%, transparent)" stroke="var(--rule)" strokeWidth={1.2} />
                <text x={z.x + 10} y={z.y + 15} fontSize={10 * Math.min(k, 1.25)} fontFamily="var(--font-mono)" letterSpacing="0.06em" fill="var(--muted)" style={{ textTransform: 'uppercase' }}>
                  {z.label}
                </text>
              </g>
            ))}
            {f.cables.map((c) => {
              const ink = inkOf(c.state);
              return <path key={c.id} d={`M${c.a.x},${c.a.y}L${c.b.x},${c.b.y}`} stroke={c.state ? ink.stroke : 'var(--muted)'} strokeWidth={c.state === 'active' ? 2.5 : 2} opacity={ink.opacity} strokeLinecap="round" />;
            })}
            {f.devices.map((d) => {
              const ink = inkOf(d.state);
              const lit = d.state === 'active' || d.state === 'answer';
              return (
                <g key={`d-${d.id}`} style={{ transform: `translate(${d.cx}px, ${d.cy}px)`, transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }} opacity={ink.opacity}>
                  {ink.halo && <circle r={R + 6} fill="var(--marked)" opacity={0.2} stroke="var(--marked)" strokeOpacity={0.6} strokeWidth={1.5} />}
                  <circle r={R - 2} fill={lit ? ink.fill : 'var(--fill)'} stroke={lit ? ink.stroke : 'none'} strokeWidth={1.5} />
                  {arriving.has(d.id) && <circle key={`ping-${i}`} r={R - 2} fill="none" stroke={ink.stroke === 'var(--ink)' ? 'var(--accent)' : ink.stroke} strokeWidth={2} className="net-ping" style={{ '--delay': `${TRAVEL}ms` } as CSSProperties} />}
                  <g transform={`scale(${ICON})`}>
                    <DeviceIcon kind={d.kind} stroke={ink.stroke} fill="var(--paper)" screen={lit ? wash(ink.stroke, 22) : 'var(--sunken)'} />
                  </g>
                  <text y={R + 6} textAnchor="middle" fontSize={LABEL * k} fontWeight={650} fontFamily="var(--font-sans)" fill={lit ? ink.text : 'var(--ink)'} style={haloText}>
                    {d.label}
                  </text>
                  {d.sub && (
                    <text y={R + 6 + 14 * k} textAnchor="middle" fontSize={SUB * k} fontFamily="var(--font-mono)" fill="var(--muted)" style={haloText}>
                      {d.sub}
                    </text>
                  )}
                </g>
              );
            })}
            {f.cables.map((c) => c.chip && (
              <g key={`${c.id}-chip`} transform={`translate(${c.chip.x},${c.chip.y})`}>
                <rect x={-(textW(c.chip.text, 10.5 * k) + 10) / 2} y={-8.5 * k} width={textW(c.chip.text, 10.5 * k) + 10} height={17 * k} rx={3} fill="var(--paper)" stroke="var(--rule)" />
                <text textAnchor="middle" dominantBaseline="central" fontSize={10.5 * k} fontFamily="var(--font-mono)" fill="var(--muted)">
                  {c.chip.text}
                </text>
              </g>
            ))}
            {/* Muted primero (rastro), luego los del paso encima. */}
            {[...f.packets].sort((a, b) => Number(b.state === 'muted') - Number(a.state === 'muted')).map((p) => (
              // Un paquete que se mueve se remonta en cada paso: la animación vuelve a correr.
              <Packet key={p.state === 'active' || p.state === 'answer' ? `${p.id}-${i}` : p.id} p={p} k={k} />
            ))}
          </>
        );
      }}
    />
  );
}
