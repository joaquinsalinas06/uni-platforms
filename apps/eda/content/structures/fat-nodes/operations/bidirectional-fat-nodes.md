---
kind: operation
title: Nodos gordos bidireccionales
order: 4
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-write-field.cpp
  - step-4-node-split.cpp
  - step-5-bidirectional.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  mode: fat-node
  steps:
    - note: >-
        Nodo n, creado junto con la versión 2. En persistencia total ya no
        alcanza un solo registro: n lleva dos, logAdelante y logAtrás,
        ambos vacíos por ahora.
      nodes:
        - { id: node, value: "n (creado en v2)" }
        - { id: logF, value: "logAdelante: []" }
        - { id: logB, value: "logAtrás: []" }
    - note: >-
        Se escribe sobre la versión 4 — hija de 2 en el árbol de versiones
        (ver linearización), por lo tanto "adelante" de 2. Esa escritura
        cae en logAdelante como entrada nueva, aún sin confirmar.
      highlight: ["logF"]
      nodes:
        - { id: node, value: "n (creado en v2)" }
        - { id: logF, value: "logAdelante: [ ] + (v4, ...)", state: copied }
        - { id: logB, value: "logAtrás: []" }
    - note: >-
        Entrada confirmada: logAdelante ahora contiene la modificación de
        v4. logAtrás sigue vacío — nada se ha escrito todavía "hacia atrás".
      nodes:
        - { id: node, value: "n (creado en v2)" }
        - { id: logF, value: "logAdelante: [(v4, ...)]" }
        - { id: logB, value: "logAtrás: []" }
    - note: >-
        Ahora se actualiza la versión 2 misma, después de haber creado ya
        4 y 5. Desde la perspectiva de 4 y 5 (ya existentes en el árbol de
        versiones), esta modificación queda "detrás": cae en logAtrás, no
        en logAdelante.
      highlight: ["logB"]
      nodes:
        - { id: node, value: "n (creado en v2)" }
        - { id: logF, value: "logAdelante: [(v4, ...)]" }
        - { id: logB, value: "logAtrás: [ ] + (v2, ...)", state: copied }
    - note: >-
        Entrada confirmada en logAtrás. El nodo queda con sus dos
        registros separados por dirección: para leer, primero hay que
        decidir "adelante" o "atrás" comparando la posición de la versión
        consultada contra la de creación de n (usando la linearización del
        árbol de versiones, O(1)) y sólo entonces buscar en el registro que
        corresponda. El split que reparte predecesores entre logAdelante y
        logAtrás cuando alguno se llena es "más delicado" y el mazo no da
        su mecánica — no se reimplica aquí (ver Casos límite).
      nodes:
        - { id: node, value: "n (creado en v2)", state: answer }
        - { id: logF, value: "logAdelante: [(v4, ...)]" }
        - { id: logB, value: "logAtrás: [(v2, ...)]" }
---

## Qué hace

Extiende los nodos gordos para soportar
[persistencia total](/structures/persistence-levels): permite actualizar
**cualquier** versión, no sólo la más reciente, agregando un segundo
registro por nodo y un split "más delicado" (diapositiva 20, páginas
42-43).

## Intuición

La técnica unidireccional asume que el tiempo sólo avanza: cada
modificación nueva tiene un tiempo mayor que todas las anteriores, y el
registro se recorre "de más reciente a más antigua" porque esa noción de
"reciente" es un único orden lineal. Eso deja de valer en persistencia
total: el árbol de versiones se ramifica, así que "actualizar una versión
vieja" puede introducir una modificación que, respecto a otras ramas del
árbol, no es ni estrictamente "antes" ni "después" en una sola línea.
Textual del profesor: "Los nodos gordos guardaban modificaciones ordenadas
solo hacia adelante en el tiempo. Si se puede actualizar una versión
'vieja', necesitamos poder navegar en **ambas direcciones** del árbol de
versiones" (páginas 36-37).

La solución: cada nodo lleva **dos** registros — uno hacia adelante (igual
que antes) y uno hacia atrás — y decidir en cuál cae cada modificación
según la posición relativa, en el árbol de versiones, entre el nodo y la
versión que escribe. Eso exige poder **comparar posiciones en el árbol de
versiones** en $O(1)$, que es exactamente lo que resuelve la
[linearización del árbol de versiones](/structures/fat-nodes/operations/version-tree-linearization).

