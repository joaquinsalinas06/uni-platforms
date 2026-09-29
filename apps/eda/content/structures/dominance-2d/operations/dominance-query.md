---
kind: operation
title: "ConsultaDominancia"
order: 3
cppSteps:
  - step-1-ray-reformulation.cpp
  - step-2-subdivision-build.cpp
  - step-3-dominance-query.cpp
  - full-implementation.cpp
visualization:
  type: range-tree
  mode: layers
  steps:
    - note: >-
        ConsultaDominancia(S, b2=4, b3=4) sobre la subdivisión de
        subdivision-build: cuatro columnas, una por punto, ordenadas por y.
        Ninguna se ha visitado todavía.
      caption: "ConsultaDominancia(S, 4, 4) — estado inicial"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
    - note: >-
        Primer paso del pseudocódigo: "cara ← búsqueda binaria de b3 en la
        columna izquierda de S". Se ubica, en O(lg n), en qué cara de la
        columna y=1 cae la altura b3=4 — sin recorrer nada más todavía.
      caption: "búsqueda binaria de b3=4 en la columna izquierda — O(lg n)"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [active, idle, idle, idle]
    - note: >-
        "mientras la posición horizontal de cara es < b2": la posición de
        y=1 (1) es menor que b2=4, así que la caminata continúa. "si el
        borde de cara es un rayo de un punto": el rayo de y=1 tiene z=5, por
        encima de b3=4 — no se cumple z_i ≤ b3, así que este punto NO se
        agrega a resultado.
      caption: "y=1: z=5 > 4 → no se reporta"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, idle, idle, idle]
    - note: >-
        "cara ← cara vecina hacia la derecha" — O(1), por el grado acotado de
        la subdivisión. Se avanza a la columna y=2 sin volver a buscar desde
        cero.
      caption: "avanzar a la cara vecina — O(1)"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, active, idle, idle]
    - note: >-
        En y=2, la posición (2) sigue siendo < b2=4: se repite la
        comprobación. El rayo de y=2 tiene z=1 ≤ b3=4: sí se cumple la
        condición, así que este punto se agrega a resultado.
      caption: "y=2: z=1 ≤ 4 → se reporta (2,1)"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, answer, idle, idle]
    - note: >-
        Se avanza otra vez a la cara vecina, ahora hacia y=4. La posición (4)
        todavía no es estrictamente menor que b2=4 en el sentido de "ya
        pasado" — el material usa ≤ en ambas coordenadas, así que el punto
        exactamente sobre el borde (y_i=b2) cuenta como dominado: se
        comprueba su cara igual que las anteriores.
      caption: "avanzar a y=4 — borde y_i=b2 incluido por la convención ≤"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, answer, active, idle]
    - note: >-
        El rayo de y=4 tiene z=4 ≤ b3=4 (empate incluido por la misma
        convención ≤): se agrega a resultado. La siguiente columna (y=5) ya
        no cumple "posición < b2=4" — el bucle `mientras` termina ahí.
      caption: "y=4: z=4 ≤ 4 → se reporta (4,4); y=5 queda fuera del rango"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, answer, answer, muted]
    - note: >-
        "devolver resultado": la caminata visitó 3 caras reales (una por
        cada punto entre y=1 y y=4) y se detuvo antes de y=5 — el costo total
        fue O(lg n) de la búsqueda inicial más O(1) por cada una de las
        k=2 caras reportadas, consistente con O(lg n + k).
      caption: "resultado: {(2,1), (4,4)}, k=2"
      arrays:
        - id: cols
          label: "columnas por y"
          row: 0
          cells: ["z=5", "z=1", "z=4", "z=2"]
          states: [muted, answer, answer, muted]
---

## Qué hace

`ConsultaDominancia(S, b2, b3)` reporta todos los puntos de `S` con
$y_i \le b_2$ y $z_i \le b_3$, caminando por la subdivisión de
[subdivision-build](/structures/dominance-2d/operations/subdivision-build)
en vez de comparar cada punto uno por uno.

## Intuición

