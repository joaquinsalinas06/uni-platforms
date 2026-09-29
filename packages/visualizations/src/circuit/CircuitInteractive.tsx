// Slider sobre el valor de una pieza (normalmente una fuente) del ÚLTIMO paso:
// en cada cambio se re-resuelve SIN hipótesis (el motor elige el estado de
// cada diodo), se dibuja con el layout de la familia y se listan estados,
// corrientes, potenciales y los umbrales de conducción (bisección).
import { useEffect, useMemo, useRef, useState } from 'react';
import VisualizationCanvas from '../VisualizationCanvas';
import { circuitSteps, type CircuitSpec } from './layout.ts';
import { formatSI, isDiode, resolveMergedValues, solveCircuit, thresholds, vfOf, type Threshold } from './solve.ts';

type Interactive = { part: string; min: number; max: number; step?: number; label?: string };
type Step = { note: string; circuit?: CircuitSpec; [k: string]: unknown };

const unitOf = (kind: string) => (kind === 'isource' ? 'A' : kind === 'vsource' || kind === 'ac-source' ? 'V' : kind === 'switch' || kind === 'button' ? '' : 'Ω');
const toneOf = (p: { tone?: string; model?: string; kind: string }) => `var(--tone-${p.tone ?? (p.model === 'ge' ? 'ge' : 'si')})`;

