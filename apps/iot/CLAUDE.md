# Internet de las Cosas (CS5055, UTEC) — plataforma de estudio

Clonada de CPD-Platform: Astro 7 + React 19 + Tailwind v4 + KaTeX. Es un curso
**teórico y de circuitos**. No hay editor de código.

## Principio rector
Una sola fuente de verdad: **`content/knowledge-map.json`** (semanas `s1..s7`, luego
temas, luego subtemas). Ningún agente inventa temas. El material fuente ya está
extraído:
- `raw-materials/text/<deck>.txt`: el texto de cada PDF (`pdftotext -layout`).
- `raw-materials/pages/<deck>/p-NN.png`: cada página renderizada. Ábrela con Read
  SOLO cuando el texto no alcance (circuitos, tablas, figuras). Nunca leas un PDF entero.
- `raw-materials/EP-2025II.pdf`, `EP-2026I.pdf`: los parciales, que marcan el nivel exigido.

## Comandos
```sh
pnpm dev | pnpm build | pnpm check | pnpm test
```
Siempre usar pnpm.

## Estructura
```
content/
  knowledge-map.json        ← sólo lo toca el agente de integración
  units/s1..s7.md           ← portada de cada semana
  topics/<id>/
    meta.yaml               ← id, title, type, unit, prereqs, formulas[]
    theory.mdx              ← el tema; sus `##` son secciones
    subtopics/<name>.mdx    ← un subtema por archivo; sus `##` son los sub-subtemas
  evaluaciones/parciales/*.md
  practica.md · formulario.md
src/lib/schemas.ts          ← TODOS los schemas Zod (contrato de visualizaciones)
src/visualizations/<family>/
```

## Visualizaciones
Familias: `circuit` (central) · `xy-chart` · `sequence` · `flow` · `dag` ·
`network-topology` · `timeline` · `memory-layout`. Cada spec es una lista de pasos; cada
paso es una foto completa y la animación sale de reutilizar keys.
- En `.mdx`: `import Visualization from '<rel>/src/components/Visualization.astro'` y
  `<Visualization viz={{ type: 'circuit', steps: [...] }} />`, tantas como hagan falta y en
  cualquier punto de la prosa. `static: true` = figura de un solo paso, sin controles.
- **Circuitos**: el contenido describe la TOPOLOGÍA (nodos, piezas, mallas, hipótesis);
  las ecuaciones y los números los calcula el solver. Toda respuesta numérica va en
  `expect`, y `pnpm test` la verifica.
- `state` (idle/active/marked/answer/shared/copied/muted) es el rol en el paso; sólo
  `active` usa `--accent`. `tone` (series/parallel/bridge/si/ge/mesh1-4/current) es el color
  semántico. Ambos vocabularios son cerrados.

## Restricciones
- No inventar temas. Lo que haga falta y no esté en el material va como
  `> **Nota de apoyo** (no está en el material): …`.
- Ninguna fórmula sin su razonamiento (`reasoning` ≥ 20 caracteres).
- Nunca mostrar la solución antes que las pistas.
- Sin gamificación, sin gradientes, sin animación decorativa.
