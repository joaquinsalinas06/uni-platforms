---
kind: theory
title: "Nodos gordos"
visualization:
  type: persistent
  mode: fat-node
  steps:
    - note: >-
        Un nodo gordo v guarda sus campos originales — el valor y los
        punteros que tendría en la máquina de punteros ordinaria — y un
        registro de modificaciones, vacío al nacer.
      nodes:
        - { id: orig, value: "v: [dato, siguiente] (original)", tag: "siguiente: campo PUNTERO de ejemplo" }
        - { id: reg, value: "registro: []" }
    - note: >-
        Primera escritura: se agrega la tupla (campo, valor, t=3) al
        registro, todavía sin confirmar.
      highlight: ["reg"]
      nodes:
        - { id: orig, value: "v: [dato, siguiente] (original)", tag: "siguiente: campo PUNTERO de ejemplo" }
        - { id: reg, value: "registro: [ ] + (campo, valor, t=3)", state: copied }
    - note: >-
        Con p=1 (un solo puntero entrante), el límite es 2p=2 entradas.
        Llega una segunda escritura, (campo, valor, t=7): el registro
        llega a su tamaño máximo.
      highlight: ["reg"]
      nodes:
        - { id: orig, value: "v: [dato, siguiente] (original)", tag: "siguiente: campo PUNTERO de ejemplo" }
        - { id: reg, value: "registro: [(campo,valor,t=3)] + (campo,valor,t=7)", state: copied }
    - note: >-
        Registro en su límite (2/2 = 2p): el invariante central es que
        nunca crece más allá de esto. La próxima escritura ya no cabe —
        dispara node-split, que crea un nodo nuevo y redirige los
        punteros entrantes (no se reimplica aquí). "siguiente" es UN
        ejemplo de campo puntero, no una parte obligatoria de todo nodo
        gordo — ver "¿por qué `next` en unos pasos de C++ y no en otros?"
        más abajo.
      caption: "campo dato != campo puntero -- next es sólo el ejemplo"
      nodes:
        - { id: orig, value: "v: [dato, siguiente] (original)", tag: "siguiente: campo PUNTERO de ejemplo" }
        - id: reg
          value: "registro: [(campo,valor,t=3), (campo,valor,t=7)]"
          state: marked
---

## ¿Qué problema resuelve?

Toda estructura vista antes de esta semana vive sobre la
[máquina de punteros](/structures/pointer-machine) y es **efímera**: cada
escritura destruye la versión anterior. El profesor lo plantea como
teorema, no como pregunta abierta: cualquier estructura de la máquina de
punteros se puede volver
[parcialmente persistente](/structures/persistence-levels) con overhead
$O(1)$ amortizado en tiempo y $O(1)$ extra de espacio por cada cambio — el
**teorema DSST** — y **nodos gordos** es su implementación concreta. Es
un resultado general y automático: no hay que rediseñar cada estructura a
mano para que recuerde su pasado; basta con aplicar esta técnica sobre
cualquier estructura que ya cumpla las reglas de la máquina de punteros.

Después, la misma idea se extiende (nodos gordos **bidireccionales**) para
lograr [persistencia total](/structures/persistence-levels), con el mismo
orden de costo.

## Intuición

La restricción que hace esto interesante es precisamente la de la máquina
de punteros: **no se pueden tocar de golpe todos los punteros que entran a
un nodo**. Si algo cambia en un nodo y ese nodo tiene varios predecesores
apuntándolo, no hay una operación mágica de "actualizar todas las
referencias a la vez" — cada predecesor es, él mismo, un nodo con $O(1)$
campos, y modificar su puntero es una escritura de campo más, sujeta a las
mismas reglas.

La solución: en vez de sobrescribir un campo y perder el valor anterior,
cada nodo lleva **un pequeño registro de sus cambios recientes** (una
lista acotada de tuplas `(campo, valor nuevo, tiempo)`), y sólo cuando ese
registro se llena se paga el costo de crear un nodo nuevo y redirigir a
quienes apuntaban al viejo — uno por uno, porque no hay otra forma. La
apuesta es que ese costo de redirección, aunque real, ocurre tan poco
seguido que **amortizado** sigue siendo $O(1)$.

