# Reglas para agentes de contenido (una semana por agente)

## Qué leer
1. `AGENTS.md`.
2. `content/knowledge-map.json`: tu semana (`units[i]`), sus temas y los `subtopics` EXACTOS.
3. `raw-materials/text/<deck>.txt` de tus `sourceSlides` (`\f` separa páginas; `grep -n`
   ayuda). Si una tabla o diagrama no se entiende en texto, abre el PDF en
   `raw-materials/pdfs/<deck>.pdf` en esa página.
4. `raw-materials/text/EP-2025II-1.txt` y `EP-2026I-1.txt`: así preguntan. Los ejercicios
   del curso están en `Sem03_Excercises1`, `Sem06_Excercises2-2`, `Sem07_Excercises3-1` y
   `CS4054_ExcercisesExtra`.
5. `templates/`: meta.yaml, theory.mdx, subtopic.mdx, exercise-solution.md, practica.md y
   **viz-redes.md** (contrato y apariencia de los diagramas: léelo entero).
6. `src/lib/schemas.ts`: contrato de las familias existentes. Las nuevas (`net-scene`,
   `spacetime`, `window`, `packet`) se están implementando en paralelo: su contrato es
   `templates/viz-redes.md`.

## Dónde escribes
SOLO `content/topics/<tus-ids>/`, `content/units/<tu-semana>.md` y los archivos de
`content/evaluaciones/` o `content/practica.mdx` que te asignen. Prohibido tocar `src/`,
`scripts/`, `templates/`, `knowledge-map.json` y los temas de otras semanas. NO corras
`pnpm build` ni `pnpm sync`. SÍ puedes correr `pnpm check`: el error "meta.yaml dice
hasVisualization=true, el mapa dice false" es esperado (el verificador corre `pnpm sync` al final); los demás no.

Escribe cada archivo apenas lo termines, sin acumular todo para el final: si te cortan por
límite, lo escrito queda.

## Estructura de cada página (theory.md y cada subtopics/*.md)
Títulos `##` numerados (`## 1. …`), separados por `---`, en este orden (omite una sección
solo si de verdad no aplica): idea y motivación → conceptos (definiciones, campos de
cabecera en tablas, fórmulas en $…$ y $$…$$) → método paso a paso → ejemplo resuelto →
errores típicos.

Usa `###` para subdividir. Los subtemas llevan `kind: subtopic` y `order`. Los ejercicios
tipo examen van en `content/practica.mdx` con `ExerciseBlock` (ver
`templates/exercise-solution.md`).

## Fidelidad (SOLO material del curso)
- Fuente única: `raw-materials/text/*.txt` y `raw-materials/pdfs/*.pdf`. Si algo no está ahí,
  se borra: nada de libro de texto, RFCs, productos (Route 53, Cloudflare…), extensiones no
  vistas (SYN cookies, ECN, PAWS, Tahoe/Reno, Chord…), ni "Notas de apoyo" fuera de sílabo.
- El texto actual lo generó otra IA y NO es fuente. Reescribir desde cero está permitido y
  es preferible si el tema está mal. Lo único fijo: `id` del tema y nombres de `subtopics`
  del mapa (`pnpm check` debe pasar). Un tema puede quedar corto; si queda vacío, repórtalo.
- Ejemplos numéricos: los del material. Uno propio solo si hace falta para entender, y
  marcado *(derivado)*.
- Erratas evidentes: corrígelas en silencio. Inconsistencias entre slides: muéstralas.
- Código solo donde el curso lo usa (sockets UDP en Python, `nslookup`/`dig`, filtros de
  Wireshark): fragmentos cortos en bloques ```python / ```sh, tal como en el lab.
- Claro y breve: que se entienda, sin relleno ni repeticiones entre theory y subtemas.

## Parciales
Lee las páginas del PDF (`raw-materials/pdfs/EP-*.pdf`, Read con `pages`) para tener las
figuras reales: IPs, puertos, trazas de Wireshark, salidas de nslookup. Cada solución usa
EXACTAMENTE esos datos. El archivo es `.mdx` y sigue `templates/examen.mdx` de
`apps/template`:
- `pdf:` en el frontmatter (PDF copiado a `public/evaluaciones/...`): botón de descarga.
- Cada pregunta abre con `<ExamStatement>`: enunciado transcrito tal cual (KaTeX).
- Figuras del examen (capturas, topologías, gráficas): recorte REAL del PDF con
  `pdftoppm -x -y -W -H` junto al `.mdx`, mostrado con `<ExamFigure>` (optimizado,
  con skeleton). No se redibujan como sustituto; un diagrama propio con la librería
  (`net-scene`, `packet`…) puede ir además, dentro de la solución.

## Diagramas
Ser generoso: todo lo que se explica mejor con una figura lleva figura, inline justo donde
se explica (`.mdx` + import, ver `templates/viz-redes.md`). Los bloques se escriben según el
contrato aunque la librería aún se esté implementando: NO pruebes el render. Una idea por
paso, `note` que diga qué mirar. Al agregar diagramas, en `meta.yaml` pon
`hasVisualization: true` y `visualizationType: <familia principal>`. Para pasar un archivo a
`.mdx` usa `git mv`.

## meta.yaml
Tiene que coincidir con el mapa en `unit`, `type`, `hasVisualization`, `prerequisites`,
`buildsOn` y `usedBy`. `formulas[]` lleva todas las fórmulas del tema (name, tex sin $,
reasoning ≥ 20 caracteres). Pon entre comillas dobles todo string con ": ".

## Respuesta final (≤ 20 líneas)
Archivos tocados, qué se borró por tema, diagramas por archivo, campos del contrato que
faltaron y dudas del material.
