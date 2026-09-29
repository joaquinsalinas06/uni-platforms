# Reglas para agentes de contenido

Las lee todo agente que genera un tema (concepto, algoritmo o modelo). Tu
prompt sólo añade lo específico de tu porción del curso.

## Qué leer antes de escribir

1. `AGENTS.md` — principio rector y restricciones del brief.
2. **Los PDFs de tu unidad en `raw-materials/UX/`** — no hay `content/analysis/`
   pre-digerido en este curso. Empieza por los **apuntes** (LaTeX compilado,
   la fuente más completa) y usa las **slides** para completar detalles y
   figuras que los apuntes no traen. Si existe una transcripción en
   `PDs/PD3/consolidado/md/` úsala sólo como orientación inicial — está
   verificada como parcial, nunca sustituye leer el PDF.
3. `templates/` — el formato obligatorio de cada archivo (`theory.md`,
   `algorithm.md`, `meta.yaml`).
4. `content/knowledge-map.json` — tu entrada. Los subtemas que debes cubrir
   son **exactamente** los que lista `subtopics`; ni uno más, ni uno menos.
5. `src/lib/schemas.ts` — los schemas Zod. Si no validas, el build falla.

## Dónde escribes

Sólo en `content/topics/<tu-id>/` y `cpp/topics/<tu-id>/` (si tu tema lo
requiere). Si te toca la unidad 3, además `content/practica.md` y
`cpp/practica/`.

**Prohibido tocar**: `knowledge-map.json`, `src/`, `templates/`, `scripts/`,
y cualquier otra carpeta de `content/topics/` o `cpp/topics/`. Hay otro
agente de contenido y un agente de visualizaciones trabajando en paralelo.

**No corras `pnpm build` ni `pnpm check`** — compiten por el mismo cache con
los demás.

## Decisiones ya tomadas por el usuario

1. **Fidelidad al profesor.** Escribe cada cosa como él la enseñó. Cuando haga
   falta algo que él no dijo pero sin lo cual no se entiende, va como nota de
   apoyo marcada: `> **Nota de apoyo** (no está en el material): ...`
2. **Ejemplos derivados, marcados.** Si el material no trae un ejemplo numérico
   para algo, derívalo ejecutando a mano el pseudocódigo/fórmula del profesor y
   márcalo: *(derivado; no aparece explícito en el material)*. Los ejemplos que
   sí son del profesor (las "Participación N", los ejercicios resueltos en los
   apuntes) van **sin** marca.
3. **Erratas, corregidas en silencio.** Si detectas una errata evidente en el
   material, escribe la versión correcta sin mencionar el PDF ni el error.
4. **Prerrequisitos se referencian, nunca se reexplican.** Enlaza `/topics/<id>`.
   Si un tema es del otro agente de contenido, menciónalo como destino y sigue.
5. **Sin ejemplos/ejercicios por tema.** No crees `examples.md`/`exercises.md`
   — no existen en este proyecto. Los ejercicios "Participación"/de práctica
   van dentro de la sección "Ejemplos" de `theory.md` (los que ya vienen
   resueltos en el material) o, si te toca U3, en la página consolidada
   `content/practica.md` (ver más abajo).

## Formato — romper esto rompe el build o el check

- **Títulos `##` SIN numerar** (`## Intuición`, no `## 2. Intuición`). Los
  números los pone un contador CSS.
- **`meta.yaml` debe coincidir EXACTAMENTE con tu entrada del knowledge map**
  en `type`, `unit`, `hasVisualization`, `prerequisites`, `buildsOn` y
  `usedBy`. Cópialos de ahí. Un check automático compara ambos y falla si
  divergen. Incluye `placeholder: false`.
- **Complejidad/fórmulas**: sólo `worst` y `reasoning` son obligatorios.
  `best`, `avg` y `space` son **opcionales y debes omitirlos si el profesor no
  los dio** — rellenarlos sería inventar. `reasoning` mínimo 20 caracteres,
  explicando de dónde sale la cota/fórmula (derivación, recurrencia, teorema
  de Brent...). `source` cita el PDF y página (`U2.1-...-apuntes.pdf#12`). Un
  concepto sin costos propios lleva `complexity: {}`.