## Estructura interna

**El mazo nunca dibuja un nodo gordo** (ausencia señalada en el análisis
de la fuente); lo que sigue es la reconstrucción directa de su
descripción textual, no una invención libre.

Un nodo gordo guarda:

- **Los campos originales**: los valores con los que el nodo nació — el
  dato y los punteros que tendría en la máquina de punteros ordinaria.
  Son el valor al que se recurre cuando el registro no tiene ninguna
  entrada aplicable ("si no hay ninguna, se usa el valor original del
  nodo", página 24).
- **El registro de modificaciones**: una lista de tuplas
  `(campo, valor nuevo, tiempo)`, en orden de inserción, de **tamaño
  acotado por $2p$** — donde $p$ es el número máximo de punteros
  **entrantes** a un nodo ($p = O(1)$ por hipótesis del teorema). Ese
  tamaño acotado es lo que hace $O(1)$ a la lectura: nunca hay que
  recorrer una lista que crece con el tiempo.

```
Nodo gordo v (derivado de la descripción, páginas 21-26):

  campos originales:  [ dato, siguiente ]
  registro (<= 2p):    (campo, valor, t=3)
                       (campo, valor, t=7)
                       ...  (a lo más 2p tuplas)
```

El invariante central: **el registro nunca crece sin límite**. En cuanto
alcanzaría la entrada $2p + 1$, la estructura no la agrega — dispara un
[node-split](/structures/fat-nodes/operations/node-split) en su lugar.
Ese límite $2p$, y no cualquier otro, es lo que hace que el argumento de
potencial cierre exactamente en $O(1)$ (ver "Análisis de complejidad" más
abajo): el split libera de golpe todo lo que el potencial había
acumulado en ese nodo.

## ¿Por qué `next` en unos pasos de C++ y no en otros?

`next`/`siguiente` **no es una parte obligatoria de un nodo gordo** — es
sólo el campo que eligió el profesor para el ejemplo. La regla real viene
de [pointer-machine](/structures/pointer-machine): un nodo tiene $O(1)$
campos, y cada campo es "dato **o** puntero a otro nodo" (regla 1 del
modelo). El nodo más simple que sirve para ilustrar la técnica es uno con
**un** campo de dato y **un** campo puntero — eso es `v: [dato, siguiente]`
en el diagrama de arriba. Podría llamarse `left`/`right` (BST), `child`
(árbol $n$-ario) o no tener ningún puntero — el registro de
modificaciones, el límite $2p$ y `node-split` funcionan exactamente igual,
porque nodos gordos versiona *escrituras de campo*, sin importarle qué
significa el campo.

Y es justo por eso que `next` importa como ejemplo: cuando el campo que se
escribe **es un puntero**, escribirlo significa redirigir quién apunta a
quién — la operación que la máquina de punteros prohíbe hacer "de golpe"
(no hay actualizar-todas-las-referencias-a-la-vez). Si el ejemplo fuera
sólo `dato`, sin ningún puntero, nunca aparecería esa complicación — que es
la razón real de ser de `trackIncoming`/`untrackIncoming` y de gran parte
de [node-split](/structures/fat-nodes/operations/node-split). Ver el
diagrama "Redirigir un puntero: el caso `campo == Next`" en
[Escribir un campo](/structures/fat-nodes/operations/write-field) para el
mecanismo completo.

Por eso `Field::Next` aparece en `step-1-node.cpp` hasta
`step-5-bidirectional.cpp` y en `full-implementation.cpp` — todos
implementan el `FatNode`/`BiFatNode` con sus dos campos de ejemplo — pero
**no** en `step-6-version-tree.cpp`: ese paso no es sobre el nodo gordo en
absoluto, es sobre el **árbol de versiones** (qué versión es ancestro de
cuál), una estructura totalmente distinta que
[linearización del árbol de versiones](/structures/fat-nodes/operations/version-tree-linearization)
necesita para persistencia total. No tiene `dato` ni `siguiente` porque no
es el mismo nodo — es un árbol aparte, sobre las versiones mismas, no
sobre los datos que esas versiones guardan.

## Operaciones

- [Leer un campo en la versión t](/structures/fat-nodes/operations/read-field) —
  recorre el registro de más reciente a más antigua.
- [Escribir un campo, caso con espacio](/structures/fat-nodes/operations/write-field) —
  agrega una tupla al registro.
- [Node-split](/structures/fat-nodes/operations/node-split) — el registro
  se llena: nace un nodo nuevo y se redirigen los $p$ punteros entrantes.
- [Nodos gordos bidireccionales](/structures/fat-nodes/operations/bidirectional-fat-nodes) —
  la extensión con dos registros por nodo para persistencia total.
- [Linearización del árbol de versiones](/structures/fat-nodes/operations/version-tree-linearization) —
  el recorrido de Euler que ordena las versiones para poder compararlas en
  $O(1)$, pieza necesaria de la persistencia total.

## Análisis de complejidad

El estilo aquí es **[el método del potencial](/structures/potential-method)**,
explícitamente heredado de la semana 2 ("Recordando de clases anteriores",
página 27) y aplicado tal cual a esta estructura:
$\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i-1})$,
con la condición de que $\Phi$ nunca caiga por debajo de su valor inicial. El
potencial concreto que fija el profesor (página 28):

