// KVL término a término y sistema de mallas. Puro (sin React/DOM).
// Convención: se suman CAÍDAS en el sentido de recorrido de la malla = 0.
//  · Resistencia: +R·(I_L ± otras mallas que la comparten).
//  · Fuente V: recorrida de − a + es una subida → −E; de + a − → +E.
//  · Diodo ON: ánodo→cátodo +Vγ, al revés −Vγ.
//  · Diodo OFF / fuente de corriente / abierto: tensión desconocida V_X = V(from) − V(to).
import { solveCircuit, formatSITex, roleOf, vfOf, gauss, type Circuit, type CPart, type CLoop, type Solution } from './solve.ts';

const SUB: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
/** 'I₁' → 'I_{1}' (KaTeX). Deja intacto lo que ya es TeX. */
export function texLabel(s: string): string {
  return s.replace(/[₀-₉]+/g, (m) => `_{${[...m].map((ch) => SUB[ch]).join('')}}`);
}

/** Orden de recorrido del path respetando dir (cw/ccw en PANTALLA, y hacia abajo).
 * Shoelace con y hacia abajo: suma > 0 ⇔ horario en pantalla. */
export function orientedPath(c: Circuit, loop: CLoop): string[] {
  const pos = new Map(c.nodes.map((n) => [n.id, n]));
  const P = loop.path;
  let s = 0;
  for (let i = 0; i < P.length; i++) {
    const a = pos.get(P[i]), b = pos.get(P[(i + 1) % P.length]);
    if (a && b) s += a.x * b.y - b.x * a.y;
  }
  const cw = s > 0;
  const want = (loop.dir ?? 'cw') === 'cw';
  return cw === want || s === 0 ? [...P] : [P[0], ...P.slice(1).reverse()];
}

export type Crossing = { part: CPart; fwd: boolean; seg: number };

/** Piezas que cruza la malla, en orden. `seg` = índice (0-based) del tramo
 * path[i]→path[i+1] al que pertenece: `kvl.upto` cuenta tramos. */
export function loopCrossings(c: Circuit, loopId: string): Crossing[] {
  const loop = c.loops?.find((l) => l.id === loopId);
  if (!loop) return [];
  const P = orientedPath(c, loop);
  const onPath = new Set(P);
  const out: Crossing[] = [];
  const rank = (p: CPart) => (p.kind === 'open' || p.kind === 'voltmeter' ? 1 : 0);
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    const direct = c.parts.filter((p) => (p.from === a && p.to === b) || (p.from === b && p.to === a)).sort((x, y) => rank(x) - rank(y));
    if (direct.length) {
      out.push({ part: direct[0], fwd: direct[0].from === a, seg: i });
      continue;
    }
    // tramo con nodos intermedios no listados: BFS por nodos fuera del path
    const prev = new Map<string, { node: string; part: CPart }>();
    const q = [a];
    const seen = new Set([a]);
    while (q.length && !seen.has(b)) {
      const u = q.shift()!;
      for (const p of c.parts) {
        if (p.from !== u && p.to !== u) continue;
        const v = p.from === u ? p.to : p.from;
        if (seen.has(v) || (onPath.has(v) && v !== b)) continue;
        seen.add(v);
        prev.set(v, { node: u, part: p });
        q.push(v);
      }
    }
    const chain: Crossing[] = [];
    for (let v = b; prev.has(v); v = prev.get(v)!.node) {
      const { node, part } = prev.get(v)!;
      chain.unshift({ part, fwd: part.from === node, seg: i });
    }
    out.push(...chain);
  }
  return out;
}

type Row = { coef: Map<string, number>; unk: Map<string, number>; konst: number };
type Ctx = { c: Circuit; sol: Solution; val: (p: CPart) => number | undefined; cross: Map<string, Crossing[]> };

function context(c: Circuit): Ctx {
  const sol = solveCircuit(c);
  const cross = new Map((c.loops ?? []).map((l) => [l.id, loopCrossings(c, l.id)]));
  return { c, sol, val: (p) => p.value ?? (p.kind === 'wire' ? 0 : undefined), cross };
}
const loopLabel = (c: Circuit, id: string) => texLabel(c.loops!.find((l) => l.id === id)!.label);
const partName = (p: CPart) => texLabel(p.label ?? p.id);

/** Tipo de cada pieza en el análisis por mallas. */
function kindIn(ctx: Ctx, p: CPart): 'R' | 'V' | 'Don' | 'unknown' | 'skip' {
  const r = roleOf(p, ctx.val(p));
  if (r === 'short') return 'skip';
  if (r === 'R') return 'R';
  if (r === 'V') return 'V';
  if (r === 'D') return ctx.sol.diodes[p.id]?.assumed === 'on' ? 'Don' : 'unknown';
  return 'unknown'; // I, open, diodo OFF
}