export default function CircuitInteractive({ steps, interactive, title }: { steps: Step[]; interactive: Interactive; title?: string }) {
  const last = useMemo(() => {
    const r = resolveMergedValues(steps);
    return r[r.length - 1];
  }, [steps]);
  const c = last.circuit!;
  const part = c.parts.find((p) => p.id === interactive.part);
  const { min, max } = interactive;
  const step = interactive.step ?? 0.1;
  const unit = part ? unitOf(part.kind) : '';
  const name = interactive.label ?? part?.label ?? interactive.part;
  const [v, setV] = useState(() => Math.min(max, Math.max(min, part?.value ?? min)));

  const sol = useMemo(() => solveCircuit({ ...c, diodes: [] }, { [interactive.part]: v }), [c, v, interactive.part]);
  const diodes = c.parts.filter(isDiode);
  const display = useMemo<CircuitSpec>(
    () => ({
      ...c,
      // el valor va en la pieza (no sólo en overrides): el panel de mallas lee `value`
      parts: c.parts.map((p) => (p.id === interactive.part ? { ...p, value: v } : p)),
      // hipótesis = la combinación consistente que eligió el motor (el panel la valida ✓)
      diodes: sol.ok ? diodes.map((d) => ({ part: d.id, assume: sol.diodes[d.id].assumed, showModel: true })) : [],
      hypothesis: diodes.length && sol.ok ? diodes.map((d) => `${d.label ?? d.id} ${sol.diodes[d.id].assumed.toUpperCase()}`).join(' · ') : c.hypothesis,
    }),
    [c, sol, v],
  );
  const frame = useMemo(() => circuitSteps([{ note: last.note, circuit: display }], { overrides: { [interactive.part]: v } }), [display, v]);
  // El lienzo sólo crece: si un rótulo más largo agranda la caja, no vuelve a encogerse (sin saltos).
  const size = useRef({ w: 0, h: 0 });
  size.current = { w: Math.max(size.current.w, frame.width), h: Math.max(size.current.h, frame.height) };

  const [ths, setThs] = useState<Threshold[] | null>(null);
  useEffect(() => {
    if (!diodes.length) return;
    const t = setTimeout(() => setThs(thresholds(c, interactive.part, min, max, step)), 20);
    return () => clearTimeout(t);
  }, [c]);

  const readCurrents = (c.currents?.length ? c.currents.map((x) => ({ id: x.part, label: x.label, sign: x.dir === 'reverse' ? -1 : 1 })) : c.parts.filter((p) => p.kind === 'resistor').map((p) => ({ id: p.id, label: `I(${p.label ?? p.id})`, sign: 1 })));
  const readNodes = c.nodes.filter((n) => n.label && !n.ground);
  const pct = (x: number) => `${((x - min) / (max - min)) * 100}%`;
  const fmtV = (x: number) => formatSI(x, unit, 3);
  const plain = (s: string) => {
    const m = /^(.+?)_\{?([^}]*)\}?$/.exec(s);
    return m ? <>{m[1]}<sub>{m[2]}</sub></> : s;
  };

  return (
    <div className="my-10">
      <VisualizationCanvas steps={frame.steps} width={size.current.w} height={size.current.h} title={title} static />
      <div className="-mt-8 rounded-b-lg border border-t-0 border-[var(--rule)] bg-[var(--fill)] px-4 pb-4 pt-3 font-[var(--font-mono)] text-[13px]">
        <label className="flex items-center gap-3">
          <span className="w-10 shrink-0 font-semibold">{name}</span>
          <span className="relative flex-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={v}
              onChange={(e) => setV(+e.target.value)}
              aria-label={`${name} (${unit})`}
              className="w-full accent-[var(--accent)]"
            />
            {ths?.map((t) => (
              <span
                key={`${t.diode}${t.at}`}
                title={`${t.label}: ${fmtV(t.at)}`}
                className="pointer-events-none absolute -bottom-2.5 h-2 w-0.5 -translate-x-1/2"
                style={{ left: pct(t.at), background: toneOf(c.parts.find((p) => p.id === t.diode)!) }}
              />
            ))}
          </span>
          <span className="w-20 shrink-0 text-right tabular-nums">{fmtV(v)}</span>
        </label>

        {diodes.length > 0 && (
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {diodes.map((d) => {
              const st = sol.diodes[d.id];
              const on = st?.assumed === 'on';
              const knee = on && st.actual === 'off'; // ON del modelo pero I = 0: en el umbral, no conduce
              return (
                <li key={d.id} className="flex items-center gap-2 tabular-nums">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: on && !knee ? toneOf(d) : 'transparent', border: `1.5px solid ${toneOf(d)}` }} />
                  <span className="w-8 font-semibold">{d.label ?? d.id}</span>
                  <span className="w-9" style={{ color: on && !knee ? toneOf(d) : 'var(--muted)' }}>{st ? (on && !knee ? 'ON' : 'OFF') : '—'}</span>
                  <span style={{ color: 'var(--tone-current)' }} aria-label="hipótesis válida">{st?.valid ? '✓' : ''}</span>
                  <span className="text-[var(--muted)]">{st ? (knee ? `en el umbral: V_AK = ${formatSI(vfOf(d), 'V')}, I = 0` : on ? `I = ${formatSI(st.id, 'A')}` : `V_AK = ${formatSI(st.vd, 'V')}`) : ''}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className={`text-[var(--muted)] ${diodes.length ? 'mt-3 min-h-[1.25rem]' : 'hidden'}`}>
          {diodes.length > 0 && ths === null && 'calculando umbrales…'}
          {ths?.length === 0 && `Ningún diodo cambia de estado entre ${fmtV(min)} y ${fmtV(max)}.`}
          {ths?.map((t) => (
            <div key={`${t.diode}${t.at}`}>
              <b style={{ color: toneOf(c.parts.find((p) => p.id === t.diode)!) }}>{t.label}</b>{' '}
              {t.becomes === 'on' ? 'conduce desde' : 'deja de conducir desde'} {name} = {fmtV(t.at)}
            </div>
          ))}
        </div>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
          {readCurrents.map((x) => (
            <div key={x.id} className="flex min-w-[9rem] gap-2">
              <dt className="text-[var(--muted)]">{plain(x.label)} =</dt>
              <dd>{sol.ok ? formatSI(x.sign * sol.currents[x.id], 'A') : '—'}</dd>
            </div>
          ))}
          {readNodes.map((n) => (
            <div key={n.id} className="flex min-w-[9rem] gap-2">
              <dt className="text-[var(--muted)]">V({n.label}) =</dt>
              <dd>{sol.ok ? formatSI(sol.potentials[n.id], 'V') : '—'}</dd>
            </div>
          ))}
        </dl>
        {sol.reason && <p className="mt-2 text-[var(--muted)]">{sol.reason}</p>}
      </div>
    </div>
  );
}
