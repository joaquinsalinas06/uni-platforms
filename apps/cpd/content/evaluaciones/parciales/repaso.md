---
title: "Ejercicios de repaso — U3.5"
category: parciales
categoryLabel: "Ejercicios de repaso"
order: 5
---

## Pregunta 1 — Modelo climático (Foster)

Un modelo atmosférico simula vientos, nubosidad y lluvias resolviendo un sistema de PDEs (ecuaciones diferenciales parciales) que describen la dinámica de fluidos en la atmósfera. Para ello se discretiza el dominio continuo en una malla de $N_x\times N_y\times N_z$, con $N_z=64$, $N_x=2N_z$, $N_y=1024$. Cada punto de malla guarda presión, temperatura, velocidad del viento y humedad. El modelo actualiza los valores de las celdas en cada paso, y cada celda envía copias de sus datos a otras celdas: en dirección horizontal se comunica con 8 celdas vecinas, y en dirección vertical con 2 celdas vecinas (10 canales de comunicación por celda en total). En cada paso también debe acumularse el valor de la masa atmosférica (una suma de números sobre todas las celdas).

#### (a) Método de Foster aplicado al problema

**Partición:** se puede iniciar definiendo una tarea por cada celda de la malla. La tarea consiste en calcular los parámetros de cada celda y actualizarlos en cada paso. En total se tienen $N_x\cdot N_y\cdot N_z$ tareas, cada una de complejidad $O(1)$.

**Comunicación:** cada tarea necesita datos de 8 celdas (dirección horizontal) y 2 celdas (dirección vertical) para completar el cálculo (en total $10\cdot N_x\cdot N_y\cdot N_z$ canales). Además, necesita acumular la masa entre todas las celdas (suma de números: $N_x\cdot N_y\cdot N_z$).

**Aglomeración:** para reducir canales de comunicación, se aglomeran tareas, cada una de las cuales obtiene un conjunto de $k$ celdas. De esta manera se reducen los canales de comunicación a $\left(\dfrac{6}{k}\right)\cdot N_x\cdot N_y\cdot N_z$ (menos canales por celda al compartir frontera interna con celdas del mismo bloque).

**Mapeo:** se asigna una tarea de tamaño $\dfrac{N_x\cdot N_y\cdot N_z}{p}$ a cada proceso (tomando en cuenta la capacidad de los procesadores para el balanceo).

#### (b) Optimización para $p=2^{10}$ procesos

Originalmente, los canales de comunicación son

$$2^{10}\cdot 2^6\cdot 2^7 - 2\cdot(2^{10}\cdot 2^7+2^{10}\cdot 2^6+2^7\cdot 2^6) \approx 2^{23}$$

considerando que las celdas de frontera no comunican en algunas direcciones (se resta el exceso de canales en las caras externas de la malla, contadas doblemente por eje).

Al contar con $p=2^{10}$ procesos, la cantidad de canales de comunicación se reduce aproximadamente a

$$\frac{2^{23}}{2^{10}} = 2^{13}$$

es decir, unas 1000 veces menos — cada proceso maneja un bloque de $N_x N_y N_z/p$ celdas y sólo necesita comunicar las celdas de su frontera externa al bloque, no todas sus celdas internas.

## Pregunta 2 — Transformada de Fourier: granularidad, speedup, eficiencia y escalabilidad

El cálculo de la transformada de Fourier es de complejidad secuencial $T_s=O(n\log n)$, mientras que la complejidad en paralelo es

$$T_p = O\left(t_c\frac{n}{p}\log(n)+\alpha\log(p)+\beta\frac{n}{p}\log(p)\right)$$

donde $\alpha$ es la latencia, $\beta$ el ancho de banda y $t_c$ el tiempo de multiplicación/suma que necesita el algoritmo.

#### (a) Granularidad

$$G = O\left(\frac{\frac{n}{p}\log(n)}{\log(p)+\frac{n}{p}\log(p)}\right) = O\left(\frac{\log n}{\log p}\right)$$

#### (b) Speedup y eficiencia

$$S = O\left(\frac{n\log n}{\frac{n}{p}\log(n)+\log(p)+\frac{n}{p}\log(p)}\right), \qquad E = O\left(\frac{n\log n/p}{\frac{n}{p}\log(n)+\log(p)+\frac{n}{p}\log(p)}\right)$$

#### (c) Escalabilidad fuerte y débil

**E. Fuerte** ($n$ constante):

$$E = O\left(\frac{1}{p\log p}\right)$$

