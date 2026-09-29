import { useMemo, useState, type ReactNode } from 'react';
import { renderRich } from './rich-text.ts';

export type Exercise = {
  level: number;
  statement: string;
  hints: string[];
  solution?: string;
};

function Rich({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderRich(text), [text]);
  return <div className={`rich ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

const LEVEL_NAMES = ['', 'reconocer', 'trazar', 'implementar', 'adaptar', 'diseñar', 'demostrar'];

/**
 * Restricción del brief: la solución nunca aparece antes de las pistas.
 * Sólo se destraba cuando se han pedido todas.
 */
/**
 * La solución puede venir de dos formas:
 *  · `exercise.solution` (texto corto, markdown en línea + KaTeX), o
 *  · como HIJOS del componente en MDX: markdown completo con $$…$$, listas,
 *    tablas y <Visualization/> (p.ej. el circuito resuelto). Se renderiza en
 *    el servidor y queda oculto (`hidden`) hasta que se piden todas las pistas.
 */
export default function ExerciseBlock({ exercise, children }: { exercise: Exercise; children?: ReactNode }) {
  const [shown, setShown] = useState(0);
  const [solved, setSolved] = useState(false);

  const allHintsShown = shown >= exercise.hints.length;

  return (
    <section className="reveal overflow-hidden rounded-lg border border-[var(--rule)]">
      {/* Espaciado del markdown en línea (renderRich): sin tocar global.css. */}
      <style>{`.rich>*+*{margin-top:.6em}.rich-list{padding-left:1.25em}.rich-list>li+li{margin-top:.2em}.rich code{font-family:var(--font-mono);font-size:.88em;background:var(--sunken);padding:.05em .3em;border-radius:3px}.rich .katex-display{margin:.5em 0;overflow-x:auto;overflow-y:hidden}`}</style>
      <header className="flex items-center gap-3 border-b border-[var(--rule)] bg-[var(--fill)] px-5 py-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent)] font-mono text-[0.75rem] font-medium text-[var(--accent-ink)]">
          {exercise.level}
        </span>
        <span className="tag">{LEVEL_NAMES[exercise.level]}</span>
        {/* Escalera de dificultad: se ve de un vistazo qué tan lejos está este de la base. */}
        <span className="ml-auto flex items-end gap-[3px]" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span
              key={n}
              className={`w-[3px] rounded-sm ${
                n <= exercise.level ? 'bg-[var(--accent)]' : 'bg-[var(--rule)]'
              }`}
              style={{ height: `${4 + n * 2}px` }}
            />
          ))}
        </span>
      </header>

      <div className="px-5 py-5">
        <Rich text={exercise.statement} className="max-w-[72ch] text-[1.0625rem] leading-relaxed" />

        {shown > 0 && (
          <ol className="mt-5 space-y-2.5">
            {exercise.hints.slice(0, shown).map((h, idx) => (
              <li
                key={idx}
                className="flex max-w-[72ch] gap-3 rounded-r border-l-2 border-[var(--accent)] bg-[var(--accent-wash)] py-2.5 pr-4 pl-3.5 text-[0.9375rem]"
                style={{ animation: 'reveal .4s cubic-bezier(.2,.7,.3,1) both' }}
              >
                <span className="tag flex-none pt-1">{idx + 1}</span>
                <Rich text={h} className="min-w-0" />
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!allHintsShown && (
            <button
              onClick={() => setShown((s) => s + 1)}
              className="rounded border border-[var(--rule)] px-3 py-1.5 text-[0.8125rem] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              pista {shown + 1} de {exercise.hints.length}
            </button>
          )}

          {(exercise.solution || children) &&
            (allHintsShown ? (
              <button
                onClick={() => setSolved((s) => !s)}
                className="rounded bg-[var(--accent)] px-3 py-1.5 text-[0.8125rem] font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90"
              >
                {solved ? 'ocultar solución' : 'ver solución'}
              </button>
            ) : (
              <span className="tag">
                solución bloqueada · faltan {exercise.hints.length - shown} pistas
              </span>
            ))}
        </div>

        {solved && exercise.solution && !children && (
          <div
            className="mt-5 max-w-[72ch] rounded border border-[var(--rule)] bg-[var(--fill)] px-4 py-3.5"
            style={{ animation: 'reveal .4s cubic-bezier(.2,.7,.3,1) both' }}
          >
            <p className="tag mb-1.5">solución</p>
            <Rich text={exercise.solution} className="text-[0.9375rem] leading-relaxed" />
          </div>
        )}
        {children && (
          <div
            hidden={!solved}
            className="exercise-solution mt-5 rounded border border-[var(--rule)] bg-[var(--fill)] px-4 py-4 sm:px-5"
            style={solved ? { animation: 'reveal .4s cubic-bezier(.2,.7,.3,1) both' } : undefined}
          >
            <p className="tag mb-2">solución paso a paso</p>
            <div className="prose max-w-none text-[0.9375rem]">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}
