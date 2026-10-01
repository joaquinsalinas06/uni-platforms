// Layout puro de `net-scene`: dispositivos en una rejilla 0–100, cables con
// chapita de tasa/retardo, paquetes como flechas desplazadas a la IZQUIERDA
// de su sentido (ida y vuelta entre el mismo par no se pisan), zonas que
// envuelven a sus dispositivos. Además resuelve choques: rótulos que se
// parten o suben, zonas que se recortan, paquetes que se curvan alrededor de
// íconos ajenos y chapitas que buscan sitio libre. `netSceneIssues` lista lo
// que aún choca (lo usa scripts/audit-viz-overlap.mjs). Sin React.
import type { NodeState } from '../canvas-types.ts';
import { r2, textW } from '../net-style.ts';
import { grow, inside, overlapArea, overlaps, polyHitsRect, quadAt, quadSamples, rect, segHitsRect, union, type Pt, type Rect } from '../geom.ts';

export type DeviceKind = 'host' | 'laptop' | 'phone' | 'server' | 'router' | 'switch' | 'dns' | 'cloud' | 'tracker';
export type NetDevice = { id: string; kind: DeviceKind; label: string; sub?: string; x: number; y: number; state?: NodeState };
export type NetCable = { from: string; to: string; label?: string; rate?: string; delay?: string; state?: NodeState };
export type NetPacket = { from: string; to: string; label?: string; order?: number; lost?: boolean; state?: NodeState };
export type NetZone = { label: string; devices: string[] };
export type NetStep = { devices?: NetDevice[]; cables?: NetCable[]; packets?: NetPacket[]; zones?: NetZone[] };
export type { Pt };

export const W = 640;
const PAD_X = 60;
const TOP = 46;
const INNER_H = 290;
const BOTTOM = 66;
export const H = TOP + INNER_H + BOTTOM;
/** Radio del disco de fondo del ícono. */
export const R = 36;
/** Escala del ícono (dibujado en ~48×40). */
export const ICON = 1.3;
/** Caja del ícono ya escalado. */
const IW = 66, IH = 52;
const OFF = 7;
export const LABEL = 13;
export const SUB = 11;
export const PKT = 11.5;
const CHIP = 10.5;
const LH_LABEL = 15, LH_SUB = 13;
/** Escala de texto del fotograma en curso (1 en escritorio, hasta 1.4 en móvil: ver net-kit).
 * ponytail: estado de módulo, válido porque layout e issues son síncronos; pasarlo por
 * parámetro a cada helper si algún día se paraleliza. */
let K = 1;
const GAP_ICON = 28;

export const toCanvas = (x: number, y: number): Pt => ({ x: PAD_X + (x / 100) * (W - 2 * PAD_X), y: TOP + (y / 100) * INNER_H });

export type TextLine = { text: string; y: number; size: number; sub: boolean };
export type DeviceL = NetDevice & { cx: number; cy: number; icon: Rect; block: Rect; lines: TextLine[] };
export type Chip = { text: string; lines: string[]; x: number; y: number; w: number; h: number };
export type CableL = { id: string; from: string; to: string; a: Pt; b: Pt; chip?: Chip; state?: NodeState };
export type PacketL = {
  id: string;
  from: string;
  to: string;
  label: string;
  order?: number;
  lost: boolean;
  state?: NodeState;
  s: Pt;
  /** Control de la cuadrática (= punto medio si va recta). */
  c: Pt;
  e: Pt;
  d: string;
  /** Recorrido del sobre (muestras hasta donde descansa). */
  travel: Pt[];
  rest: Pt;
  badge?: Pt;
  chip?: Chip;
  /** Ángulo de la punta (tangente al final). */
  angle: number;
};
export type ZoneL = { label: string; x: number; y: number; w: number; h: number; devices: string[] };
export type NetFrame = { k: number; devices: DeviceL[]; cables: CableL[]; packets: PacketL[]; zones: ZoneL[] };