La eficiencia cae con $p\log p$, por lo que no se considera escalable.

**E. Débil** ($n$, $p$ variables):

$$E = O\left(\frac{1}{\frac{p\log p}{n\log n}+\frac{\log p}{\log n}}\right)$$

Hay dos condiciones de escalabilidad débil, siendo la dominante $p\log p\propto n\log n$.

#### (d) Granularidad para eficiencia constante

Reemplazando la condición anterior en la expresión de $G$ se obtiene

$$G = O\left(\frac{p}{n}\right)$$

expresión que es $\ll 1$, ya que $p\ll n$.

## Pregunta 3 — Suma de prefijos: trabajo, span y optimalidad WT

Modelo PRAM del método de suma de prefijos: entrada $x_1,\dots,x_n$ (con $n=2^k$), salida $s_1,\dots,s_n$ con $s_i=x_1\circ x_2\circ\cdots\circ x_i$, donde $\circ$ es una operación asociativa. El pseudocódigo combina, en un primer `pardo`, pares adyacentes $y_i:=x_{2i-1}\circ x_{2i}$ y resuelve recursivamente la suma de prefijos sobre $(y_1,\dots,y_{n/2})$; luego, en un segundo `pardo`, reconstruye cada $s_i$ a partir de $z_{\lfloor i/2\rfloor}$ (combinando con $x_i$ si $i$ es impar, o tomando el valor directo si $i$ es par).

#### (a) $T(n)$ y trabajo $W(n)$

**$T(n)$:** el primer condicional ($n=1$) cuesta $O(1)$; el primer y segundo `pardo` cuestan $O(1)$ cada uno (se ejecutan en paralelo); la recursividad aporta $T(n/2)+c=T(n/4)+2c=\cdots=T(1)+(\log n)\,c$. Por lo tanto $T(n)=O(\log n)$.

**$W(n)$:** el primer condicional cuesta $O(1)$; el primer y segundo `pardo` cuestan $O(n/2)$ y $O(n)$ respectivamente; la recursividad aporta $W(n)\le W(n/2)+dn=W(n/4)+dn/2+dn=\cdots=d\cdot 2n=O(n)$. Por lo tanto $W(n)=O(n)$.

#### (b) Paradigma aplicado

Se aplica memoria compartida (PRAM) — el algoritmo asume acceso uniforme a un arreglo compartido tanto en la fase de combinación (upsweep) como en la de reconstrucción (downsweep), sin modelar comunicación explícita entre procesadores.

#### (c) ¿Es WT-óptimo?

Un algoritmo se considera WT-óptimo cuando $W(n)=T^*(n)$, siendo $T^*(n)$ el tiempo del algoritmo secuencial óptimo. Ya que la suma de prefijos secuencial es $T^*=O(n)$, y aquí $W(n)=O(n)$, sí es WT-óptimo.

## Pregunta 4 — Comunicación: PRAM con topología aleatoria

Un maestro genera un rank aleatorio y envía su nombre (rank 1) a ese proceso, el cual añade su rank al dato recibido y genera otro rank aleatorio para reenviar el resultado acumulado. Así, cada proceso envía un mensaje a otro proceso; ningún proceso se envía un mensaje a sí mismo ni al maestro; procesos que ya recibieron un mensaje no vuelven a recibir otro; el último proceso elegido no envía mensajes. Se permite un mínimo de 3 y un máximo de 50 procesos.

#### (a) Directivas de comunicación agregadas al PRAM

Con entrada $M[i]=\{0\}$, $1<i<p$, contando con $p$ procesos, y salida el mensaje final $M[p]$ en el último proceso:

```
k := p
// array de mensajes
for i := 1 to p pardo
    M[i] := 0
if (nproc < 3 or nproc > 50): abort()
time_0 := time()

// comunicación aleatoria — el maestro inicializa y secuencializa la comunicación
for i = 1 to p pardo {
    if (i == 1) {
        id_next := random entre 2 y p
        M[i] += i
        send M to id_next
    } else {
        if (M[i] == 0) {
            receive M from any_source
            do {
                id_next := random entre 2 y p
            } while (M[id_next] != 0)
            M[i] += i
            send M to id_next
        }
    }
}
if (rank == 1):
    time := time() - time_0
    print(M[p])
```

#### (b) ¿Se puede usar `MPI_ANY_SOURCE`?

Sí es posible, ya que la comunicación es siempre única entre un par de procesos (cada proceso recibe a lo sumo un mensaje, de un origen no predeterminado por diseño) — no hay ambigüedad de a quién pertenece el mensaje recibido.

