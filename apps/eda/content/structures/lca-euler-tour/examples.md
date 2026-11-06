---
kind: examples
title: Casos resueltos
---

En el árbol de clase A tiene hijos B y C, y B tiene hijos D y E. Usaremos posiciones desde cero.

## Registrar la vuelta es parte del recorrido
La secuencia es A,B,D,B,E,B,A,C,A. Las profundidades son 0,1,2,1,2,1,0,1,0. Después de D se anota B porque se regresó por esa arista. Si se guardaran sólo las primeras visitas A,B,D,E,C, el intervalo entre D y E no incluiría a B y se perdería el ancestro que debe devolver la consulta.

## Dos nodos en ramas del mismo padre
Primera aparición de D en 2 y de E en 4. El intervalo de profundidades es [2,1,2]. El mínimo cae en posición 3 y el nodo en la misma posición es B. El 1 es una profundidad y el 3 es un índice del recorrido. La respuesta que pide LCA es el nodo B.

## Raíz común y extremo que ya es ancestro
Para D y C toma el intervalo [2,7]. El recorrido vuelve a A antes de bajar a C, así que el mínimo es profundidad 0. Para B y E toma [1,4]. La primera posición ya tiene profundidad 1 y sigue siendo mínima. Si B aparece otra vez a la misma profundidad dentro del intervalo, ambas apariciones representan el mismo ancestro.

## Dos nodos con igual profundidad no son el mismo ancestro

En el recorrido de clase, B y C están ambos a profundidad uno. Para LCA(B,C) toma primeras posiciones 1 y 7. Dentro de [1,7] aparece A en posición 6 con profundidad cero. Esa posición decide la respuesta aunque ambos extremos estén a la misma altura. Buscar sólo una profundidad igual a la de los extremos devolvería un nodo demasiado abajo.

Si en cambio consultas LCA(D,D), el intervalo contiene una sola posición y la respuesta es D. No hace falta un retorno ni una segunda aparición para tratar ese caso.

## Escribir cada entrada de Euler antes de resolver LCA

Árbol de clase: A tiene hijos B y C; B tiene hijos D y E. Se explora de izquierda a derecha.

1. Anota A a profundidad 0 en el índice 0. Marca su primera aparición.
2. Baja a B. Anota B, profundidad 1, en el índice 1.
3. Baja a D. Anota D, profundidad 2, en el índice 2.
4. D no tiene hijos. Vuelve a B y anótalo otra vez en el índice 3. Su primera aparición sigue siendo 1.
5. Baja a E. Anota E, profundidad 2, en el índice 4.
6. E no tiene hijos. Anota el regreso a B en el índice 5.
7. Los hijos de B se agotaron. Vuelve a A y anótalo en el índice 6.
8. Baja a C y anótalo en el índice 7. Es su primera aparición.
9. Regresa a A y escribe la entrada final, índice 8.
10. Consulta D y E: mira profundidades desde el índice 2 hasta el 4. [2,1,2] minimiza en el índice 3.
11. Lee la letra en la misma columna: B. Si consultas D y C, usa [2,7] y el mínimo se mueve al índice 6, que contiene A.

**Comprobación.** Hay nueve entradas porque se registran ocho movimientos y el estado inicial. El índice de un mínimo y la profundidad mínima son datos distintos.
