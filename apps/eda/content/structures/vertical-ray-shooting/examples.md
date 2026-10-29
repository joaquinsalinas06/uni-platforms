---
kind: examples
title: Ejemplos
---

## Mínimo

Un segmento S=((2,5),(10,5)) y Q=(6,2). La vertical x=6 cruza S y el rayo
hacia arriba lo toca en (6,5). S es el primer y único impacto.
Este ejemplo numérico es didáctico, derivado del enunciado.

## Normal

El [mapa reconstruido](/structures/vertical-ray-shooting) conserva las
aristas y coordenadas de #9/#23. Desde (4,12), el primer impacto está en
y=15. Desde (8,4), está en el vértice (8,10): dos segmentos comparten ese
impacto. Desde (19,4), está en (19,77/6), sobre el segmento
(14,2)–(20,15). No existe un techo horizontal único y=8 para estas consultas.

El segmento encontrado permite consultar la cara incidente por debajo.
Una misma cara puede tener varios segmentos superiores: **segmentos
diferentes no implican caras diferentes**. En un vértice se requiere una
convención de desempate/incidencia, no elegir una cara por el ID de arista.

## Límite

Si todos los segmentos quedan por debajo de Q o fuera de su columna,
el rayo no tiene impacto. Un segmento vertical colineal se alcanza en su
extremo inferior por encima de Q; si Q ya está sobre él, la distancia es
cero. El explorador muestra todos los segmentos empatados en el primer
impacto.

El curso construye la reducción para rayos verticales. La dirección
arbitraria se deja como pregunta abierta (#58), no como una función ya
implementada aquí.