#### (c) Complejidad de comunicación

Leyendo el PRAM, las operaciones son de comunicación punto a punto, $T_{comm}=(\alpha+x\beta)$, donde $x$ es el tamaño del mensaje enviado (aquí, un entero: $x=1$). Esta operación se repite $p$ veces (una por proceso, salvo el último), por lo que la complejidad final es

$$T_{comm} = p(\alpha+\beta)$$

#### (d) ¿Es necesaria comunicación colectiva?

Se podría usar un `Bcast` para informar a todos los procesos que ya se terminó de recorrer la cadena, pero se logra el mismo PRAM sin usar ninguna colectiva — la propia cadena de mensajes punto a punto ya define un orden total y el último proceso conoce que es el final por construcción (nadie más le envía tras recibir).

## Pregunta 5 — Speedup y eficiencia bajo distintos grados de paralelismo

Se considera un algoritmo secuencial paralelizado en $p=1000$ procesos, en tres casos: (a) totalmente paralelizable, (b) 50% paralelizable, (c) no paralelizable. Se pide, en cada caso, el speedup $S(n)$ y la eficiencia $E(n)$ para *weak scaling* (considerando $\alpha=1$, exponente de crecimiento del problema) y *strong scaling* (Amdahl clásico), interpretando los resultados.

#### (a) Totalmente paralelizable ($f_s=0$)

**Strong scaling:** $S=\dfrac{f_p}{f_p/p}=p$, y la eficiencia $E=p/p=1$.

**Weak scaling:** $S=\dfrac{f_p\,p^\alpha}{f_p\,p^{\alpha-1}}=p$, y la eficiencia $E=p/p=1$.

Eficiencia constante e igual a 1: es el caso ideal, perfectamente escalable, en ambos regímenes, independientemente de $n$ y $p$.

#### (b) 50% paralelizable ($f_s=f_p=0{,}5$)

**Strong scaling:** $S=\dfrac{f_s+f_p}{f_s+f_p/p}=\dfrac{2p}{p+1}\approx 2$, y la eficiencia $E\approx 0{,}002$ (para $p=1000$).

**Weak scaling:** $S=\dfrac{f_s+f_p\,p^\alpha}{f_s+f_p\,p^{\alpha-1}}=\dfrac{p+1}{2}\approx 500$, y la eficiencia $E\approx 0{,}5$.

Se incrementa mucho el speedup y la eficiencia al pasar de *strong* a *weak scaling*, y es mucho más escalable en el régimen débil (el problema crece junto con $p$, evitando que la fracción secuencial domine tan pronto).

#### (c) No paralelizable ($f_s=1$, $f_p=0$)

**Strong scaling:** $S=\dfrac{f_s}{f_s}=1$, y la eficiencia $E=1/p$.

**Weak scaling:** $S=\dfrac{f_s}{f_s}=1$, y la eficiencia $E=1/p$.

La eficiencia cae con $p$ en ambos regímenes por igual (no hay diferencia entre *strong* y *weak scaling* cuando no hay nada que paralelizar) — no es escalable.

## Pregunta 6 — Ping-Pong: latencia y ancho de banda

#### (a) Diseño del código C++/MPI de ping-pong

Se pide un programa donde el proceso 0 envía un mensaje al proceso 1 (ping), el proceso 1 lo recibe y reenvía uno de vuelta (pong), repitiendo el procedimiento 50 veces y midiendo el tiempo de comunicación por mensaje en microsegundos:

```cpp
#include <mpi.h>
#include <cstdio>

int main(int argc, char** argv) {
  MPI_Init(&argc, &argv);
  int rank; MPI_Comm_rank(MPI_COMM_WORLD, &rank);
  const int N = 64;         // tamaño del mensaje (elementos)
  const int reps = 50;
  double buf[N] = {0};
  double t0 = MPI_Wtime();
  for (int r = 0; r < reps; r++) {
    if (rank == 0) {
      MPI_Send(buf, N, MPI_DOUBLE, 1, 0, MPI_COMM_WORLD);
      MPI_Recv(buf, N, MPI_DOUBLE, 1, 1, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
    } else if (rank == 1) {
      MPI_Recv(buf, N, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
      MPI_Send(buf, N, MPI_DOUBLE, 0, 1, MPI_COMM_WORLD);
    }
  }
  double t1 = MPI_Wtime();
  if (rank == 0)
    printf("tiempo por mensaje: %.3f us\n", (t1 - t0) * 1e6 / (2 * reps));
  MPI_Finalize();
  return 0;
}
```

