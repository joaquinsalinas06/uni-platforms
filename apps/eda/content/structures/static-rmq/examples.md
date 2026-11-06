---
kind: examples
title: Casos resueltos
---

Usaremos el arreglo de clase A=[5,3,8,1,9,4,7,2] e índices desde cero. RMQ devuelve el índice del mínimo.

## Construir una celda a partir de dos medias ventanas
Para M[2,4], la ventana empieza en 4 y mide cuatro. Divide [4,7] en [4,5] y [6,7]. El primer mínimo está en 5 porque 4<9. El segundo está en 7 porque 2<7. Compara A[5]=4 con A[7]=2. Escribe 7 en la tabla, no 2. Guardar el índice permite recuperar la posición y el valor sin ambigüedad.

## Responder [1,6] con ventanas solapadas
La longitud es seis. La mayor potencia de dos que cabe es cuatro. Toma [1,4] y [3,6]. La primera ventana toca el límite izquierdo, la segunda el derecho y juntas cubren las seis posiciones. Ambas encuentran A[3]=1. Repetir ese candidato no cambia la respuesta, que sigue siendo índice 3. Si intentaras sumar los valores con la misma cobertura, las posiciones 3 y 4 entrarían dos veces.

## Longitud exacta y empate
Para [4,7], ambas ventanas coinciden: lees dos veces la misma información o puedes devolverla directamente. Para una variante del arreglo [5,3,8,1,9,1,7,2], consultar [1,6] encuentra dos unos. Elige 3 con el desempate por índice menor. Esa convención debe usarse al construir las ventanas y al responder.

## Resolver el caso de longitud uno

Consulta [6,6]. La mayor potencia de dos que cabe es uno, así que ambas ventanas son [6,6]. La fila cero guarda el índice 6 en esa posición. No se necesitan otras filas, aunque el valor A[6] no sea mínimo de ningún intervalo grande. Esta prueba rápida detecta errores en el término $r-l+1$: con $r-l$ obtendrías longitud cero para una consulta válida.

En la misma tabla, [0,7] usa la fila de longitud ocho y devuelve el índice 3. Los extremos de tamaño uno y de tamaño completo se resuelven con la misma regla.

## Construir las dos celdas que necesita RMQ(1,6)

Arreglo de clase [5,3,8,1,9,4,7,2]. Usa índices desde cero y devuelve el primer mínimo.

1. Cuenta las posiciones de 1 a 6, ambas incluidas: son seis.
2. Selecciona k=2 porque cuatro cabe y ocho no. Vas a consultar la fila de longitud cuatro.
3. Ancla la primera ventana en 1. Cubre [1,4].
4. Para construir su entrada, parte en [1,2] y [3,4].
5. Los mínimos de esas mitades son índice 1, valor 3, e índice 3, valor 1. Conserva 3.
6. Ancla la segunda ventana en el extremo derecho. Su inicio es 6−4+1=3.
7. Parte [3,6] en [3,4] y [5,6].
8. Los mínimos de las mitades son índice 3, valor 1, e índice 5, valor 4. Conserva 3.
9. Marca la intersección [3,4]. Los índices 1 a 6 quedan cubiertos y ninguno queda fuera.
10. Compara los dos candidatos de la fila de longitud cuatro. Ambos son 3. Devuelve el índice 3, no el valor 1.

**Comprobación.** La construcción hizo comparaciones intermedias. La consulta, una vez preparada la tabla, sólo lee los dos candidatos y compara.