const add = (p: Pt, q: Pt, k = 1): Pt => ({ x: r2(p.x + q.x * k), y: r2(p.y + q.y * k) });
const P = (p: Pt): Pt => ({ x: r2(p.x), y: r2(p.y) });

/** Parte en dos líneas en el espacio (o antes de "(") que deja las líneas más parejas. */
export function wrap2(text: string): string[] {
  const cuts: number[] = [];
  // Cortes: espacio, antes de "(" y después de ":" (IP:puerto → "192.168.1.10:" / "5324").
  for (let i = 1; i < text.length; i++) if (text[i] === ' ' || (text[i] === '(' && text[i - 1] !== ' ') || (text[i - 1] === ':' && text[i] !== ' ')) cuts.push(i);
  if (!cuts.length) return [text];
  let best = cuts[0], worst = Infinity;
  for (const i of cuts) {
    // Cortar antes de un paréntesis se prefiere: "borde / (centro de datos)".
    const paren = text[i] === '(' || text[i + 1] === '(';
    const m = Math.max(text.slice(0, i).trim().length, text.slice(i).trim().length) - (paren ? 8 : 0);
    if (m < worst) { worst = m; best = i; }
  }
  return [text.slice(0, best).trim(), text.slice(best).trim()];
}

type Opt = { label: string[]; sub: string[]; pos: 'below' | 'above' | 'right' | 'left'; dx: number };
function blockOf(cx: number, cy: number, o: Opt): { block: Rect; lines: TextLine[] } {
  const w = Math.max(...o.label.map((l) => textW(l, LABEL * K, false)), ...o.sub.map((l) => textW(l, SUB * K)), 10) + 6;
  const h = (o.label.length * LH_LABEL + o.sub.length * LH_SUB) * K + 2;
  const top = o.pos === 'above' ? cy - GAP_ICON - h : o.pos === 'below' ? cy + GAP_ICON : cy - h / 2;
  const bx = o.pos === 'right' ? cx + IW / 2 + 6 + w / 2 : o.pos === 'left' ? cx - IW / 2 - 6 - w / 2 : cx + o.dx;
  const lines: TextLine[] = [
    ...o.label.map((text, i) => ({ text, y: r2(top + (11 + i * LH_LABEL) * K), size: LABEL * K, sub: false })),
    ...o.sub.map((text, j) => ({ text, y: r2(top + (o.label.length * LH_LABEL + 10 + j * LH_SUB) * K), size: SUB * K, sub: true })),
  ];
  return { block: rect(bx, top + h / 2, w, h), lines };
}
const canvas: Rect = { x: 0, y: 0, w: W, h: H };
const outside = (r: Rect) => (inside(r, canvas) ? 0 : r.w * r.h - overlapArea(r, canvas) + 1);