/** Mallas que pasan por la pieza, con su signo relativo al sentido from→to. */
function sharers(ctx: Ctx, partId: string): { loop: string; d: number }[] {
  const out: { loop: string; d: number }[] = [];
  for (const [loop, cs] of ctx.cross) for (const x of cs) if (x.part.id === partId) out.push({ loop, d: x.fwd ? 1 : -1 });
  return out;
}

function termOf(ctx: Ctx, loopId: string, x: Crossing, row: Row): { sign: number; body: string } | null {
  const k = kindIn(ctx, x.part);
  const s = x.fwd ? 1 : -1;
  if (k === 'skip') return null;
  if (k === 'R') {
    const R = ctx.val(x.part)!;
    const mine = sharers(ctx, x.part.id);
    const dL = s;
    const others = mine.filter((m) => m.loop !== loopId);
    // corriente en sentido de recorrido = I_L + Σ dL·dM·I_M
    row.coef.set(loopId, (row.coef.get(loopId) ?? 0) + R);
    for (const m of others) row.coef.set(m.loop, (row.coef.get(m.loop) ?? 0) + R * dL * m.d);
    const cur = others.length
      ? `(${loopLabel(ctx.c, loopId)}${others.map((m) => `${dL * m.d > 0 ? ' + ' : ' - '}${loopLabel(ctx.c, m.loop)}`).join('')})`
      : loopLabel(ctx.c, loopId);
    return { sign: 1, body: `${formatSITex(R, 'Ω')}\\,${cur}` };
  }
  if (k === 'V') {
    const E = ctx.val(x.part)!;
    row.konst += -s * E;
    return { sign: -s, body: formatSITex(E, 'V') };
  }
  if (k === 'Don') {
    const vf = vfOf(x.part);
    row.konst += s * vf;
    return { sign: s, body: formatSITex(vf, 'V') };
  }
  row.unk.set(x.part.id, (row.unk.get(x.part.id) ?? 0) + s);
  return { sign: s, body: `V_{${partName(x.part)}}` };
}

const joinTerms = (ts: { sign: number; body: string }[]) =>
  ts.map((t, i) => (i === 0 ? (t.sign < 0 ? '-' : '') : t.sign < 0 ? ' - ' : ' + ') + t.body).join('') || '0';

function rowTex(ctx: Ctx, row: Row, rhs: number): string {
  const ts: { sign: number; body: string }[] = [];
  for (const l of (ctx.c.loops ?? []).map((q) => q.id)) {
    const v = row.coef.get(l) ?? 0;
    if (Math.abs(v) > 1e-12) ts.push({ sign: Math.sign(v), body: `${formatSITex(Math.abs(v), 'Ω')}\\,${loopLabel(ctx.c, l)}` });
  }
  for (const [p, v] of row.unk)
    if (Math.abs(v) > 1e-12) {
      const part = ctx.c.parts.find((q) => q.id === p)!;
      ts.push({ sign: Math.sign(v), body: `${Math.abs(v) === 1 ? '' : +Math.abs(v).toPrecision(4)}V_{${partName(part)}}` });
    }
  return `${joinTerms(ts)} = ${Math.abs(rhs) < 1e-12 ? '0' : formatSITex(rhs, 'V')}`;
}

function buildRow(ctx: Ctx, loopId: string, upto = Infinity) {
  const row: Row = { coef: new Map(), unk: new Map(), konst: 0 };
  const terms: { part: string; tex: string; sign: number; body: string }[] = [];
  for (const x of ctx.cross.get(loopId) ?? []) {
    if (x.seg >= upto) break;
    const t = termOf(ctx, loopId, x, row);
    if (t) terms.push({ part: x.part.id, tex: '', ...t });
  }
  terms.forEach((t, i) => (t.tex = (i === 0 ? (t.sign < 0 ? '-' : '') : t.sign < 0 ? '- ' : '+ ') + t.body));
  return { row, terms };
}

/** Términos de la KVL de una malla hasta el tramo `upto` (1-based, cuenta
 * tramos de `path`). Sin `upto` (o completo) incluye `closedTex`:
 * "… = 0 ⇒ forma simplificada". */
export function kvlTerms(c: Circuit, loopId: string, upto?: number): { terms: { part: string; tex: string }[]; closedTex?: string } {
  const ctx = context(c);
  const segs = c.loops?.find((l) => l.id === loopId)?.path.length ?? 0;
  const { row, terms } = buildRow(ctx, loopId, upto ?? Infinity);
  const out: { terms: { part: string; tex: string }[]; closedTex?: string } = { terms: terms.map(({ part, tex }) => ({ part, tex })) };
  if (upto == null || upto >= segs) out.closedTex = `${joinTerms(terms)} = 0 \\;\\Rightarrow\\; ${rowTex(ctx, row, -row.konst)}`;
  return out;
}

