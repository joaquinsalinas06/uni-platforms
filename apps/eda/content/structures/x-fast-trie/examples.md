---
kind: examples
title: Casos resueltos
---

Tomamos hojas binarias de cuatro bits {0010,1001,1010,1100}. Los ejemplos son derivados.

## Falta la rama derecha
Para 1011, prueba longitud 2, después 3 y finalmente 4. Los prefijos 10 y 101 existen. La palabra completa no. Bajo el nodo 101 falta el hijo derecho, así que la hoja máxima de la rama izquierda es la mayor llave bajo el prefijo. Ese extremo es 1010. El sucesor aparece en la lista de hojas: 1100. Si se pidiera el predecesor bastaría con 1010.

## Falta la rama izquierda
Para 1000, el prefijo 100 existe gracias a 1001. El hijo 0 de ese prefijo no existe. Ahora el extremo útil es el mínimo de la rama derecha: 1001. Ése es el sucesor. Para el predecesor, retrocede en la lista a 0010. Cambiar de izquierda a derecha invierte el papel del extremo, aunque la búsqueda de longitud funcione igual.

## La palabra completa sí existe
Para 1010, la búsqueda llega al nivel 4. No necesitas un puntero para una rama ausente. Desde la hoja existente puedes leer sus vecinos 1001 y 1100. Si la hoja fuera el primer elemento de la lista, faltaría el vecino anterior.

## Un extremo puede quedarse sin vecino

Consulta 0000. El prefijo 00 existe, pero 000 no: la única hoja con ese prefijo inicial es 0010 y continúa por 001. Falta el hijo izquierdo, así que el mínimo de la parte derecha da el sucesor 0010. Al pedir el anterior de esa hoja, la lista termina. El predecesor no existe.

Observa la secuencia completa: la búsqueda por longitudes termina con un prefijo válido, el salto devuelve un extremo válido y el vecino todavía puede faltar. El caso extremo pertenece a la lista ordenada y no se detecta mirando solamente la longitud de prefijo.

## Encontrar el prefijo y traducir el fallo en vecinos

Derivado. Hojas 0010, 1001, 1010 y 1100. Consulta 1011.

1. Numera longitudes 0 a 4. El prefijo vacío existe porque el conjunto no está vacío.
2. Prueba longitud 2. El diccionario contiene 10.
3. Descarta longitudes menores como solución final: ya conoces un prefijo más largo.
4. Prueba longitud 3. El diccionario contiene 101 gracias a la hoja 1010.
5. Prueba longitud 4. No contiene 1011.
6. Concluye que 101 es el prefijo más largo y examina el bit que faltaba consumir.
7. El último bit pedido es 1. Falta la rama derecha bajo 101.
8. El salto de ese nodo devuelve la mayor hoja de la rama existente a la izquierda, 1010.
9. Esa hoja es menor que 1011 y ninguna hoja del subárbol puede superarla. Es el predecesor.
10. Sigue un enlace de la lista de hojas hacia la derecha. 1100 es el sucesor, aunque tenga otro prefijo inicial.

**Comprobación.** Las pruebas de existencia sólo encuentran el punto de fallo. El salto y la lista completan la consulta ordenada.
