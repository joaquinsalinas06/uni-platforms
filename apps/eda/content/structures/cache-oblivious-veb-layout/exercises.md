---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: >-
    En el layout van Emde Boas de un árbol de 15 nodos, ¿qué conjuntos de nodos ocupan casillas consecutivas?
  hints:
  - Observa qué produce cada corte de la recursión.
  solution: Cada pieza de la descomposición recursiva, por ejemplo {1,2,3} y {4,8,9}.
  label: reconocer
- level: 2
  statement: >-
    Con el layout [1,2,3,4,8,9,5,10,11,6,12,13,7,14,15], traza buscar 6. Indica el orden de los nodos visitados.
  hints:
  - Decide izquierda o derecha en cada nodo lógico, no en la casilla.
  - El camino de 6 pasa por 1 y 3.
  solution: Visita 1, 3 y 6. El nodo 6 está en la casilla 10.
  label: trazar
- level: 3
  statement: >-
    Con el mismo layout y bloques de 4 casillas, ¿cuántos bloques toca la ruta 1, 2, 5, 11?
  hints:
  - Primero encuentra la casilla de cada nodo de la ruta.
  - Las casillas son 1, 2, 7 y 9.
  solution: Tres bloques. Las casillas 1 y 2 caen en el bloque 1, la 7 en el bloque 2 y la 9 en el bloque 3.
  label: resolver
- level: 4
  statement: >-
    Con $B = 2$, ¿cuántos bloques toca la pieza que ocupa las casillas 2 y 3?
  hints:
  - Las fronteras de bloque están antes de las casillas 1, 3, 5, etc.
  solution: Dos. Las casillas 2 y 3 caen en bloques distintos, aunque la pieza tenga 2 casillas.
  label: comparar
- level: 5
  statement: >-
    Justifica que la altura de cada pieza de la escala $B$ es al menos $\tfrac{1}{2}\lg B$.
  hints:
  - Piensa en la pieza que resulta de la primera escala donde la altura es menor o igual a lg B.
  - Compara con la altura de su padre en la recursión.
  solution: >-
    El padre de esa pieza tenía altura mayor que lg B, y el corte a media altura deja piezas de aproximadamente la mitad de la altura del padre. Así cada pieza tiene altura al menos (1/2) lg B.
  label: justificar
- level: 6
  statement: >-
    ¿Por qué una pieza de $B$ casillas puede costar dos lecturas, y nunca tres?
  hints:
  - Prueba un comienzo cerca del final de un bloque.
  - Cuenta cuántas fronteras de bloque pueden caer dentro de un intervalo de longitud B.
  solution: >-
    Un intervalo de longitud a lo sumo $B$ puede contener como mucho una frontera interna de bloques de tamaño $B$. Por tanto toca como máximo dos bloques.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