/** Primer punto, desde `from` hacia `to`, que queda fuera de todas las cajas. */
function exitPoint(from: Pt, to: Pt, boxes: Rect[]): Pt {
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const u = { x: (to.x - from.x) / len, y: (to.y - from.y) / len };
  for (let t = 0; t < len / 2; t += 2) {
    const p = { x: from.x + u.x * t, y: from.y + u.y * t };
    if (!boxes.some((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h)) return p;
  }
  return { x: from.x + u.x * (len / 2), y: from.y + u.y * (len / 2) };
}

export function netSceneLayout(step: NetStep, k = 1): NetFrame {
  K = k;
  // ── Dispositivos y sus rótulos: abajo en una línea; si choca, partido, arriba o corrido.
  const base = (step.devices ?? []).map((d) => ({ d, ...toCanvas(d.x, d.y) }));
  const icons = base.map(({ x, y }) => rect(x, y, IW, IH));
  const devices: DeviceL[] = [];
  const placed: Rect[] = [];
  base.forEach(({ d, x, y }, i) => {
    const L = [d.label], Lw = wrap2(d.label), S = d.sub ? [d.sub] : [], Sw = d.sub ? wrap2(d.sub) : [];
    const opts: Opt[] = [];
    for (const pos of ['below', 'above', 'right', 'left'] as const)
      for (const [label, sub] of [[L, S], [L, Sw], [Lw, Sw]] as const)
        for (const dx of pos === 'below' || pos === 'above' ? [0, -24, 24, -44, 44] : [0]) opts.push({ label: [...label], sub: [...sub], pos, dx });
    let best: { block: Rect; lines: TextLine[] } | undefined, bestCost = Infinity;
    for (const o of opts) {
      const b = blockOf(x, y, o);
      const others = icons.filter((_, j) => j !== i);
      // Los dispositivos que aún no se ubicaron cuentan con su rótulo por defecto (abajo).
      const pending = base.slice(i + 1).map((q) => blockOf(q.x, q.y, { label: [q.d.label], sub: q.d.sub ? [q.d.sub] : [], pos: 'below', dx: 0 }).block);
      const cost = [...others, ...placed].reduce((s, r) => s + overlapArea(grow(b.block, 6), r), 0) * 10 + pending.reduce((s, r) => s + overlapArea(b.block, r), 0) + outside(b.block) * 10;
      if (cost < bestCost - 1e-6) { bestCost = cost; best = b; }
      if (cost === 0) break;
    }
    placed.push(best!.block);
    devices.push({ ...d, cx: x, cy: y, icon: icons[i], block: best!.block, lines: best!.lines });
  });
  const byId = new Map(devices.map((d) => [d.id, d]));
  const occupied = (except: string[] = []) => devices.filter((d) => !except.includes(d.id)).flatMap((d) => [d.icon, d.block]);

  // ── Zonas: envuelven a sus miembros; se recortan para no tocar intrusos ni a otras zonas.
  const zones = layoutZones(step.zones ?? [], devices);
  const titles = zones.map(zoneTitle);

  // ── Cables: del borde de un ícono al otro; chapita en el primer sitio libre del tramo.
  const chips: Rect[] = [];
  const cables: CableL[] = [];
  (step.cables ?? []).forEach((c, k) => {
    const A = byId.get(c.from), B = byId.get(c.to);
    if (!A || !B) return;
    const a = P(exitPoint({ x: A.cx, y: A.cy }, { x: B.cx, y: B.cy }, [grow(A.icon, -6)]));
    const b = P(exitPoint({ x: B.cx, y: B.cy }, { x: A.cx, y: A.cy }, [grow(B.icon, -6)]));
    const text = [c.label, c.rate, c.delay].filter(Boolean).join(' · ');
    let chip: Chip | undefined;
    if (text) {
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const nn = { x: (b.y - a.y) / len, y: -(b.x - a.x) / len };
      const cands: Chip[] = [];
      for (const lines of chipLines(text, CHIP * K))
        for (const off of [0, 22, -22, 36, -36, 50, -50]) for (const t of [0.5, 0.38, 0.62, 0.28, 0.72]) {
          const w = Math.max(...lines.map((l) => textW(l, CHIP * K))) + 10, h = lines.length * 13 * K + 4;
          cands.push({ text, lines, ...rect(a.x + (b.x - a.x) * t + nn.x * off, a.y + (b.y - a.y) * t + nn.y * off, w, h) });
        }
      chip = pick(cands, [...occupied(), ...chips, ...titles]);
      chips.push(chip);
    }
    cables.push({ id: `c-${c.from}-${c.to}`, from: c.from, to: c.to, a, b, state: c.state, chip: chip && { ...chip, x: r2(chip.x), y: r2(chip.y) } });
  });

  // ── Paquetes: rectos si no hay nada en medio; si no, curva que esquiva íconos y rótulos ajenos.
  const raw = step.packets ?? [];
  const prio = (p: NetPacket) => (p.state === 'active' || p.state === 'answer' ? 0 : p.state === 'muted' ? 2 : 1);
  const order = raw.map((_, i) => i).sort((i, j) => prio(raw[i]) - prio(raw[j]) || i - j);
  const out: (PacketL | undefined)[] = [];
  const badges: Rect[] = [];
  type Geo = { p: NetPacket; s: Pt; cc: Pt; e: Pt; tRest: number; rest: Pt; label: string; tan: (t: number) => Pt; badge?: Pt };
  const geo = new Map<number, Geo>();
  for (const k of order) {
    const p = raw[k];
    const A = byId.get(p.from), B = byId.get(p.to);
    if (!A || !B) continue;
    const a = { x: A.cx, y: A.cy }, b = { x: B.cx, y: B.cy };
    const len0 = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const u = { x: (b.x - a.x) / len0, y: (b.y - a.y) / len0 };
    // Izquierda del sentido de viaje (y hacia abajo): (uy, −ux).
    const n = { x: u.y, y: -u.x };
    const s = add(exitPoint(a, b, [grow(A.icon, 2), grow(A.block, 2)]), n, OFF);
    const e0 = add(exitPoint(b, a, [grow(B.icon, 2), grow(B.block, 2)]), n, OFF);
    const mid = { x: (s.x + e0.x) / 2, y: (s.y + e0.y) / 2 };
    // Íconos ajenos pesan más que rótulos ajenos; sin curva limpia, la que menos pisa.
    const others = devices.filter((d) => d.id !== p.from && d.id !== p.to);
    const score = (cc: Pt) => {
      const q = quadSamples(s, cc, e0);
      return others.reduce((acc, d) => acc + (polyHitsRect(q, grow(d.icon, 3)) ? 10 : 0) + (polyHitsRect(q, grow(d.block, 2)) ? 1 : 0), 0);
    };
    let c = mid, best = score(mid);
    if (best > 0) {
      for (const dd of [40, -40, 70, -70, 100, -100, 140, -140, 190, -190, 250, -250]) {
        const cc = add(mid, n, dd);
        const sc = score(cc);
        if (sc < best) { best = sc; c = cc; }
        if (!sc) break;
      }
    }
    c = P(c);
    let e = e0;
    let cc = c;
    if (p.lost) {
      // de Casteljau en t = ½: la primera mitad es otra cuadrática.
      cc = P({ x: (s.x + c.x) / 2, y: (s.y + c.y) / 2 });
      e = P(quadAt(s, c, e0, 0.5));
    }
    const len = Math.hypot(e.x - s.x, e.y - s.y) || 1;
    const tRest = p.lost ? 1 : Math.max(0.5, 1 - 24 / len);
    const rest = P(quadAt(s, cc, e, tRest));
    const label = p.label ?? '';
    const tan = (t: number) => {
      const q0 = quadAt(s, cc, e, Math.max(0, t - 0.01)), q1 = quadAt(s, cc, e, Math.min(1, t + 0.01));
      const l = Math.hypot(q1.x - q0.x, q1.y - q0.y) || 1;
      return { x: (q1.x - q0.x) / l, y: (q1.y - q0.y) / l };
    };
    const badge = p.order !== undefined ? P(quadAt(s, cc, e, Math.min(0.3, 22 / len))) : undefined;
    if (badge) badges.push(rect(badge.x, badge.y, 18, 18));
    geo.set(k, { p, s, cc, e, tRest, rest, label, tan, badge });
  }
  // Chips después de trazar todo: además de íconos y rótulos, evitan cruzar flechas y cables ajenos.
  const trails = [...geo.entries()].map(([k, g]) => ({ k, pts: quadSamples(g.s, g.cc, g.e, 12) }));
  const wires = cables.map((c) => [c.a, c.b]);
  for (const k of order) {
    const g = geo.get(k);
    if (!g) continue;
    const { p, s, cc, e, tRest, rest, label, tan, badge } = g;
    const polys = [...trails.filter((t) => t.k !== k).map((t) => t.pts), ...wires];
    let chip: Chip | undefined;
    if (label) {
      const cands: Chip[] = [];
      for (const lines of chipLines(label, PKT * K))
        for (const extra of [5, 16, 30, 44])
          for (const t of [0.5, 0.4, 0.6, 0.3, 0.7])
            for (const side of [1, -1]) {
              const w = Math.max(...lines.map((l) => textW(l, PKT * K))) + 12, h = lines.length * 14 * K + 3;
              const q = quadAt(s, cc, e, t), tg = tan(t);
              const nn = { x: tg.y * side, y: -tg.x * side };
              const off = (w / 2) * Math.abs(nn.x) + (h / 2) * Math.abs(nn.y) + extra;
              cands.push({ text: label, lines, ...rect(q.x + nn.x * off, q.y + nn.y * off, w, h) });
            }
      const [best, cost] = pickCost(cands, [...occupied(), ...chips, ...titles, ...badges], polys);
      // Un paquete ya pasado (muted) sin sitio libre queda sólo con su número.
      if (cost === 0 || p.state !== 'muted') {
        chips.push(best);
        chip = { ...best, x: r2(best.x), y: r2(best.y) };
      }
    }
    const tg = tan(1);
    out[k] = {
      id: `p-${p.from}-${p.to}-${p.order ?? ''}-${label}`,
      from: p.from,
      to: p.to,
      label,
      order: p.order,
      lost: !!p.lost,
      state: p.state,
      s, c: cc, e,
      d: `M${s.x},${s.y}Q${cc.x},${cc.y} ${e.x},${e.y}`,
      travel: quadSamples(s, cc, e, 14).filter((_, i, arr) => i / (arr.length - 1) <= tRest + 1e-9).map(P).concat(rest),
      rest,
      badge,
      chip,
      angle: r2((Math.atan2(tg.y, tg.x) * 180) / Math.PI),
    };
  }
  const packets = out.filter((p): p is PacketL => !!p);
  return { k, devices, cables, packets, zones };
}

/** Variantes de texto de una chapita: en una línea y, si es larga, partida en dos. */
const chipLines = (text: string, size: number): string[][] => {
  const w = wrap2(text);
  return w.length > 1 && textW(text, size) > 70 ? [[text], w] : [[text]];
};

/** Candidato sin choques; si no hay, el que menos pisa. */
function pickCost<T extends Rect>(cands: T[], obstacles: Rect[], polys: Pt[][] = []): [T, number] {
  let best = cands[0], bestCost = Infinity;
  for (const c of cands) {
    const cost = obstacles.reduce((s, r) => s + overlapArea(grow(c, 1), r), 0) + outside(c) * 5 + polys.filter((q) => polyHitsRect(q, c)).length * 60;
    if (cost < bestCost) { bestCost = cost; best = c; }
    if (cost === 0) break;
  }
  return [best, bestCost];
}
const pick = <T extends Rect>(cands: T[], obstacles: Rect[]): T => pickCost(cands, obstacles)[0];

export const zoneTitle = (z: ZoneL): Rect => ({ x: z.x + 8, y: z.y + 3, w: textW(z.label.toUpperCase(), 10 * K) + 8, h: 15 * K });

function layoutZones(spec: NetZone[], devices: DeviceL[]): ZoneL[] {
  const core = (ids: string[]) => {
    const ds = devices.filter((d) => ids.includes(d.id));
    return ds.length ? union(ds.flatMap((d) => [d.icon, d.block])) : undefined;
  };
  const items = spec
    .map((z) => ({ z, core: core(z.devices) }))
    .filter((q): q is { z: NetZone; core: Rect } => !!q.core)
    .sort((a, b) => a.z.devices.length - b.z.devices.length);
  const zones: (ZoneL & { core: Rect })[] = [];
  for (const { z, core: c } of items) {
    let r: Rect = { x: c.x - 10, y: c.y - 24, w: c.w + 20, h: c.h + 32 };
    // Anidadas: la de afuera envuelve con margen a la de adentro.
    for (const inner of zones) if (inner.devices.every((id) => z.devices.includes(id))) r = union([r, { x: inner.x - 8, y: inner.y - 22, w: inner.w + 16, h: inner.h + 30 }]);
    zones.push({ label: z.label, devices: z.devices, core: c, ...r });
  }
  const nested = (a: ZoneL, b: ZoneL) => a.devices.every((id) => b.devices.includes(id)) || b.devices.every((id) => a.devices.includes(id));
  // Intrusos: un dispositivo ajeno dentro de la zona → se recorta el lado que menos área pierde.
  for (const z of zones)
    for (const d of devices) {
      if (z.devices.includes(d.id)) continue;
      const box = union([d.icon, d.block]);
      if (overlaps(box, z)) cut(z, grow(box, 4), z.core);
    }
  // Zona contra zona (no anidadas): se parte en el hueco entre sus miembros.
  for (let i = 0; i < zones.length; i++)
    for (let j = i + 1; j < zones.length; j++) {
      const a = zones[i], b = zones[j];
      if (nested(a, b) || !overlaps(a, b, 3)) continue;
      const [l, r] = a.core.x <= b.core.x ? [a, b] : [b, a];
      const [t, bo] = a.core.y <= b.core.y ? [a, b] : [b, a];
      if (l.core.x + l.core.w + 8 <= r.core.x) {
        const m = (l.core.x + l.core.w + r.core.x) / 2;
        const lx1 = Math.min(l.x + l.w, m - 4);
        l.w = lx1 - l.x;
        const rx0 = Math.max(r.x, m + 4);
        r.w = r.x + r.w - rx0; r.x = rx0;
      } else if (t.core.y + t.core.h + 8 <= bo.core.y) {
        const m = (t.core.y + t.core.h + bo.core.y) / 2;
        t.h = Math.min(t.y + t.h, m - 4) - t.y;
        const by0 = Math.max(bo.y, m + 4);
        bo.h = bo.y + bo.h - by0; bo.y = by0;
      }
    }
  return zones.map(({ core: _c, ...z }) => {
    const x = Math.max(2, z.x), y = Math.max(2, z.y);
    return { ...z, x: r2(x), y: r2(y), w: r2(Math.min(W - 2, z.x + z.w) - x), h: r2(Math.min(H - 2, z.y + z.h) - y) };
  });
}

/** Recorta `z` para dejar fuera a `box` sin dejar fuera a `core`. */
function cut(z: Rect, box: Rect, core: Rect) {
  const opts: [number, () => void][] = [];
  const x1 = z.x + z.w, y1 = z.y + z.h;
  if (box.x >= core.x + core.w + 2) opts.push([(x1 - box.x) * z.h, () => { z.w = box.x - z.x; }]);
  if (box.x + box.w <= core.x - 2) opts.push([(box.x + box.w - z.x) * z.h, () => { z.w = x1 - (box.x + box.w); z.x = box.x + box.w; }]);
  if (box.y >= core.y + core.h + 2) opts.push([(y1 - box.y) * z.w, () => { z.h = box.y - z.y; }]);
  if (box.y + box.h <= core.y - 2) opts.push([(box.y + box.h - z.y) * z.w, () => { z.h = y1 - (box.y + box.h); z.y = box.y + box.h; }]);
  opts.sort((a, b) => a[0] - b[0]);
  opts[0]?.[1]();
}

/** Lo que aún choca en un fotograma (para el auditor y los tests). */
export function netSceneIssues(f: NetFrame): string[] {
  K = f.k;
  const out: string[] = [];
  const A = (a: Rect, b: Rect) => overlapArea(a, b) > 4;
  const ds = f.devices;
  const titles = f.zones.map(zoneTitle);
  for (let i = 0; i < ds.length; i++) {
    for (let j = i + 1; j < ds.length; j++) {
      const a = ds[i], b = ds[j];
      if (A(a.icon, b.icon)) out.push(`ícono «${a.label}» pisa ícono «${b.label}»`);
      if (A(a.icon, b.block)) out.push(`ícono «${a.label}» pisa rótulo de «${b.label}»`);
      if (A(b.icon, a.block)) out.push(`ícono «${b.label}» pisa rótulo de «${a.label}»`);
      if (A(a.block, b.block)) out.push(`rótulos de «${a.label}» y «${b.label}» se pisan`);
    }
    if (!inside(ds[i].block, canvas) || !inside(ds[i].icon, canvas)) out.push(`«${ds[i].label}» se sale del lienzo`);
  }
  f.zones.forEach((z, i) => {
    f.zones.slice(i + 1).forEach((y) => {
      const nest = z.devices.every((id) => y.devices.includes(id)) || y.devices.every((id) => z.devices.includes(id));
      if (!nest && A(z, y)) out.push(`zonas «${z.label}» y «${y.label}» se pisan`);
    });
    for (const d of ds) {
      if (z.devices.includes(d.id)) { if (!inside(d.icon, z)) out.push(`«${d.label}» queda fuera de su zona «${z.label}»`); continue; }
      if (A(d.icon, z) || A(d.block, z)) out.push(`zona «${z.label}» toca a «${d.label}» (no es miembro)`);
    }
    for (const d of ds) if (A(titles[i], d.icon) || A(titles[i], d.block)) out.push(`título de zona «${z.label}» pisa a «${d.label}»`);
  });
  const things = [...ds.flatMap((d) => [{ r: d.icon, what: `ícono «${d.label}»` }, { r: d.block, what: `rótulo «${d.label}»` }]), ...titles.map((r, i) => ({ r, what: `título «${f.zones[i].label}»` }))];
  const chips = [...f.cables.flatMap((c) => (c.chip ? [{ r: c.chip as Rect, what: `chapita «${c.chip.text}»` }] : [])), ...f.packets.flatMap((p) => (p.chip ? [{ r: p.chip as Rect, what: `chip «${p.label}»` }] : []))];
  chips.forEach((c, i) => {
    for (const t of things) if (A(c.r, t.r)) out.push(`${c.what} pisa ${t.what}`);
    for (const o of chips.slice(i + 1)) if (A(c.r, o.r)) out.push(`${c.what} pisa ${o.what}`);
    if (!inside(c.r, canvas)) out.push(`${c.what} se sale del lienzo`);
  });
  for (const p of f.packets) {
    if (!p.chip) continue;
    for (const o of f.packets) if (o !== p && polyHitsRect(quadSamples(o.s, o.c, o.e, 12), p.chip)) out.push(`chip «${p.label}» cruza la flecha «${o.label}»`);
  }
  for (const p of f.packets) {
    const pts = quadSamples(p.s, p.c, p.e);
    for (const d of ds) if (d.id !== p.from && d.id !== p.to && polyHitsRect(pts, grow(d.icon, -4))) out.push(`paquete «${p.label}» atraviesa el ícono «${d.label}»`);
    if (p.badge) for (const d of ds) if (A(rect(p.badge.x, p.badge.y, 16, 16), d.icon)) out.push(`círculo ${p.order} pisa el ícono «${d.label}»`);
  }
  for (const c of f.cables) {
    // Largo VISIBLE: lo que no tapan íconos ni rótulos.
    const len = Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y);
    const n = Math.max(2, Math.ceil(len / 2));
    const cover = [...ds.map((d) => d.icon), ...ds.map((d) => d.block)];
    let free = 0;
    for (let i = 0; i <= n; i++) {
      const q = { x: c.a.x + ((c.b.x - c.a.x) * i) / n, y: c.a.y + ((c.b.y - c.a.y) * i) / n };
      if (!cover.some((r) => q.x > r.x && q.x < r.x + r.w && q.y > r.y && q.y < r.y + r.h)) free++;
    }
    const vis = (len * free) / (n + 1);
    if (vis < 16) out.push(`cable ${c.from}–${c.to} casi no se ve (${Math.round(vis)} px visibles)`);
    for (const d of ds) if (d.id !== c.from && d.id !== c.to && segHitsRect(c.a, c.b, grow(d.icon, -6))) out.push(`cable ${c.from}–${c.to} atraviesa el ícono «${d.label}»`);
  }
  return out;
}
