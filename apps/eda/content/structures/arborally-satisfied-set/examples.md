---
kind: examples
title: Ejemplos
---

## Mínimo

Un solo punto, $P = \{(2, 1)\}$. No hay ningún par de puntos, así que la condición se cumple **vacuamente**: $P$ es arboralmente satisfecho.
Corresponde a un BST con un solo acceso a la llave 2 que sólo toca la raíz. *(Derivado de la definición; no aparece en las diapositivas.)*

## Normal

El conjunto de la clase (#18): $P = \{(3,1), (3,2), (1,2), (3,3), (4,3), (3,4), (1,4), (2,4)\}$.
Se comprueban todos los pares que no comparten línea. Algunos representativos:

| Par | Rectángulo | Tercer punto |
|---|---|---|
| $(1,2)$ y $(4,3)$ | $[1,4] \times [2,3]$ | $(3,2)$ (también $(3,3)$) |
| $(1,2)$ y $(2,4)$ | $[1,2] \times [2,4]$ | $(1,4)$ en el borde |
| $(4,3)$ y $(2,4)$ | $[2,4] \times [3,4]$ | $(3,3)$ y $(3,4)$ |

El resto de los pares se verifica igual: es arboralmente satisfecho, como corresponde a una ejecución real de BST. *(Verificado con el
comprobador de la teoría sobre los 8 puntos.)*

## Límite

El conjunto $P = \{(1,1), (4,2)\}$ **no** es arboralmente satisfecho: su único par define el rectángulo $[1,4] \times [1,2]$ sin ningún tercer punto.
Para arreglarlo, en general, no basta con agregar *cualquier* punto de ese rectángulo: el punto nuevo forma pares propios que también deben cumplir la condición.

| Punto agregado | ¿Queda satisfecho? | Por qué |
|---|---|---|
| $(1, 2)$ | Sí | Cae en el borde del rectángulo; sus pares con $(1,1)$ y $(4,2)$ comparten línea |
| $(4, 1)$ | Sí | Simétrico |
| $(2, 2)$ | **No** | El par $(1,1)$–$(2,2)$ define $[1,2]\times[1,2]$ sin tercer punto |
| $(2, 1)$ | **No** | El par $(2,1)$–$(4,2)$ define $[2,4]\times[1,2]$ sin tercer punto |

*(Derivado y verificado por enumeración; no aparece en las diapositivas.)*
