---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el registro de modificaciones tiene tamaño acotado 2p, y qué se rompería en la cota O(1) de lectura si no lo tuviera."
  - "Por qué redirigir un puntero entrante no es una operación mágica, sino una escritura de campo más sobre el predecesor, sujeta a la restricción de la máquina de punteros."
  - "Cómo se aplica el método del potencial (Phi = entradas usadas en el registro) a los dos casos de write-field, distinguiendo siempre el costo real del amortizado."
  - "Por qué el teorema exige p = O(1), y qué paso exacto del análisis de node-split deja de cerrar si p crece con n."
  - "Qué gana path copying frente a nodos gordos (persistencia 'gratis', sin registro ni split) y qué límite tienen los nodos gordos frente a la persistencia confluente."
  - "Por qué los nodos gordos unidireccionales no alcanzan para persistencia total, y qué agrega la extensión bidireccional."
canDo:
  - Implementar read-field y write-field (caso con espacio) de memoria, sin mirar el pseudocódigo derivado.
  - Trazar un node-split completo a mano, incluyendo la redirección de los p punteros entrantes y qué queda congelado en el nodo viejo.
  - Calcular el costo amortizado de node-split aplicando el método del potencial, no memorizando el resultado O(1).
  - Producir la secuencia de paréntesis del recorrido de Euler sobre un árbol de versiones dado, y leer de ella qué versiones son ancestros de cuáles.
  - Aplicar la técnica con p=1 al ejercicio del BST parcialmente persistente que propone el propio mazo.
---

Si algo de esta lista no sale sin mirar el material, vuelve a
[node-split](/structures/fat-nodes/operations/node-split): es la
operación donde vive toda la dificultad real del tema — la lectura y la
escritura con espacio son casi triviales, y la extensión bidireccional
depende de entender primero por qué el split unidireccional funciona.
