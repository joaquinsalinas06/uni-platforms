# IoT-Platform

Plataforma de estudio del curso **Internet de las Cosas** (CS5055, UTEC): Astro 7 +
React 19 + Tailwind v4 + KaTeX. Curso teórico y de circuitos, sin editor de código.

Ver `AGENTS.md` para la estructura de contenido y `CONTENT-AGENT-RULES.md` para las
reglas de los agentes de contenido.

## Comandos

| Comando        | Acción                                             |
| :------------- | :-------------------------------------------------- |
| `pnpm install` | Instala dependencias                                |
| `pnpm dev`     | Servidor local en `localhost:4321`                  |
| `pnpm build`   | Build de producción a `./dist/`                     |
| `pnpm preview` | Sirve el build de producción localmente              |
| `pnpm check`   | Valida coherencia de `content/knowledge-map.json`    |
| `pnpm test`    | Corre los tests (incluida la verificación de circuitos) |

Siempre usar `pnpm`, nunca `npm`/`yarn`.
