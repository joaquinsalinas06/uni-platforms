import { useState } from 'react';

export type Exercise = {
  level: number;
  statement: string;
  hints: string[];
  solution?: string;
};

const LEVEL_NAMES = ['', 'reconocer', 'trazar', 'implementar', 'adaptar', 'diseñar', 'demostrar'];

/**
 * Restricción del brief: la solución nunca aparece antes de las pistas.
 * Sólo se destraba cuando se han pedido todas.
 */
export default function ExerciseBlock({ exercise }: { exercise: Exercise }) {
  const [shown, setShown] = useState(0);
  const [solved, setSolved] = useState(false);

  const allHintsShown = shown >= exercise.hints.length;

  return (
    <section className="reveal overflow-hidden rounded-lg border border-[var(--rule)]">
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
        <p className="max-w-[72ch] text-[1.0625rem] leading-relaxed">{exercise.statement}</p>

        {shown > 0 && (
          <ol className="mt-5 space-y-2.5">
            {exercise.hints.slice(0, shown).map((h, idx) => (
              <li
                key={idx}
                className="flex max-w-[72ch] gap-3 rounded-r border-l-2 border-[var(--accent)] bg-[var(--accent-wash)] py-2.5 pr-4 pl-3.5 text-[0.9375rem]"
                style={{ animation: 'reveal .4s cubic-bezier(.2,.7,.3,1) both' }}
              >
                <span className="tag flex-none pt-1">{idx + 1}</span>
                <span>{h}</span>
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

          {exercise.solution &&
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

        {solved && exercise.solution && (
          <div
            className="mt-5 max-w-[72ch] rounded border border-[var(--rule)] bg-[var(--fill)] px-4 py-3.5"
            style={{ animation: 'reveal .4s cubic-bezier(.2,.7,.3,1) both' }}
          >
            <p className="tag mb-1.5">solución</p>
            <p className="text-[0.9375rem] leading-relaxed">{exercise.solution}</p>
          </div>
        )}
      </div>
    </section>
  );
}
