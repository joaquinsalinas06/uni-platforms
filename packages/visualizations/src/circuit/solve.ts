// Solver DC del contrato `circuit` (src/lib/schemas.ts). Puro: sin React/DOM,
// importable desde node --test, layout.ts, componentes y scripts.
//
// MNA (análisis nodal modificado) con eliminación gaussiana y pivoteo parcial.
//  · wire/ammeter/switch cerrado = fusión de nodos (su corriente sale por KCL).
//  · open/voltmeter/capacitor/switch abierto = nada.
//  · vsource/ac-source: from = −, to = +.  isource: flecha from→to.
//  · diode/led: modelo de caída constante (si 0.7, ge 0.3, led 2.0, o `vf`).
//  · Corriente de una pieza = sentido from→to.

export type CNode = { id: string; x: number; y: number; label?: string; ground?: boolean; [k: string]: unknown };
export type CPart = {
  id: string;
  kind: string;
  from: string;
  to: string;
  value?: number;
  label?: string;
  model?: 'si' | 'ge';
  vf?: number;
  mergedFrom?: string[];
  mergeKind?: 'series' | 'parallel' | 'delta-wye' | 'wye-delta';
  [k: string]: unknown;
};
export type CLoop = { id: string; path: string[]; dir?: 'cw' | 'ccw'; label: string; [k: string]: unknown };
export type Circuit = {
  nodes: CNode[];
  parts: CPart[];
  loops?: CLoop[];
  diodes?: { part: string; assume: 'on' | 'off'; [k: string]: unknown }[];
  req?: { between: [string, string] };
  [k: string]: unknown;
};
export type DiodeState = { assumed: 'on' | 'off'; actual: 'on' | 'off'; valid: boolean; vd: number; id: number };
export type Solution = {
  ok: boolean;
  reason?: string;
  potentials: Record<string, number>;
  currents: Record<string, number>;
  diodes: Record<string, DiodeState>;
  req?: number;
};

const EPS_I = 1e-9; // A
const EPS_V = 1e-6; // V
const GMIN = 1e-15; // S, de cada nodo a tierra: ningún nodo queda indefinido
// S, a través de cada diodo OFF: el nodo flotante entre diodos OFF en serie se
// reparte la tensión como un divisor (≫ GMIN), en vez de caer a 0 V.
const GOFF = 1e-12;
const SNAP_I = 1e-10; // A: corrientes menores se informan como 0 (sólo son fugas del modelo)

export const isDiode = (p: CPart) => p.kind === 'diode' || p.kind === 'led';
export const isSource = (p: CPart) => p.kind === 'vsource' || p.kind === 'ac-source' || p.kind === 'isource';
export function vfOf(p: CPart): number {
  return p.vf ?? (p.kind === 'led' ? 2 : p.model === 'ge' ? 0.3 : 0.7);
}

export type Role = 'short' | 'open' | 'R' | 'V' | 'I' | 'D';
export function roleOf(p: CPart, value: number | undefined): Role {
  switch (p.kind) {
    case 'wire':
    case 'ammeter':
      return 'short';
    case 'open':
    case 'voltmeter':
    case 'capacitor':
      return 'open';
    case 'switch':
    case 'button':
      return value === 0 ? 'open' : 'short';
    case 'vsource':
    case 'ac-source':
      return 'V';
    case 'isource':
      return 'I';
    case 'diode':
    case 'led':
      return 'D';
    case 'galvanometer':
    case 'lamp':
    case 'motor':
    case 'relay':
      return value == null ? 'open' : value === 0 ? 'short' : 'R';
    default: // resistor, pot
      return value === 0 ? 'short' : 'R';
  }
}

