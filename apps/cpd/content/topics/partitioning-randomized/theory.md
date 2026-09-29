---
kind: theory
title: "Particionamiento de datos/tareas y algoritmos aleatorizados"
visualization:
  type: network-topology
  steps:
    - note: "Broadcast en arreglo lineal: el maestro (p0) reenvía al vecino, y este al siguiente, formando una cadena. Con el maestro en un extremo se necesitan $p-1$ saltos — el costo crece linealmente con $p$."
      processes:
        - { id: p0, label: "p0 (maestro)", state: active }
        - { id: p1, label: "p1" }
        - { id: p2, label: "p2" }
        - { id: p3, label: "p3" }
      dataFlow:
        - { from: p0, to: p1, label: "salto 1" }
        - { from: p1, to: p2, label: "salto 2" }
        - { from: p2, to: p3, label: "salto 3" }
    - note: "Broadcast en árbol binario: el maestro (p0) envía a dos hijos, cada uno reenvía a los suyos. En $\\log p$ niveles todos reciben el mensaje — mucho menos que los $p-1$ saltos de la cadena lineal."
      processes:
        - { id: p0, label: "p0 (maestro)", state: active }
        - { id: p1, label: "p1" }
        - { id: p2, label: "p2" }
        - { id: p3, label: "p3" }
      dataFlow:
        - { from: p0, to: p1, label: "nivel 1" }
        - { from: p0, to: p2, label: "nivel 1" }
        - { from: p1, to: p3, label: "nivel 2" }
---

## ¿Qué problema resuelve?

Una vez que un problema se descompone en tareas (ver [DAG de tareas/canales](/topics/dag-cost-model))
y se conocen las métricas para juzgar si vale la pena paralelizar
([speedup, Amdahl, Gustafson](/topics/performance-metrics)), queda una
decisión de diseño muy concreta: cómo repartir físicamente los datos o las
tareas entre los procesos, y cómo generar aleatoriedad quando el algoritmo
la necesita, sin que la comunicación o la falta de balance arruinen la
ganancia obtenida al paralelizar.

## Intuición

Repartir trabajo entre procesos no es gratis: alguien tiene que enviar los
datos, y al final alguien tiene que juntar los resultados. Cuánto cuesta
ese envío depende de cómo están "conectados" los procesos entre sí (una
fila, un árbol) y de cuántos datos hay que mandar. Por otro lado, algunos
problemas (Monte Carlo, generación de números aleatorios) necesitan
aleatoriedad, y hacerlo bien en paralelo exige cuidado: no basta con que
cada proceso tire su propio dado, hay que asegurarse de que no todos tiren
el mismo dado por accidente cuando cada uno genera el suyo de forma
independiente.

## Estructura interna

**Modelo de costo de comunicación.** El tiempo de comunicación tiene la
forma general:

$$T_{comm} = f(p)(\alpha + x\beta)$$

donde $\alpha$ es la latencia (tiempo de enviar un mensaje de tamaño cero), $\beta$
es el tiempo de enviar un byte (inverso del ancho de banda), $x$ el tamaño
del mensaje, y $f(p)$ depende de la topología de comunicación usada.

**Broadcast/scatter/gather: lineal vs. árbol.** En un arreglo lineal de $p$
procesos (grafo $G(V,E)$ donde cada uno tiene un vecino anterior y
posterior), un broadcast simple reenvía el mensaje de vecino a vecino:
$T_{bcast} = O(p(\alpha + m\beta))$ (el número de saltos depende de la posición del
maestro: $p-1$ si está en un extremo, $\lfloor p/2 \rfloor$ si está en el medio). Un
particionamiento (scatter/gather) de $m$ datos toma
$T_{scatter/gather} = O(\alpha p + \beta m)$.

Si los $p$ procesadores se organizan en árbol binario, el broadcast
desciende un nivel por paso: $T_{bcast} = O(\log p(\alpha + m\beta))$. El
scatter/gather en árbol organiza los envíos en $\log p$ niveles, donde en el
nivel $i$ el mensaje acumulado tiene tamaño $2^i \cdot m/p$:

$$T_{scatter/gather} \approx \sum_{i=0}^{\log p - 1}\left(\alpha + \beta \cdot 2^i \frac{m}{p}\right) = \alpha \log p + \beta m\left(1 - \frac{1}{p}\right) = O(\alpha \log p + \beta m)$$

