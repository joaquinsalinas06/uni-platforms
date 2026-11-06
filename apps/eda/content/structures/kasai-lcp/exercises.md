---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué compara LCP en el rango r?
  hints:
  - Mira las posiciones r y r−1 en SA.
  solution: Compara los dos sufijos vecinos en orden lexicográfico.
  label: reconocer
- level: 2
  statement: Después de medir h=3 en i=1, ¿desde dónde compara i=2?
  hints:
  - Ambos sufijos perdieron su primer carácter.
  solution: Puede omitir los dos primeros caracteres y empezar con longitud conocida 2.
  label: trazar
- level: 3
  statement: ¿Qué intervalo de LCP compara los rangos 1 y 3?
  hints:
  - Usa las aristas entre rangos, no las celdas de los extremos.
  solution: LCP[2..3]. Sus valores 1 y 3 dan mínimo 1.
  label: resolver
- level: 4
  statement: ¿Cuántos substrings distintos tiene banana?
  hints:
  - Empieza con 6·7/2.
  - Resta la suma de LCP positivos.
  solution: 21−(1+3+2)=15.
  label: comparar
- level: 5
  statement: ¿Qué orden de recorrido permite heredar h−1?
  hints:
  - Distingue avanzar un rango de quitar un carácter al sufijo.
  solution: Avanzar una posición de texto. El sufijo en i+1 se obtiene quitando la primera letra del
    sufijo en i.
  label: justificar
- level: 6
  statement: ¿Por qué un RMQ de LCP usa el mínimo?
  hints:
  - Un prefijo común en los extremos debe aparecer en todos los sufijos intermedios.
  solution: La menor coincidencia entre vecinos es el prefijo que todos los sufijos del intervalo
    comparten.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
