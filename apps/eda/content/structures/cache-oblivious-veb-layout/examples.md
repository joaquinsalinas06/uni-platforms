---
kind: examples
title: Casos resueltos
---

Estas trazas usan el layout recursivo sobre el árbol fijo de la lección. Distingue orden de almacenamiento de orden de búsqueda.

## Buscar 5 después de reordenar el árbol
En el BST con raíz 4, la primera comparación dirige a 6. La segunda dirige a su hijo izquierdo 5. El recorrido lógico es 4 → 6 → 5, aunque las posiciones físicas de esas llaves sean 0, 4 y 5 en el arreglo [4,2,1,3,6,5,7].

Si los bloques físicos tienen cuatro celdas, 4 ocupa el primer bloque y 6 y 5 comparten el segundo. Tres comparaciones de llaves implican dos lecturas en frío. Para buscar 1, la ruta 4 → 2 → 1 cae entera en el primer bloque. La misma altura puede dar distintos costos exactos.

## Un fragmento que cruza una frontera
Toma [2,1,3] en posiciones 1–3. Con B=4 cae completo en el primer bloque. Con B=2, las posiciones 1 y 2 están a lados distintos de una frontera. Ese fragmento de tres celdas es demasiado grande para el argumento de un fragmento que cabe en un bloque. En cambio, cualquier fragmento de dos celdas sí toca como máximo dos bloques físicos, incluso si empieza en una posición impar.

La prueba selecciona fragmentos de tamaño a lo sumo B **después** de fijar B para analizar. El layout ya está construido y puede usarse para ambas máquinas.

## Qué sucede si toda la entrada cabe
Si N es menor que B, una búsqueda fría sobre el arreglo alineado necesita una lectura. Una expresión que sólo escriba logaritmo puede dar una fracción en este caso. El término constante representa precisamente el primer acceso y los casos de tamaño pequeño.

## Comparar el mismo camino en dos layouts

Para el árbol completo de siete llaves, el orden por niveles es [4,2,6,1,3,5,7]. Buscar 1 toca posiciones 0, 1 y 3. En el layout recursivo [4,2,1,3,6,5,7] visita 0, 1 y 2. Con bloques de tres celdas, el primer recorrido cruza al segundo bloque justo al visitar 1. El segundo queda entero en el primero.

Prueba la misma comparación con búsqueda de 7: por niveles se visitan 0, 2 y 6, que ocupan dos bloques. En el layout recursivo se visitan 0, 4 y 6, que ocupan tres. Una traza pequeña incluso puede empeorar. La cota del layout se obtiene al analizar cuántos fragmentos de la escala de B puede cruzar cualquier ruta.

## Separar las decisiones del BST de las lecturas del arreglo

Derivado. Usa el BST completo de llaves 1 a 7, el layout [4,2,1,3,6,5,7] y bloques de cuatro.

1. Identifica 4 como raíz lógica. Su lugar en el arreglo es la posición 0.
2. Corta la estructura en la parte superior [4] y dos subárboles de tres nodos.
3. Escribe el fragmento superior. Aún no necesitas fijar un tamaño físico de bloque.
4. Descompón la parte izquierda. Se escribe primero 2, después 1 y 3.
5. Descompón la parte derecha. Se escribe primero 6, después 5 y 7.
6. Para analizar B=4, marca la frontera entre posiciones 3 y 4.
7. Consulta 5. Carga el bloque de 4, que también contiene la parte izquierda.
8. Compara 5>4. La siguiente llave es 6, en la posición 4, y obliga a cargar el bloque siguiente.
9. Compara 5<6. Su hijo izquierdo es 5 en la posición 5. Ese bloque ya está cargado.
10. Encuentra 5 tras tres visitas de nodo y dos lecturas. Las posiciones físicas explican la diferencia.

**Comprobación.** Buscar 1 lee un bloque con la misma altura de búsqueda. El tamaño del bloque se usa para analizar el layout, no para construirlo.