La topología en árbol reduce el factor $p$ a $\log p$ — es la misma idea que
ya se vio con la [suma por reducción PRAM](/topics/pram-algorithms/algorithms/sum-reduction),
ahora aplicada al costo real de comunicación.

**Particionamiento de datos: ejemplo de imagen (image warping).** Cada
píxel de una imagen $n \times n$ se transforma independientemente de sus
vecinos (rotación respecto a un centro $(c_x, c_y)$):

$$x' = (x-c_x)\cos\theta + (y-c_y)\sin\theta + c_x, \qquad y' = -(x-c_x)\sin\theta + (y-c_y)\cos\theta + c_y$$

Con $p$ procesos y comunicación en árbol: $T_{comp} = O(n^2/p)$,
$T_{comm} = O(\alpha \log p + \beta n^2/p)$, por lo que
$T_p = O(n^2/p + \alpha \log p + \beta n^2/p)$. Como la comunicación de ida y vuelta
domina el costo, una arquitectura de memoria compartida (incluyendo GPUs) es
más adecuada para este tipo de problema.

**Particionamiento de tareas: Mandelbrot.** Cada píxel se calcula iterando
$z_{k+1} = z_k^2 + c$ hasta que $|z|$ supera 2 o se alcanza $K_{max}$
iteraciones. Con $n^2$ píxeles y $K_{max}$ iteraciones máximas: $W = O(n^2 K_{max})$,
$T_\infty = O(K_{max})$, y con [Brent](/topics/pram-algorithms/algorithms/brent-theorem):
$T_p = O(n^2 K_{max}/p + K_{max})$ (que se simplifica a $O(n^2/p)$ si $K_{max}$ es
constante y $p \le n^2$). Hay dos estrategias de reparto:

- **Distribución estática:** cada proceso recibe una porción fija de la
  imagen ($n^2/p$ píxeles). Como cada píxel necesita un número distinto de
  iteraciones, los procesos no terminan sincronizados entre sí.
- **Distribución dinámica (*work pool*):** las tareas se colocan en un área
  común de la que cada proceso toma una nueva tarea cuando queda inactivo.
  Balancea mejor la carga, a costa de un overhead adicional de mensajes
  ($T_{msg}$) y de planeamiento de tareas ($T_{sched}$).

**Algoritmos aleatorizados.** Un algoritmo estocástico incorpora variables
aleatorias explícitamente: para la misma entrada, dos ejecuciones pueden
seguir caminos distintos. Hay dos categorías:

- **Monte Carlo:** el tiempo de ejecución está controlado, pero el
  resultado puede contener error.
- **Las Vegas:** el resultado es siempre correcto, pero el tiempo de
  ejecución es una variable aleatoria.

**Estimación de π por Monte Carlo.** Se generan $N$ puntos aleatorios en un
cuadrado que inscribe un círculo; si $n$ es el número de puntos dentro del
círculo, como el área del círculo es $\pi r^2$ y la del cuadrado $4r^2$:
$n/N = \pi/4$, es decir $\pi = 4n/N$. A mayor $N$ (típicamente entre $10^3$ y
$10^6$), más exacta la aproximación. Como cada punto se evalúa
independientemente, el algoritmo paraleliza trivialmente con una reducción
(`+ : Ncirc`).