// ─────────────────────────── formato ───────────────────────────
const PREFIXES: [number, string][] = [
  [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'],
];
function siParts(v: number, digits: number): [string, string] {
  if (!Number.isFinite(v)) return [v > 0 ? '∞' : '−∞', ''];
  if (Math.abs(v) < 1e-13) return ['0', ''];
  // Sin prefijo desde 0.1 (0.3 V, 0.5 A); debajo se baja de prefijo (4.7 mA).
  for (const [f, p] of PREFIXES) {
    const n = +(v / f).toPrecision(digits);
    if (Math.abs(n) >= (f <= 1 ? 0.1 : 1)) return [String(n), p];
  }
  return [String(+(v / 1e-12).toPrecision(digits)), 'p'];
}
/** 2200,'Ω' → '2.2 kΩ' · 0.0047,'A' → '4.7 mA' · 0.3,'V' → '0.3 V' */
export function formatSI(value: number, unit: string, digits = 3): string {
  const [n, p] = siParts(value, digits);
  return `${n.replace('-', '−')} ${p}${unit}`;
}
/** Igual que formatSI pero en KaTeX: 2200,'Ω' → '2.2\,\text{k}\Omega' */
export function formatSITex(value: number, unit: string, digits = 3): string {
  const [n, p] = siParts(value, digits);
  const pre = p === 'µ' ? '\\mu ' : p ? `\\text{${p}}` : '';
  const u = unit === 'Ω' ? '\\Omega' : unit ? `\\text{${unit}}` : '';
  return `${n.replace('∞', '\\infty')}\\,${pre}${u}`;
}

// ─────────────────────────── álgebra ───────────────────────────
/** Eliminación gaussiana con pivoteo parcial. null = singular. */
export function gauss(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  let scale = 0;
  for (const r of A) for (const v of r) scale = Math.max(scale, Math.abs(v));
  const tol = 1e-19 * Math.max(scale, 1e-300);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (Math.abs(M[p][k]) <= tol) return null;
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      if (f) for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

// ─────────────────────────── núcleo MNA ───────────────────────────
type Val = (p: CPart) => number | undefined;
const nodeLabel = (c: Circuit, id: string) => c.nodes.find((n) => n.id === id)?.label;
/** Nombre humano de la tensión sobre `p` (x→y): V_ab si ambos nodos tienen
 * etiqueta; si no, nunca el id interno del nodo. */
const vAcross = (c: Circuit, p: CPart, x: string, y: string) => {
  const a = nodeLabel(c, x), b = nodeLabel(c, y);
  return a && b ? `V_${a}${b}` : `la tensión entre los terminales de ${p.label ?? p.id}`;
};

function mna(c: Circuit, parts: CPart[], val: Val, states: Map<string, 'on' | 'off'>, groundHint?: string): Solution {
  const fail = (reason: string): Solution => ({ ok: false, reason, potentials: {}, currents: {}, diodes: {} });
  const ids = new Set<string>(c.nodes.map((n) => n.id));
  for (const p of parts) ids.add(p.from).add(p.to);

  // 1. fusión de nodos por cables
  const uf = new Map<string, string>([...ids].map((i) => [i, i]));
  const find = (x: string): string => {
    while (uf.get(x) !== x) x = uf.get(x)!;
    return x;
  };
  const roles = new Map<string, Role>();
  for (const p of parts) {
    const r = roleOf(p, val(p));
    roles.set(p.id, r);
    if (r === 'short') uf.set(find(p.from), find(p.to));
    if (r === 'R' && val(p) == null) return fail(`${p.label ?? p.id} no tiene valor`);
    if ((r === 'V' || r === 'I') && val(p) == null) return fail(`${p.label ?? p.id} no tiene valor`);
  }

  // 2. restricciones de tensión (fuentes V y diodos ON): V(from) − V(to) = v
  type VEl = { p: CPart; a: string; b: string; v: number };
  const vels: VEl[] = [];
  const adj = new Map<string, { to: string; dv: number }[]>(); // dv = V(to) − V(de)
  const link = (a: string, b: string, v: number) => {
    // V(a) − V(b) = v  ⇒  V(b) = V(a) − v
    (adj.get(a) ?? adj.set(a, []).get(a)!).push({ to: b, dv: -v });
    (adj.get(b) ?? adj.set(b, []).get(b)!).push({ to: a, dv: v });
  };
  const implied = (a: string, b: string): number | null => {
    // devuelve V(a) − V(b) si ya están atados por fuentes, si no null
    const pot = new Map([[a, 0]]);
    const q = [a];
    while (q.length) {
      const x = q.shift()!;
      if (x === b) return -pot.get(b)!;
      for (const e of adj.get(x) ?? []) if (!pot.has(e.to)) (pot.set(e.to, pot.get(x)! + e.dv), q.push(e.to));
    }
    return null;
  };
  const vDesc: string[] = [];
  for (const p of parts) {
    const r = roles.get(p.id)!;
    const on = r === 'D' && states.get(p.id) === 'on';
    if (r !== 'V' && !on) continue;
    const v = r === 'V' ? -val(p)! : vfOf(p);
    const a = find(p.from), b = find(p.to);
    const imp = a === b ? 0 : implied(a, b);
    if (imp != null) {
      if (Math.abs(imp - v) > 1e-9) {
        const who = r === 'D' ? `${vDesc.join(' y ')}${vDesc.length ? ' y ' : ''}${p.label ?? p.id} ON` : `${p.label ?? p.id}`;
        const [x, y] = r === 'V' ? [p.to, p.from] : [p.from, p.to];
        const s = r === 'V' ? -1 : 1;
        return fail(
          `${who}: ${vAcross(c, p, x, y)} tendría que valer ${formatSI(s * imp, 'V')} y ${formatSI(s * v, 'V')} a la vez`,
        );
      }
      continue; // redundante (misma tensión en paralelo): corriente indeterminada, queda en 0
    }
    if (r === 'D') vDesc.push(`${p.label ?? p.id}`);
    link(a, b, v);
    vels.push({ p, a, b, v });
  }

  // 3. tierra
  const gNode =
    groundHint ?? c.nodes.find((n) => n.ground)?.id ?? parts.find((p) => roles.get(p.id) === 'V')?.from ?? c.nodes[0]?.id ?? parts[0]?.from;
  const g = find(gNode);
  const reps = [...new Set([...ids].map(find))].filter((r) => r !== g);
  const idx = new Map(reps.map((r, i) => [r, i]));
  const n = reps.length, m = vels.length;
  const A = Array.from({ length: n + m }, () => new Array(n + m).fill(0));
  const rhs = new Array(n + m).fill(0);
  for (let i = 0; i < n; i++) A[i][i] += GMIN;
  const I = (r: string) => idx.get(r);
  for (const p of parts) {
    const r = roles.get(p.id)!;
    const a = I(find(p.from)), b = I(find(p.to));
    if (r === 'R') {
      const G = 1 / val(p)!;
      if (a != null) A[a][a] += G;
      if (b != null) A[b][b] += G;
      if (a != null && b != null) (A[a][b] -= G, A[b][a] -= G);
    } else if (r === 'D' && states.get(p.id) !== 'on') {
      if (a != null) A[a][a] += GOFF;
      if (b != null) A[b][b] += GOFF;
      if (a != null && b != null) (A[a][b] -= GOFF, A[b][a] -= GOFF);
    } else if (r === 'I') {
      if (a != null) rhs[a] -= val(p)!;
      if (b != null) rhs[b] += val(p)!;
    }
  }
  vels.forEach((e, k) => {
    const a = I(e.a), b = I(e.b), row = n + k;
    if (a != null) (A[a][row] += 1, A[row][a] += 1);
    if (b != null) (A[b][row] -= 1, A[row][b] -= 1);
    rhs[row] = e.v;
  });
  const x = gauss(A, rhs);
  if (!x) return fail('el sistema es singular (circuito mal definido)');

  const V = (id: string) => {
    const k = I(find(id));
    return k == null ? 0 : x[k];
  };
  const potentials: Record<string, number> = {};
  // redondeo a 1 nV: las fugas del modelo (GOFF/GMIN) no deben asomar como "6 nV"
  for (const id of ids) potentials[id] = Math.round(V(id) * 1e9) / 1e9;
  const currents: Record<string, number> = {};
  for (const p of parts) {
    const r = roles.get(p.id)!;
    currents[p.id] = r === 'R' ? (V(p.from) - V(p.to)) / val(p)! : r === 'I' ? val(p)! : 0;
  }
  vels.forEach((e, k) => (currents[e.p.id] = x[n + k]));
  for (const k in currents) if (Math.abs(currents[k]) < SNAP_I) currents[k] = 0;

  // 4. corriente por los cables: KCL sobre un árbol generador de cada grupo fusionado
  const wires = parts.filter((p) => roles.get(p.id) === 'short');
  if (wires.length) {
    const excess = new Map<string, number>(); // corriente que SALE del nodo por piezas no-cable
    for (const p of parts) {
      if (roles.get(p.id) === 'short') continue;
      excess.set(p.from, (excess.get(p.from) ?? 0) + currents[p.id]);
      excess.set(p.to, (excess.get(p.to) ?? 0) - currents[p.id]);
    }
    const wadj = new Map<string, CPart[]>();
    for (const w of wires) for (const e of [w.from, w.to]) (wadj.get(e) ?? wadj.set(e, []).get(e)!).push(w);
    const seen = new Set<string>();
    for (const root of wadj.keys()) {
      if (seen.has(root)) continue;
      const order: { node: string; via?: CPart; parent?: string }[] = [{ node: root }];
      seen.add(root);
      for (let i = 0; i < order.length; i++) {
        const u = order[i].node;
        for (const w of wadj.get(u)!) {
          const v = w.from === u ? w.to : w.from;
          if (seen.has(v)) continue;
          seen.add(v);
          order.push({ node: v, via: w, parent: u });
        }
      }
      for (let i = order.length - 1; i > 0; i--) {
        const { node, via, parent } = order[i];
        const ex = excess.get(node) ?? 0;
        currents[via!.id] = via!.from === node ? -ex : ex;
        excess.set(parent!, (excess.get(parent!) ?? 0) + ex);
      }
    }
  }

  const diodes: Record<string, DiodeState> = {};
  for (const p of parts) {
    if (roles.get(p.id) !== 'D') continue;
    const assumed = states.get(p.id) ?? 'off';
    const vd = V(p.from) - V(p.to), id = currents[p.id];
    const valid = assumed === 'on' ? id >= -EPS_I : vd <= vfOf(p) + EPS_V;
    // Un diodo "ON" con I ≈ 0 está en el umbral (V_AK = Vγ), no conduce: se
    // informa OFF en todas partes (panel, chips, etiqueta, umbrales).
    const actual = !valid ? (assumed === 'on' ? 'off' : 'on') : assumed === 'on' && id <= EPS_I ? 'off' : assumed;
    diodes[p.id] = { assumed, actual, valid, vd, id };
  }
  return { ok: true, potentials, currents, diodes };
}

function valFn(c: Circuit, overrides: Record<string, number>): Val {
  const byId = new Map(c.parts.map((p) => [p.id, p]));
  const memo = new Map<string, number | undefined>();
  const val: Val = (p) => {
    if (p.id in overrides) return overrides[p.id];
    if (p.value != null) return p.value;
    if (p.kind === 'wire') return 0;
    if (!p.mergedFrom) return undefined;
    if (memo.has(p.id)) return memo.get(p.id);
    memo.set(p.id, undefined);
    // fundida dentro del mismo circuito (sus piezas de origen siguen presentes)
    const src = p.mergedFrom.map((id) => byId.get(id));
    const v = src.every(Boolean) ? mergeValue(p, src as CPart[], src.map((s) => val(s!))) : undefined;
    memo.set(p.id, v);
    return v;
  };
  return val;
}

function describeStates(parts: CPart[], st: Map<string, 'on' | 'off'>) {
  return parts.map((p) => `${p.label ?? p.id} ${st.get(p.id)?.toUpperCase()}`).join(' · ');
}

/** Resuelve el circuito. Con `c.diodes` usa esas hipótesis (y las valida);
 * los diodos sin hipótesis se enumeran (2^k, k ≤ 10) y se devuelve el estado
 * consistente. `overrides` cambia el `value` de piezas por id. */
export function solveCircuit(c: Circuit, overrides: Record<string, number> = {}): Solution {
  const val = valFn(c, overrides);
  const fixed = new Map<string, 'on' | 'off'>((c.diodes ?? []).map((d) => [d.part, d.assume]));
  const free = c.parts.filter((p) => isDiode(p) && !fixed.has(p.id));
  let sol: Solution;
  if (!free.length) {
    sol = mna(c, c.parts, val, fixed);
    if (sol.ok) {
      const bad = Object.entries(sol.diodes).filter(([, d]) => !d.valid);
      if (bad.length)
        sol.reason = bad
          .map(([id, d]) => {
            const lab = c.parts.find((p) => p.id === id)!.label ?? id;
            return d.assumed === 'on'
              ? `${lab} supuesto ON pero I = ${formatSI(d.id, 'A')} < 0: hipótesis falsa`
              : `${lab} supuesto OFF pero V_AK = ${formatSI(d.vd, 'V')} > ${formatSI(vfOf(c.parts.find((p) => p.id === id)!), 'V')}: hipótesis falsa`;
          })
          .join('; ');
    }
  } else {
    if (free.length > 10) return { ok: false, reason: 'demasiados diodos para enumerar (> 10)', potentials: {}, currents: {}, diodes: {} };
    const found: { s: Solution; st: Map<string, 'on' | 'off'> }[] = [];
    let last: Solution | undefined;
    for (let mask = 0; mask < 1 << free.length; mask++) {
      const st = new Map(fixed);
      free.forEach((p, i) => st.set(p.id, mask & (1 << i) ? 'on' : 'off'));
      const s = mna(c, c.parts, val, st);
      if (s.ok) last = s;
      if (s.ok && free.every((p) => s.diodes[p.id].valid)) found.push({ s, st });
    }
    if (!found.length)
      return last
        ? { ...last, ok: false, reason: 'ninguna combinación ON/OFF de los diodos es consistente' }
        : { ok: false, reason: 'ninguna combinación ON/OFF de los diodos tiene solución', potentials: {}, currents: {}, diodes: {} };
    // Varias combinaciones con las MISMAS corrientes (diodos en serie sin
    // corriente) son la misma solución física: se elige la de más diodos OFF.
    const same = (a: Solution, b: Solution) => Object.keys(b.currents).every((k) => Math.abs(a.currents[k] - b.currents[k]) <= EPS_I);
    const offs = (f: (typeof found)[number]) => [...f.st.values()].filter((x) => x === 'off').length;
    const best = found.filter((f) => same(f.s, found[0].s)).reduce((a, f) => (offs(f) > offs(a) ? f : a));
    sol = best.s;
    const distinct = found.filter((f) => !same(f.s, sol)).length;
    if (distinct)
      sol.reason = `${distinct + 1} soluciones consistentes (caso límite); se muestra ${describeStates(free, best.st)}`;
  }
  if (sol.ok && c.req) {
    const r = reqBetween(c, c.req.between[0], c.req.between[1], overrides);
    if (r != null) sol.req = r;
  }
  return sol;
}

const resolveNode = (c: Circuit, key: string) =>
  c.nodes.some((n) => n.id === key) || c.parts.some((p) => p.from === key || p.to === key)
    ? key
    : c.nodes.find((n) => n.label === key)?.id ?? key;

/** Req entre a y b: fuentes independientes anuladas (V en corto, I abiertas),
 * diodos abiertos, 1 A de prueba inyectado en a y extraído en b. */
export function reqBetween(c: Circuit, a: string, b: string, overrides: Record<string, number> = {}): number | undefined {
  a = resolveNode(c, a);
  b = resolveNode(c, b);
  const val = valFn(c, overrides);
  // Una fuente V conectada justo entre a y b es "la fuente desde la que se mira":
  // se retira (abierta). Las demás fuentes V se anulan (corto).
  const uf = new Map<string, string>();
  const find = (x: string): string => (uf.has(x) && uf.get(x) !== x ? find(uf.get(x)!) : x);
  for (const p of c.parts) if (roleOf(p, val(p)) === 'short') uf.set(find(p.from), find(p.to));
  const ends = (p: CPart) => [find(p.from), find(p.to)].sort().join('|');
  const ab = [find(a), find(b)].sort().join('|');
  const parts: CPart[] = c.parts.map((p) =>
    (p.kind === 'vsource' || p.kind === 'ac-source') && ends(p) === ab
      ? { ...p, kind: 'open' }
      : p.kind === 'vsource' || p.kind === 'ac-source'
      ? { ...p, kind: 'wire' }
      : p.kind === 'isource' || isDiode(p)
        ? { ...p, kind: 'open' }
        : p,
  );
  parts.push({ id: '__test', kind: 'isource', from: b, to: a, value: 1 });
  const s = mna(c, parts, (p) => (p.id === '__test' ? 1 : val(p)), new Map(), b);
  if (!s.ok) return undefined;
  const r = s.potentials[a] - s.potentials[b];
  return r > 1e9 ? Infinity : r;
}

// ─────────────────────────── reducciones ───────────────────────────
const par = (vs: number[]) => (vs.some((v) => v === 0) ? 0 : 1 / vs.reduce((s, v) => s + 1 / v, 0));

/** Valor de una pieza fundida a partir de sus piezas de origen (con sus
 * extremos tal como estaban antes de fundir). */
export function mergeValue(p: CPart, src: CPart[], vals: (number | undefined)[]): number | undefined {
  if (vals.some((v) => v == null)) return undefined;
  const v = vals as number[];
  let kind = p.mergeKind;
  if (!kind) {
    const key = (q: CPart) => [q.from, q.to].sort().join('|');
    kind = src.every((q) => key(q) === key(src[0])) ? 'parallel' : 'series';
  }
  if (kind === 'series') return v.reduce((s, x) => s + x, 0);
  if (kind === 'parallel') return par(v);
  if (v.length !== 3) return undefined;
  const sum = v[0] + v[1] + v[2];
  if (kind === 'delta-wye') {
    // Ry(terminal X) = producto de las dos Δ que tocan X / suma
    const deltaNodes = new Set(src.flatMap((q) => [q.from, q.to]));
    const term = deltaNodes.has(p.from) ? p.from : p.to;
    const adjIdx = src.map((q, i) => (q.from === term || q.to === term ? i : -1)).filter((i) => i >= 0);
    const [i, j] = adjIdx.length === 2 ? adjIdx : [0, 1];
    return (v[i] * v[j]) / sum;
  }
  // wye-delta: R_XY = (RaRb + RbRc + RcRa) / R_opuesta (la que no toca X ni Y)
  let opp = src.findIndex((q) => ![q.from, q.to].includes(p.from) && ![q.from, q.to].includes(p.to));
  if (opp < 0) opp = 2;
  return (v[0] * v[1] + v[1] * v[2] + v[2] * v[0]) / v[opp];
}

type StepLike = { circuit?: Circuit; [k: string]: unknown };
/** Recorre los pasos y rellena `value` de toda pieza con `mergedFrom` sin
 * valor, usando las piezas de origen tal como aparecieron en pasos previos
 * (o en el mismo). No muta la entrada. */
export function resolveMergedValues<T extends StepLike>(steps: T[]): T[] {
  const known = new Map<string, CPart>();
  return steps.map((s) => {
    if (!s.circuit) return s;
    // mismo id = misma pieza: sin value propio hereda el del paso anterior
    const parts = s.circuit.parts.map((p) => (p.value == null && known.get(p.id)?.value != null && p.kind === known.get(p.id)!.kind ? { ...p, value: known.get(p.id)!.value } : { ...p }));
    const here = new Map(parts.map((p) => [p.id, p]));
    const pv = (q: CPart) => q.value ?? (q.kind === 'wire' ? 0 : undefined);
    for (let changed = true; changed; ) {
      changed = false;
      for (const p of parts) {
        if (p.value != null || !p.mergedFrom) continue;
        const src = p.mergedFrom.map((id) => (here.get(id)?.mergedFrom?.includes(p.id) ? undefined : known.get(id) ?? here.get(id)));
        if (src.some((q) => !q)) continue;
        // Δ↔Y con sólo 2 piezas de origen (las que tocan el terminal): la 3.ª se busca por topología.
        if ((p.mergeKind === 'delta-wye' || p.mergeKind === 'wye-delta') && src.length === 2) {
          const [a, b] = src as CPart[];
          const ends = (q: CPart) => [q.from, q.to];
          const shared = ends(a).find((n) => ends(b).includes(n));
          const pool = [...known.values()].filter((q) => q.id !== a.id && q.id !== b.id && q.kind !== 'wire');
          let third: CPart | undefined;
          if (p.mergeKind === 'delta-wye') {
            const oa = ends(a).find((n) => n !== shared), ob = ends(b).find((n) => n !== shared);
            third = pool.find((q) => ends(q).includes(oa!) && ends(q).includes(ob!));
          } else third = pool.find((q) => shared && ends(q).includes(shared)); // Y: la otra rama al centro
          if (!third) continue;
          src.push(third);
        }
        const v = mergeValue(p, src as CPart[], (src as CPart[]).map(pv));
        if (v != null) (p.value = v, (changed = true));
      }
    }
    for (const p of parts) known.set(p.id, p);
    return { ...s, circuit: { ...s.circuit, parts } };
  });
}

// ─────────────────────────── expect ───────────────────────────
export type Mismatch = { step: number; key: string; expected: number; got: number; message?: string };

/** Valor de una clave de `expect` sobre una solución. */
export function evalKey(c: Circuit, sol: Solution, key: string): number | undefined {
  const m = /^\s*(I|V|Req|P)\s*\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)\s*$/.exec(key);
  if (!m) return undefined;
  const [, f, x, y] = m;
  const part = (k: string) => c.parts.find((p) => p.id === k) ?? c.parts.find((p) => p.label === k);
  const pot = (k: string) => sol.potentials[resolveNode(c, k)];
  if (f === 'I') {
    const p = part(x);
    return p ? sol.currents[p.id] : undefined;
  }
  if (f === 'V') return y ? pot(x) - pot(y) : pot(x);
  if (f === 'Req') return y ? reqBetween(c, x, y) : undefined;
  const p = part(x);
  if (!p) return undefined;
  const drop = sol.potentials[p.from] - sol.potentials[p.to];
  const consumed = drop * sol.currents[p.id];
  return isSource(p) ? -consumed : consumed;
}

/** Recorre una spec de visualización y devuelve las discrepancias (1 %). */
export function checkExpect(spec: { steps: StepLike[] }): Mismatch[] {
  const out: Mismatch[] = [];
  resolveMergedValues(spec.steps).forEach((s, i) => {
    const exp = s.expect as Record<string, number> | undefined;
    if (!exp || !s.circuit) return;
    const sol = solveCircuit(s.circuit);
    for (const [key, expected] of Object.entries(exp)) {
      const got = sol.ok ? evalKey(s.circuit, sol, key) : undefined;
      if (got == null || Number.isNaN(got)) {
        out.push({ step: i, key, expected, got: NaN, message: sol.ok ? 'clave no reconocida o pieza/nodo inexistente' : sol.reason });
      } else if (Math.abs(got - expected) > 0.01 * Math.abs(expected) + 1e-9) {
        out.push({ step: i, key, expected, got });
      }
    }
  });
  return out;
}


// ─────────────────────────── práctica: reducir ───────────────────────────
// Clasifica y funde pares de resistencias sobre la TOPOLOGÍA (los cables
// funden nodos). Puro: CircuitPractice.tsx sólo guarda el historial.
export type PairKind = 'series' | 'parallel' | 'none';
export type PairVerdict = { kind: PairKind; why: string; delta?: string /* id de la 3.ª pieza del triángulo */ };

const isRes = (p: CPart) => roleOf(p, p.value ?? 1) === 'R';
function groups(c: Circuit) {
  const uf = new Map<string, string>();
  const find = (x: string): string => (uf.has(x) && uf.get(x) !== x ? find(uf.get(x)!) : x);
  for (const p of c.parts) if (roleOf(p, p.value) === 'short') {
    const a = find(p.from), b = find(p.to);
    if (a !== b) uf.set(a, b);
  }
  return find;
}
const nm = (p: CPart) => p.label ?? p.id;

/** ¿a y b están en serie, en paralelo o ninguna? `between` = terminales (por
 * ellos "sale" otra rama, así que un nodo terminal nunca es nodo de serie). */
export function classifyPair(c: Circuit, a: string, b: string, between: [string, string]): PairVerdict {
  const find = groups(c);
  const pa = c.parts.find((p) => p.id === a)!, pb = c.parts.find((p) => p.id === b)!;
  const ea = [find(pa.from), find(pa.to)], eb = [find(pb.from), find(pb.to)];
  const key = (e: string[]) => [...e].sort().join('|');
  if (key(ea) === key(eb))
    return { kind: 'parallel', why: `${nm(pa)} y ${nm(pb)} están conectadas a los MISMOS dos nodos: paralelo.` };
  const shared = ea.filter((n) => eb.includes(n));
  if (shared.length === 1) {
    const n = shared[0];
    const others = c.parts.filter((p) => p.id !== a && p.id !== b && roleOf(p, p.value ?? 1) !== 'short' && roleOf(p, p.value ?? 1) !== 'open' && (find(p.from) === n || find(p.to) === n));
    const terminal = between.map(find).includes(n);
    if (!others.length && !terminal)
      return { kind: 'series', why: `El nodo entre ${nm(pa)} y ${nm(pb)} sólo las toca a ellas: la misma corriente pasa por las dos, serie.` };
    // ¿triángulo? la 3.ª pieza une los extremos no compartidos
    const oa = ea.find((x) => x !== n)!, ob = eb.find((x) => x !== n)!;
    const third = c.parts.find((p) => p.id !== a && p.id !== b && isRes(p) && key([find(p.from), find(p.to)]) === key([oa, ob]));
    const why = terminal
      ? `Comparten un nodo, pero es un terminal (${between.join('/')}) y por él sale otra rama: no es serie.`
      : `Comparten un nodo, pero de él sale otra rama (${others.map(nm).join(', ')}): no es serie.`;
    return third ? { kind: 'none', why: `${why} Con ${nm(third)} forman un triángulo (Δ): prueba Δ→Y.`, delta: third.id } : { kind: 'none', why };
  }
  return { kind: 'none', why: `${nm(pa)} y ${nm(pb)} no comparten ningún nodo: ni serie ni paralelo.` };
}

/** R1,R2 → "R12" si está libre y es corto; si no, la primera libre de Ra, Rb, … */
function freshLabel(c: Circuit, la: string, lb: string) {
  const taken = new Set(c.parts.map((p) => p.label ?? p.id));
  const m1 = /^R(\d+)$/.exec(la), m2 = /^R(\d+)$/.exec(lb);
  const cat = m1 && m2 ? `R${m1[1]}${m2[1]}` : '';
  if (cat && cat.length <= 5 && !taken.has(cat)) return cat;
  return nextLetter(taken);
}
function nextLetter(taken: Set<string>) {
  for (let i = 0; ; i++) {
    const l = `R${i < 26 ? String.fromCharCode(97 + i) : String.fromCharCode(97 + Math.floor(i / 26) - 1) + String.fromCharCode(97 + (i % 26))}`;
    if (!taken.has(l)) return l;
  }
}

/** Quita cables colgantes y nodos aislados (deja los terminales y los nodos con rótulo). */
function prune(c: Circuit, keep: string[]): Circuit {
  let parts = c.parts;
  for (let changed = true; changed; ) {
    changed = false;
    const deg = new Map<string, number>();
    for (const p of parts) for (const e of [p.from, p.to]) deg.set(e, (deg.get(e) ?? 0) + 1);
    const next = parts.filter((p) => !(p.kind === 'wire' && [p.from, p.to].some((e) => deg.get(e) === 1 && !keep.includes(e))));
    if (next.length !== parts.length) (parts = next, (changed = true));
  }
  const used = new Set(parts.flatMap((p) => [p.from, p.to]));
  return { ...c, parts, nodes: c.nodes.filter((n) => used.has(n.id) || keep.includes(n.id)) };
}

/** Funde a y b (ya clasificadas) en una pieza nueva con mergedFrom. */
export function mergePair(c: Circuit, a: string, b: string, kind: 'series' | 'parallel', between: [string, string]): { circuit: Circuit; part: CPart } {
  const find = groups(c);
  const pa = c.parts.find((p) => p.id === a)!, pb = c.parts.find((p) => p.id === b)!;
  const value = mergeValue({ id: '', kind: 'resistor', from: '', to: '', mergeKind: kind }, [pa, pb], [pa.value, pb.value])!;
  const id = `${a}_${b}`;
  const label = freshLabel(c, nm(pa), nm(pb));
  const base = { id, kind: 'resistor', value, label, mergedFrom: [a, b], mergeKind: kind, tone: kind } as CPart;
  let part: CPart;
  if (kind === 'parallel') {
    // se queda con el trazo más directo de las dos
    const g = ((pb.via as unknown[]) ?? []).length < ((pa.via as unknown[]) ?? []).length ? pb : pa;
    part = { ...base, from: g.from, to: g.to, ...(g.via ? { via: g.via } : {}) };
  }
  else {
    const n = [find(pa.from), find(pa.to)].find((x) => x === find(pb.from) || x === find(pb.to))!;
    const [outA, inA] = find(pa.from) === n ? [pa.to, pa.from] : [pa.from, pa.to];
    const [inB, outB] = find(pb.from) === n ? [pb.from, pb.to] : [pb.to, pb.from];
    const pos = (id: string) => c.nodes.find((q) => q.id === id);
    const viaA = ((pa.via as [number, number][]) ?? []).slice(), viaB = ((pb.via as [number, number][]) ?? []).slice();
    if (pa.from === inA) viaA.reverse();
    if (pb.to === inB) viaB.reverse();
    const via: [number, number][] = [...viaA];
    for (const id of [inA, inB]) {
      const q = pos(id);
      if (q && !via.some(([x, y]) => x === q.x && y === q.y)) via.push([q.x, q.y]);
    }
    via.push(...viaB);
    part = { ...base, from: outA, to: outB, via };
  }
  const parts = c.parts.filter((p) => p.id !== a && p.id !== b);
  const at = c.parts.findIndex((p) => p.id === a);
  parts.splice(Math.min(at, parts.length), 0, part);
  return { circuit: prune({ ...c, parts, groups: [], loops: [] }, between), part };
}

/** Δ→Y sobre el triángulo a-b-third: centro nuevo en el baricentro. */
export function deltaToWye(c: Circuit, ids: [string, string, string], between: [string, string]): Circuit {
  const src = ids.map((id) => c.parts.find((p) => p.id === id)!);
  const nodes = [...new Set(src.flatMap((p) => [p.from, p.to]))];
  const pos = nodes.map((id) => c.nodes.find((n) => n.id === id) ?? { id, x: 0, y: 0 });
  const center: CNode = { id: `Y_${ids.join('')}`, x: Math.round((pos.reduce((s, n) => s + n.x, 0) / 3) * 2) / 2, y: Math.round((pos.reduce((s, n) => s + n.y, 0) / 3) * 2) / 2 };
  const taken = new Set(c.parts.map((p) => p.label ?? p.id));
  const ys: CPart[] = nodes.map((t, i) => {
    const label = nextLetter(taken);
    taken.add(label);
    const p: CPart = { id: `${center.id}_${i}`, kind: 'resistor', from: t, to: center.id, label, mergedFrom: [...ids], mergeKind: 'delta-wye', tone: 'bridge' };
    p.value = mergeValue(p, src, src.map((q) => q.value));
    const n = pos[i];
    if (n.x !== center.x && n.y !== center.y) p.via = [[center.x, n.y]];
    return p;
  });
  const parts = c.parts.filter((p) => !ids.includes(p.id)).concat(ys);
  return prune({ ...c, nodes: [...c.nodes, center], parts, groups: [], loops: [] }, between);
}

/** ¿La pieza no lleva corriente al mirar desde `between` (puente equilibrado)? */
export function carriesNoCurrent(c: Circuit, id: string, between: [string, string]): boolean {
  const s = solveCircuit({ ...c, diodes: [], parts: [...c.parts.filter((p) => !isSource(p)), { id: '__t', kind: 'isource', from: between[1], to: between[0], value: 1 }] });
  return s.ok && Math.abs(s.currents[id]) < 1e-9;
}
export function removePart(c: Circuit, id: string, between: [string, string]): Circuit {
  return prune({ ...c, parts: c.parts.filter((p) => p.id !== id), groups: [], loops: [] }, between);
}

/** Resistencias que quedan; `done` cuando sólo una une los dos terminales. */
export function practiceStatus(c: Circuit, between: [string, string]) {
  const find = groups(c);
  const rs = c.parts.filter(isRes);
  const t = [find(between[0]), find(between[1])].sort().join('|');
  const done = rs.length === 1 && [find(rs[0].from), find(rs[0].to)].sort().join('|') === t;
  return { resistors: rs.map((p) => p.id), done, value: done ? rs[0].value : undefined };
}

// ─────────────────────────── umbrales ───────────────────────────
export type Threshold = { diode: string; label: string; at: number; becomes: 'on' | 'off' };
/** Barre `part` en [min, max] (sin hipótesis: el motor elige el estado) y, en
 * cada cambio de estado de un diodo, biseca hasta 1e-6 de precisión. */
export function thresholds(c: Circuit, part: string, min: number, max: number, step = (max - min) / 200): Threshold[] {
  const free = { ...c, diodes: [] };
  const states = (v: number) => {
    const s = solveCircuit(free, { [part]: v });
    return s.ok ? s.diodes : null;
  };
  const n = Math.min(400, Math.max(2, Math.ceil((max - min) / step)));
  const out: Threshold[] = [];
  let prevV = min, prev = states(min);
  for (let k = 1; k <= n; k++) {
    const v = min + ((max - min) * k) / n, cur = states(v);
    if (prev && cur)
      for (const d of Object.keys(cur)) {
        if (prev[d]?.actual === cur[d].actual) continue;
        let lo = prevV, hi = v;
        const start = prev[d].actual;
        while (hi - lo > 1e-6) {
          const mid = (lo + hi) / 2;
          if (states(mid)?.[d]?.actual === start) lo = mid;
          else hi = mid;
        }
        const p = c.parts.find((q) => q.id === d)!;
        out.push({ diode: d, label: p.label ?? d, at: +((lo + hi) / 2).toFixed(5), becomes: cur[d].actual });
      }
    prev = cur;
    prevV = v;
  }
  return out;
}

export { kvlTerms, meshSystem, loopCrossings } from './kvl.ts';
