import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visualizationSchema } from '../../lib/schemas.ts';
import { circuitSteps, overlap, CELL, type Box } from './layout.ts';
import { GALLERY } from './gallery.ts';

// Geometría del renderer sobre TODOS los casos de la galería (/lab/circuitos).

const parsed = GALLERY.map((g) => {
  const r = visualizationSchema.safeParse(g.viz);
  if (!r.success) throw new Error(`${g.id}: spec inválida ${JSON.stringify(r.error.issues.slice(0, 2))}`);
  return { g, viz: r.data, out: circuitSteps(r.data.steps as never[]) };
});

test('la galería tiene ≥ 25 casos borde', () => {
  assert.ok(GALLERY.length >= 25, `sólo ${GALLERY.length}`);
});

test('cada pieza arranca en su nodo `from` y termina en su nodo `to`', () => {
  for (const { g, viz, out } of parsed)
    viz.steps.forEach((s, i) => {
      const lay = out.layouts[i];
      for (const p of s.circuit!.parts) {
        const gm = lay.debug.parts.find((q) => q.id === p.id)!;
        const a = lay.debug.nodes[p.from], b = lay.debug.nodes[p.to];
        assert.ok(a && b, `${g.id}#${i} ${p.id}: nodo inexistente`);
        const r = gm.route;
        assert.ok(Math.hypot(r[0][0] - a[0], r[0][1] - a[1]) < 0.01, `${g.id}#${i} ${p.id} no sale de ${p.from}`);
        assert.ok(Math.hypot(r[r.length - 1][0] - b[0], r[r.length - 1][1] - b[1]) < 0.01, `${g.id}#${i} ${p.id} no llega a ${p.to}`);
      }
    });
});

// Todos los circuitos reales: galería + plantillas + content/**/*.mdx + practica.md.
const { walk, vizBlocks } = await import('../../../scripts/viz-blocks.mjs' as string);
const everything = [
  ...parsed.map(({ g, viz, out }) => ({ id: g.id, viz, out })),
  ...['templates', 'content'].flatMap((d) => walk(d) as string[]).flatMap((f) =>
    (vizBlocks(f) as { at: number | string; viz?: { type?: string } }[])
      .filter((b) => b.viz?.type === 'circuit')
      // un bloque de plantilla sin pasos (esqueleto a llenar) no es un circuito
      .flatMap((b) => {
        const r = visualizationSchema.safeParse(b.viz);
        return r.success ? [{ id: `${f}:${b.at}`, viz: r.data, out: circuitSteps(r.data.steps as never[]) }] : [];
      }),
  ),
];

test('ningún tramo va en diagonal (galería, plantillas y todo el contenido)', () => {
  // Redes no tiene circuitos en content/ (la plantilla heredada de IoT ya no está): basta la galería.
  assert.ok(everything.length >= parsed.length, `sólo ${everything.length} circuitos`);
  const bad: string[] = [];
  for (const { id, out } of everything)
    out.layouts.forEach((lay, i) => {
      for (const gm of lay.debug.parts)
        gm.route.slice(1).forEach((q, j) => {
          const a = gm.route[j];
          if (Math.abs(a[0] - q[0]) > 0.01 && Math.abs(a[1] - q[1]) > 0.01) bad.push(`${id}#${i} ${gm.id}`);
        });
    });
  assert.deepEqual(bad, []);
});

const partsById = (viz: { steps: { circuit?: { parts: { id: string; from: string; to: string; kind: string }[] } }[] }, i: number) => viz.steps[i].circuit?.parts ?? [];