**Generación de números aleatorios en paralelo.** El generador lineal
congruente (LCG) produce pseudo-aleatorios con $x_{i+1} = (a x_i + c) \mod m$.
Estrategias para paralelizarlo: *centralizada* (el maestro distribuye
números ya generados — bajo desempeño), *replicativa* (cada proceso genera
su propio seed con el mismo generador — puede crear correlaciones entre
streams), *distribuida* (cada proceso genera su seed a partir de vecinos —
eficiente pero difícil de implementar). Una variante más robusta es el
generador recursivo múltiple **MRG32k3a** (L'Ecuyer, 1999), que provee
$1.8 \times 10^{19}$ streams independientes, cada uno con $2.3 \times 10^{15}$ substreams de
período $7.6 \times 10^{22}$, y un período conjunto de $3.1 \times 10^{57}$.

**Granularidad.** Describe cuánto trabajo computacional contiene una tarea
paralela por unidad de overhead de comunicación/sincronización:

$$G = \frac{T_{comp}}{T_{comm}}$$

- **Paralelismo fino:** muchas tareas pequeñas ($T_{comp}$ bajo), facilita el
  balance de carga pero incrementa $T_{comm}$ al necesitar más procesos.
- **Paralelismo grueso:** pocas tareas grandes ($T_{comp}$ alto), reduce
  $T_{comm}$ pero puede dificultar el balance de carga.
- **Paralelismo medio:** combina ambas formas; es la más usada en la
  práctica.

## Operaciones

Este tema no tiene subtemas: `theory.md` cubre el modelo de costo de
comunicación, las topologías de broadcast/scatter/gather, los dos ejemplos
de particionamiento (imagen, Mandelbrot), los algoritmos aleatorizados y la
granularidad en una sola pieza.

## Análisis de complejidad

El razonamiento central de este tema es comparar el factor $f(p)$ según la
topología usada. En comunicación lineal, cada salto adicional paga $\alpha + x\beta$
de forma acumulativa a lo largo de la cadena, dando $f(p) = O(p)$. En árbol
binario, cada nivel duplica los receptores alcanzados por el mismo costo
fijo, dando $f(p) = O(\log p)$. Esta misma sustitución ($p \to \log p$) es la
que explica, en el ejemplo de suma de un arreglo, la diferencia entre
$T_p = O(p\alpha + (n+p)\beta + n/p)$ (comunicación lineal) y
$T_p = O(n/p + \alpha \log p + (n/p)\beta)$ (comunicación optimizada en árbol): el
span $T_\infty(n) = O(\log n)$ de la reducción se convierte directamente en el
factor de comunicación $\log p$, porque cada resultado local se propaga y
acumula en un árbol de profundidad $\log p$.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`: el modelo general de comunicación,
broadcast lineal, broadcast en árbol y la fórmula de granularidad. Los
casos de imagen y Mandelbrot ya desarrollados arriba son aplicaciones
concretas de este mismo modelo.

## Ejemplos

**Ejemplo: suma de un arreglo con comunicación lineal vs. optimizada.**
Sumar $n$ elementos secuencialmente es $O(n)$ ($n-1$ sumas). Con $p$
procesos y comunicación lineal: envío $T_{comm1} = O(p(\alpha + (n/p)\beta))$,
cómputo local $T_{comp1} = O(n/p)$, recolección $T_{comm2} = O(p(\alpha+\beta))$,
suma final $T_{comp2} = O(p)$, con complejidad total
$T_p(n,p) = O(p\alpha + (n+p)\beta + n/p)$. Con comunicación optimizada en
árbol: $T_{comm1} = O(\alpha \log p + (n/p)\beta)$,
$T_{comp1} = O(n/p)$, reducción $T_{comm2} = O(\log p(\alpha+\beta+1))$, dando
$T_p(n,p) = O(n/p + \alpha \log p + (n/p)\beta)$.

**Participación: análisis de escalabilidad de image warping.** El material
deja como ejercicio hacer el análisis de escalabilidad del algoritmo de
image warping tanto en un paradigma de memoria compartida como en uno
distribuido, sin resolverlo explícitamente en las diapositivas.

## Comparación con temas relacionados

| | Comunicación lineal | Comunicación en árbol |
|---|---|---|
| $f(p)$ para broadcast | $O(p)$ | $O(\log p)$ |
| $f(p)$ para scatter/gather | $O(p)$ (en $\alpha$) | $O(\log p)$ (en $\alpha$) |
| Cuándo conviene | Topología simple, $p$ pequeño | $p$ grande, domina la latencia $\alpha$ |

Frente al [teorema de Brent](/topics/pram-algorithms/algorithms/brent-theorem),
que sólo separa trabajo ($W/p$) y camino crítico ($T_\infty$) sin costo de
comunicación explícito, este tema agrega justamente esa pieza que Brent
ignora: cuánto cuesta mover los datos según la topología real de la red.

## Prueba de dominio

- Derivar $T_{bcast}$ para comunicación lineal y en árbol, y explicar por qué
  el árbol reduce el factor $p$ a $\log p$.
- Aplicar el modelo de costo de comunicación al ejemplo de suma de un
  arreglo, comparando la versión lineal y la optimizada.
- Explicar la diferencia entre distribución estática y dinámica (*work
  pool*) de tareas, con Mandelbrot como ejemplo.
- Distinguir un algoritmo Monte Carlo de uno Las Vegas, con un ejemplo de
  cada uno.
- Explicar por qué el cálculo de π por Monte Carlo paraleliza trivialmente
  con una reducción.
- Explicar la fórmula de granularidad $G = T_{comp}/T_{comm}$ y las
  consecuencias de elegir paralelismo fino vs. grueso vs. medio.
