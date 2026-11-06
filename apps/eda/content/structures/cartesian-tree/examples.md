---
kind: examples
title: Casos resueltos
---

El ejemplo principal es el arreglo de clase [7,8,2,6,9,4]. Dibuja posiciones aunque varias llaves puedan tener el mismo valor.

## Dos retiros cambian la raíz
Tras 7 y 8, la espina derecha contiene ambos en ese orden. Llega 2. Retira primero 8 y luego 7 porque ambos valores superan 2. La espina queda vacía y 2 pasa a ser raíz. El último retirado es 7: todo su subárbol, incluido 8, se conecta a la izquierda de 2. Retirar del stack no equivale a borrar del árbol.

## Dos retiros sin cambiar la raíz
Después de leer 6 y 9, la espina es [2,6,9]. Llega 4. Retira 9 y 6, pero 2 permanece porque es menor. Conecta 4 a la derecha de 2 y el subárbol de 6 a la izquierda de 4. El 9 continúa a la derecha de 6. El inorden sigue siendo 7,8,2,6,9,4. Cada padre continúa siendo menor que sus hijos.

## Usar el árbol para contestar un intervalo
RMQ(3,5) pregunta por [6,9,4]. Ubica los nodos de índices 3 y 5. El segundo, de valor 4, es ancestro del primero, por lo que el LCA es el propio índice 5. Para RMQ(1,4), los extremos 8 y 9 están a lados distintos de la raíz de valor 2. El LCA es el índice 2. En ambos casos devuelve el índice del ancestro.

## Un empate prueba la convención de argmin

Construye para [2,2,1]. Si el desempate favorece el índice menor, el segundo 2 entra como hijo derecho del primero: ambos tienen igual valor, pero el primero tiene prioridad. Cuando llega 1 retira a los dos de la espina y se vuelve raíz. El primer 2 queda como raíz del subárbol izquierdo y conserva al segundo como hijo derecho.

Consulta [0,1]. El LCA de los dos doses es el índice 0, que coincide con el primer mínimo. Si hubieras tratado la igualdad como motivo para retirar al primero al insertar al segundo, el resultado seguiría siendo mínimo por valor pero cambiaría la posición devuelta.

## Construir la espina, reparar el árbol y verificar un RMQ

Arreglo de clase [7,8,2,6,9,4]. Mantén separados el índice y el valor.

1. Inserta índice 0 con valor 7. Es raíz y único elemento de la pila.
2. Llega 8. El 7 puede seguir arriba, así que enlaza 8 a su derecha y apílalo.
3. Llega 2. Retira 8 porque supera a 2; eso sólo elimina un candidato de la pila.
4. Retira también 7. Sigue siendo padre de 8, aunque ambos ya no estén en la pila.
5. La pila se vació. Haz de 2 la raíz y conecta 7 como su hijo izquierdo.
6. Llega 6. Entra a la derecha de 2. La pila representa [2,6].
7. Llega 9. Entra a la derecha de 6. La pila pasa a [2,6,9].
8. Llega 4. Retira 9 y luego 6. Detente en 2 porque 2 es menor.
9. Conecta 6 a la izquierda de 4 y conserva a 9 bajo 6.
10. Conecta 4 a la derecha de 2 y apílalo. La espina final es [2,4].
11. Consulta [3,5]. Los extremos son 6 y 4. El 4 es su ancestro común más bajo.

**Comprobación.** El inorden sigue siendo 7,8,2,6,9,4. El LCA devuelve el índice 5, donde vive el mínimo de [6,9,4].
