---
kind: operation
title: "Procesar una fila (greedy-row)"
order: 1
cppSteps:
  - step-1-punto.cpp
  - step-2-escalera.cpp
  - step-3-fila.cpp
  - full-implementation.cpp
visualization:
  type: geometric
  steps:
    - note: "Estado antes de la fila 4 de la secuencia 3, 1, 4, 2 (llaves 1..4). Las llaves ya tocadas: la 3 (t = 1, 2, 3), la 1 (t = 2) y la 4 (t = 3). Llega el acceso a la llave 2."
      points:
        - { id: a1, x: 3, t: 1 }
        - { id: a2, x: 1, t: 2 }
        - { id: e2, x: 3, t: 2, kind: added }
        - { id: a3, x: 4, t: 3 }
        - { id: e3, x: 3, t: 3, kind: added }
      xMax: 4
      tMax: 4
    - note: "Fila 4, acceso a la llave 2. Hacia la DERECHA desde 2: la llave 3 se tocó por última vez en t = 3. Es más reciente que todo lo visto (nada entre 2 y 3), así que entra. La llave 4 (t = 3) no es más reciente que la 3: no entra."
      points:
        - { id: a1, x: 3, t: 1 }
        - { id: a2, x: 1, t: 2 }
        - { id: e2, x: 3, t: 2, kind: added }
        - { id: a3, x: 4, t: 3 }
        - { id: e3, x: 3, t: 3, kind: added }
        - { id: a4, x: 2, t: 4, state: active }
        - { id: e4, x: 3, t: 4, kind: added, state: active }
      rects:
        - { id: r_der, a: a4, b: e3, state: active, fill: true }
      xMax: 4
      row: 4
      tMax: 4
    - note: "Hacia la IZQUIERDA desde 2: la llave 1 se tocó por última vez en t = 2, y nada entre 1 y 2: entra. Fila terminada: se tocaron 1, 2 y 3. Total del conjunto: 8 puntos, igual que el árbol estático de la clase."
      points:
        - { id: a1, x: 3, t: 1 }
        - { id: a2, x: 1, t: 2 }
        - { id: e2, x: 3, t: 2, kind: added }
        - { id: a3, x: 4, t: 3 }
        - { id: e3, x: 3, t: 3, kind: added }
        - { id: a4, x: 2, t: 4 }
        - { id: e4, x: 3, t: 4, kind: added }
        - { id: e5, x: 1, t: 4, kind: added, state: active }
      rects:
        - { id: r_izq, a: a4, b: a2, state: active, fill: true }
      xMax: 4
      row: 4
      tMax: 4
---

## Qué hace

Dada la secuencia de accesos hasta el tiempo $t - 1$ ya procesada y el nuevo acceso $x_t$, agrega al conjunto **la fila $t$**: el punto $(x_t, t)$ más los puntos mínimos para
que el conjunto acumulado siga siendo arboralmente satisfecho. No modifica ninguna fila anterior.

## Intuición

Mira desde $x_t$ hacia la derecha y hacia la izquierda. Cada llave $y$ guarda *cuándo fue la última vez que se tocó*. La llave $y$ tiene que entrar a la fila si, entre ella y $x_t$,
ninguna llave entre ambas, incluyendo el extremo $x_t$, fue tocada en ese tiempo o después: si no entrara, el rectángulo entre $(x_t, t)$ y $(y, \mathrm{ult}(y))$ quedaría **vacío** y la condición arboral se rompería.
Lo que entra es una **escalera**: llaves cuyos últimos toques son cada vez más recientes a medida que te acercas a $x_t$.

## Algoritmo

1. Poner $(x_t, t)$ en la fila.
2. **Hacia la derecha**: recorrer $y = x_t + 1, x_t + 2, \dots$ llevando el último toque más reciente visto, $m$, inicialmente $\mathrm{ult}(x_t)$. El toque anterior de la propia llave también puede bloquear el rectángulo. Si $\mathrm{ult}(y) > m$, agregar $(y, t)$ y hacer $m \leftarrow \mathrm{ult}(y)$.
3. **Hacia la izquierda**: igual con $y = x_t - 1, x_t - 2, \dots$
4. Para cada llave de la fila, $\mathrm{ult}(y) \leftarrow t$ (**después** de leer ambas escaleras, para que una escalera no vea los toques de la propia fila).

Las llaves nunca tocadas tienen $\mathrm{ult} = 0$ y nunca entran.

> **Nota de apoyo** (no está en las diapositivas): la regla de la escalera es la definición de Greedy del artículo que las diapositivas citan (Demaine et al., 2009).

## Pseudocódigo

```
GREEDY-FILA(x, t):
  fila ← {x}
  para paso en {+1, −1}:
    mejor ← ult[x]
    para y desde x + paso mientras 1 ≤ y ≤ n, de paso en paso:
      si ult[y] > mejor:
        fila ← fila ∪ {y}
        mejor ← ult[y]
  para y en fila:
    P ← P ∪ {(y, t)}
    ult[y] ← t
```

## C++

El editor de arriba trae los tres pasos y el programa completo: primero sólo los puntos de acceso, luego la escalera hacia un lado, luego una fila completa, y por
último `greedy` sobre varias secuencias con el comprobador de [arborally-satisfied-set](/structures/arborally-satisfied-set).

## Complejidad temporal

Una fila recorre las $n$ llaves como mucho una vez a cada lado: $O(n)$ por fila ingenuamente, $O(m \cdot n)$ para toda la secuencia. Es el costo de este programa, **no** el costo geométrico del algoritmo,
que es $|P|$ puntos. *(Cota derivada del código; no aparece en las diapositivas.)*

## Complejidad espacial

$O(n)$ para el arreglo `ult`, más $O(|P|)$ para guardar el conjunto de puntos.

## Ejemplo

Fila 4 de la secuencia $3, 1, 4, 2$ (la animación de arriba): $\mathrm{ult} = [t_1 = 2, t_2 = 0, t_3 = 3, t_4 = 3]$. Desde $x = 2$ a la derecha, $y = 3$ entra ($3 > 0$) y $y = 4$ no ($3 \not> 3$);
a la izquierda, $y = 1$ entra ($2 > 0$). La fila queda $\{1, 2, 3\}$.

## Casos límite

- **Primera fila**: nada fue tocado antes; la fila es sólo $\{x_1\}$.
- **Mismo acceso repetido**: si $x_t = x_{t-1}$, se inicia la escalera en $\mathrm{ult}(x_t)=t-1$. Ninguna otra llave tiene un toque más reciente: la nueva fila es sólo $\{x_t\}$, aunque el acceso anterior haya tocado varias llaves.
- **Acceso secuencial** $1, 2, \dots, n$: cada fila agrega sólo la llave anterior (la fila $t$ es $\{t-1, t\}$): $2n - 1$ puntos en total.