test('piezas en paralelo (mismo par de nodos): símbolos separados, nunca encimados', () => {
  const two = { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 6, y: 0 }], parts: ['R1', 'R2', 'R3'].map((id) => ({ id, kind: 'resistor', from: 'A', to: 'B', value: 1000, label: id })) };
  const diag = { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 6, y: 4 }], parts: ['R1', 'R2', 'R3'].map((id) => ({ id, kind: 'resistor', from: 'A', to: 'B', value: 1000, label: id })) };
  const short = { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 0, y: 5 }], parts: [{ id: 'R1', kind: 'resistor', from: 'A', to: 'B', value: 1 }, { id: 'w', kind: 'wire', from: 'B', to: 'A' }] };
  const synth = [two, { ...two, parts: two.parts.slice(0, 2) }, diag, short].map((circuit, n) => {
    const viz = visualizationSchema.parse({ type: 'circuit', steps: [{ note: '', circuit }] });
    return { id: `sintético-${n}`, viz, out: circuitSteps(viz.steps as never[]) };
  });
  const bad: string[] = [];
  for (const { id, viz, out } of [...synth, ...everything])
    out.layouts.forEach((lay, i) => {
      const ps = partsById(viz as never, i);
      for (let x = 0; x < ps.length; x++)
        for (let y = x + 1; y < ps.length; y++) {
          const [p, q] = [ps[x], ps[y]];
          if (!((p.from === q.from && p.to === q.to) || (p.from === q.to && p.to === q.from))) continue;
          const gp = lay.debug.parts.find((g) => g.id === p.id)!, gq = lay.debug.parts.find((g) => g.id === q.id)!;
          const same = gp.route.length === gq.route.length && gp.route.every((a, j) => Math.hypot(a[0] - gq.route[j][0], a[1] - gq.route[j][1]) < 0.5);
          const rev = gp.route.length === gq.route.length && gp.route.every((a, j) => Math.hypot(a[0] - gq.route[gq.route.length - 1 - j][0], a[1] - gq.route[gq.route.length - 1 - j][1]) < 0.5);
          if (same || rev) bad.push(`${id}#${i} ${p.id}/${q.id}: misma ruta`);
          for (const a of gp.symbolBoxes) for (const b of gq.symbolBoxes) if (overlap(a, b) > 0) bad.push(`${id}#${i} ${p.id}/${q.id}: símbolos encimados`);
        }
    });
  assert.deepEqual(bad, []);
});

test('ningún símbolo pisa a otro', () => {
  const bad: string[] = [];
  for (const { id, out } of everything)
    out.layouts.forEach((lay, i) => {
      const P = lay.debug.parts;
      for (let x = 0; x < P.length; x++)
        for (let y = x + 1; y < P.length; y++)
          for (const a of P[x].symbolBoxes) for (const b of P[y].symbolBoxes) if (overlap(a, b) > 4) bad.push(`${id}#${i} ${P[x].id}/${P[y].id}`);
    });
  assert.deepEqual(bad, []);
});

