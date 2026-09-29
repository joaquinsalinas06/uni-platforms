// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  // Sätteri (el procesador nativo, por defecto desde Astro 7) no corre plugins
  // remark/rehype del ecosistema unified. El curso es análisis amortizado
  // (sumatorias, potencial, series geométricas), así que se necesita
  // remark-math + rehype-katex: se vuelve al procesador `unified` de
  // @astrojs/markdown-remark sólo para eso.
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },

  vite: {
    plugins: [tailwindcss()]
  },

  // Sin esto, cada click en una pestaña (teoría/operaciones/ejemplos...) es
  // una navegación de página completa desde cero: pedir el HTML, parsear,
  // hidratar los islands de React del diagrama — la espera perceptible que
  // se reportó. Con prefetch en "viewport", Astro precarga el HTML de cada
  // link del nav apenas entra en pantalla, así que para cuando el usuario
  // hace click ya está en caché y la navegación se siente instantánea.
  prefetch: {
    defaultStrategy: 'viewport',
  },

  adapter: vercel()
});