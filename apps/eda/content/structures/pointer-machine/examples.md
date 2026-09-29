---
kind: examples
title: Ejemplos
---

## Mínimo

La figura del mazo (páginas 9-12): una cadena de cuatro nodos con datos `7`,
`2`, `7`, `42`. La raíz apunta al primer nodo (`7`), que apunta al segundo
(`2`), que apunta al tercero (`7`), que apunta al cuarto (`42`). Cada nodo
tiene $O(1)$ campos (un dato, un puntero), sólo la raíz es punto de entrada, y
seguir cada flecha cuesta $O(1)$. El profesor no traza ninguna operación sobre
esta figura — es un diagrama estático de referencia, no un ejemplo animado.

## Normal

*(derivado de la definición; no aparece en las diapositivas)*

Tomemos la misma cadena de la figura y preguntemos: ¿cuánto cuesta leer el
dato del tercer nodo (el segundo `7`)? Bajo el modelo:

```
1. Empezar en la raíz.               O(1) — regla 2
2. Seguir el puntero al nodo(7).     O(1) — regla 3
3. Seguir el puntero al nodo(2).     O(1) — regla 3
4. Seguir el puntero al nodo(7).     O(1) — regla 3
5. Leer el campo dato del nodo.      O(1) — regla 3
```

Costo total: 4 operaciones de $O(1)$ cada una, es decir $O(4)$ = $O(k)$ donde `k`
es la posición del nodo desde la raíz. No hay forma de saltar directo al
tercer nodo: cada paso de la cadena hay que recorrerlo.

## Límite

*(derivado de la definición; no aparece en las diapositivas)*

El caso patológico es justo el que la figura no dibuja pero que el modelo
permite: una cadena de `n` nodos donde hay que llegar al último. Costo:
$O(n)$ operaciones de seguir-puntero, aunque cada una individualmente sea
$O(1)$. Esto es exactamente lo que distingue al modelo de una máquina RAM con
arreglos — ahí acceder al elemento `n` cuesta $O(1)$ por aritmética de
direcciones, aquí cuesta $O(n)$ porque no existe otra forma de llegar que
seguir la cadena de punteros desde la raíz.

Este caso límite es el que motiva, más adelante en la semana, que
[fat-nodes](/structures/fat-nodes) tenga que resolver el problema de
encontrar los punteros entrantes a un nodo (no se pueden indexar) y que
[path-copying](/structures/path-copying) tenga que copiar el camino
completo desde la raíz (no hay atajo bajo este modelo para llegar a un nodo
intermedio sin pasar por sus ancestros).
