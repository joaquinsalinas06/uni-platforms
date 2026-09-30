// Modo práctica "reducir": el lector toca dos resistencias; el motor dice si
// están en serie / paralelo / ninguna (y sugiere Δ→Y), las funde si procede,
// guarda historial con deshacer y, cuando queda una sola entre los terminales,
// muestra Req contrastada con el solver. La lógica es pura (solve.ts).
import { useMemo, useRef, useState } from 'react';
import VisualizationCanvas from '../../components/VisualizationCanvas.tsx';
import { circuitSteps, type CircuitSpec } from './layout.ts';
import {
  carriesNoCurrent, classifyPair, deltaToWye, formatSI, mergePair, practiceStatus, reqBetween, removePart, resolveMergedValues,
  type PairVerdict,
} from './solve.ts';

type Step = { note: string; circuit?: CircuitSpec; [k: string]: unknown };
type Entry = { circuit: CircuitSpec; note: string; fresh?: string };

export default function CircuitPractice({ steps, practice, title }: { steps: Step[]; practice: { kind: 'reduce'; between: [string, string] }; title?: string }) {
  const bt = practice.between;
  const start = useMemo<CircuitSpec>(() => {
    const r = resolveMergedValues(steps);
    const c = r[r.length - 1].circuit!;
    return { ...c, loops: [], kvl: undefined, showSystem: false, currents: [], voltages: [], diodes: [], req: undefined };
  }, [steps]);
  const truth = useMemo(() => reqBetween(start, bt[0], bt[1]), [start]);
  const [hist, setHist] = useState<Entry[]>([{ circuit: start, note: 'Toca dos resistencias: te digo si están en serie o en paralelo.' }]);
  const [sel, setSel] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<PairVerdict | null>(null);
  const cur = hist[hist.length - 1];
  const status = practiceStatus(cur.circuit, bt);
  const lab = (id: string) => cur.circuit.parts.find((p) => p.id === id)?.label ?? id;
  const nodeLab = (id: string) => start.nodes.find((n) => n.id === id)?.label ?? id;

  const push = (circuit: CircuitSpec, note: string, fresh?: string) => {
    setHist((h) => [...h, { circuit, note, fresh }]);
    setSel([]);
    setVerdict(null);
  };

  const pick = (id: string) => {
    if (status.done) return;
    const next = sel.includes(id) ? sel.filter((x) => x !== id) : sel.length === 2 ? [id] : [...sel, id];
    setSel(next);
    setVerdict(null);
    if (next.length < 2) return;
    const v = classifyPair(cur.circuit, next[0], next[1], bt);
    if (v.kind === 'none') return setVerdict(v);
    const m = mergePair(cur.circuit, next[0], next[1], v.kind, bt);
    const how = v.kind === 'series' ? `${lab(next[0])} + ${lab(next[1])}` : `${lab(next[0])} ‖ ${lab(next[1])}`;
    push(m.circuit, `${v.why} ${m.part.label} = ${how} = ${formatSI(m.part.value!, 'Ω')}.`, m.part.id);
  };

  const noCurrent = () => {
    const id = sel[0];
    if (carriesNoCurrent(cur.circuit, id, bt)) push(removePart(cur.circuit, id, bt), `Por ${lab(id)} no circula corriente (puente equilibrado: sus dos extremos están al mismo potencial). Se puede quitar.`);
    else setVerdict({ kind: 'none', why: `Por ${lab(id)} sí circula corriente: sus extremos no están al mismo potencial, no se puede quitar.` });
  };

  const applyDelta = () => {
    const ids: [string, string, string] = [sel[0], sel[1], verdict!.delta!];
    push(deltaToWye(cur.circuit, ids, bt), `Δ→Y sobre ${ids.map(lab).join(', ')}: cada rama de la Y = producto de las dos Δ que tocan ese nodo / suma de las tres.`);
  };

  // Todas las fotos del historial comparten viewBox: nada salta al fundir.
  const display = hist.map((e, i) => {
    const last = i === hist.length - 1;
    const parts = e.circuit.parts.map((p) => (last && sel.includes(p.id) ? { ...p, state: 'active' as const } : last && status.done && p.id === status.resistors[0] ? { ...p, state: 'answer' as const } : p));
    const fresh = last && e.fresh ? e.circuit.parts.find((p) => p.id === e.fresh) : undefined;
    const groups = fresh ? [{ parts: [fresh.id], tone: fresh.mergeKind === 'parallel' ? 'parallel' : 'series', label: fresh.mergeKind === 'parallel' ? 'paralelo' : 'serie' }] : [];
    return { note: e.note, circuit: { ...e.circuit, parts, groups, req: last && status.done ? { between: bt } : undefined } as CircuitSpec };
  });
  const frame = useMemo(() => circuitSteps(display), [JSON.stringify(display)]);
  const shown = frame.steps[frame.steps.length - 1];

  // Clic sobre el dibujo: la pieza cuyo trazo queda más cerca (en coordenadas del SVG).
  const wrap = useRef<HTMLDivElement>(null);
  const onCanvasClick = (ev: React.MouseEvent) => {
    const svg = wrap.current?.querySelector('svg');
    const geoms = frame.layouts[frame.layouts.length - 1]?.debug?.parts as { id: string; route: [number, number][] }[] | undefined;
    // coordenadas de la escena = las del grupo que contiene los trazos (el canvas lo traslada)
    const layer = svg?.querySelector(':scope > g path')?.parentElement as SVGGraphicsElement | null | undefined;
    const ctm = (layer ?? svg)?.getScreenCTM();
    if (!svg || !ctm || !geoms) return;
    const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    const res = new Set(status.resistors);
    let best: { id: string; d: number } | null = null;
    for (const g of geoms) {
      if (!res.has(g.id)) continue;
      for (let i = 1; i < g.route.length; i++) {
        const d = segDist([pt.x, pt.y], g.route[i - 1], g.route[i]);
        if (!best || d < best.d) best = { id: g.id, d };
      }
    }
    if (best && best.d < 24) pick(best.id);
  };

  return (
    <div className="my-10">
      <div ref={wrap} onClick={onCanvasClick} className="cursor-pointer">
        <VisualizationCanvas steps={[{ ...shown, note: cur.note }]} width={frame.width} height={frame.height} title={title} static />
      </div>
      <div className="-mt-8 rounded-b-lg border border-t-0 border-[var(--rule)] bg-[var(--fill)] px-4 pb-4 pt-3 font-[var(--font-mono)] text-[13px]">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="resistencias">
          {status.resistors.map((id) => {
            const p = cur.circuit.parts.find((q) => q.id === id)!;
            const on = sel.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => pick(id)}
                disabled={status.done}
                className={`rounded border px-2 py-0.5 tabular-nums ${on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-[var(--rule)] bg-[var(--paper)]'}`}
              >
                {p.label ?? id} · {formatSI(p.value ?? NaN, 'Ω')}
              </button>
            );
          })}
        </div>

        <div className="mt-3 min-h-[2.5rem]">
          {verdict && <p><b>Ni serie ni paralelo.</b> {verdict.why}</p>}
          {status.done && (
            <p>
              <b style={{ color: 'var(--answer)' }}>
                Req({nodeLab(bt[0])},{nodeLab(bt[1])}) = {formatSI(status.value!, 'Ω', 4)}
              </b>{' '}
              {truth != null && Math.abs(truth - status.value!) <= 1e-6 * truth ? (
                <span style={{ color: 'var(--tone-current)' }}>✓ coincide con el solver</span>
              ) : (
                <span style={{ color: 'var(--answer)' }}>✗ el solver da {formatSI(truth ?? NaN, 'Ω', 4)}</span>
              )}
            </p>
          )}
          {!verdict && !status.done && <p className="text-[var(--muted)]">{sel.length === 1 ? `${lab(sel[0])} seleccionada: toca otra.` : `${status.resistors.length} resistencias. Paso ${hist.length}.`}</p>}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => (setHist((h) => (h.length > 1 ? h.slice(0, -1) : h)), setSel([]), setVerdict(null))} disabled={hist.length < 2} className="rounded border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5 disabled:opacity-40">
            ↶ deshacer
          </button>
          {sel.length === 1 && !status.done && (
            <button type="button" onClick={noCurrent} className="rounded border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5">
              {lab(sel[0])} no lleva corriente (puente equilibrado)
            </button>
          )}
          {verdict?.delta && (
            <button type="button" onClick={applyDelta} className="rounded border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5">
              aplicar Δ→Y con {lab(verdict.delta)}
            </button>
          )}
          <button type="button" onClick={() => (setHist((h) => h.slice(0, 1)), setSel([]), setVerdict(null))} disabled={hist.length < 2} className="rounded border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5 disabled:opacity-40">
            reiniciar
          </button>
        </div>

        {hist.length > 1 && (
          <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-[var(--muted)]">
            {hist.slice(1).map((e, i) => (
              <li key={i}>{e.note}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function segDist(p: [number, number], a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