**¿Es necesario comunicación no bloqueada?** No — el patrón ping-pong es inherentemente secuencial por diseño: cada proceso debe esperar la respuesta del otro antes de continuar la siguiente ronda (no hay trabajo útil que solapar con la espera). Usar `Isend`/`Irecv` no reduciría el tiempo total, porque de todas formas hay que hacer `Wait` antes de usar el dato recibido para armar el siguiente mensaje; sólo agregaría complejidad sin beneficio.

#### (b) Latencia y ancho de banda para distintos modos y tamaños de mensaje

Para separar latencia ($\alpha$) de ancho de banda ($\beta$) se usa el modelo $T_{comm}=\alpha+x\beta$: midiendo el tiempo de ida y vuelta para mensajes de tamaño creciente (8 B, 512 B, 32 kB, 2 MB) y ajustando una recta $T$ vs. $x$ (bytes), la ordenada al origen da $\alpha$ (latencia) y la pendiente da $\beta$ (tiempo por byte, inverso del ancho de banda).

- **`MPI_Send`** (modo estándar): para mensajes pequeños (8 B, 512 B) probablemente usa el protocolo *eager* (copia a buffer del sistema, retorno casi inmediato), por lo que domina $\alpha$; para mensajes grandes (32 kB, 2 MB) puede pasar al protocolo *rendezvous* (equivalente a síncrono), por lo que domina $\beta$.
- **`MPI_Ssend`** (síncrono): no retorna hasta que el receptor posteó su `Recv`, para todos los tamaños — el tiempo medido siempre incluye el *handshake* completo, por lo que $\alpha_{Ssend} \ge \alpha_{Send}$ para mensajes chicos (donde `Send` se beneficia del modo eager).

Se recomienda excluir las primeras iteraciones (efecto de arranque/warm-up de la red y de las cachés) y promediar sobre múltiples repeticiones para obtener un valor estable; el rango de tamaños de $8$ B a $2$ MB permite ver claramente ambos regímenes (dominado por latencia vs. dominado por ancho de banda) al graficar tiempo vs. $\log_2(\text{tamaño})$.

## Pregunta 7 — Producto vectorial en paralelo

Se calcula $C[j]=\sum_{i=0}^{N-1}A[j][i]\cdot B[j][i]$ para $j=0,\dots,M-1$ ($M$ vectores de tamaño $N$ cada uno), obteniendo un arreglo $C$ de tamaño $M$.

#### 7.1 Paralelización con MPI bloqueado

Cada uno de los $M$ productos punto a punto es independiente de los demás, así que conviene repartir los $M$ vectores entre los $p$ procesos (descomposición de dominio por filas de $A$/$B$):

```cpp
int M_loc = M / p; // asumiendo M múltiplo de p
double* A_loc = new double[M_loc * N];
double* B_loc = new double[M_loc * N];
double* C_loc = new double[M_loc];

MPI_Scatter(A, M_loc * N, MPI_DOUBLE, A_loc, M_loc * N, MPI_DOUBLE, 0, MPI_COMM_WORLD);
MPI_Scatter(B, M_loc * N, MPI_DOUBLE, B_loc, M_loc * N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

for (int j = 0; j < M_loc; j++) {
  double acc = 0.0;
  for (int i = 0; i < N; i++)
    acc += A_loc[j*N + i] * B_loc[j*N + i];
  C_loc[j] = acc;
}

MPI_Gather(C_loc, M_loc, MPI_DOUBLE, C, M_loc, MPI_DOUBLE, 0, MPI_COMM_WORLD);
```

**Optimización:** ya que cada producto punto a punto es en sí mismo paralelizable (reducción sobre $N$), si $N\gg M/p$ conviene además repartir cada producto individual entre varios procesos en dos niveles (comunicador 2D), o vectorizar el bucle interno (SIMD) — pero para $M\gg N$, como es el caso típico aquí, la descomposición por filas ya es de grano grueso y suficiente.

#### 7.2 Complejidad, cómputo y comunicación

$$T_p(N,M,p) = O\left(t_c\frac{M}{p}N + \alpha + \beta\frac{M}{p}N\right)$$

El primer término es el cómputo local de los $M/p$ productos punto a punto de tamaño $N$ cada uno; el término de comunicación corresponde a un `Scatter` lineal de los dos arreglos $A$, $B$ (tamaño total $MN$ cada uno) seguido de un `Gather` de tamaño $M$ (dominado por el término $MN\beta/p$).

