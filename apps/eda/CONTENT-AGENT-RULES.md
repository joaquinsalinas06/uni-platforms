# Reglas para agentes de contenido

Las lee todo agente que genera una estructura o concepto. Tu prompt sólo añade
lo específico de tu tema.

## Qué leer antes de escribir

1. `AGENTS.md` — principio rector y restricciones del brief.
2. Tu sección del análisis en `content/analysis/` — **es tu única fuente de verdad.**
   No abras los PDF: ya están analizados, exhaustivamente. Lee tu sección **entera**.
3. `templates/` — el formato obligatorio de cada archivo.
4. `content/knowledge-map.json` — tu entrada. Las operaciones que debes cubrir son
   **exactamente** las que lista `operations`; ni una más, ni una menos.
5. `src/lib/schemas.ts` — los schemas Zod. Si no validas, el build falla.
6. **Una estructura ya terminada como referencia de calidad**: `content/structures/binary-heap/`
   (estructura con operaciones) o `content/structures/potential-method/` (concepto sin
   operaciones). Son el estándar a igualar, no un punto de partida a superar por poco.

## Dónde escribes

Sólo en `content/structures/<tu-id>/` y `cpp/structures/<tu-id>/`.

**Prohibido tocar**: `knowledge-map.json`, `content/analysis/`, `src/`, `templates/`,
`scripts/`, y cualquier otra carpeta de `content/structures/` o `cpp/structures/`.
Hay otros agentes trabajando en paralelo.

**No corras `pnpm build` ni `pnpm check`** — compiten por el mismo cache con los demás.

## Decisiones ya tomadas por el usuario

1. **Fidelidad al profesor.** Escribe cada cosa como él la enseñó. Cuando haga falta
   algo que él no dijo pero sin lo cual no se entiende, va como nota de apoyo marcada:
   `> **Nota de apoyo** (no está en las diapositivas): ...`
2. **Ejemplos derivados, marcados.** Si el mazo no trae ejemplos numéricos, derívalos
   ejecutando a mano el pseudocódigo del profesor y marca cada uno:
   *(derivado del pseudocódigo; no aparece en las diapositivas)*. Los ejemplos que sí
   son del profesor van **sin** marca. La distinción importa: el estudiante tiene que
   saber qué puede citar en un examen.
3. **Erratas, corregidas en silencio.** Si el análisis reporta una errata, escribe la
   versión correcta sin mencionar la diapositiva ni el error.
4. **Prerrequisitos se referencian, nunca se reexplican.** Enlaza `/structures/<id>`.
   Si un tema es de otro agente, menciónalo como destino y sigue.
5. **Conceptos de apoyo.** `segment-tree`, `balanced-bst` y `fenwick-tree` están en el
   mapa como andamio (`supportConcept: true`) porque el profesor los usa sin explicarlos.
   Enlázalos; no los expliques tú.

## Formato — romper esto rompe el build o el check

- **Títulos `##` SIN numerar** (`## Intuición`, no `## 2. Intuición`). Los números los
  pone un contador CSS.
- **`meta.yaml` debe coincidir EXACTAMENTE con tu entrada del knowledge map** en `type`,
  `week`, `hasVisualization`, `prerequisites`, `buildsOn` y `usedBy`. Cópialos de ahí.
  Hay un check automático que compara ambos y falla si divergen. Incluye `placeholder: false`.
- **Complejidad**: sólo `worst` y `reasoning` son obligatorios. `best`, `avg` y `space`
  son **opcionales y debes omitirlos si el profesor no los dio** — este profesor casi
  nunca distingue casos ni menciona espacio, y rellenarlos sería inventar. `reasoning`
  mínimo 20 caracteres, en el estilo de análisis que el mapa declara para tu tema.
  `source` cita la diapositiva (`Sem_1_Heaps_I-1.pdf#19`). Un concepto sin costos
  propios lleva `complexity: {}`.
- **YAML**: todo string que contenga `": "` va entre comillas dobles. **Es el error más
  común y rompe el build.** Aplica a `statement`, `solution`, `hints`, `canExplain`,
  `canDo`, `title`, `summary` y cualquier otro texto libre.
- `exercises.md`: 6 niveles (1 reconocer, 2 trazar, 3 implementar, 4 adaptar,
  5 diseñar, 6 demostrar), cada uno con **al menos una pista**. Sin pistas, la solución
  no se puede desbloquear y el schema lo rechaza.
