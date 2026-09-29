---
kind: operation
title: "Construcción de la subdivisión"
order: 2
cppSteps:
  - step-1-ray-reformulation.cpp
  - step-2-subdivision-build.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        La columna más a la izquierda (y=1, rayo con z=5) queda tal cual:
        sólo su propio rayo, sin nada promovido todavía. Es la base sobre la
        que se apoyan las columnas siguientes.
      caption: "columna y=1: base, sin promociones"
      arrays:
        - id: col1
          label: "col y=1"
          row: 0
          cells: ["z=5"]
    - note: >-
        La columna y=2 (rayo propio z=1) no sólo guarda su propio rayo:
        promueve (virtualmente) una fracción de lo que ya vio la columna y=1,
        para que la caminata de ConsultaDominancia nunca tenga que volver
        atrás. La celda promovida (marcada) guarda un puente hacia su
        posición real en la columna y=1.
      caption: "col y=2: propio + promovido de y=1 (misma idea de fractional cascading)"
      arrays:
        - id: col1
          label: "col y=1"
          row: 0
          cells: ["z=5"]
        - id: col2
          label: "col y=2"
          row: 1
          cells: ["z=1", "z=5"]
          states: [idle, marked]
      bridges:
        - { from: col2, fromIndex: 1, to: col1, toIndex: 0, active: true }
    - note: >-
        Lo mismo se repite entrando a la columna y=4 (rayo propio z=4): más
        lo promovido desde y=2 (marcado, con puente hacia su posición real en
        y=2). El puente de y=2 hacia y=1 sigue ahí — no se vuelve a explicar
        en cada nivel, sólo baja un paso a la vez.
      caption: "col y=4: propio + promovido de y=2 — grado acotado, O(n) espacio total"
      arrays:
        - id: col1
          label: "col y=1"
          row: 0
          cells: ["z=5"]
        - id: col2
          label: "col y=2"
          row: 1
          cells: ["z=1", "z=5"]
          states: [idle, marked]
        - id: col4
          label: "col y=4"
          row: 2
          cells: ["z=4", "z=1"]
          states: [idle, marked]
      bridges:
        - { from: col2, fromIndex: 1, to: col1, toIndex: 0, active: false }
        - { from: col4, fromIndex: 1, to: col2, toIndex: 0, active: true }
---

## Qué hace

Construye, sobre los `n` rayos verticales de
[ray-reformulation](/structures/dominance-2d/operations/ray-reformulation),
una **subdivisión planar de grado acotado**: un número constante de vecinos
por cara, con $O(n)$ caras en total, sobre la que
[dominance-query](/structures/dominance-2d/operations/dominance-query) puede
caminar en $O(1)$ por paso.

## Intuición

Con `n` rayos, dejar que cada uno se extienda completo hasta el final del
plano podría producir muchas más de $O(n)$ intersecciones relevantes entre
caras vecinas. La solución (Chazelle, 1986) es la misma idea de "promover la
mitad" que ya aparece en fractional cascading sobre listas: no todos los
segmentos llegan hasta el final — algunos se extienden hacia columnas
lejanas para mantener el grado acotado de las caras que atraviesan, y otros
se cortan porque ya no hacen falta más allá de cierto punto. El resultado es
una subdivisión con espacio total $O(n)$, aunque cada cara individual sólo
"ve" un número constante de vecinas.

## Algoritmo

El profesor no da pseudocódigo para este paso (ver "pseudocódigo" abajo):
describe el resultado (grado acotado, $O(n)$ espacio, citando a Chazelle
1986) sin dar los pasos de construcción. Lo que sí es explícito:

1. Ordenar los `n` puntos por su coordenada `y` — cada rayo ocupa una
   columna vertical distinta (o comparte columna si hay empates en `y`).
2. Entre columnas consecutivas, aplicar la idea de "promover la mitad": una
   fracción de los rayos que ya empezaron a la izquierda se extiende
   (virtualmente) hacia la columna siguiente, para que la caminata de
   `dominance-query` nunca tenga que mirar más de $O(1)$ caras vecinas por
   paso.
3. El resultado es una subdivisión con grado acotado por cara (#24) y
   espacio total $O(n)$ segmentos, porque no todos los segmentos llegan
   hasta el final (#24).

## Pseudocódigo

> **Nota de apoyo** (no está en las diapositivas): el profesor no da
> pseudocódigo de construcción para $D_1$ — sólo cita la existencia del
> resultado geométrico (Chazelle, 1986) que garantiza grado acotado y
> espacio $O(n)$. El único pseudocódigo del tema es `ConsultaDominancia`,
> transcrito en
> [dominance-query](/structures/dominance-2d/operations/dominance-query).

## C++

Ver `step-2-subdivision-build.cpp` y `full-implementation.cpp` en el editor
de arriba. La construcción ahí es una realización didáctica simple y
correcta (columnas acumulativas ordenadas por `y`, cada una con sus rayos
activos ordenados por `z`) — no reproduce la subdivisión de grado acotado de
Chazelle, que el profesor cita pero no construye en el curso. Ver el
reporte final del agente para el detalle exacto de la simplificación.

## Complejidad temporal

El profesor no da un costo de construcción para este paso.

## Complejidad espacial

$O(n)$ segmentos (#25): "no todos los segmentos llegan hasta el final:
algunos se extienden y otros se cortan" (#24) es precisamente lo que permite
que el total, sumado sobre las `n` columnas, siga siendo lineal.

## Ejemplo

*(derivado del pseudocódigo; no aparece en las diapositivas — no hay
diagrama de la subdivisión, sólo del resultado de los rayos, #22-23)*: con
los puntos `(1,5), (2,1), (4,4), (5,2)` ordenados por `y`, la subdivisión
tiene columnas en `y=1,2,4,5`; la columna en `y=2` ya contiene, además de su
propio rayo, la información necesaria (promovida) para no tener que volver a
mirar la columna `y=1` al caminar hacia la derecha.

## Casos límite

- **Grado acotado como condición indispensable** (#24): sin él, la caminata
  de `dominance-query` no podría garantizar $O(1)$ por cara.
- **Todos los puntos con la misma `y`**: una sola columna con todos los
  rayos, ordenados por `z` dentro de ella — la subdivisión colapsa a un caso
  degenerado de una columna.
- **Un solo punto ($n=1$)**: la subdivisión es una única columna con un solo
  rayo; caso trivial pero válido.
