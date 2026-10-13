import { useEffect, useState, type RefObject } from 'react';
import { serializeNodeWithKatex } from './dom-extractor';
import type { SelectionScope, SelectionState } from './types';

/**
 * Hook dedicado exclusivamente a capturar selecciones de texto/fórmulas/diagramas
 * dentro de <main> y clicks en el botón `[data-ask-diagram-btn]`.
 */
export function usePageSelection(options: {
  widgetRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
  onDiagramRequested?: () => void;
  onEscape?: () => void;
}) {
  const { widgetRef, popoverRef, onDiagramRequested, onEscape } = options;
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [scope, setScope] = useState<SelectionScope>('selection-with-page');

  useEffect(() => {
    const selectDiagramSummary = (summary: string) => {
      setSelection({
        text: `[Diagrama seleccionado]\n${summary}`,
        latexFormulas: [],
        diagramNotes: [summary],
        rect: {
          top: window.innerHeight - 180,
          left: window.innerWidth - 220,
          bottom: window.innerHeight - 140,
          width: 200,
        },
      });
      setScope('selection-with-page');
      onDiagramRequested?.();
    };

    const updateSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const main = document.querySelector('main');
      if (!main || !main.contains(range.commonAncestorContainer)) return;

      if (
        widgetRef.current?.contains(range.commonAncestorContainer) ||
        popoverRef.current?.contains(range.commonAncestorContainer)
      ) {
        return;
      }

      const serialized = serializeNodeWithKatex(range.cloneContents());
      const ancestorEl =
        range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? (range.commonAncestorContainer as HTMLElement)
          : range.commonAncestorContainer.parentElement;
      const parentDiag = ancestorEl?.closest('[data-ai-diagram]')?.getAttribute('data-ai-diagram');
      if (parentDiag && !serialized.diagramNotes.includes(parentDiag)) {
        serialized.diagramNotes.push(parentDiag);
      }

      const cleanText = serialized.text.trim();
      if (cleanText.length < 3 && serialized.diagramNotes.length === 0) return;

      const rect = range.getBoundingClientRect();
      setSelection({
        text: cleanText || serialized.diagramNotes.join('\n'),
        latexFormulas: serialized.latexFormulas,
        diagramNotes: serialized.diagramNotes,
        rect: {
          top: rect.top,
          left: rect.left + rect.width / 2,
          bottom: rect.bottom,
          width: rect.width,
        },
      });
    };

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest('[data-ask-diagram-btn]');
      if (!btn) return;
      const summary = btn.closest('[data-ai-diagram]')?.getAttribute('data-ai-diagram');
      if (summary) selectDiagramSummary(summary);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (
        widgetRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node) ||
        (e.target as HTMLElement | null)?.closest('[data-ask-diagram-btn]')
      ) {
        return;
      }
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setSelection(null);
        } else {
          updateSelection();
        }
      }, 15);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection(null);
        onEscape?.();
        return;
      }
      if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        updateSelection();
      }
    };

    const onPageLoad = () => {
      setSelection(null);
      onEscape?.();
    };

    document.addEventListener('click', onClick);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('astro:page-load', onPageLoad);

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('astro:page-load', onPageLoad);
    };
  }, [widgetRef, popoverRef, onDiagramRequested, onEscape]);

  return { selection, setSelection, scope, setScope };
}
