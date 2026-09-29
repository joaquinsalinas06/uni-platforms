---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué la consulta de dominancia se reformula como intersección de rayos, y no se ataca directamente comparando coordenadas."
  - "Por qué D_1 se construye como subdivisión geométrica y no como un Layered Range Tree anidado."
  - "Por qué el costo de ConsultaDominancia es O(lg n + k) y no O(lg n) a secas: qué papel juegan las caras 'vacías'."
  - "Qué gana D_2 al guardar una copia de D_1 por nodo, en vez de replicar una estructura con árbol interno."
canDo:
  - "Transcribir ConsultaDominancia de memoria, incluyendo el comentario de costo de cada línea."
  - "Trazar la caminata de ConsultaDominancia sobre un conjunto de puntos dado, columna por columna, sin saltarme el criterio de parada en b2."
  - "Distinguir, para una consulta dada, cuáles puntos aportan al término O(k) y cuáles quedan fuera antes de empezar a caminar."
  - "Reconocer, en vertical-ray-shooting o en d2-bound-x, la misma jugada de reformulación por rayos y de composición estructural."
---

Si algo de esta lista no sale de memoria, vuelve a
[dominance-query.md](/structures/dominance-2d/operations/dominance-query) y
traza el ejemplo "Normal" de
[examples.md](/structures/dominance-2d/examples) a mano, columna por
columna, antes de intentarlo de nuevo.
