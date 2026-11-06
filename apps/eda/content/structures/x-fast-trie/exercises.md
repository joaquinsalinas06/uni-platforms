---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: >-
    En el X-fast trie de $S = \{2, 3, 4, 5, 7, 14, 15\}$ con $w = 4$, ¿cuántas entradas tiene $T$? Y, ¿por qué la búsqueda de sucesor puede hacer búsqueda binaria sobre las longitudes $\ell$?
  hints:
  - Cuenta los nodos de valor 1 del trie, nivel por nivel.
  - Si un prefijo no existe, ninguna extensión suya existe.
  solution: >-
    Hay $1 + 2 + 3 + 4 + 7 = 17$ entradas, una por cada prefijo que existe. La búsqueda por longitudes es válida porque la existencia es monótona: si el prefijo de longitud $\ell$ falta, todos los de longitud mayor también faltan.
  label: reconocer
- level: 2
  statement: >-
    En el mismo conjunto, traza la búsqueda de niveles para $x = 6 = 0110_2$. Indica el valor de $\text{lo}$, $\text{hi}$ y $\text{mid}$ en cada paso, y el valor final de $\ell$.
  hints:
  - Empieza con $\text{lo} = 0$ y $\text{hi} = 4$. Usa $\text{mid} = \lceil (\text{lo} + \text{hi})/2 \rceil$.
  - Cuando un prefijo existe, lo sube a $\text{mid}$; cuando no, baja $\text{hi}$ a $\text{mid} - 1$.
  solution: >-
    $(0,4) \to \text{mid}=2$ existe, $\text{lo}=2$; $\text{mid}=3$ existe, $\text{lo}=3$; $\text{mid}=4$ no existe, $\text{hi}=3$. Termina con $\ell = 3$ y $p = 011$.
  label: trazar
- level: 3
  statement: >-
    Con el mismo $S$, calcula el sucesor de $x = 13 = 1101_2$. ¿Qué extremo de qué subárbol usas, y qué valor devuelve?
  hints:
  - El prefijo más largo de 13 existente es $11$. Mira el bit que sigue.
  - Si falta el hijo izquierdo, el sucesor es un mínimo de la rama derecha.
  solution: >-
    El prefijo más largo es $11$ ($\ell = 2$). El bit 3 de $x$ es 0 y falta $110$, así que el sucesor es $T[(3,111)].\min = 14$.
  label: resolver
- level: 4
  statement: >-
    Sobre el conjunto derivado $\{0010, 1001, 1010, 1100\}$ con $w = 4$, calcula el sucesor y el predecesor de $x = 1011$. Indica qué parte de la respuesta sale del trie y qué parte de la lista de hojas.
  hints:
  - El prefijo más largo de 1011 que existe tiene longitud 3. Falta su hijo derecho.
  - El predecesor es un máximo; el sucesor se obtiene siguiendo un enlace de la lista desde ese máximo.
  solution: >-
    Prefijo más largo $101$ ($\ell=3$). Falta el hijo derecho, así que el predecesor es $T[(4,1010)].\max = 1010$. El sucesor es el siguiente de $1010$ en la lista: $1100$. El sucesor sale de la lista, no del trie, porque $1100$ no empieza por $101$.
  label: comparar
- level: 5
  statement: >-
    Explica por qué insertar una llave cuesta $\Theta(w)$ aunque la consulta cueste $O(\lg w)$. ¿Qué es lo que se toca en cada operación?
  hints:
  - Cuenta los prefijos que la llave nueva agrega a $T$.
  - La búsqueda del sucesor sólo ubica a la llave en la lista; no es la parte cara.
  solution: >-
    La inserción agrega los $w+1$ prefijos de $x$ a $T$, actualizando mínimo y máximo de los que ya existían. Tocar $w+1$ entradas es $\Theta(w)$. La búsqueda de sucesor sólo ubica la llave en la lista y cuesta $O(\lg w)$.
  label: justificar
- level: 6
  statement: >-
    Demuestra que la búsqueda de niveles hace $\lceil \lg (w+1) \rceil$ sondeos en el peor caso y concluye que la consulta es $O(\lg w)$.
  hints:
  - Tras $k$ sondeos el intervalo de niveles tiene tamaño a lo sumo $\lceil (w+1)/2^k \rceil$.
  - La búsqueda termina cuando el intervalo tiene un solo nivel.
  solution: >-
    Cada sondeo parte el intervalo: si queda con tamaño $m$, después queda con tamaño a lo sumo $\lceil m/2 \rceil$. Tras $k$ sondeos el tamaño es a lo sumo $\lceil (w+1)/2^k \rceil$. Para llegar a 1 hace falta $k \ge \lg(w+1)$, así que $k = \lceil \lg(w+1) \rceil$. Como $\lg(w+1) = O(\lg w)$ y cada sondeo es $O(1)$ esperado, la consulta es $O(\lg w)$ esperado.
  label: demostrar
---