El rayo horizontal de la consulta (ver
[ray-reformulation](/structures/dominance-2d/operations/ray-reformulation))
entra por la derecha, a la altura `b3`, y avanza hacia la izquierda. En vez
de simular ese avance por todo el plano, la estructura hace lo contrario:
localiza primero, con una búsqueda binaria, en qué **cara** de la columna
izquierda cae la altura `b3` — y desde ahí camina cara por cara hacia la
derecha, hasta llegar a la posición `b2`. Cada cara que se cruza corresponde
o bien al rayo de un punto real (se reporta) o bien a una cara "vacía" que
sólo existe por el grado acotado de la subdivisión.

## Algoritmo

1. Búsqueda binaria de `b3` en la columna izquierda de `S` → $O(\lg n)$.
2. Caminar hacia la derecha, cara por cara, mientras la posición horizontal
   de la cara actual sea menor que `b2`:
   - si el borde de la cara actual es el rayo de un punto, agregar ese punto
     al resultado;
   - avanzar a la cara vecina hacia la derecha ($O(1)$, por el grado
     acotado).
3. Devolver el resultado cuando la caminata alcanza `b2`.

## Pseudocódigo

Transcripción literal (el deck repite este bloque idéntico en dos overlays,
#30 como "Algoritmo 1" y #31 como "Algoritmo 2" — mismo cuerpo, el segundo
sólo agrega el párrafo de costo debajo; es el mismo algoritmo, no dos):

```
Algoritmo: ConsultaDominancia(S, b2, b3)
cara ← búsqueda binaria de b3 en la columna izquierda de S   // O(lg n)
resultado ← lista vacía
mientras la posición horizontal de cara es < b2 hacer
    si el borde de cara es un rayo de un punto entonces
        agregar ese punto a resultado
     cara ← cara vecina hacia la derecha                      // O(1)
devolver resultado
```

## C++

Ver `step-3-dominance-query.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(\lg n + k)$. Conteo directo por pasos, output-sensitive: $O(\lg n)$ de la
búsqueda binaria inicial, más $O(1)$ por cada cara visitada. Se visita
exactamente una cara por punto reportado (más un puñado de caras "vacías"),
así que el total es $O(\lg n + k)$ (#31) — el mismo patrón de descomposición
que el profesor usa en todo el deck (#54): $O(\lg n) + O(1) \cdot O(\lg n) + O(k)$.

## Complejidad espacial

No requiere espacio adicional más allá de la subdivisión ya construida
($O(n)$, ver
[subdivision-build](/structures/dominance-2d/operations/subdivision-build))
y la lista de resultado, de tamaño `k`.

## Ejemplo

*(derivado del pseudocódigo; no aparece en las diapositivas — no hay un
solo valor concreto en las 76 páginas del deck)*: con
`(1,5), (2,1), (4,4), (5,2)` y consulta $(b_2,b_3) = (4,4)$, la búsqueda
binaria ubica `b3=4` en la columna izquierda; la caminata avanza por las
columnas `y=1` (rayo en `z=5`, por encima de `4`, no se reporta), `y=2`
(rayo en `z=1 ≤ 4`, se reporta), `y=4` (rayo en `z=4 ≤ 4`, se reporta), y se
detiene ahí porque la siguiente columna (`y=5`) ya no es `< b2=4`.
Resultado: $\{(2,1), (4,4)\}$, $k=2$.

## Casos límite

- **$k=0$** (ningún punto dominado): la caminata todavía hace el $O(\lg n)$
  de la búsqueda binaria y luego sólo cruza caras "vacías" hasta `b2`.
- **$k=n$** (todos los puntos dominados, `b2` y `b3` mayores que todo el
  conjunto): la caminata visita una cara por cada uno de los `n` puntos —
  el costo se acerca a $O(\lg n + n)$, consistente con la cota.
- **"Un puñado de caras vacías"** (#31): el profesor menciona
  explícitamente que la caminata puede visitar algunas caras que no
  reportan punto, y que eso no rompe la cota $O(\lg n + k)$ porque su número
  está acotado por el grado de la subdivisión, no por `n`.
