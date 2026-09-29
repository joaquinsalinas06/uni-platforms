# Reglas para agentes de contenido (una semana por agente)

## Qué leer
1. `AGENTS.md`.
2. `content/knowledge-map.json`: tu semana (`units[i]`), sus temas y los `subtopics` EXACTOS.
3. `raw-materials/text/<deck>.txt` de tus `sourceSlides`. Primero el texto. Después abre
   con Read SOLO las páginas PNG que necesites (`raw-materials/pages/<deck>/p-NN.png`),
   sobre todo circuitos, tablas y diagramas. El número de página sale del texto
   (`\f` separa páginas; `grep -n` ayuda).
4. `raw-materials/EP-2025II.pdf` y `EP-2026I.pdf` (o sus PNG en `raw-materials/pages/EP-*`):
   así preguntan. Cada tema termina con preguntas tipo examen en ese estilo.
5. `templates/`: meta.yaml, theory.mdx, subtopic.mdx y **circuit-examples.mdx** (cómo se
   escriben los circuitos).
6. `src/lib/schemas.ts`: el contrato. Si no valida, el build falla.

## Dónde escribes
SOLO `content/topics/<tus-ids>/` y `content/units/<tu-semana>.md`. Prohibido tocar `src/`,
`scripts/`, `templates/`, `knowledge-map.json` y los temas de otras semanas. NO corras
`pnpm build`. SÍ puedes correr `pnpm check` y `node scripts/validate-viz.mjs <archivo>`
(valida tus bloques de visualización contra el schema).

Escribe cada archivo apenas lo termines, sin acumular todo para el final: si te cortan por
límite, lo escrito queda.

## Estructura de cada página (theory.mdx y cada subtopics/*.mdx)
Títulos `##` SIN numerar, en este orden (omite una sección solo si de verdad no aplica):
- `## Idea`: qué problema resuelve, en 3-5 líneas.
- `## Conceptos`: definiciones, clasificaciones, tablas y fórmulas ($…$ y $$…$$).
- `## Método paso a paso`: cómo se resuelve un ejercicio de esto, como lo hace el profe.
- `## Ejemplo resuelto`: los ejemplos de las slides, resueltos completos y con unidades.
- `## Errores típicos`
- `## Pregunta tipo examen`: 1-3 `<ExerciseBlock client:visible exercise={{ level, statement,
  hints: [...], solution }} />` en el estilo de los parciales.

Usa `###` para subdividir. Un tema CON subtopics usa theory.mdx como panorama corto que
enlaza a sus subtemas (`/topics/<id>/subtopics/<name>`). Los subtemas llevan
`kind: subtopic` y `order`.

## Fidelidad
- Todo como lo enseñó el profe. Lo que falta y es indispensable va como Nota de apoyo.
- Ejemplos numéricos que no están en el material: márcalos *(derivado)*.
- Erratas evidentes: corrígelas en silencio.
- Inconsistencias entre slides (p. ej. dos alcances distintos para Zigbee): muéstralas.
- No hay código, salvo la semana 4 (Arduino): fragmentos estáticos cortos en bloques ```cpp,
  solo porque el parcial pidió leer y corregir código.

## Diagramas: cuántos y cuáles
Ser generoso: todo lo explicable con una figura lleva figura, a mitad de la prosa y
justo donde se explica. En circuitos, UN PASO POR IDEA:
- identificar nodos → marcar un grupo serie (tone series) → fundir → marcar un grupo
  paralelo (tone parallel) → fundir → … → Req;
- malla por malla, recorriendo con `kvl: {loop, upto: k}` pieza por pieza;
- diodos: hipótesis → modelo → resolver → validar → si falla, `answer` + nueva hipótesis.

El `note` de cada paso dice QUÉ mirar y POR QUÉ. Las etiquetas van cortas ("R1", "E").

**No escribas ecuaciones ni resultados a mano en los circuitos**: pon `expect` con los
valores que te da el material (o los que calculas); el solver los verifica.

Si el schema no te alcanza para un diagrama, NO lo cambies: escribe lo más cercano y
reporta en tu respuesta final qué campo faltó.

## meta.yaml
Tiene que coincidir con el mapa en `unit`, `type`, `hasVisualization`, `prerequisites`,
`buildsOn` y `usedBy`. `formulas[]` lleva todas las fórmulas del tema (name, tex sin $,
reasoning ≥ 20 caracteres, source "deck#pág"). Pon entre comillas dobles todo string con ": ".

## Respuesta final (≤ 15 líneas)
Archivos escritos, diagramas por archivo, campos de schema que faltaron y dudas del material.
