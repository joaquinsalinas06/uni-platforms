# Redes y Comunicaciones (CS4054, UTEC) — Plataforma de Estudio

Astro 7 + React 19 + Tailwind v4 + KaTeX. Curso de redes de computadoras centrado en capas de aplicación, transporte, métricas de retardo, protocolos RDT, UDP, TCP y análisis de tráfico con Wireshark.

## Principio Rector
Una sola fuente de verdad: **`content/knowledge-map.json`** (semanas `s1..s7`, 21 temas, 42 subtemas). Ningún modelo inventa temas ni modifica el mapa sin justificación. El material fuente proviene de:
- `raw-materials/text/<deck>.txt`: el texto extraído de las diapositivas oficiales (`pdftotext -layout`).
- `raw-materials/text/EP-2025II-1.txt`, `EP-2026I-1.txt`: exámenes parciales resueltos.
- `raw-materials/text/CS4054_ExcercisesExtra.txt`: ejercicios avanzados de sockets y laboratorios.

## Comandos Clave
```sh
pnpm dev              # Modo desarrollo local
pnpm build            # Compilación estática de producción (77 rutas)
pnpm check            # Verifica consistencia de knowledge-map.json contra archivos en disco
```
Siempre usar `pnpm` desde la raíz del monorepo (`pnpm --filter redes-platform <cmd>`) o dentro de `apps/redes/`.

## Despliegue en Vercel
Este proyecto ya está creado y vinculado a Vercel bajo:
- **Proyecto**: `redes-platform`
- **Organización / Equipo**: `joaquin-salinas-projects`
- **Root Directory**: `apps/redes`
- **Framework**: `Astro`
- **Despliegue**: Automático mediante `git push origin main` al repositorio GitHub `https://github.com/joaquinsalinas06/uni-platforms.git`. No subir binarios directamente por CLI.

## Estructura de Contenidos
```
content/
  knowledge-map.json        ← Fuente de verdad (unidades s1..s7, temas y subtemas)
  units/s1..s7.md           ← Portada y resumen ejecutivo de cada semana
  topics/<id>/
    meta.yaml               ← id, title, type, unit, prereqs, formulas[]
    theory.md               ← Exposición teórica profunda con secciones ##
    subtopics/<name>.md     ← Subtema individual con order entero
  evaluaciones/
    parciales/*.md          ← Exámenes parciales resueltos paso a paso
    laboratorio/*.md        ← Laboratorios y ejercicios extra
  formulario.md             ← Compendio de fórmulas del curso
  practica.mdx              ← Banco de ejercicios interactivos con ExerciseBlock
```

## Restricciones Estrictas
- **No inventar temas ni fórmulas**: Todo concepto debe basarse en el material oficial del curso.
- **Sin diagramas manuales o mermaid decorativos**: El usuario solicitó expresamente no generar diagramas sintéticos; el foco es prosa técnica exhaustiva, fórmulas en KaTeX y código estructurado.
- **Fórmulas documentadas**: Todo objeto en `formulas[]` de `meta.yaml` debe incluir `name`, `tex` y un `reasoning` explicativo de al menos 20 caracteres.