#### 7.3 Speedup, eficiencia y escalabilidad

$$S(N,M,p) = O\left(\frac{MN}{\frac{MN}{p}+\alpha+\beta\frac{MN}{p}}\right), \qquad E(N,M,p) = O\left(\frac{MN/p}{\frac{MN}{p}+\alpha+\beta\frac{MN}{p}}\right) = O\left(\frac{1}{1+\frac{p\alpha}{MN}+\beta}\right)$$

**Escalabilidad:** para $t_c\gg\beta$ (cómputo domina sobre ancho de banda) la eficiencia se mantiene alta al crecer $p$, y como el término dominante de comunicación no depende explícitamente de $\log p$ ni de $p^2$, sino sólo linealmente de $p$ vía $\alpha$, la condición de isoeficiencia es $MN\propto p\alpha/t_c$ — escala débilmente con relativa facilidad siempre que $MN$ crezca proporcional a $p$.

## Pregunta 8 — Latencia en anillo, bloqueado vs. no bloqueado

Se pide medir la latencia (tiempo de envío de un mensaje de tamaño 0) en un anillo de $p$ procesos, con la mayor cantidad de procesos posible, comparando comunicación bloqueada y no bloqueada.

#### 8.1 Caso bloqueado

Cada proceso envía un mensaje vacío a su vecino `next` y recibe de `prev` (o viceversa, alternando por paridad para evitar el bloqueo mutuo cíclico visto en clase), repitiendo muchas veces y promediando:

```cpp
double t0 = MPI_Wtime();
for (int r = 0; r < reps; r++) {
  if (rank % 2 == 0) {
    MPI_Send(nullptr, 0, MPI_INT, next, 0, MPI_COMM_WORLD);
    MPI_Recv(nullptr, 0, MPI_INT, prev, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
  } else {
    MPI_Recv(nullptr, 0, MPI_INT, prev, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
    MPI_Send(nullptr, 0, MPI_INT, next, 0, MPI_COMM_WORLD);
  }
}
double t1 = MPI_Wtime();
double latencia = (t1 - t0) / reps; // por salto del anillo
```

Como cada salto involucra sólo dos vecinos pero la comunicación bloqueada fuerza una alternancia par/impar (secuencialidad parcial), el tiempo total del anillo completo no es $p$ veces la latencia de un salto — se recomienda medir el tiempo de una vuelta completa del token alrededor del anillo y dividir entre $p$ para aislar la latencia de un solo salto, o bien fijar dos procesos vecinos y aislar el resto de la topología, repitiendo para tamaños de mensaje crecientes (0, y luego mayores) y extrapolando a tamaño 0 mediante el modelo $T=\alpha+x\beta$, tal como en el ejercicio de ping-pong.

#### 8.2 Caso no bloqueado

```cpp
MPI_Request reqs[2];
double t0 = MPI_Wtime();
for (int r = 0; r < reps; r++) {
  MPI_Isend(nullptr, 0, MPI_INT, next, 0, MPI_COMM_WORLD, &reqs[0]);
  MPI_Irecv(nullptr, 0, MPI_INT, prev, 0, MPI_COMM_WORLD, &reqs[1]);
  MPI_Waitall(2, reqs, MPI_STATUSES_IGNORE);
}
double t1 = MPI_Wtime();
double latencia = (t1 - t0) / reps;
```

#### Comparación esperada

Con comunicación bloqueada, la alternancia par/impar necesaria para evitar el bloqueo mutuo introduce secuencialidad artificial: en cada ronda sólo la mitad de los procesos puede iniciar su envío antes de que el otro grupo lo haga, así que el tiempo medido por salto tiende a sobreestimar la latencia real de la red. Con comunicación no bloqueada, todos los procesos emiten `Isend`/`Irecv` simultáneamente sin riesgo de bloqueo (no hay ciclo de espera, ya que ningún proceso queda detenido esperando iniciar su propio envío), de modo que el tiempo medido se acerca más a la latencia física del enlace punto a punto. Se espera entonces que la latencia medida en el caso no bloqueado sea menor o igual que en el caso bloqueado, con la diferencia creciendo a medida que $p$ aumenta (más rondas de alternancia necesarias en el caso bloqueado). El error de la medición debe reportarse como la desviación estándar entre repeticiones, y se recomienda una gráfica de latencia vs. $p$ para ambos modos, mostrando la brecha creciente.