- Cada `operations/<op>.md` lleva las 9 secciones del template, más `order` y `cppSteps`
  en el frontmatter. Si una operación es pieza de otra (un `link`, un `cut`, un
  `consolidate`), ponla antes en el `order` y que las demás la referencien en vez de
  repetirla.
- **Matemáticas**: KaTeX **ya está configurado**. Usa `$...$` en línea y `$$...$$` en
  bloque para fórmulas de verdad (sumatorias, Φ, recurrencias). Reserva los bloques de
  código para pseudocódigo y trazas, no para matemáticas.

## Visualizaciones

Bloque `visualization` en el frontmatter de la operación, con pasos
`{note, highlight, nodes:[{id, value, parent}]}`. Cada `note` explica **qué se está
mirando y por qué**, no sólo el mecanismo — la visualización existe para entender el
algoritmo paso a paso, no para decorar.

Las familias `tree`, `persistent` y `range-tree` **ya están implementadas**
(`src/visualizations/`). Consulta `HANDOFF-DESIGN-REPLY.md` para los campos de cada
una (`state`, `links`, `fields`, `ports`, `arrays`, `bridges`, `panels`, `caption`…).

**Etiquetas de nodo CORTAS**: un valor, una clave, un rango. La explicación va en el
`note` del paso o en `caption`, nunca dentro del nodo — una etiqueta larga se dibuja
como una caja enorme y rompe el diagrama. Usa `state` para el rol (`active`, `marked`,
`answer`, `shared`, `muted`), nunca texto ni colores nuevos: ver `AGENTS.md`
§ "Estados en las visualizaciones".

`theory.md` también acepta `visualization` en el frontmatter, igual que
`operations/<op>.md` — si tu tema es un concepto sin operaciones y necesita
diagrama, ponlo ahí.

**Diagrama a mitad de la explicación**: si necesitas más de un diagrama, o uno
que no vaya arriba de todo sino entre dos secciones de prosa, escribe el
archivo como `.mdx` en vez de `.md` (incluida en la colección igual, el `id`
no cambia) e importa el componente donde lo necesites — ver `AGENTS.md` §
MDX para el formato exacto. Si un solo diagrama arriba te alcanza, quédate en
`.md` con el frontmatter `visualization` de siempre; no compliques tu tema
sin necesidad.

**Si la forma de `nodes` no te alcanza, NO cambies el schema.** Escribe lo que puedas
con la forma actual y **reporta en tu respuesta final exactamente qué campo te faltó**.
Eso se canaliza al equipo de plataforma; tú no.

**Si un diagrama que ya existe se ve mal (aristas superpuestas, un anillo de
hermanos poco claro), arréglalo con los campos que ya existen o repórtalo —
nunca lo apagues.** `src/components/Visualization.astro` decide qué familia
de visualización se renderiza para TODAS las estructuras; una condición ahí
que oculte una familia entera (o un rango de rutas) apaga contenido de otros
agentes sin que ellos se enteren. Ver AGENTS.md § "Listas circulares de
hermanos" para el patrón correcto de `child`/`sibling` con anillo `left`/
`right` (incluye `bidirectional` para un par de punteros opuestos).

## C++

Pasos acumulativos (`step-1-*.cpp` … ) y `full-implementation.cpp`. Nada de un bloque
completo de golpe: el estudiante tiene que ver qué cambia en cada paso.

`full-implementation.cpp` debe:
- compilar con `g++ -std=c++20 -Wall` **sin warnings**;
- traer `main()` con asserts que cubran el caso normal **y** los casos límite;
- **imprimir qué verificó.** Un ejecutable mudo no enseña nada: si pasa en silencio, el
  estudiante no sabe qué acaba de demostrar. Una línea por propiedad comprobada, en el
  estilo de `cpp/structures/persistence-levels/full-implementation.cpp`.

**Compílalo y ejecútalo tú mismo antes de terminar.** Si no compila, arréglalo.

## Tu respuesta final

Máximo 15 líneas: archivos escritos, operaciones cubiertas, qué marcaste como derivado
o como nota de apoyo, qué campo te faltó para las visualizaciones (si aplica), la salida
de la compilación, qué dejaste fuera a propósito, y cualquier ambigüedad del material
que deba resolver el usuario.
