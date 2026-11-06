# Pasada "pizarra" (semanas 10–13) — brief compartido

Lo lee todo agente de esta tanda. Tu prompt sólo dice **qué estructura te toca**.

## Objetivo del usuario

Estas semanas se **estudian como teoría**, no como código: "como si fuera una pizarra":
ver las operaciones, que los diagramas expliquen las expresiones y las gráficas, leer una vez
y entender. El contenido que dejó Codex es correcto pero básico (≈150 líneas, 1–2 ejemplos,
diagramas con notas escuetas). Tu trabajo es **reescribirlo más rico**, no inventar temas.

## Alcance (reglas duras)

- Escribes **sólo** en `content/structures/<id>/` (`theory.mdx`, `examples.mdx`, `exercises.md`,
  `mastery-check.md`, `operations/*` si existe). `meta.yaml`: NO lo toques salvo
  `hasVisualization`/`visualizationType` si cambias de familia. Nada de `src/`, `knowledge-map.json`
  ni otras estructuras (enlázalas por id: `/structures/<id>`).
- **SIN CÓDIGO.** Ni ```cpp, ni `cppSteps`, ni editor, ni pseudocódigo en bloque de código. Los
  algoritmos se explican como **pasos numerados en prosa + diagrama paso a paso**. Los `.cpp` de
  `raw-materials/new/` (sais, manber-myers, dc3, black-order) sólo son fuente *conceptual*.
- No inventes: todo sale de las láminas. Algo imprescindible que no esté va marcado como
  concepto de apoyo (ver `CONTENT-AGENT-RULES.md`). Erratas del PDF se corrigen en silencio.
- Nunca navegador visible. NO corras `pnpm build`, `pnpm dev` ni `pnpm shot` (varios agentes en
  paralelo pisarían `dist/`): valida sólo con `node scripts/validate-viz.mjs content/structures/<id>`
  (debe terminar en `✓ N/N`). El build y las capturas los hace el integrador.

## Fuente

`content/analysis/weeks-10-13-fuentes.md` dice qué PDF de `raw-materials/new/` y qué páginas te
tocan. Léelas: `pdftotext -f A -l B -layout raw-materials/new/<pdf> -` (puedes volcar a
`/tmp/` el texto, no al repo). Las láminas explican con ejemplos concretos: **reutilízalos** como
ejemplo corrido de toda la página.

## Cómo debe quedar `theory.mdx`

Cuerpo en este orden (encabezados `##` sin numerar; ver las otras teorías para el frontmatter):

1. **Motivación** — qué falla sin esta estructura (con un caso numérico).
2. **Intuición dibujada** — una imagen mental + el primer diagrama.
3. **Definición y notación** — tabla de símbolos (qué mide cada variable y qué pasa si crece).
4. **Operaciones paso a paso** — UN ejemplo corrido; cada operación con su diagrama de 6–10
   pasos. Cada paso responde *qué miro, qué decido, por qué*.
5. **De dónde sale la cota** — la fórmula en `$$…$$` y, encima, un diagrama que muestre de dónde
   sale **cada término** (cada sumando, cada logaritmo, cada $B$, $w$, $\lg\lg u$…).
6. **Errores típicos / casos límite** — vacío, un elemento, duplicados, borde de bloque.
7. **Conexión** — enlaces a prerrequisitos y a lo que sigue (no los re-expliques).

Longitud objetivo: 250–400 líneas de MDX. Densidad antes que volumen: nada de relleno.

## Matemáticas (LaTeX) — `KATEX-PASS.md` manda

- `$…$` en línea; `$$…$$` en **su propia línea/párrafo** para fórmulas destacadas (el plugin
  `remark-display-math` ya renderiza `$$x$$` de una línea como bloque).
- TODA cota/fórmula en LaTeX: `\Theta`, `\log_B`, `\lg`, `\lfloor`, `\Sigma`, `\lvert\Sigma\rvert`,
  `\frac{N}{B}`. Nunca `|Sigma|`, `O(n lg n)` suelto ni fórmulas en backticks.
