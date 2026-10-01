// Layout puro de `net-scene`: dispositivos en una rejilla 0–100, cables con
// chapita de tasa/retardo, paquetes como flechas desplazadas a la IZQUIERDA
// de su sentido (ida y vuelta entre el mismo par no se pisan), zonas que
// envuelven a sus dispositivos. Sin React: se testea con `node --test`.
import type { NodeState } from '../canvas-types.ts';
import { r2, textW } from '../net-style.ts';

export type DeviceKind = 'host' | 'laptop' | 'phone' | 'server' | 'router' | 'switch' | 'dns' | 'cloud' | 'tracker';
export type NetDevice = { id: string; kind: DeviceKind; label: string; sub?: string; x: number; y: number; state?: NodeState };
export type NetCable = { from: string; to: string; label?: string; rate?: string; delay?: string; state?: NodeState };
export type NetPacket = { from: string; to: string; label?: string; order?: number; lost?: boolean; state?: NodeState };
export type NetZone = { label: string; devices: string[] };
export type NetStep = { devices?: NetDevice[]; cables?: NetCable[]; packets?: NetPacket[]; zones?: NetZone[] };

export const W = 640;
const PAD_X = 60;
const TOP = 46;
const INNER_H = 290;
const BOTTOM = 66;
export const H = TOP + INNER_H + BOTTOM;
/** Radio del ícono: los cables y flechas se recortan aquí. */
export const R = 36;
/** Escala del ícono (dibujado en ~48×40). */
export const ICON = 1.3;
const OFF = 7;
export const LABEL = 13;
export const SUB = 11;
export const PKT = 11.5;

export type Pt = { x: number; y: number };
export const toCanvas = (x: number, y: number): Pt => ({ x: PAD_X + (x / 100) * (W - 2 * PAD_X), y: TOP + (y / 100) * INNER_H });

export type DeviceL = NetDevice & { cx: number; cy: number };
export type CableL = { id: string; a: Pt; b: Pt; chip?: { text: string; x: number; y: number }; state?: NodeState };
export type PacketL = {
  id: string;
  to: string;
  label: string;
  order?: number;
  lost: boolean;
  state?: NodeState;
  /** Trazo de la flecha (ya recortado y desplazado). */
  s: Pt;
  e: Pt;
  /** Donde descansa el sobre al llegar (o donde se pierde). */
  rest: Pt;
  badge?: Pt;
  chip?: Pt;
  angle: number;
};
export type ZoneL = { label: string; x: number; y: number; w: number; h: number };
export type NetFrame = { devices: DeviceL[]; cables: CableL[]; packets: PacketL[]; zones: ZoneL[] };

const add = (p: Pt, q: Pt, k = 1): Pt => ({ x: r2(p.x + q.x * k), y: r2(p.y + q.y * k) });

export function netSceneLayout(step: NetStep): NetFrame {
  const devices: DeviceL[] = (step.devices ?? []).map((d) => {
    const c = toCanvas(d.x, d.y);
    return { ...d, cx: c.x, cy: c.y };
  });
  const at = new Map(devices.map((d) => [d.id, { x: d.cx, y: d.cy }]));
  const byId = new Map(devices.map((d) => [d.id, d]));

  const cables: CableL[] = [];
  (step.cables ?? []).forEach((c, k) => {
    const a = at.get(c.from), b = at.get(c.to);
    if (!a || !b) return;
    const text = [c.label, c.rate, c.delay].filter(Boolean).join(' · ');
    cables.push({ id: `c${k}-${c.from}-${c.to}`, a, b, state: c.state, chip: text ? { text, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : undefined });
  });

  const packets: PacketL[] = [];
  (step.packets ?? []).forEach((p, k) => {
    const a = at.get(p.from), b = at.get(p.to);
    if (!a || !b) return;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    // Izquierda del sentido de viaje (y hacia abajo): (uy, −ux).
    const n = { x: u.y, y: -u.x };
    // Por debajo del ícono van label y sub: una flecha que sale/llega por abajo se recorta más.
    const below = (d: string | undefined, dirY: number) => Math.max(0, dirY) * (d ? 34 : 20);
    const da = byId.get(p.from), db = byId.get(p.to);
    const s = add(add(a, u, Math.min(R + below(da?.sub, u.y), len / 3)), n, OFF);
    let e = add(add(b, u, -Math.min(R + below(db?.sub, -u.y), len / 3)), n, OFF);
    if (p.lost) e = { x: r2((s.x + e.x) / 2), y: r2((s.y + e.y) / 2) };
    const seg = Math.hypot(e.x - s.x, e.y - s.y);
    const label = p.label ?? '';
    const mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
    // Chip afuera, del lado izquierdo: distancia del centro del chip a su borde en dirección n.
    const hw = textW(label, PKT) / 2 + 6, hh = 9;
    const chip = label ? add(mid, n, hw * Math.abs(n.x) + hh * Math.abs(n.y) + 5) : undefined;
    packets.push({
      id: `p${k}-${p.from}-${p.to}`,
      to: p.to,
      label,
      order: p.order,
      lost: !!p.lost,
      state: p.state,
      s,
      e,
      rest: p.lost ? e : add(e, u, -Math.min(24, seg / 2)),
      badge: p.order !== undefined ? add(s, u, Math.min(16, seg / 4)) : undefined,
      chip,
      angle: r2((Math.atan2(u.y, u.x) * 180) / Math.PI),
    });
  });

  const zones: ZoneL[] = (step.zones ?? []).flatMap((z) => {
    const ds = devices.filter((d) => z.devices.includes(d.id));
    if (!ds.length) return [];
    const half = (d: DeviceL) => Math.max(R, textW(d.label, LABEL, false) / 2, textW(d.sub ?? '', SUB) / 2) + 10;
    const x0 = Math.min(...ds.map((d) => d.cx - half(d)));
    const x1 = Math.max(...ds.map((d) => d.cx + half(d)));
    const y0 = Math.min(...ds.map((d) => d.cy - R)) - 16;
    const y1 = Math.max(...ds.map((d) => d.cy + R + (d.sub ? 34 : 20)));
    return [{ label: z.label, x: Math.max(2, x0), y: Math.max(2, y0), w: Math.min(W - 2, x1) - Math.max(2, x0), h: Math.min(H - 2, y1) - Math.max(2, y0) }];
  });

  return { devices, cables, packets, zones };
}