- **YAML**: todo string que contenga `": "` va entre comillas dobles. **Es el
  error más común y rompe el build.** Aplica a `title`, `reasoning`, `source`
  y cualquier otro texto libre.
- Cada `algorithms/<name>.md` o `models/<name>.md` lleva las secciones del
  template, más `order` en el frontmatter (y `cppSteps` sólo si el subtema
  tiene código propio — la mayoría no lo necesita).
- **Matemáticas**: KaTeX **ya está configurado**. Usa `$...$` en línea y
  `$$...$$` en bloque para fórmulas de verdad (sumatorias, derivaciones,
  recurrencias). Reserva los bloques de código para pseudocódigo y trazas.

## Visualizaciones

Bloque `visualization` en el frontmatter de `theory.md` o de un
`algorithms|models/<name>.md`, con la forma que declara
`src/lib/schemas.ts` para la familia que te toca (`xy-chart`, `dag`,
`network-topology`, `timeline`, `memory-layout` — ver `meta.yaml.visualizationType`).
Cada `note` de paso explica **qué se está mirando y por qué**, no sólo el
mecanismo.

**Ninguna de las 5 familias está implementada todavía** — el agente de
visualizaciones las va registrando en `src/visualizations/registry.ts` a
medida que las construye. Mientras tu familia no exista, escribe igual el
bloque `visualization` completo en el frontmatter (queda validado por Zod
aunque la página muestre "pendiente de implementar") — no esperes a que el
agente de visualizaciones termine para escribir tu prosa.

**Etiquetas/labels CORTAS**: la explicación va en el `note` del paso o en
`caption`, nunca dentro de un nodo/evento — una etiqueta larga rompe el
layout. Usa `state` para el rol (`active`, `marked`, `answer`, `shared`,
`muted`), nunca texto ni colores nuevos: ver `AGENTS.md` § "Estados en las
visualizaciones".

**Si la forma del schema no te alcanza para tu diagrama, NO cambies el
schema.** Escribe lo que puedas con la forma actual y **reporta en tu
respuesta final exactamente qué campo te faltó**.

## Página de práctica (sólo el agente de la unidad 3)

`content/practica.md` es la ÚNICA página de ejemplos y ejercicios de toda la
plataforma — sigue el template `templates/practica.md`. Items con
`level` 1-6 (reconocer/trazar/implementar/adaptar/diseñar/demostrar), cada
uno con **al menos una pista** (sin pistas la solución no se puede
desbloquear y el schema lo rechaza).

- Copia el código de `PDs/PD3/consolidado/cpp/` (ya deduplicado por el
  profesor) a `cpp/practica/` como base. Revisa `U3.1-...-MPI-Lab`,
  `U3.2-...-MPI-code(-codigo)` y `U3.4-...-tiposMPI-codigo` sólo para capturar
  algo que PD3 no traiga — no dupliques lo que PD3 ya cubre.
- Cada item puede referenciar un `cppFile` (debe existir en `cpp/practica/`).
- Los ejercicios "Participación" que ya resolviste dentro de un `theory.md`
  de tu propia porción NO se repiten aquí — sólo lo que sea genuinamente
  material de laboratorio/práctica independiente.

## C++ (sólo si tu subtema declara `cppSteps`)

Pasos acumulativos (`step-1-*.cpp`…) y `full-implementation.cpp`. Nada de un
bloque completo de golpe.

`full-implementation.cpp` debe:
- compilar con `g++ -std=c++20 -Wall` **sin warnings**;
- traer `main()` con asserts que cubran el caso normal **y** los casos especiales;
- **imprimir qué verificó.**

**Compílalo y ejecútalo tú mismo antes de terminar.** Si no compila, arréglalo.

## Tu respuesta final

Máximo 15 líneas: archivos escritos, subtemas cubiertos, qué marcaste como
derivado o como nota de apoyo, qué campo te faltó para las visualizaciones
(si aplica), qué dejaste fuera a propósito, y cualquier ambigüedad del
material que deba resolver el usuario.
