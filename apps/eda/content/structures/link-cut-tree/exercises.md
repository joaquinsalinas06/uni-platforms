---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: >-
    ¿En qué se diferencian el hijo pesado de Heavy-Light y el hijo preferido de un link-cut tree?
  hints:
  - >-
    Piensa en quién elige y en cuándo cambia.
  solution: >-
    El pesado lo elige el tamaño y no cambia (árbol estático); el preferido lo elige el último acceso y cambia en cada Access. Heavy-Light garantiza $\le \lg n$ cadenas por camino; los caminos preferidos, $O(\lg n)$ amortizado, y Heavy-Light sólo se usa para analizarlos.
- level: 2
  label: trazar
  statement: >-
    En el árbol de clase con caminos $\{1,2,4\}$, $\{3,6\}$, $\{5\}$, ejecuta Access(6): ¿qué caminos quedan y qué cambios de hijo preferido hubo?
  hints:
  - >-
    La ruta es $1 \to 3 \to 6$.
  solution: >-
    El 1 cambia de 2 a 3; $3 \to 6$ ya era preferida; 6 no tiene hijos. Caminos: $\{1, 3, 6\}$, $\{2, 4\}$, $\{5\}$. Un cambio.
- level: 3
  label: resolver
  statement: >-
    Explica cómo se implementa Cut(v) con raíz fija y por qué el hijo izquierdo de $v$ tras Access(v) contiene exactamente a sus ancestros.
  hints:
  - >-
    La clave del splay es la profundidad.
  solution: >-
    Tras Access(v), el splay de $v$ contiene el camino raíz $\leadsto v$ y $v$ es su raíz sin hijo derecho. Como la clave es la profundidad, todo lo que está a la izquierda de $v$ es menos profundo: sus ancestros. Cut: $\mathrm{padre}[\mathrm{izq}[v]] \leftarrow$ nulo, $\mathrm{izq}[v] \leftarrow$ nulo, actualizar $v$. $O(\lg n)$ amortizado.
- level: 4
  label: adaptar
  statement: >-
    Adapta la estructura para responder el **máximo peso de arista** en el camino entre $u$ y $v$ en un bosque sin raíz fija.
  hints:
  - >-
    Convierte cada arista en un nodo con su peso.
  - >-
    Con MakeRoot(u) y Access(v) el splay de $v$ es el camino $u \leadsto v$.
  solution: >-
    Cada arista $(u, v, w)$ se representa con un nodo $e$ de valor $w$ y Link(u, e), Link(e, v); los nodos originales valen $-\infty$. Cada nodo guarda el máximo de su subárbol del splay. Camino(u, v): MakeRoot(u), Access(v) y se lee el máximo en la raíz del splay de $v$.
- level: 5
  label: diseñar
  statement: >-
    Diseña un MST dinámico bajo inserción de aristas con link-cut trees y da su costo por arista.
  hints:
  - >-
    Si la arista nueva cierra un ciclo, compara con la más cara del ciclo.
  solution: >-
    Al llegar $(u, v, w)$: si FindRoot(u) $\ne$ FindRoot(v), se enlazan (con el nodo de la arista). Si están conectados, se consulta el máximo del camino $u \leadsto v$; si es mayor que $w$, se corta esa arista (dos Cut) y se enlaza la nueva. Cada paso es $O(1)$ operaciones de $O(\lg n)$ amortizado.
- level: 6
  label: demostrar
  statement: >-
    Demuestra que en $m$ operaciones Access hay $O(n + m\lg n)$ cambios de hijo preferido.
  hints:
  - >-
    Clasifica los cambios por la arista que se vuelve preferida, pesada o liviana.
  - >-
    ¿Cuándo deja de ser preferida una arista pesada?
  solution: >-
    Livianas: en cada Access se vuelven preferidas sólo aristas de la ruta raíz $\leadsto v$, que tiene $\le \lg n$ livianas: $\le m \lg n$. Pesadas: para volverse preferida, una pesada tuvo que dejar de serlo, lo que ocurre sólo si su hermana liviana se vuelve preferida ($\le \lg n$ por Access) o si el Access termina en su padre (1 por Access); al inicio hay $\le n$ pesadas no preferidas: $\le n + m(\lg n + 1)$. Total $O(n + m\lg n)$.
---

Antes de abrir una pista, dibuja los caminos preferidos actuales.
