import { useCallback, useEffect, useRef, useState } from 'react';
import { AiSparkleIcon } from './AiSparkleIcon';
import { buildMoldedPrompt, buildProviderUrl, formatFullMarkdownDocument } from './prompt-builder';
import { SelectionPopover } from './SelectionPopover';
import type { AiProvider, SelectionScope } from './types';
import { usePageSelection } from './usePageSelection';

/**
 * Widget principal de consulta a IA en la esquina inferior derecha del layout.
 * Orquesta el panel desplegable y el popover de selección manteniendo
 * responsabilidad única de presentación.
 */
export default function AskAiWidget() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [copiedStatus, setCopiedStatus] = useState<'prompt' | 'md' | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);

  const onDiagramRequested = useCallback(() => setPanelOpen(true), []);
  const onEscape = useCallback(() => setPanelOpen(false), []);

  const { selection, setSelection, scope, setScope } = usePageSelection({
    widgetRef,
    popoverRef,
    onDiagramRequested,
    onEscape,
  });

  useEffect(() => {
    if (panelOpen) {
      const t = setTimeout(() => questionInputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [panelOpen]);

  const launchAi = (provider: AiProvider, overrideScope?: SelectionScope) => {
    const effectiveScope = overrideScope ?? scope;
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const prompt = buildMoldedPrompt({
      selection,
      scope: effectiveScope,
      customQuestion: question,
      includeFullMarkdown: isLocalhost,
    });

    navigator.clipboard?.writeText?.(prompt).catch(() => {});
    window.open(buildProviderUrl(provider, prompt), '_blank', 'noopener,noreferrer');
  };

  const copyText = async (type: 'prompt' | 'md') => {
    const content =
      type === 'md'
        ? formatFullMarkdownDocument()
        : buildMoldedPrompt({ selection, scope, customQuestion: question });
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStatus(type);
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch {
      // Ignorar si el navegador bloquea el portapapeles
    }
  };

  return (
    <>
      {selection && !panelOpen && (
        <SelectionPopover
          popoverRef={popoverRef}
          selection={selection}
          scope={scope}
          onScopeChange={setScope}
          question={question}
          onQuestionChange={setQuestion}
          onLaunch={launchAi}
        />
      )}

      <div
        ref={widgetRef}
        data-ai-widget="corner-dock"
        className="fixed right-5 bottom-5 z-40 flex flex-col items-end"
      >
        {panelOpen && (
          <div
            role="dialog"
            aria-label="Consultar IA sobre esta página"
            className="mb-2.5 w-[min(23rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-[var(--rule)] bg-[var(--paper)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--rule)] bg-[var(--fill)] px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-ink)]">
                  <AiSparkleIcon size={14} />
                </span>
                <div>
                  <p className="text-[0.8125rem] leading-tight font-semibold text-[var(--ink)]">
                    Consultar con IA
                  </p>
                  <p className="font-mono text-[0.65rem] text-[var(--muted)]">
                    link en vivo + KaTeX + diagramas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="tag rounded border border-transparent px-1.5 py-0.5 hover:border-[var(--rule)] hover:text-[var(--ink)]"
              >
                esc
              </button>
            </div>

            <div className="space-y-3 p-3.5">
              {selection ? (
                <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-wash)] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[0.6875rem] font-semibold text-[var(--accent)]">
                      Fragmento seleccionado
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelection(null)}
                      className="font-mono text-[0.65rem] text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      limpiar ×
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-2 font-mono text-[0.72rem] text-[var(--ink)]">
                    “{selection.text.slice(0, 140)}”
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScope('selection-only')}
                      className={`rounded border px-2 py-1 font-mono text-[0.6875rem] transition-colors ${
                        scope === 'selection-only'
                          ? 'border-[var(--accent)] bg-[var(--accent)] font-medium text-[var(--accent-ink)]'
                          : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Solo esta parte
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('selection-with-page')}
                      className={`rounded border px-2 py-1 font-mono text-[0.6875rem] transition-colors ${
                        scope === 'selection-with-page'
                          ? 'border-[var(--accent)] bg-[var(--accent)] font-medium text-[var(--accent-ink)]'
                          : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Parte + toda la pág.
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[0.78rem] leading-snug text-[var(--muted)]">
                  Envía el enlace actual junto con las expresiones <strong>KaTeX</strong> y cómo funcionan los <strong>diagramas</strong>.
                </p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  launchAi('chatgpt');
                }}
                className="space-y-2"
              >
                <label className="block font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--faint)]">
                  Pregunta directa (opcional)
                </label>
                <div className="flex gap-1.5">
                  <input
                    ref={questionInputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      selection ? '¿Qué quieres saber de esta selección?' : 'Ej: Explícame la fórmula o el diagrama…'
                    }
                    className="min-w-0 flex-1 rounded-md border border-[var(--rule)] bg-[var(--fill)] px-2.5 py-1.5 text-[0.8125rem] text-[var(--ink)] outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md bg-[var(--accent)] px-3 py-1.5 font-mono text-[0.75rem] font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90"
                  >
                    Preguntar ↗
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {(['chatgpt', 'claude', 'perplexity'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => launchAi(p)}
                    className="flex items-center justify-center gap-1 rounded-md border border-[var(--rule)] bg-[var(--fill)] px-2.5 py-2 font-mono text-[0.72rem] font-medium capitalize text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {p === 'chatgpt' ? 'ChatGPT' : p} ↗
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--rule)] pt-2.5">
                <button
                  type="button"
                  onClick={() => copyText('prompt')}
                  className="font-mono text-[0.6875rem] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {copiedStatus === 'prompt' ? '✓ prompt copiado' : 'copiar prompt + link'}
                </button>
                <button
                  type="button"
                  onClick={() => copyText('md')}
                  className="font-mono text-[0.6875rem] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {copiedStatus === 'md' ? '✓ MD copiado' : 'copiar MD completo'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {selection && !panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent-wash)] px-3 py-2 font-mono text-[0.72rem] font-medium text-[var(--accent)] shadow-lg transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              <span>selección activa</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-label="Consultar IA sobre esta página"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--paper)] px-3.5 py-2.5 font-mono text-[0.75rem] font-medium text-[var(--ink)] shadow-lg transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
              <AiSparkleIcon size={12} />
            </span>
            <span>consultar IA</span>
          </button>
        </div>
      </div>
    </>
  );
}
