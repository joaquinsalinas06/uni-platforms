---
kind: examples
title: Casos resueltos
---

En estas consultas derivadas, los vecinos son estrictos. Escribe esa convención antes de empezar.

## La consulta existe y aun así hay que mirar sus vecinos
Para S={2,5,9,13}, consulta 9. La búsqueda exacta se detiene al encontrar 9. El predecesor estricto es 5 y el sucesor estricto es 13. Si cambias a predecesor no estricto, la misma entrada devuelve 9. En una lista ordenada son dos pruebas diferentes: la posición de la primera llave mayor o igual y la de la primera estrictamente mayor. Confundirlas afecta precisamente al caso de coincidencia.

## La consulta cae fuera del conjunto
Para q=1, el primer candidato a la derecha es 2 y a la izquierda no hay ninguno. Para q=14 ocurre lo contrario: el predecesor es 13 y el sucesor no existe. En el conjunto vacío faltan ambos. No uses 0 para representar ausencia si 0 es una llave válida del universo.

## Separar y recomponer una llave
En cuatro bits, 10 es 1010. Sus dos bits altos dan 2 y sus dos bits bajos dan 2. Así sabemos que vive en el clúster [8,11], con desplazamiento 2. Para q=11 el prefijo es el mismo y sólo cambia el desplazamiento. Al pasar de 11 a 12 cambian ambos, pues se cruza al grupo siguiente. Recomponer con cuatro posiciones por clúster da 4·2+2=10.

## Una tabla de pertenencia deja una pregunta abierta

En universo de cuatro bits, compara dos conjuntos, {2,5,9} y {2,7,9}. Consultar si 8 está presente devuelve «no» en ambos. En el primero, su predecesor es 5 y en el segundo es 7. Una respuesta de pertenencia no distingue dos estados que requieren respuestas ordenadas distintas.

Si representas cada conjunto por una lista creciente, puedes localizar el hueco de 8 con comparaciones. En un modelo que permite trabajar con bits, también puedes dividir 8 como prefijo 10 y sufijo 00. Eso delimita su grupo natural, pero todavía hay que saber si el grupo tiene candidatos o si hay que cruzar a otro.

## Localizar un hueco incluso cuando la consulta no existe

Derivado. Usa S={2,5,9,13}, universo de cuatro bits y predecesor estricto de 8.

1. Ordena las llaves y escribe sus posiciones de 0 a 3. La consulta no se agrega al conjunto.
2. Busca el primer índice con llave mayor o igual que 8. Al inicio, los cuatro índices son candidatos.
3. Compara 8 con la llave del índice 2, que es 9. El primer candidato no puede estar después de 2.
4. Compara con el índice 1, que contiene 5. Como 5 es menor, ese índice tampoco es la frontera.
5. La frontera es 2. El candidato inmediatamente anterior es el índice 1.
6. Lee su valor 5. Ese es el predecesor; 1 sólo es su índice en el arreglo.
7. Comprueba que el sucesor estricto es 9 porque 8 no está presente.
8. Repite la lectura conceptual para q=9. Ahora la frontera señala una coincidencia.
9. Para predecesor estricto conserva el anterior, 5. Para sucesor estricto descarta la coincidencia y devuelve 13.
10. Representa 8 como 1000: su grupo por prefijo 10 va de 8 a 11. Contiene un candidato a sucesor, pero no al predecesor.

**Comprobación.** Dividir en grupos da una región candidata, pero algunos vecinos están fuera. Una estructura como vEB necesita un resumen para cruzar ese límite.