test('un halo no cubre el centro de ninguna pieza ajena a su grupo', () => {
  const bad: string[] = [];
  const segDist = (p: number[], a: number[], b: number[]) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };
  for (const { id, viz, out } of everything)
    out.steps.forEach((s, i) => {
      const groups = (viz.steps[i] as { circuit?: { groups?: { parts: string[] }[] } }).circuit?.groups ?? [];
      for (const h of s.scene!.halos) {
        const gr = groups.find((g) => h.id.endsWith(`:${g.parts.join('+')}`))!;
        if (h.d.endsWith('Z')) {
          // rectángulo redondeado: su caja engordada `pad`
          const xs = [...h.d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
          const [x0, y0, x1, y1] = [Math.min(...xs.map((q) => q[0])) - h.pad, Math.min(...xs.map((q) => q[1])) - h.pad, Math.max(...xs.map((q) => q[0])) + h.pad, Math.max(...xs.map((q) => q[1])) + h.pad];
          for (const gm of out.layouts[i].debug.parts)
            if (gm.center && !gr.parts.includes(gm.id) && gm.center[0] > x0 && gm.center[0] < x1 && gm.center[1] > y0 && gm.center[1] < y1) bad.push(`${id}#${i} ${h.id} cubre ${gm.id}`);
          continue;
        }
        const segs = [...h.d.matchAll(/M([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+)/g)].map((m) => [[+m[1], +m[2]], [+m[3], +m[4]]]);
        assert.ok(segs.length, `${id}#${i} ${h.id}: halo sin cápsulas`);
        for (const gm of out.layouts[i].debug.parts) {
          if (!gm.center || gr.parts.includes(gm.id)) continue;
          if (segs.some(([a, b]) => segDist(gm.center!, a, b) < h.pad)) bad.push(`${id}#${i} ${h.id} cubre ${gm.id}`);
        }
      }
    });
  assert.deepEqual(bad, []);
});

test('el símbolo cae centrado en su tramo, el más largo que no comparte con otro cable', () => {
  const bad: string[] = [];
  for (const { id, out } of everything)
    out.layouts.forEach((lay, i) => {
      for (const gm of lay.debug.parts) {
        if (!gm.center) continue;
        const [a, b] = [gm.route[gm.seg], gm.route[gm.seg + 1]];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (Math.hypot(gm.center[0] - (a[0] + b[0]) / 2, gm.center[1] - (a[1] + b[1]) / 2) > 0.01) bad.push(`${id}#${i} ${gm.id}: descentrado`);
        if (len < 2 * gm.hl) bad.push(`${id}#${i} ${gm.id}: el tramo (${len} px) no alcanza para el cuerpo (${2 * gm.hl} px)`);
      }
    });
  assert.deepEqual(bad, []);
});

const area = (b: Box) => (b[2] - b[0]) * (b[3] - b[1]);

test('ningún rótulo pisa un símbolo', () => {
  const bad: string[] = [];
  for (const { g, out } of parsed)
    out.layouts.forEach((lay, i) => {
      for (const l of lay.debug.labels)
        for (const gm of lay.debug.parts)
          for (const sb of gm.symbolBoxes) {
            const o = overlap(l.box, sb);
            if (o > 6) bad.push(`${g.id}#${i} ${l.id} × ${gm.id} (${o.toFixed(0)} px²)`);
          }
    });
  assert.deepEqual(bad, []);
});

test('ningún rótulo pisa a otro', () => {
  const bad: string[] = [];
  for (const { g, out } of parsed)
    out.layouts.forEach((lay, i) => {
      const L = lay.debug.labels;
      for (let a = 0; a < L.length; a++)
        for (let b = a + 1; b < L.length; b++) {
          if (L[a].id === L[b].id) continue;
          const o = overlap(L[a].box, L[b].box);
          if (o > 0.08 * Math.min(area(L[a].box), area(L[b].box))) bad.push(`${g.id}#${i} ${L[a].id} × ${L[b].id}`);
        }
    });
  assert.deepEqual(bad, []);
});

test('keys únicas por paso (React no mezcla elementos)', () => {
  for (const { g, out } of parsed)
    out.steps.forEach((s, i) => {
      const sc = s.scene!;
      for (const [name, list] of Object.entries({ wires: sc.wires, symbols: sc.symbols, texts: sc.texts, marks: sc.marks, dots: sc.dots, halos: sc.halos })) {
        const ids = (list as { id: string }[]).map((x) => x.id);
        assert.equal(new Set(ids).size, ids.length, `${g.id}#${i} ${name}: ${ids.filter((x, j) => ids.indexOf(x) !== j)}`);
      }
    });
});

test('viewBox común: todos los pasos comparten tamaño y origen', () => {
  for (const { g, out } of parsed) {
    const o = out.steps[0].scene!.origin;
    for (const s of out.steps) {
      assert.equal(s.width, out.width, g.id);
      assert.equal(s.height, out.height, g.id);
      assert.deepEqual(s.scene!.origin, o, g.id);
    }
  }
});

test('una celda = 20 px; 4 celdas alcanzan para un símbolo con sus cables', () => {
  assert.equal(CELL, 20);
});

test('fusión: la pieza nueva lista sus fuentes y el valor se resuelve', () => {
  const chain = parsed.find((x) => x.g.id === 'reduccion-cadena')!;
  const last = chain.out.steps[chain.out.steps.length - 1];
  const req = last.scene!.symbols.find((s) => s.part === 'Req')!;
  assert.deepEqual(req.mergedFrom, ['Rb', 'R7']);
  assert.ok(last.panel!.rows.some((r) => r.id === 'merge:Req' && /4\\,\\text\{k\}/.test(r.tex ?? '')), JSON.stringify(last.panel!.rows));
});

test('KVL: la pieza del tramo actual queda activa en la escena y en el panel', () => {
  const m = parsed.find((x) => x.g.id === 't2-mallas')!;
  const s2 = m.out.steps[1];
  assert.equal(s2.scene!.symbols.find((s) => s.part === 'R1')!.state, 'active');
  const row = s2.panel!.rows.find((r) => r.terms)!;
  assert.deepEqual(row.terms!.filter((t) => t.active).map((t) => t.part), ['R1']);
  assert.ok(s2.scene!.walker && s2.scene!.walker.frac > 0 && s2.scene!.walker.frac < 1);
});

test('diodos: hipótesis ON dibuja la fuente equivalente, OFF el circuito abierto; veredicto ✓/✗', () => {
  const d = parsed.find((x) => x.g.id === 't3-si-ge')!;
  const s1 = d.out.steps[1].scene!;
  assert.equal(s1.symbols.find((s) => s.part === 'D2')!.kind, 'vdrop');
  assert.equal(s1.symbols.find((s) => s.part === 'D1')!.variant, 'off');
  assert.ok(s1.texts.some((t) => t.id === 'badge:hyp' && t.text.endsWith('✓')));
  const inv = parsed.find((x) => x.g.id === 'diodo-inverso')!;
  assert.ok(inv.out.steps[0].scene!.texts.some((t) => t.text === 'D1 ✗'));
  assert.ok(inv.out.steps[1].scene!.texts.some((t) => t.text === 'D1 ✓'));
});
