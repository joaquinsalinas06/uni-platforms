---
kind: examples
title: Ejemplos
---

<!--
El mazo no trae ejemplos concretos en esta sección (páginas 13-20): las
cuatro definiciones son abstractas, sin valores ni secuencias. Los tres
ejemplos que siguen están DERIVADOS de las definiciones textuales, no
aparecen en las diapositivas — se marca en cada uno.
-->

## Mínimo

*(derivado de la definición; no aparece en las diapositivas)*

Una lista con una sola operación `set(i, valor)` e `historial de versiones`,
efímera al inicio:

```
v0: [1, 2, 3]
set(0, 9)  ->  v1: [9, 2, 3]     (v0 se pierde: estructura efímera)
```

Si se hace **parcialmente** persistente, la misma secuencia produce:

```
v0: [1, 2, 3]
set(0, 9) sobre v0  ->  v1: [9, 2, 3]     (v0 sigue consultable)
set(1, 7) sobre v1  ->  v2: [9, 7, 3]     (v0 y v1 siguen consultables)
```

`set` sólo puede aplicarse sobre v1 (la más reciente) para producir v2 — no
se puede volver a escribir sobre v0. Grafo de versiones: `v0 -> v1 -> v2`,
una línea. Esto es exactamente el caso donde parcial ya alcanza y total
sería más poder del que el problema pide.

## Normal

*(derivado de la definición; no aparece en las diapositivas)*

La misma lista, ahora **totalmente** persistente: se permite volver a v0 y
escribir ahí, en vez de forzar a partir siempre de la última versión.

```
v0: [1, 2, 3]
set(0, 9) sobre v0  ->  v1: [9, 2, 3]
set(2, 5) sobre v0  ->  v2: [1, 2, 5]     (rama distinta, también hija de v0)
set(1, 7) sobre v1  ->  v3: [9, 7, 3]
```

Grafo de versiones:

```
        v0
       /  \
     v1    v2
      |
     v3
```

Un árbol, no una línea: v1 y v2 son ambas hijas de v0, y ninguna es hija de
la otra. Esto es lo que un problema necesita en cuanto pide "explorar varias
líneas de cambios desde el mismo punto" — parcial no alcanza porque parcial
prohíbe volver a escribir sobre v0 una vez que existe v1.

Caso de decisión típico (el que un ejercicio pediría): dado el enunciado
"quiero deshacer un cambio y probar una alternativa distinta desde ahí,
conservando ambas ramas", el nivel que se necesita es **total**, no parcial
— porque hay dos escrituras (v1 y v2) sobre la misma versión padre (v0).

## Límite

*(derivado de la definición; no aparece en las diapositivas)*

Ahora se pide **combinar** v1 y v2 (por ejemplo, "toma la versión con
`set(0,9)` aplicado y la versión con `set(2,5)` aplicado, y produce una
versión con ambos cambios"):

```
v0
 |  \
v1   v2
 \   /
  v3   <- merge(v1, v2): dos padres, no uno
```

Ni parcial ni total alcanzan aquí: total permite que v3 tenga un único padre
(sea v1 o v2), pero no que tenga **dos**. v3 con dos padres convierte al
grafo de versiones en un **DAG** — es exactamente la definición de
persistencia confluente: "además de actualizar, se puede combinar (mezclar)
dos versiones distintas en una nueva." Este es el caso patológico frente a
total: un merge de dos ramas es la operación que fuerza a subir de nivel.
Es también, según el mazo, la parte de la taxonomía que este curso menciona
pero no desarrolla con una técnica propia — se resuelve fuera del alcance de
`fat-nodes` y `path-copying`.