- En `<Visualization viz={{…}}>` (JS) los `note`/`caption` van en comillas dobles y admiten `$…$`
  con `\\` doblado (`"$\\Theta(N/B)$"`). Evita `\` si puedes; si no, dóblalo.
- Frontmatter YAML y `meta.yaml`: texto plano, sin `$`.

## Diagramas

Misma disciplina que `DIAGRAM-PASS.md` (pasos de decisión, `note` de 1–2 frases completas que
dicen QUÉ y POR QUÉ, ids estables entre pasos, etiquetas de nodo cortas, estados del vocabulario
cerrado de `AGENTS.md`). **Elige la familia por lo que dibujas:**

| Qué dibujas | Familia |
| --- | --- |
| Memoria en bloques, caché, runs de merge, layout vEB, sparse table, suffix array + LCP, cadenas de bits, arreglos con tramos | **`array`** (nueva) |
| Árboles: B-tree, trie, árbol cartesiano, árbol de Euler, vEB como árbol, X/Y-fast, autómata Aho–Corasick | **`tree`** (`links` con `kind: pointer` para enlaces de falla/diccionario/saltos) |
| Plano llave × tiempo | `geometric` |

### Familia `array` (pizarra de celdas)

```js
<Visualization viz={{
  type: "array",
  steps: [
    {
      note: "Texto del paso: qué se mira y por qué.",
      rows: [
        { id: "disco", label: "Disco", cells: [
          { value: 7, tag: "0" },                 // tag = índice pequeño ARRIBA de la celda
          { value: 3, tag: "1", state: "active" },
          { id: "x", value: "∞", tag: "2", state: "answer" },   // id propio opcional
        ]},
        { id: "ram", label: "RAM", cells: [{ value: 7 }, { value: 3 }] },
      ],
      spans: [ { id: "b0", row: "disco", from: 0, to: 1, label: "bloque 0" } ],  // tramo rodeado (índices inclusivos)
      links: [ { from: "disco-1", to: "ram-0", kind: "pointer", label: "carga" } ], // flecha entre celdas; id por defecto `<fila>-<i>`
      caption: "Estado acumulado: texto corto bajo el diagrama.",
      highlight: ["disco-1"],
    },
  ],
}} />
```

- Una fila = una tira de celdas; **varias filas** para comparar (disco/RAM, nivel 0/1/2, texto/SA/LCP).
- `spans` para bloques de tamaño $B$, clusters de $\sqrt u$, grupos de $\lg n$, sufijos con prefijo común.
- `states`: `active` (lo que se toca ahora, único azul), `marked` (delimitador), `answer`,
  `muted` (descartado), `shared`, `copied`, `idle`. Todos los pasos de un diagrama usan **las
  mismas filas y ids** para que la animación deslice en vez de saltar.
- Celdas de texto largo ensanchan TODAS las celdas: valores cortos (≤ 8 caracteres).
- Si `array` no alcanza para tu estructura, **dilo en tu informe final** (qué falta); no
  fuerces otra familia ni dibujes con texto.

## Ejemplos y ejercicios

- `examples.mdx`: mínimo / normal / límite, cada uno con su diagrama paso a paso.
- `exercises.md`: niveles 1–6, pistas progresivas (nunca la solución antes de las pistas),
  fórmulas en `$…$` (el cuerpo de `statement`/`hints`/`solution` admite KaTeX vía `renderRich`;
  evita `\` problemáticos en YAML: usa `>-`).
- `mastery-check.md`: qué debe poder explicar el estudiante sin mirar.

## Tu respuesta final (máx. 10 líneas)

Líneas antes/después de `theory.mdx`, nº de diagramas y de pasos totales, resultado de
`validate-viz.mjs`, qué viste que el modelo visual no alcanza a mostrar, y cualquier errata
o duda sobre el PDF.

## Errores de frontmatter que ya rompieron el build (evítalos)

- `exercises.md` y `mastery-check.md` DEBEN cerrar el frontmatter con una línea `---` al final. Sin ese cierre el build falla con "kind: Received {}".
- Una frase de `canExplain`/`canDo` con `: ` (dos puntos + espacio) sin comillas se parsea como mapa. Usa coma, o `>-`, o comillas.
- Una `solution:` con `{a,b}` o `: ` va como bloque `>-` indentado.
- Antes de terminar: `node scripts/check-knowledge-map.mjs` (detecta estos casos).
- NUNCA escribas `\$` dentro de `$…$` (remark-math no lo trata como escape: descuadra todos los `$` siguientes y MDX revienta con `X is not defined`). Para el sentinela usa `\mathdollar` (`$banana\mathdollar$`).