/** Plantea y resuelve el sistema de mallas (con supermalla si una fuente de
 * corriente es compartida) y lo contrasta con MNA. solution: etiqueta → A. */
export function meshSystem(c: Circuit): {
  equations: string[];
  solution: Record<string, number>;
  crossCheck: { ok: boolean; mismatches: { part: string; mesh: number; mna: number }[] };
} {
  const ctx = context(c);
  const loops = c.loops ?? [];
  const rows = loops.map((l) => buildRow(ctx, l.id).row);
  const extras = [...new Set(rows.flatMap((r) => [...r.unk.keys()]))];
  const L = loops.length, N = L + extras.length;
  const A: number[][] = [], b: number[] = [];
  rows.forEach((r) => {
    const a = new Array(N).fill(0);
    loops.forEach((l, j) => (a[j] = r.coef.get(l.id) ?? 0));
    extras.forEach((p, j) => (a[L + j] = r.unk.get(p) ?? 0));
    A.push(a);
    b.push(-r.konst);
  });
  const cons: { part: CPart; a: number[]; rhs: number }[] = extras.map((pid) => {
    const p = c.parts.find((q) => q.id === pid)!;
    const a = new Array(N).fill(0);
    for (const m of sharers(ctx, pid)) a[loops.findIndex((l) => l.id === m.loop)] += m.d;
    const rhs = p.kind === 'isource' ? ctx.val(p) ?? 0 : 0;
    A.push(a);
    b.push(rhs);
    return { part: p, a, rhs };
  });
  const x = gauss(A, b) ?? new Array(N).fill(NaN);
  const solution: Record<string, number> = {};
  loops.forEach((l, j) => (solution[l.label] = x[j]));

  // ecuaciones a mostrar
  const equations: string[] = [];
  const used = new Set<number>();
  rows.forEach((r, i) => {
    if (r.unk.size === 0) equations.push(rowTex(ctx, r, -r.konst));
  });
  cons.forEach((k, j) => {
    const pid = extras[j];
    const withIt = rows.map((r, i) => (r.unk.has(pid) ? i : -1)).filter((i) => i >= 0 && !used.has(i));
    if (withIt.length === 2 && withIt.every((i) => rows[i].unk.size === 1)) {
      const [i1, i2] = withIt;
      const f = -rows[i1].unk.get(pid)! / rows[i2].unk.get(pid)!;
      const sm: Row = { coef: new Map(), unk: new Map(), konst: rows[i1].konst + f * rows[i2].konst };
      for (const l of loops) sm.coef.set(l.id, (rows[i1].coef.get(l.id) ?? 0) + f * (rows[i2].coef.get(l.id) ?? 0));
      equations.push(`\\text{supermalla: } ${rowTex(ctx, sm, -sm.konst)}`);
      withIt.forEach((i) => used.add(i));
    } else if (withIt.length > 2 || (withIt.length === 2 && !withIt.every((i) => rows[i].unk.size === 1))) {
      withIt.forEach((i) => (used.add(i), equations.push(rowTex(ctx, rows[i], -rows[i].konst))));
    } else withIt.forEach((i) => used.add(i));
    const ts: { sign: number; body: string }[] = [];
    loops.forEach((l, q) => k.a[q] && ts.push({ sign: Math.sign(k.a[q]), body: loopLabel(c, l.id) }));
    const unit = k.part.kind === 'isource' ? 'A' : 'A';
    if (ts.length) equations.push(`${joinTerms(ts)} = ${formatSITex(k.rhs, unit)}`);
  });

  // contraste con MNA
  const mismatches: { part: string; mesh: number; mna: number }[] = [];
  if (ctx.sol.ok)
    for (const p of c.parts) {
      const k = kindIn(ctx, p);
      if (k === 'skip') continue;
      const sh = sharers(ctx, p.id);
      if (!sh.length) continue;
      const mesh = sh.reduce((s, m) => s + m.d * x[loops.findIndex((l) => l.id === m.loop)], 0);
      const mna = ctx.sol.currents[p.id];
      if (!(Math.abs(mesh - mna) <= 1e-9 + 1e-4 * Math.abs(mna))) mismatches.push({ part: p.id, mesh, mna });
    }
  return { equations, solution, crossCheck: { ok: ctx.sol.ok && mismatches.length === 0, mismatches } };
}
