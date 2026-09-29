---
kind: theory
title: "Modelo pointer machine"
visualization:
  type: tree
  steps:
    - note: >-
        La única entrada es la raíz. Para leer cualquier valor hay que
        empezar aquí y seguir punteros uno a la vez — no existe "saltar"
        directo a una posición.
      highlight: ["n1"]
      nodes:
        - { id: n1, value: 7, tag: n1, parent: null, state: active }
        - { id: n2, value: 2, tag: n2, parent: n1 }
        - { id: n3, value: 7, tag: n3, parent: n2 }
        - { id: n4, value: 42, tag: n4, parent: n3 }
    - note: >-
        Un paso más: seguir el puntero de n1 a n2 es una operación O(1),
        pero ya van dos operaciones para llegar aquí.
      highlight: ["n2"]
      nodes:
        - { id: n1, value: 7, tag: n1, parent: null }
        - { id: n2, value: 2, tag: n2, parent: n1, state: active }
        - { id: n3, value: 7, tag: n3, parent: n2 }
        - { id: n4, value: 42, tag: n4, parent: n3 }
    - note: >-
        Tercer puntero seguido. El costo crece con la distancia a la raíz:
        no hay forma de evitar los pasos intermedios.
      highlight: ["n3"]
      nodes:
        - { id: n1, value: 7, tag: n1, parent: null }
        - { id: n2, value: 2, tag: n2, parent: n1 }
        - { id: n3, value: 7, tag: n3, parent: n2, state: active }
        - { id: n4, value: 42, tag: n4, parent: n3 }
    - note: >-
        Llegar a n4 costó 3 pasos de puntero (O(k) con k = distancia a la
        raíz). Una máquina RAM llegaría aquí indexando directo, en O(1),
        sin pasar por n1, n2 ni n3 — ese es el contraste que hace el resto
        de la semana (fat-nodes, path-copying) sobre este modelo.
      highlight: ["n4"]
      nodes:
        - { id: n1, value: 7, tag: n1, parent: null }
        - { id: n2, value: 2, tag: n2, parent: n1 }
        - { id: n3, value: 7, tag: n3, parent: n2 }
        - { id: n4, value: 42, tag: n4, parent: n3, state: active }
    - note: >-
        Contraste con el modelo RAM (el otro modelo de cómputo estándar,
        no el de este curso): un arreglo indexado llega al mismo valor
        con un solo acceso, `A[3]`, sin visitar n1 ni n2 ni n3. La cadena
        de la izquierda queda atenuada — no se usa en este acceso — para
        que se vea de un vistazo la diferencia entre O(k) pasos de
        puntero y O(1) de indexación directa.
      highlight: ["ram"]
      nodes:
        - { id: n1, value: 7, tag: n1, parent: null, state: muted }
        - { id: n2, value: 2, tag: n2, parent: n1, state: muted }
        - { id: n3, value: 7, tag: n3, parent: n2, state: muted }
        - { id: n4, value: 42, tag: n4, parent: n3, state: muted }
        - { id: ram, value: "A[3]", parent: null, state: active }
---

## ¿Qué problema resuelve?

Antes de poder afirmar algo como "esta estructura se puede volver
persistente en $O(1)$ amortizado", hace falta acordar primero **qué
operaciones cuestan $O(1)$** en la estructura original. Sin un modelo de
cómputo fijo, esa afirmación no significa nada: $O(1)$ según qué reglas.

La respuesta de este curso es la máquina de punteros (*pointer machine*): un
modelo simple, pero suficientemente general para describir casi cualquier
estructura enlazada (listas, árboles, heaps, tries, …). Todo el resto de la
semana — [fat-nodes](/structures/fat-nodes) y
[path-copying](/structures/path-copying) — da por hecho que las estructuras
viven sobre este modelo, y sus técnicas son respuestas a restricciones que
el modelo mismo impone.

## Intuición

