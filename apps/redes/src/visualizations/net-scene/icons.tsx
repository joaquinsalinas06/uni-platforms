// Íconos de dispositivo dibujados a mano, centrados en (0,0), ~48×40.
// `s` = trazo, `f` = relleno del cuerpo, `p` = pantalla/cara interior.
import { headPoints } from '../net-kit.tsx';
import type { DeviceKind } from './layout.ts';

type C = { s: string; f: string; p: string };

function Rack({ s, f, units, top = -18 }: C & { units: number; top?: number }) {
  return (
    <>
      {Array.from({ length: units }, (_, i) => {
        const y = top + i * 11;
        return (
          <g key={i}>
            <rect x={-17} y={y} width={34} height={9.5} rx={2} fill={f} stroke={s} />
            <circle cx={-12} cy={y + 4.75} r={1.5} fill={s} stroke="none" />
            <circle cx={-7.5} cy={y + 4.75} r={1.5} fill={s} stroke="none" opacity={0.45} />
            <path d={`M-1,${y + 3.2}H12M-1,${y + 6.3}H12`} strokeWidth={1.1} />
          </g>
        );
      })}
    </>
  );
}

function Glyph({ kind, s, f, p }: { kind: DeviceKind } & C) {
  const c = { s, f, p };
  switch (kind) {
    case 'laptop':
      return (
        <>
          <rect x={-17} y={-17} width={34} height={23} rx={2.5} fill={f} />
          <rect x={-13.5} y={-13.5} width={27} height={16} rx={1} fill={p} stroke="none" />
          <path d="M-23,6H23L25,10.5Q25,12 23.5,12H-23.5Q-25,12 -25,10.5Z" fill={f} />
          <path d="M-4,9H4" strokeWidth={1.2} />
        </>
      );
    case 'host':
      return (
        <>
          <rect x={-24} y={-15} width={29} height={20} rx={2} fill={f} />
          <rect x={-21} y={-12} width={23} height={14} rx={1} fill={p} stroke="none" />
          <path d="M-9.5,5V10M-15,11H-4" />
          <rect x={9} y={-17} width={14} height={29} rx={2} fill={f} />
          <path d="M12,-12.5H20M12,-8.5H20" strokeWidth={1.2} />
          <circle cx={16} cy={6} r={1.7} fill={s} stroke="none" />
        </>
      );
    case 'phone':
      return (
        <>
          <rect x={-10.5} y={-19} width={21} height={37} rx={4} fill={f} />
          <rect x={-7.5} y={-14} width={15} height={25} rx={1} fill={p} stroke="none" />
          <path d="M-3,-16.5H3" strokeWidth={1.3} />
          <circle cx={0} cy={14.6} r={1.4} fill={s} stroke="none" />
        </>
      );
    case 'server':
      return <Rack {...c} units={3} />;
    case 'dns':
      return (
        <>
          <Rack {...c} units={2} />
          <rect x={-16} y={5} width={32} height={14} rx={3} fill={s} />
          <text y={12.4} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--paper)" stroke="none" letterSpacing="0.08em">
            DNS
          </text>
        </>
      );
    case 'tracker':
      return (
        <>
          <Rack {...c} units={2} top={-19} />
          <circle cx={10} cy={10} r={9} fill={f} />
          <circle cx={10} cy={10} r={5.5} fill={p} strokeWidth={1.2} />
          <circle cx={10} cy={10} r={2} fill={s} stroke="none" />
          <path d="M-14,14L4,10" strokeWidth={1.3} />
          <polygon points={headPoints(8, 10, -12, 5, 2.6)} fill={s} stroke="none" />
        </>
      );
    case 'router':
      return (
        <>
          <path d="M-23,-4V7A23,7.5 0 0 0 23,7V-4" fill={f} />
          <ellipse cx={0} cy={-4} rx={23} ry={7.5} fill={p} />
          {/* Flechas cruzadas de la cara superior (estilo Cisco): dos entran, dos salen. */}
          <g strokeWidth={1.4}>
            <path d="M-16,-8.4L-5,-5.4M16,0.4L5,-2.6M3,-5.6L15,-8.7M-3,-2.4L-15,0.6" />
          </g>
          <g fill={s} stroke="none">
            <polygon points={headPoints(-4, -5.1, 15, 4.5, 2.6)} />
            <polygon points={headPoints(4, -2.9, 195, 4.5, 2.6)} />
            <polygon points={headPoints(16.5, -9, -14, 4.5, 2.6)} />
            <polygon points={headPoints(-16.5, 1, 166, 4.5, 2.6)} />
          </g>
        </>
      );
    case 'switch':
      return (
        <>
          <path d="M17,-2L23,-10V0L17,8Z" fill={p} />
          <path d="M-23,-2L-17,-10H23L17,-2Z" fill={p} />
          <rect x={-23} y={-2} width={40} height={10} rx={1} fill={f} />
          <g strokeWidth={1.3}>
            <path d="M-12,-7.6H11M13,-4.4H-10" />
          </g>
          <g fill={s} stroke="none">
            <polygon points={headPoints(15, -7.6, 0, 4.5, 2.4)} />
            <polygon points={headPoints(-14, -4.4, 180, 4.5, 2.4)} />
          </g>
          {[-19, -13, -7, -1, 5, 11].map((x) => <rect key={x} x={x} y={1.6} width={4} height={3} rx={0.5} fill={s} stroke="none" opacity={0.7} />)}
        </>
      );
    case 'cloud':
      return <path d="M-14,12C-24,12 -26,0 -17,-2C-17,-12 -5,-16 1,-9C6,-17 20,-14 18,-4C26,-4 27,12 17,12Z" fill={f} />;
  }
}

export function DeviceIcon({ kind, stroke, fill, screen }: { kind: DeviceKind; stroke: string; fill: string; screen: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
      <Glyph kind={kind} s={stroke} f={fill} p={screen} />
    </g>
  );
}
