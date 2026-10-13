import { extractPageTechnicalDetails } from './dom-extractor';
import type { AiProvider, SelectionScope, SelectionState } from './types';

/**
 * Moldea el prompt según el alcance seleccionado (solo selección, selección + toda la página
 * o página completa), inyectando el link en vivo del usuario y los detalles de KaTeX y diagramas.
 */
export function buildMoldedPrompt(options: {
  selection: SelectionState | null;
  scope: SelectionScope;
  customQuestion: string;
  includeFullMarkdown?: boolean;
}): string {
  const { selection, scope, customQuestion, includeFullMarkdown = false } = options;
  const page = extractPageTechnicalDetails();
  const question = customQuestion.trim();

  if (selection && selection.text && scope === 'selection-only') {
    const parts: string[] = [
      `Estoy revisando un fragmento específico de la página "${page.pageTitle}" (${page.courseLabel}).`,
      `Enlace de referencia: ${page.currentUrl}`,
      '',
      'Analiza únicamente esta parte seleccionada:',
      '"""',
      selection.text.slice(0, 1800),
      '"""',
    ];

    if (selection.latexFormulas.length > 0) {
      parts.push(
        `\nConsidera que este fragmento contiene las siguientes expresiones matemáticas en KaTeX/LaTeX:\n${selection.latexFormulas.slice(0, 10).join(', ')}`
      );
    }
    if (selection.diagramNotes.length > 0) {
      parts.push(
        `\nConsidera además el funcionamiento de este diagrama incluido en la selección:\n${selection.diagramNotes.join('\n')}`
      );
    }

    parts.push(
      '',
      question
        ? `Pregunta directa: ${question}`
        : 'Explícame paso a paso y de forma rigurosa únicamente este fragmento seleccionado (su significado, intuición y fórmulas si las tiene).'
    );
    return parts.join('\n');
  }

  if (selection && selection.text && scope === 'selection-with-page') {
    const parts: string[] = [
      `Ve a este enlace y lee el contenido de la página "${page.pageTitle}" (${page.courseLabel}):`,
      page.currentUrl,
      '',
      'Dentro de toda la página, mi consulta se centra en esta parte que seleccioné:',
      '"""',
      selection.text.slice(0, 1400),
      '"""',
      '',
      'Para complementar tu lectura del enlace, considera estos detalles técnicos de la página:',
    ];

    if (page.headings.length > 0) {
      parts.push(`• Estructura de secciones: ${page.headings.slice(0, 10).join(' → ')}`);
    }
    if (page.katexFormulas.length > 0) {
      parts.push(
        `• Expresiones matemáticas en KaTeX/LaTeX presentes en la página: ${page.katexFormulas.slice(0, 12).join(' ; ')}`
      );
    }
    if (page.diagrams.length > 0) {
      parts.push(
        `• Cómo funcionan los diagramas interactivos de la página:\n${page.diagrams.join('\n').slice(0, 1200)}`
      );
    }

    parts.push(
      '',
      question
        ? `Pregunta directa: ${question}`
        : 'Explícame en detalle el fragmento seleccionado y cómo se relaciona con el resto de la teoría, las fórmulas en KaTeX y los diagramas de la página.'
    );
    return parts.join('\n');
  }

  const parts: string[] = [
    `Ve a este enlace y analiza la página "${page.pageTitle}" (${page.courseLabel}):`,
    page.currentUrl,
    '',
    'Para complementar tu lectura del enlace, considera estos detalles técnicos de la página:',
  ];

  if (page.headings.length > 0) {
    parts.push(`• Secciones del tema: ${page.headings.slice(0, 12).join(' → ')}`);
  }
  if (page.katexFormulas.length > 0) {
    parts.push(
      `• Fórmulas en KaTeX/LaTeX que utiliza la página: ${page.katexFormulas.slice(0, 14).join(' ; ')}`
    );
  }
  if (page.diagrams.length > 0) {
    parts.push(
      `• Diagramas interactivos en la página y cómo funcionan paso a paso:\n${page.diagrams.join('\n').slice(0, 1400)}`
    );
  }

  if (includeFullMarkdown && page.fullMarkdown) {
    parts.push('\nContenido en Markdown de respaldo:\n"""\n' + page.fullMarkdown.slice(0, 1800) + '\n"""');
  }

  parts.push(
    '',
    question
      ? `Pregunta directa: ${question}`
      : 'Explícame los conceptos clave de esta página paso a paso, incluyendo la intuición de sus fórmulas matemáticas y cómo funcionan sus diagramas.'
  );

  return parts.join('\n');
}

export function buildProviderUrl(provider: AiProvider, prompt: string): string {
  const encoded = encodeURIComponent(prompt);
  switch (provider) {
    case 'chatgpt':
      return `https://chatgpt.com/?hints=search&q=${encoded}`;
    case 'claude':
      return `https://claude.ai/new?q=${encoded}`;
    case 'perplexity':
      return `https://www.perplexity.ai/search?q=${encoded}`;
  }
}

export function formatFullMarkdownDocument(): string {
  const page = extractPageTechnicalDetails();
  const lines = [
    `# ${page.pageTitle}`,
    `Curso: ${page.courseLabel}`,
    `Enlace: ${page.currentUrl}`,
    '',
  ];
  if (page.katexFormulas.length > 0) {
    lines.push('## Fórmulas en KaTeX / LaTeX', page.katexFormulas.join('\n'), '');
  }
  if (page.diagrams.length > 0) {
    lines.push('## Diagramas Interactivos', page.diagrams.join('\n\n'), '');
  }
  lines.push('## Contenido de la Página', page.fullMarkdown);
  return lines.join('\n');
}