## Algoritmo

El mazo da la idea y la cota final, **no** el algoritmo paso a paso del
split bidireccional ("un split más delicado", sin desarrollarlo). Lo que
sí se puede fijar con precisión, derivado de la descripción:

1. Cada nodo tiene `logAdelante` y `logAtrás`, cada uno de tamaño acotado.
2. Leer un campo en la versión $t$ requiere decidir primero si $t$ queda
   "adelante" o "atrás" respecto a la versión de creación del nodo (usando
   la [linearización](/structures/fat-nodes/operations/version-tree-linearization)
   para comparar en $O(1)$), y buscar en el registro correspondiente.
3. Escribir en una versión arbitraria agrega la entrada al registro que
   corresponda según esa misma comparación; si ese registro se llena,
   dispara un split — cuya mecánica exacta de "hacia dónde reparte" cada
   predecesor **no la da el mazo**.

## Pseudocódigo

No hay pseudocódigo en el mazo para esta extensión (ni siquiera en prosa
detallada, a diferencia del caso unidireccional). Lo único formalizable
sin inventar es la forma del nodo y la lectura por dirección:

```
función leerCampoBidireccional(nodo, campo, t):
    si t es "adelante" de nodo (según la linearización):
        buscar en logAdelante(nodo), más reciente a más antigua
    si_no:
        buscar en logAtrás(nodo), más antigua a más reciente
    si ninguna entrada aplica:
        devolver valorOriginal(nodo, campo)
```

## C++

Ver `step-5-bidirectional.cpp` (el nodo con dos registros y las dos
lecturas, `readValueForward` / `readValueBackward`) en el editor de
arriba. **El split bidireccional pleno no se implementa**: el mazo no da
su mecánica interna (ver "Casos límite").

## Complejidad temporal

El profesor da únicamente la cota agregada: "$O(1)$ amortizado por
operación" (páginas 44-45), sin reproducir el cálculo de $\Delta\Phi$ para este
caso extendido. Se puede afirmar con confianza que el estilo sigue siendo
[potential-method](/structures/potential-method) — hereda la misma
"receta" de semana 2 aplicada a una estructura con dos registros en vez de
uno — pero el mazo no expone los términos concretos del potencial
bidireccional.

## Complejidad espacial

No lo da el mazo para este caso extendido (a diferencia del caso
unidireccional, donde sí se especifica $+1$ entrada por escritura).

## Ejemplo

*(Derivado de la descripción; no aparece en las diapositivas.)* Sobre el
[árbol de versiones de 7 nodos](/structures/fat-nodes/operations/version-tree-linearization)
del mazo: si se actualiza la versión `2` después de haber creado ya las
versiones `4` y `5` (sus hijas), esa modificación queda "detrás" desde la
perspectiva de `4` y `5` en el árbol de versiones — exactamente el caso
que el registro unidireccional no puede representar, y que el registro
`logAtrás` de los nodos afectados sí captura.

## Casos límite

- **Por qué se rompe la versión unidireccional**: "Los nodos gordos
  guardaban modificaciones ordenadas solo hacia adelante en el tiempo. Si
  se puede actualizar una versión 'vieja', necesitamos poder navegar en
  ambas direcciones del árbol de versiones" (páginas 36-37) — es la razón
  declarada, no una inferencia.
- **El split bidireccional "más delicado" queda como caja negra**: el
  mazo lo nombra pero no lo desarrolla; cualquier implementación completa
  de cómo reparte los predecesores entre registro adelante/atrás durante
  un split bidireccional es, necesariamente, una extensión más allá de lo
  que la fuente cubre — se señala aquí en vez de inventarla con
  confianza falsa.
- **Comparar tiempos requiere la estructura de mantenimiento de orden**:
  el profesor la nombra y da su interfaz ("soporta comparar dos tiempos e
  insertar un tiempo nuevo entre otros dos, ambos en $O(1)$", página 41)
  pero no la implementa — es un prerrequisito asumido, no explicado, y
  esta operación depende de ella para decidir "adelante" o "atrás" en
  $O(1)$.
