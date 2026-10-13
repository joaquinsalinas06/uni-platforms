export type AiProvider = 'chatgpt' | 'claude' | 'perplexity';
export type SelectionScope = 'selection-only' | 'selection-with-page';

export interface SelectionState {
  text: string;
  latexFormulas: string[];
  diagramNotes: string[];
  rect: { top: number; left: number; bottom: number; width: number };
}

export interface PageTechnicalDetails {
  pageTitle: string;
  courseLabel: string;
  currentUrl: string;
  headings: string[];
  katexFormulas: string[];
  diagrams: string[];
  fullMarkdown: string;
}
