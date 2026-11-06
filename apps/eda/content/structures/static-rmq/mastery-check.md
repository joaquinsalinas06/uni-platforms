---
kind: mastery
title: Prueba de dominio
canExplain:
- "Por qué la sparse table guarda índices y no valores, y qué pasa si guardas valores"
- "Por qué ⌊lg(j - i + 1)⌋ elige dos ventanas que siempre cubren [i, j]"
- "Por qué el solapamiento sirve para mínimo y no para suma"
- "De dónde sale la cota O(n lg n) de preprocesamiento y O(1) de consulta"
- "Cómo las tres zonas (sufijo, bloques completos, prefijo) reducen la memoria a O(n)"
canDo:
- "Construir M[1], M[2] y M[3] para un arreglo de 8 valores comparando índices"
- "Trazar RMQ(i, j) con dos ventanas solapadas y devolver el índice correcto"
- "Aplicar la regla de empate al índice menor en la construcción y en la consulta"
- "Dividir una consulta en tres zonas cuando i y j están en bloques distintos"
---

Cierra el documento sin mirar la teoría. Si no puedes dibujar el nivel 2 de la tabla para un arreglo de 8 valores, vuelve a los diagramas de construcción antes de hacer las trazas.
