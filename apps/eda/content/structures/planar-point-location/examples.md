---
kind: examples
title: Ejemplos
---

## Mínimo

En el mapa reconstruido de las diapositivas #9/#23, **(8,4) pertenece a B**.
Su frontera, en orden, es (0,0), (8,10), (14,8), (16,13), (20,15), (14,2),
(8,0). Un rayo horizontal desde (8,4) cruza una vez este contorno: impar,
dentro. Las letras A–D son nuestras etiquetas para seguir las caras.

Puedes ver el mapa y mover Q en la
[teoría de localización](/structures/planar-point-location).

## Normal

Los tres puntos del profesor se clasifican sobre el mismo mapa:

| consulta | cara | primer impacto del rayo hacia arriba |
| --- | --- | --- |
| (4,12) | A | segmento (2,15)–(10,15), y=15 |
| (8,4) | B | vértice (8,10), compartido por dos segmentos |
| (19,4) | C | segmento (14,2)–(20,15), y=77/6 |

La figura original es esquemática: aquí usamos las coordenadas rotuladas
y la conectividad de sus aristas, no las distancias en píxeles del PDF.
En (8,10) hay empate entre dos segmentos: para devolver una cara hace
falta la incidencia de las aristas y una convención de desempate. Encontrar
el segmento y etiquetar la cara son pasos relacionados, pero diferentes.

## Límite

**(28,18)** está fuera de todas las caras acotadas: pertenece a la cara
infinita. La paridad es par al probar cada cara.

**(8,4)** estaría sobre la frontera del polígono *distinto*
(0,0)–(8,0)–(8,10)–(0,4), porque su lado derecho es x=8. Ese polígono no
es la cara B del mapa del profesor. No debe usarse para afirmar que el
punto está en su interior.

Para un punto en una arista o vértice, la implementación didáctica devuelve
`frontera` antes de buscar una cara por paridad. En una subdivisión,
una arista puede ser incidente a dos caras: asignarla arbitrariamente a una
ocultaría información.
