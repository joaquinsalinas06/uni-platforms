// Barra de pasos compartida por todas las visualizaciones: grupo ◀ ⏯ ▶, una
// línea de tiempo segmentada (un tramo por paso; mientras reproduce, el tramo
// siguiente se llena durante la espera del autoplay) y un contador "3 / 8".
//
// Estilos propios en un <style> con `href`/`precedence` (React 19 lo iza al
// <head> y lo deduplica): no dependen de que Tailwind de cada app escanee
// este paquete. Sólo tokens del tema (--accent, --rule, --paper…), así claro y
// oscuro salen solos. prefers-reduced-motion apaga toda animación.
import { useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';

const CSS = `
.vc-bar{container-type:inline-size;border-top:1px solid var(--rule);background:var(--fill);padding:10px 14px 12px}
.vc-row{display:flex;align-items:center;gap:14px}
.vc-cluster{display:flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--rule);border-radius:999px;background:var(--paper);flex:none}
.vc-btn{all:unset;box-sizing:border-box;display:grid;place-items:center;width:36px;height:36px;border-radius:999px;color:var(--ink);cursor:pointer;transition:background-color .18s ease,color .18s ease,transform .12s ease,opacity .18s ease;-webkit-tap-highlight-color:transparent}
.vc-btn:hover{background:var(--sunken)}
.vc-btn:active{transform:scale(.92)}
.vc-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.vc-btn:disabled{cursor:default;color:var(--faint);opacity:.55;background:none;transform:none}
.vc-btn svg{width:18px;height:18px;transition:transform .2s cubic-bezier(.2,.7,.3,1)}
.vc-btn.vc-prev:hover:not(:disabled) svg{transform:translateX(-2px)}
.vc-btn.vc-next:hover:not(:disabled) svg{transform:translateX(2px)}
.vc-play{width:40px;height:40px;margin:0 2px;background:var(--accent);color:var(--accent-ink);box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 12%,transparent),0 4px 14px -6px var(--accent)}
.vc-play:hover{background:color-mix(in srgb,var(--accent) 86%,var(--ink))}
.vc-glyphs{position:relative;width:18px;height:18px}
.vc-glyphs svg{position:absolute;inset:0;transition:opacity .22s ease,transform .3s cubic-bezier(.2,.7,.3,1.2)}
.vc-glyphs svg[data-on="false"]{opacity:0;transform:scale(.4) rotate(-90deg)}
.vc-glyphs svg[data-on="true"]{opacity:1;transform:none}
.vc-track{position:relative;flex:1;min-width:0;height:32px;display:flex;align-items:center;gap:3px;cursor:pointer;touch-action:none;outline:none;border-radius:6px}
.vc-track:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.vc-seg{position:relative;flex:1;height:4px;border-radius:999px;background:color-mix(in srgb,var(--muted) 22%,transparent);overflow:hidden;transition:height .18s ease}
.vc-track:hover .vc-seg,.vc-track[data-drag="true"] .vc-seg{height:7px}
.vc-seg i{position:absolute;inset:0;border-radius:inherit;background:var(--accent);transform-origin:left;transform:scaleX(0);transition:transform .28s cubic-bezier(.2,.7,.3,1)}
.vc-seg[data-fill="done"] i{transform:scaleX(1)}
.vc-seg[data-fill="now"] i{transform:scaleX(1)}
.vc-seg[data-fill="next"] i{transform:scaleX(1);opacity:.55;transition:none;animation:vc-fill var(--vc-dur,1.5s) linear both}
.vc-seg[data-hover="true"]{background:color-mix(in srgb,var(--muted) 40%,transparent)}
@keyframes vc-fill{from{transform:scaleX(0)}}
.vc-tip{position:absolute;bottom:calc(100% - 2px);transform:translateX(-50%);padding:2px 7px;border-radius:5px;background:var(--ink);color:var(--paper);font:500 11px/1.4 var(--font-mono);white-space:nowrap;pointer-events:none;animation:vc-pop .14s ease-out both}
@keyframes vc-pop{from{opacity:0;transform:translate(-50%,3px)}}
.vc-count{flex:none;display:flex;align-items:baseline;gap:4px;font:500 13px/1 var(--font-mono);color:var(--muted);font-variant-numeric:tabular-nums;min-width:4.2em;justify-content:flex-end}
.vc-count b{display:inline-block;color:var(--ink);font-weight:600;overflow:hidden;height:1.15em;line-height:1.15em}
.vc-count b span{display:inline-block;animation:vc-digit .26s cubic-bezier(.2,.7,.3,1) both}
.vc-count b span[data-dir="-1"]{animation-name:vc-digit-back}
@keyframes vc-digit{from{transform:translateY(100%);opacity:0}}
@keyframes vc-digit-back{from{transform:translateY(-100%);opacity:0}}
.vc-note-in{animation:vc-note .26s cubic-bezier(.2,.7,.3,1) both}
@keyframes vc-note{from{opacity:0;transform:translateY(4px)}}
@container (max-width: 30rem){
  .vc-bar{padding:6px 12px 10px}
  .vc-row{flex-wrap:wrap;gap:2px 10px}
  .vc-track{order:-1;flex-basis:100%}
  .vc-count{margin-left:auto}
}
@media (prefers-reduced-motion: reduce){
  .vc-bar *,.vc-note-in{animation:none!important;transition:none!important}
  .vc-seg[data-fill="next"] i{transform:scaleX(0)}
}
`;

/** Hoja de estilos de la barra (una sola vez por página). */
export const StepControlsStyle = () => (
  <style href="uni-vc-step-controls" precedence="default">
    {CSS}
  </style>
);

const Chevron = ({ dir }: { dir: -1 | 1 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir < 0 ? 'M14.5 6l-6 6 6 6' : 'M9.5 6l6 6-6 6'} />
  </svg>
);

type Mode = 'play' | 'pause' | 'replay';

function PlayGlyph({ mode }: { mode: Mode }) {
  return (
    <span className="vc-glyphs" aria-hidden="true">
      <svg viewBox="0 0 24 24" data-on={mode === 'play'}>
        <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 24 24" data-on={mode === 'pause'}>
        <rect x="6.5" y="5" width="4" height="14" rx="1.3" fill="currentColor" />
        <rect x="13.5" y="5" width="4" height="14" rx="1.3" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 24 24" data-on={mode === 'replay'} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
        <path d="M4.5 4.5v4h4" />
      </svg>
    </span>
  );
}

export function StepControls({ i, n, playing, delay, onGo, onSet, onToggle }: {
  i: number;
  n: number;
  playing: boolean;
  /** Espera del autoplay en este paso (ms): el tramo siguiente se llena en ese tiempo. */
  delay: number;
  onGo: (d: number) => void;
  onSet: (k: number) => void;
  onToggle: () => void;
}) {
  const last = n - 1;
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const prev = useRef(i);
  const dir = i >= prev.current ? 1 : -1;
  prev.current = i;
  const mode: Mode = playing ? 'pause' : i >= last ? 'replay' : 'play';

  const at = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(last, Math.floor(((e.clientX - r.left) / r.width) * n)));
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    onSet(at(e));
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const k = at(e);
    setHover(k);
    if (drag && k !== i) onSet(k);
  };
  const up = () => setDrag(false);
  const tip = drag ? i : hover;

  return (
    <div className="vc-bar">
      <StepControlsStyle />
      <div className="vc-row">
        <div className="vc-cluster" role="group" aria-label="Controles de reproducción">
          <button type="button" className="vc-btn vc-prev" onClick={() => onGo(-1)} disabled={i === 0} aria-label="Paso anterior" title="Paso anterior (←)">
            <Chevron dir={-1} />
          </button>
          <button
            type="button"
            className="vc-btn vc-play"
            onClick={onToggle}
            aria-label={mode === 'pause' ? 'Pausar' : mode === 'replay' ? 'Repetir' : 'Reproducir'}
            title={mode === 'pause' ? 'Pausar (Espacio)' : mode === 'replay' ? 'Repetir desde el inicio' : 'Reproducir (Espacio)'}
          >
            <PlayGlyph mode={mode} />
          </button>
          <button type="button" className="vc-btn vc-next" onClick={() => onGo(1)} disabled={i === last} aria-label="Paso siguiente" title="Paso siguiente (→)">
            <Chevron dir={1} />
          </button>
        </div>

        {/* Las flechas del teclado las atiende la <figure> (el evento sube). */}
        <div
          ref={track}
          className="vc-track"
          role="slider"
          tabIndex={0}
          aria-label="Paso"
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={i + 1}
          aria-valuetext={`Paso ${i + 1} de ${n}`}
          data-drag={drag}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={() => !drag && setHover(null)}
        >
          {Array.from({ length: n }, (_, k) => (
            <span
              key={k}
              className="vc-seg"
              data-fill={k < i ? 'done' : k === i ? 'now' : playing && k === i + 1 ? 'next' : 'todo'}
              data-hover={hover === k}
              style={k === i + 1 && playing ? ({ '--vc-dur': `${delay}ms` } as CSSProperties) : undefined}
            >
              {/* Remontar al cambiar de paso reinicia la cuenta regresiva del tramo. */}
              <i key={k === i + 1 && playing ? `run-${i}` : 'idle'} />
            </span>
          ))}
          {tip !== null && (
            <span key={tip} className="vc-tip" style={{ left: `${((tip + 0.5) / n) * 100}%` }}>
              paso {tip + 1}
            </span>
          )}
        </div>

        <div className="vc-count" aria-hidden="true">
          <b>
            <span key={i} data-dir={dir}>{i + 1}</span>
          </b>
          <span>/ {n}</span>
        </div>
      </div>
    </div>
  );
}
