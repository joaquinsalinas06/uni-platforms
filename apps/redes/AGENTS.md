# Redes y Comunicaciones (CS4054, UTEC) — Plataforma de Estudio

Astro 7 + React 19 + Tailwind v4 + KaTeX. Curso de redes de computadoras centrado en capas de aplicación, transporte, métricas de retardo, protocolos RDT, UDP, TCP, congestión, capa de red (IPv4, NAT, IPv6, routers, routing link-state y distance vector), capa física inalámbrica y análisis de tráfico con Wireshark.

## Principio Rector
Una sola fuente de verdad: **`content/knowledge-map.json`** (semanas `s1..s7`, `s9..s15`; 38 temas, 83 subtemas). Ningún modelo inventa temas ni modifica el mapa sin justificación. El material fuente proviene de:
- `raw-materials/text/<deck>.txt`: el texto extraído de las diapositivas oficiales (`pdftotext -layout`).
- `raw-materials/text/EP-2025II-1.txt`, `EP-2026I-1.txt`: exámenes parciales resueltos.
- `raw-materials/text/EF_2025_CS4054.txt`, `EF_2026_CS4054.txt`: exámenes finales (PDF en `raw-materials/sem14/`).
- `raw-materials/semNN/`: PDF descargados de Canvas por semana (mapa en `raw-materials/canvas-manifest.json`).
- `raw-materials/text/CS4054_ExcercisesExtra.txt`: ejercicios avanzados de sockets y laboratorios.

## Comandos Clave
```sh
pnpm dev              # Modo desarrollo local
pnpm build            # Compilación estática de producción (rutas generadas según el contenido vigente)
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
  knowledge-map.json        ← Fuente de verdad (unidades s1..s7, s9..s15, temas y subtemas)
  units/s1..s7.md, s9..s15.md ← Portada y resumen ejecutivo de cada semana
  topics/<id>/
    meta.yaml               ← id, title, type, unit, prereqs, formulas[]
    theory.md|mdx           ← Exposición teórica con secciones ## (mdx si lleva diagramas)
    subtopics/<name>.md|mdx ← Subtema individual con order entero
  evaluaciones/
    parciales/*.md          ← Exámenes parciales resueltos paso a paso
    finales/*.mdx           ← Exámenes finales resueltos paso a paso (categoría `finales`)
    laboratorio/*.md        ← Laboratorios y ejercicios extra
  formulario.md             ← Compendio de fórmulas del curso
  practica.mdx              ← Banco de ejercicios interactivos con ExerciseBlock
```

## Restricciones Estrictas
- **No inventar temas ni fórmulas**: Todo concepto debe basarse en el material oficial del curso.
- **Solo material del curso**: Si algo no está en `raw-materials/text/` o en los PDFs de `raw-materials/pdfs/` (slides, labs, ejercicios, parciales), no va. Nada de contenido de libro de texto ni relleno (RFCs, productos, extensiones no vistas).
- **Diagramas con la librería de Redes**: `net-scene`, `spacetime`, `window`, `packet`, `fsm`, `routing-table` (+ `xy-chart`, `flow`, `sequence`). Contrato y apariencia en `templates/viz-redes.md`. Se usan inline en archivos `.mdx`; nada de mermaid ni imágenes sintéticas.
- **Fórmulas documentadas**: Todo objeto en `formulas[]` de `meta.yaml` debe incluir `name`, `tex` y un `reasoning` explicativo de al menos 20 caracteres.

## Material incorporado de semanas 9–10

- Teoría: `Sem9_NetT-TCP2.pdf` y `Sem10_NetT-NetLayer_Addressing.pdf`.
- Laboratorios: `Sem09_LAB3_P1-2.pdf`, `Sem09_LAB3_TCP_PPT.pptx.pdf`, `Sem10_LAB3_TCP_P2 (1)-1.pdf`.
- Ejercicios: `Sem10_Excercises4-TCP.pdf` (preguntas 1–9).
- Evidencia: `content/source-coverage.json` enlaza páginas/secciones con contenido. `public/labs/tcp/` contiene código y resultados reproducibles de la captura oficial; `scripts/analyze-tcp-trace.py` regenera CSV/JSON con tshark.
- Validación adicional: `python3 -m unittest discover -s tests -v`.
- No se crea semana 8: su único material (`Sem08_LAB_SolvedExcercises`) repite ejercicios de s1–s6 ya resueltos en `practica.mdx`. `RFC_TCP.txt` no fue proporcionado; sus mediciones no se inventan.

## Material incorporado de semanas 11–15

Enfoque teórico, organizado según lo que preguntan parciales y finales. Los laboratorios son fuente secundaria: no tienen página propia; sus preguntas evaluables se integran en los temas y en `practica.mdx`.

| Semana | Teoría | Temas | Fuentes secundarias |
|---|---|---|---|
| s11 | `Sem11_NetT-NetLayer2` | `nat-firewall`, `ipv6-tunel-transicion` | `Sem12_LAB4B_NAT`, `Sem11_LAB4A_IP (2)`, `Sem10_LAB4_Slides_IP` |
| s12 | `Sem12_NetT-Routers` | `arquitectura-router`, `seguridad-router-icmp` | `Sem13_LAB4C_ICMP`, `Evaluación_LAB4_TEST_Assignment` |
| s13 | `Sem13_NetT-Dijkstra_OSPF_ISIS` | `link-state-dijkstra`, `ospf-isis-autenticacion`, `subredes-forwarding-lpm` | `Sem13_Excercises5_NetworkLayer` (resuelto en `evaluaciones/laboratorio/ejercicios-5-capa-red.mdx`) |
| s14 | `Sem14_NetT-DistanceVector_BGPAuthentication` | `distance-vector-bellman-ford`, `bgp-autenticacion-sesion` | `EF_2025_CS4054`, `EF_2026_CS4054` |
| s15 | `Sem15_NetT-Wireless-PhyLayer` | `capa-fisica-enlace`, `wifi-celular-movilidad` | `Sem14_Experience_Ethernet` (= `Sem15_Experience_Ethernet`) |

- Finales resueltos: `content/evaluaciones/finales/final-2025-ii.mdx` (EF del 3-12-2025) y `final-2026-i.mdx` (EF del 20-07-2026), con recortes reales del PDF y PDF en `public/evaluaciones/finales/`.
- Convención de TTL en traceroute (declarada en cada solución): la sonda que expira en el salto $k$ sale con TTL $k$; la respuesta llega con $TTL_0-(k-1)$. Se da también el valor con la otra convención.
- No cubierto por falta de fuente: RTS/CTS, campos de trama 802.11/Ethernet, ARP, áreas OSPF/niveles IS-IS, atributos y políticas BGP, poisoned reverse.
- `content/source-coverage.json` enlaza cada página de las fuentes nuevas con su contenido.
