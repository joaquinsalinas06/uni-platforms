import { useEffect, useMemo, useRef, useState } from 'react';
import { rank } from '../lib/search';
import type { SearchEntry } from '../lib/search-index';

/**
 * Buscador Ctrl-K sobre los 33 temas del knowledge map y sus operaciones.
 * Sin índice externo: el índice ya viene construido desde el server
 * (buildSearchIndex) y aquí sólo se filtra por subcadena.
 */
export default function SearchDialog({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => rank(index, query).slice(0, 20), [index, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        returnFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // Foco al abrir: un frame después de montar el input.
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      returnFocus.current?.focus();
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const close = () => setOpen(false);
  const go = (href: string) => {
    close();
    window.location.href = href;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r?.ready) go(r.href);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          returnFocus.current = document.activeElement as HTMLElement | null;
          setOpen(true);
        }}
        className="tag hidden items-center gap-2 rounded border border-[var(--rule)] px-2.5 py-1 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] lg:flex"
        aria-label="Buscar temas y operaciones"
      >
        buscar
        <kbd className="rounded border border-[var(--rule)] px-1 font-mono text-[0.625rem] normal-case">⌘K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar temas y operaciones"
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[var(--rule)] bg-[var(--paper)] shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un tema o una operación…"
          aria-activedescendant={results[active] ? `result-${active}` : undefined}
          role="combobox"
          aria-expanded={results.length > 0}
          className="w-full border-b border-[var(--rule)] bg-transparent px-4 py-3.5 text-[0.9375rem] outline-none placeholder:text-[var(--faint)]"
        />

        {query && results.length === 0 && (
          <p className="px-4 py-6 text-center text-[0.875rem] text-[var(--faint)]">sin resultados</p>
        )}

        {results.length > 0 && (
          <ul role="listbox" className="max-h-[60vh] overflow-y-auto py-1.5">
            {results.map((r, i) => (
              <li key={r.href} id={`result-${i}`} role="option" aria-selected={i === active}>
                <button
                  onClick={() => go(r.href)}
                  onMouseEnter={() => setActive(i)}
                  disabled={!r.ready}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                    i === active ? 'bg-[var(--accent-wash)]' : ''
                  } ${r.ready ? '' : 'cursor-default opacity-40'}`}
                >
                  <span className="tag w-16 shrink-0">{r.kind === 'topic' ? 'tema' : 'operación'}</span>
                  <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{r.title}</span>
                  <span className="tag shrink-0 truncate">{r.subtitle}</span>
                  {!r.ready && <span className="tag shrink-0">pendiente</span>}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-3 border-t border-[var(--rule)] bg-[var(--fill)] px-4 py-2">
          <span className="tag">↑↓ navegar</span>
          <span className="tag">↵ ir</span>
          <span className="tag ml-auto">esc cerrar</span>
        </div>
      </div>
    </div>
  );
}
