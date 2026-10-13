import { useEffect, useRef, useState, type RefObject } from 'react';
import { AiSparkleIcon } from './AiSparkleIcon';
import type { AiProvider, SelectionScope, SelectionState } from './types';

interface Props {
  popoverRef: RefObject<HTMLDivElement | null>;
  selection: SelectionState;
  scope: SelectionScope;
  onScopeChange: (scope: SelectionScope) => void;
  question: string;
  onQuestionChange: (q: string) => void;
  onLaunch: (provider: AiProvider, scope: SelectionScope) => void;
}

/**
 * Componente de interfaz dedicado exclusivamente al popover flotante
 * cuando el usuario subraya texto, fórmulas o diagramas en la página.
 */
export function SelectionPopover({
  popoverRef,
  selection,
  scope,
  onScopeChange,
  question,
  onQuestionChange,
  onLaunch,
}: Props) {
  const [askInputOpen, setAskInputOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (askInputOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [askInputOpen]);

  const style = {
    top: `${Math.max(12, Math.min(window.innerHeight - 130, selection.rect.top - 52))}px`,
    left: `${Math.max(170, Math.min(window.innerWidth - 170, selection.rect.left))}px`,
  };

  return (
    <div
      ref={popoverRef}
      data-ai-widget="selection-popover"
      style={style}
      className="fixed z-50 -translate-x-1/2 rounded-lg border border-[var(--accent)] bg-[var(--paper)] p-1.5 shadow-xl"
    >
      <div className="flex flex-wrap items-center gap-1">
        <span className="inline-flex items-center gap-1 px-1.5 font-mono text-[0.6875rem] font-medium text-[var(--accent)]">
          <AiSparkleIcon size={13} />
          IA
        </span>

        <div
          className="inline-flex rounded border border-[var(--rule)] bg-[var(--fill)] p-0.5"
          role="group"
          aria-label="Alcance de la consulta"
        >
          <button
            type="button"
            onClick={() => onScopeChange('selection-only')}
            className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] transition-colors ${
              scope === 'selection-only'
                ? 'bg-[var(--accent)] font-medium text-[var(--accent-ink)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            title="Enviar solo el fragmento seleccionado"
          >
            solo selección
          </button>
          <button
            type="button"
            onClick={() => onScopeChange('selection-with-page')}
            className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] transition-colors ${
              scope === 'selection-with-page'
                ? 'bg-[var(--accent)] font-medium text-[var(--accent-ink)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            title="Enviar la selección junto con el link y detalles de toda la página"
          >
            + toda la pág.
          </button>
        </div>

        <button
          type="button"
          onClick={() => onLaunch('chatgpt', scope)}
          className="rounded bg-[var(--accent)] px-2 py-1 font-mono text-[0.6875rem] font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90"
        >
          Abrir GPT ↗
        </button>

        <button
          type="button"
          onClick={() => onLaunch('claude', scope)}
          className="rounded border border-[var(--rule)] px-2 py-1 font-mono text-[0.6875rem] text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Claude ↗
        </button>

        <button
          type="button"
          onClick={() => setAskInputOpen((v) => !v)}
          className={`rounded border px-2 py-1 font-mono text-[0.6875rem] transition-colors ${
            askInputOpen
              ? 'border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent)]'
              : 'border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          preguntar…
        </button>
      </div>

      {askInputOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLaunch('chatgpt', scope);
          }}
          className="mt-1.5 flex items-center gap-1 border-t border-[var(--rule)] pt-1.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder={
              scope === 'selection-only'
                ? 'Pregunta sobre este fragmento…'
                : 'Pregunta sobre esto en el contexto de la página…'
            }
            className="w-60 rounded border border-[var(--rule)] bg-[var(--fill)] px-2 py-1 text-[0.75rem] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded bg-[var(--accent)] px-2 py-1 font-mono text-[0.6875rem] font-medium text-[var(--accent-ink)]"
          >
            GPT ↗
          </button>
        </form>
      )}
    </div>
  );
}
