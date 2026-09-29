---
kind: examples
title: Ejemplos
---

<!--
El material (#12-20) da los cinco algoritmos en pseudocódigo y el conteo de
llamadas a Splay, pero NI UNA traza numérica: no hay un solo árbol con
valores concretos en toda la sección de operaciones básicas. Los tres
ejemplos de abajo están *derivados* ejecutando a mano el pseudocódigo de
split.md / join.md / insert.md / delete.md, y verificados contra
cpp/structures/splay-tree-adt/full-implementation.cpp — ninguno aparece en
las diapositivas.
-->

Notación: `30(20(10,·),40)` es el árbol con raíz 30, hijo izquierdo 20 (que
a su vez tiene hijo izquierdo 10 y ninguno derecho) e hijo derecho 40. `·`
es un puntero nulo.

## Mínimo

*(derivado del pseudocódigo; no aparece en las diapositivas)*

El caso más pequeño donde `Separar` hace algo distinto según la rama: un
árbol de **un solo nodo**, `{7}`.

**Separar por `k = 7`** (o por cualquier `k ≥ 7`):

```
Buscar(7)   → verdadero, 7 ya es la raíz. Splay(7) es un no-op,
              pero cuenta como 1 llamada.
Separar(7): r = 7,  r.valor ≤ k  (7 ≤ 7)  ⇒ primera rama
            I ← 7,  D ← 7.der = ·,  7.der ← ·
            devolver (7, ·)
```

**Separar por `k = 3`** (o por cualquier `k < 7`):

```
Buscar(3)   → falso. El descenso mira 7, baja a la izquierda, cae en ·.
              El último visitado es 7 (el SUCESOR de 3). Splay(7): no-op.
Separar(3): r = 7,  r.valor > k  (7 > 3)  ⇒ segunda rama
            D ← 7,  I ← 7.izq = ·,  7.izq ← ·
            devolver (·, 7)
```

Mismo árbol, misma cantidad de trabajo, resultados espejo. Es el caso mínimo
que muestra por qué el `si` de `Separar` (#15) tiene dos ramas y por qué la
comparación `r.valor ≤ k` basta para los cuatro casos posibles (`k` presente
o ausente, raíz predecesor o sucesor).

Las dos ramas están verificadas con `assert` en la sección 5 de
`full-implementation.cpp`.

## Normal

*(derivado del pseudocódigo; no aparece en las diapositivas)*

`Insertar(35)` sobre un árbol de 7 nodos. Es el caso típico: `k` no está, y
la operación entera recorre el árbol **una sola vez**.

```
Árbol inicial:            20(10(5,15), 40(30,50))
```

**Paso 1 — `Buscar(35)`.** Descenso: 35 > 20 → derecha, a 40. 35 < 40 →
izquierda, a 30. 35 > 30 → derecha, y ahí `30.der = ·`. Se sale del bucle
sin encontrar 35.

El último nodo visitado fue **30**, el predecesor de 35 (#14). Se hace
`Splay(30)` — **llamada 1**, y la única de toda la operación:

```
tras Splay(30):           30(20(10(5,15),·), 40(·,50))
```

**Paso 2 — `Separar(35)`.** La precondición ya se cumple: la raíz 30 tiene a
su izquierda todo lo que vale a lo más 35 y a su derecha todo lo que vale
más. Una comparación, `30 ≤ 35` ⇒ primera rama:

```
I ← 30,  D ← 30.der = 40,  30.der ← ·

I = 30(20(10(5,15),·), ·)        D = 40(·,50)
```

Cero llamadas a Splay acá (#16, #20). Cero comparaciones más allá de la
primera.

**Paso 3 — colgar el nodo nuevo.**

```
x ← nuevo nodo 35
x.izq ← I,  x.der ← D,  raiz ← x

Resultado:                35(30(20(10(5,15),·),·), 40(·,50))
```

**Cuenta final**: 1 llamada a Splay, 1 descenso del árbol (el de `Buscar`),
1 nodo creado, 4 punteros modificados. Exactamente lo que promete el #18
("ningún recorrido adicional del árbol") y lo que cuenta el #20.

El caso simétrico, `Eliminar`, sobre el árbol `20(10, 40(30, 60(50,70)))`:
`Buscar(40)` lo splaya a la raíz (**llamada 1**), quedando
`40(20(10,30), 60(50,70))`; `Unir` desciende por la espina derecha de
`A = 20(10,30)` hasta `m = 30` y hace `Splay(30)` (**llamada 2**), quedando
`A = 30(20(10,·),·)`; finalmente `30.der ← B` da
`30(20(10,·), 60(50,70))`. Dos llamadas, ni una más — el "doble" del #20.

## Límite

*(derivado del pseudocódigo; no aparece en las diapositivas)*

El caso patológico tiene dos mitades, y la segunda es la interesante.

**Mitad 1 — insertar en orden creciente es barato.** `Insertar(1)`,
`Insertar(2)`, …, `Insertar(7)` sobre un árbol vacío:

```
1
2(1,·)
3(2(1,·),·)
4(3(2(1,·),·),·)
...
7(6(5(4(3(2(1,·),·),·),·),·),·)
```

Cada `Buscar(k)` falla contra el máximo actual, que **siempre está en la
raíz** (lo dejó ahí la inserción anterior), así que el descenso mira un solo
nodo y el `Splay` es un no-op. Costo real de cada inserción: $O(1)$. Costo
total de construir el árbol: $O(n)$ — más barato que las $n$ inserciones de
un [BST balanceado](/structures/balanced-bst), que pagan $\Theta(\lg n)$ cada
una más el rebalanceo.

**Mitad 2 — y deja el peor árbol posible.** El resultado es una cadena
degenerada de profundidad 6: el precio de la mitad 1. Ahora `Buscar(1)`, el
nodo más profundo, cuesta $O(n)$ **real**: 6 pasos de descenso y una cascada
de zig-zig/zig hasta la raíz.

```
antes:  7(6(5(4(3(2(1,·),·),·),·),·),·)
Buscar(1) → 1(·, 6(4(2(·,3),5), 7))
```

Nótese qué hace Splay de paso: la cadena de profundidad 6 quedó convertida
en un árbol de profundidad 3. Ésa es la propiedad que hace que la cota
amortizada exista — el costo alto de esta búsqueda ya "prepagó" las
siguientes — y es exactamente lo que el
[Lema de Acceso](/structures/access-lemma) demuestra. Este tema no la
demuestra: lo que hace es **heredarla**. Como `Insertar` y `Eliminar` son
una y dos llamadas a Splay (#20), la misma cota los cubre a los dos sin
ninguna prueba adicional.

**El límite del conteo.** Sobre ese último árbol, `Eliminar(1)` gasta **1**
llamada a Splay, no 2:

```
Buscar(1)  → verdadero, 1 ya es la raíz (llamada 1)
r = 1,  r.izq = ·,  r.der = 6(4(2(·,3),5), 7)
Unir(·, B) → devuelve B en su PRIMERA línea, sin llegar a Splay
Resultado: 6(4(2(·,3),5), 7)
```

El "2" del #20 es una **cota superior**, no una cuenta fija: `Unir` corta
antes cuando uno de los dos árboles está vacío, y `Buscar` no splaya nada
sobre un árbol vacío. La cota se cumple por arriba en todos los casos, que es
lo único que el argumento necesita.
