# Pasada de diagramas — brief compartido

Lo lee todo agente de esta tanda. Tu prompt sólo dice **qué temas te tocan**.

## Objetivo del usuario, en sus palabras

> "quiero que me quede el documento de estudio perfecto, el documento que lo lea
> 1 vez en mi vida y entienda"

Eso se traduce en: **más diagramas, más detallados, que muestren TODOS los pasos
en orden**, con explicaciones densas y ejemplos claros. No basta con que el
diagrama exista: tiene que enseñar el mecanismo completo.

## REGLA DURA: nunca abras un navegador visible

El usuario está usando su pantalla. **Prohibido** usar las herramientas MCP de
Chrome DevTools (`new_page`, `take_screenshot`, `navigate_page`…). Usa el script
headless del repo:

```sh
pnpm shot /structures/binary-heap/operations/max-heapify --out /tmp/x.png
pnpm shot /structures/binomial-heap --full --out /tmp/y.png     # página entera
pnpm shot /structures/splay-tree --dark --out /tmp/z.png        # modo oscuro
```

Imprime un informe JSON con: `http`, `figuras` (cuántos diagramas se renderizaron
de verdad), el alto/ancho/nodos de cada uno, `textoDesbordado`, `katex`,
`errores` de consola y `peticionesFallidas`. **Y guarda un PNG que puedes abrir
con la herramienta Read para mirarlo.** Míralo de verdad, no te fíes del JSON.

El servidor está en http://localhost:4321 sirviendo el **build de producción**.
Si cambias contenido, reconstruye antes de capturar:
`pnpm build && (pnpm preview --port 4321 &)`. Si el puerto está ocupado por otro
agente, **no lo mates**: usa `--base http://localhost:4322` y levanta el tuyo ahí.

## Qué tienes que verificar en CADA página que toques

1. **Que el contenido se renderiza**: `http: 200` y, si el tema tiene diagrama,
   `figuras >= 1`. Si sale `figuras: 0`, el diagrama NO se está pintando: arréglalo.
2. **Que el diagrama se ve bien**: `textoDesbordado: 0`, nodos que no se solapan,
   raíz centrada, nada saliéndose del lienzo. **Abre el PNG y míralo.**
3. **Sin errores de consola** (`errores: []`). Si ves un error de hidratación de
   React (#418/#425), suele ser texto que difiere entre servidor y cliente:
   repórtalo, no lo ignores.
4. **Modo claro y oscuro**: captura con y sin `--dark`.

## Cómo mejorar un diagrama

- **Todos los pasos, en orden.** Si una operación enlaza dos árboles, el diagrama
  debe mostrar: estado inicial → qué se compara → qué se mueve → cómo quedan las
  conexiones → estado final. El usuario pidió literalmente ver "cómo se van
  haciendo al mismo nivel, las conexiones, cómo se parten, movimientos, todo".
- **6 a 10 pasos** en las operaciones centrales (antes eran 3-4 y se quedaban
  cortas). En las secundarias, 3-5. Un paso por *decisión*, no por *movimiento
  mecánico*.
- **Cada `note` explica QUÉ se mira y POR QUÉ**, en una o dos frases completas.
  Es la parte que más peso pedagógico tiene y hoy está escueta.
- **`caption`** para el estado acumulado (el arreglo, la cola, la secuencia).
- **Un subárbol NO se dibuja como un nodo.** Si un nodo representa un subárbol
  entero (los A/B/C de una rotación, un B_{k-1} dentro de un B_k), márcalo con
  `collapsed: true`: se dibuja como triángulo. Que un subárbol se vea igual que
  una clave suelta es justo una de las quejas del usuario.
- **Etiquetas de nodo CORTAS**: un valor, una clave, un rango. La prosa va en
  `note`/`caption`, nunca dentro del nodo.
- **Mismos `id` entre pasos** para el mismo elemento: así la animación se desliza
  en vez de saltar. Es lo que hace que se sienta pulida.
- **Estados** con `state` (`active`, `marked`, `answer`, `shared`, `copied`,
  `muted`) — ver `AGENTS.md` § "Estados en las visualizaciones".

## Prosa y ejemplos

El usuario también pidió **explicaciones más densas y ejemplos más claros**. Si al
mirar una página ves que la teoría pasa de puntillas por lo difícil, amplíala —
respetando siempre las reglas de `CONTENT-AGENT-RULES.md`: nada que no esté en el
material sin marcarlo, prerrequisitos enlazados y no reexplicados, erratas
corregidas en silencio.

Si un tema necesita varios diagramas repartidos por la explicación, pásalo a
`.mdx` (ver `AGENTS.md` § MDX). Es lo que el usuario quiere: diagramas a mitad
del texto, no todos amontonados arriba.

## Reglas de convivencia

- Escribes **sólo** en las carpetas de TUS temas (`content/structures/<id>/`).
  Nada de `src/`, nada de `content/knowledge-map.json`, nada de otros temas.
- Si cambias `hasVisualization` en un `meta.yaml`, **no toques el mapa**: el
  agente de integración corre `pnpm sync`.
- **No corras `pnpm check`**; sí puedes `pnpm build` si levantas tu propio
  preview en un puerto libre.
- YAML: strings con `": "` entre comillas; **no** entrecomilles claves de mapa
  (`- note: >-`) ni mapas en línea (`- { id: n1, ... }`).

## Tu respuesta final

Máximo 15 líneas: qué diagramas mejoraste o creaste y cuántos pasos tiene cada
uno, qué comprobaste en las capturas (claro y oscuro), qué errores de consola
viste, qué prosa ampliaste, y qué quedó mal que no supiste arreglar.
