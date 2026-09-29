# Pasada de KaTeX — brief compartido

Todo el contenido se escribió cuando las reglas decían *"KaTeX no está
configurado, no uses `$...$`"*, porque entonces era cierto. Ya lo está. Quedan
**533 fórmulas metidas en backticks** que deberían renderizarse como
matemáticas. Este curso es puro análisis amortizado: es la diferencia entre
leer `Σ_{h=0}^{⌊lg n⌋} ⌈n/2^(h+1)⌉ · O(h)` y ver la sumatoria de verdad.

## Qué SÍ convertir

Matemáticas reales, en línea con `$...$` y en bloque con `$$...$$`:

- Sumatorias, productos, límites: `Σ_{h=0}^{⌊lg n⌋}` → `$\sum_{h=0}^{\lfloor \lg n \rfloor}$`
- Funciones potencial y coste amortizado: `Φ(H) = t(H) + 2m(H)`, `ĉᵢ = cᵢ + Φᵢ − Φᵢ₋₁`
- Recurrencias: `T(n) = T(n/2) + O(1)`
- Desigualdades y relaciones: `≤`, `≥`, `⟹`, `∈`, `⊆`
- Pisos y techos: `⌊x⌋`, `⌈x⌉`
- Subíndices y superíndices reales: `2^(h+1)`, `k_i`, `B_{k-1}`, `D₁`, `O(log^d n)`
- Cotas dentro de una **afirmación matemática**: "el coste es $O(\log n)$ porque…"

## Qué NO convertir — importante

- **Pseudocódigo y trazas**: los bloques ```` ``` ```` se quedan como están. Son código.
- **Identificadores de código**: `A[i]`, `vals[0]`, `root_`, `insert()`, nombres de
  función y de variable siguen en backticks. No son matemáticas.
- **Nombres de archivo, ids del mapa, rutas**: `binary-heap`, `meta.yaml`.
- **`meta.yaml`**: el campo `reasoning` se renderiza como **texto plano**, no como
  markdown — un `$...$` ahí saldría literal y feo. **No toques los meta.yaml.**
- **Frontmatter en general** (`statement`, `hints`, `solution`, `canExplain`…):
  esos campos tampoco pasan por el renderizador de markdown. Déjalos.

Es decir: **sólo el cuerpo markdown** de `theory.md(x)`, `operations/*.md(x)` y
`examples.md`.

## Reglas de escritura

- `$...$` para fórmulas dentro de una frase; `$$...$$` en bloque aparte para las
  que el profesor destaca (la recurrencia principal, la función potencial).
- Escapa bien: en KaTeX es `\lg`, `\log`, `\Theta`, `\Omega`, `\Phi`, `\lfloor`,
  `\rfloor`, `\lceil`, `\rceil`, `\sum`, `\cdot`, `\le`, `\ge`, `\implies`.
- **No cambies el contenido matemático**, sólo su notación. Si una fórmula está
  mal, es una errata del material y ya está tratada — no la "arregles" ahora.
- Si una expresión es ambigua entre código y matemáticas, **déjala en backticks**.
  Pasarse de conversión es peor que quedarse corto.

## Verificación obligatoria

Después de convertir, por cada página tocada:

```sh
pnpm build && node scripts/shot.mjs <ruta> --out /tmp/x.png
```

El informe trae `katex: N`. Tiene que **subir** respecto a antes, y
`textoDesbordado` seguir en `0`. **Abre el PNG con Read y mira las fórmulas**:
KaTeX que no compila se pinta en rojo y se ve a la legua. Comprueba también el
modo oscuro con `--dark`.

**NUNCA abras un navegador visible** (nada de Chrome DevTools MCP): el usuario
está usando su pantalla. Sólo `pnpm shot`, que es headless.

Si el puerto 4321 está ocupado por otro agente, no lo mates: levanta el tuyo en
otro puerto y usa `--base http://localhost:PUERTO`.

## Convivencia

Escribes **sólo** en las carpetas de TUS temas. Nada de `src/`, nada del
knowledge map, nada de `meta.yaml`, nada de otros temas.

## Tu respuesta final

Máximo 10 líneas: cuántas fórmulas convertiste por tema, el `katex` antes y
después en las páginas principales, qué dejaste deliberadamente en backticks y
por qué, y si viste alguna fórmula que KaTeX no supo compilar.