$$\Phi = \sum_{v} (\text{entradas usadas en el registro de } v)$$

Dos casos, calculados operación por operación (páginas 29-33):

- **Caso 1 — hay espacio en el registro**: $c_i = O(1)$, $\Delta\Phi = +1$ (una
  entrada más usada). $\hat{c}_i = O(1) + 1 = O(1)$.
- **Caso 2 — el registro está lleno, se hace split**: $c_i = O(1)$ (nodo
  nuevo) $+ O(p)$ (redirigir los $p$ punteros entrantes). El nodo viejo
  pasa de $2p$ entradas usadas a $0$: $\Delta\Phi_{split} = -2p$. Cada redirección
  agrega a lo más 1 entrada en su predecesor: $\Delta\Phi_{redirect} \le +p$. Entonces
  $\hat{c}_i = O(p) + (-2p + p) = O(p) - p = O(1)$, **porque $p = O(1)$ por
  hipótesis** — sin esa hipótesis el argumento no cierra.

El mismo razonamiento, aplicado a los $n$ cambios de una secuencia
completa (no sólo a uno), es el contenido del **teorema DSST**: el
overhead total es $O(1)$ multiplicativo amortizado en tiempo y $O(1)$
extra de espacio por cada cambio.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. Como en el resto del curso, el
profesor **nunca distingue mejor/promedio/peor caso**: da un costo real y
uno amortizado, y aquí ambos aparecen siempre en el `reasoning` de cada
operación.

## Ejemplos

Ver [Ejemplos](/structures/fat-nodes/examples).

## Comparación con estructuras relacionadas

| | Técnica | Registro/copia por cambio | Nivel de persistencia |
| --- | --- | --- | --- |
| Nodos gordos | mutar in place + registro acotado | $O(1)$ amortizado | parcial (y total, bidireccional) |
| [Path copying](/structures/path-copying) | nunca mutar, copiar el camino | $O(h)$ nodos copiados (altura $h$) | cualquiera, vía persistencia funcional |

El contraste lo hace el propio profesor (página 49): path copying da
persistencia "gratis" porque **"no hace falta ningún registro de
modificaciones ni ningún split"** — es la alternativa a los nodos gordos,
no su complemento. Y un límite declarado hacia arriba: los nodos gordos
"pensadas para un único 'historial lineal o de árbol', ya no bastan en
general" (página 47) frente a la persistencia confluente, donde una misma
versión puede combinar hasta $2^u$ historiales distintos acumulados por
caminos diferentes.

## Prueba de dominio

Ver [Prueba de dominio](/structures/fat-nodes/mastery-check).