Piensa en una estructura enlazada como una colección de cajas conectadas por
flechas, con una única entrada marcada. Para llegar a cualquier caja hay que
empezar en esa entrada y seguir flechas una por una — no hay forma de
"saltar" directo a la caja número 42 como en un arreglo. Eso es la máquina
de punteros: no hay direcciones de memoria ni aritmética sobre ellas, sólo
cajas con campos y la posibilidad de seguir un campo que apunta a otra caja.

## Estructura interna

El modelo se construye con tres reglas (el profesor las llama diapositiva
única en tres overlays):

1. **Cada nodo tiene $O(1)$ campos.** Un nodo guarda una cantidad constante de
   datos y/o punteros a otros nodos — no una cantidad que crezca con el
   tamaño de la estructura.
2. **Hay un único nodo raíz.** Es el único punto de entrada: para llegar a
   cualquier otro nodo hay que partir de la raíz y seguir punteros.
3. **Cada operación cuesta $O(1)$.** Leer un campo, escribir un campo o seguir
   un puntero de un nodo a otro son, cada una, una operación de costo
   constante.

La figura del mazo (páginas 9-12) dibuja esto con nodos partidos en dos
celdas — celda superior el dato, celda inferior el puntero — y una etiqueta
"raíz" con una flecha entrando al primer nodo (ver el diagrama arriba de esta
página: cuatro nodos encadenados, 7 → 2 → 7 → 42).

Nótese lo que el modelo **no** permite, aunque el profesor no lo discuta
explícitamente: no hay aritmética de direcciones ("dame el nodo en la
posición `i + 3`") ni acceso indexado a un arreglo de memoria arbitrario.
La única forma de llegar a un nodo es seguir punteros desde la raíz, uno a
la vez. Ese es justamente el contraste que hace interesante al modelo frente
a la máquina RAM (que sí permite acceso indexado en $O(1)$) — un arreglo
clásico *no* vive naturalmente sobre una máquina de punteros.

## Operaciones

Ninguna propia. `pointer-machine` no es una estructura con una interfaz que
llamar: es el conjunto de reglas — leer un campo, escribir un campo, seguir
un puntero — sobre el que se construyen y se cuestan las demás estructuras
del curso.

## Análisis de complejidad

No hay análisis que hacer aquí: las tres reglas no se derivan de nada, son
**axiomas** del modelo. El profesor no las demuestra ni las acota — las
enuncia como postulados, acompañados de la figura de referencia. Todo el
análisis de costos que viene después en la semana (nodos gordos, path
copying) usa estas tres reglas como premisas, no como conclusiones.

## Tabla de complejidad

No aplica: `meta.yaml` deja `complexity: {}` a propósito. Las tres
operaciones del modelo (leer campo, escribir campo, seguir puntero) cuestan
$O(1)$ **por definición**, no por un análisis que distinga mejor, promedio o
peor caso, ni por un costo de espacio que reportar.

## Ejemplos

Ver [examples.md](/structures/pointer-machine#ejemplos).

## Comparación con estructuras relacionadas

| | máquina de punteros | máquina RAM / arreglo |
| --- | --- | --- |
| acceso a un elemento | seguir punteros desde la raíz, uno a la vez | indexar directo, $O(1)$, sin pasar por vecinos |
| entrada a la estructura | un único nodo raíz | cualquier posición es accesible desde el índice |
| costo de "saltar" k posiciones | $O(k)$: hay que seguir k punteros | $O(1)$: aritmética de direcciones |
| qué estructuras modela naturalmente | listas, árboles, heaps, tries, … | arreglos, tablas de hash con acceso directo |

Es exactamente esta diferencia — no poder saltar directo a un nodo — la que
hace no trivial dar persistencia a una estructura enlazada: cuando
[fat-nodes](/structures/fat-nodes) necesita encontrar todos los punteros que
entran a un nodo para actualizarlos, no puede simplemente indexarlos; y
cuando [path-copying](/structures/path-copying) necesita copiar el camino
desde la raíz hasta un nodo modificado, ese camino es exactamente la
secuencia de punteros que el modelo obliga a seguir uno por uno.

## Prueba de dominio

Ver [mastery-check.md](/structures/pointer-machine#prueba-de-dominio).
