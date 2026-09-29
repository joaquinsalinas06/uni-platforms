---
kind: theory
title: "Speedup, eficiencia, Ley de Amdahl y Ley de Gustafson"
visualization:
  type: xy-chart
  steps:
    - note: "Ley de Amdahl con $f_s=0.1$: el 90% del código sí paraleliza, pero el speedup deja de crecer rápido pasados los 16-32 procesos y se acerca a su techo $1/f_s = 10$."
      params: { fs: 0.1, p: 64 }
      series:
        - id: amdahl-fs01
          label: "Amdahl, f_s=0.1"
          points: [[1, 1], [2, 1.818], [4, 3.077], [8, 4.706], [16, 6.4], [32, 7.805], [64, 8.767]]
    - note: "Ley de Amdahl con $f_s=0.5$: con la mitad del código secuencial, el techo baja a $1/f_s = 2$ y se alcanza casi de inmediato, con muy pocos procesos."
      params: { fs: 0.5, p: 64 }
      series:
        - id: amdahl-fs05
          label: "Amdahl, f_s=0.5"
          points: [[1, 1], [2, 1.333], [4, 1.6], [8, 1.778], [16, 1.882], [32, 1.939], [64, 1.969]]
    - note: "Ley de Gustafson con $f_s=0.1$: si el tamaño del problema crece junto con $p$ ($T_p$ fijo), el speedup escala linealmente en vez de saturar."
      params: { fs: 0.1, p: 64 }
      series:
        - id: gustafson-fs01
          label: "Gustafson, f_s=0.1"
          points: [[1, 1], [2, 1.9], [4, 3.7], [8, 7.3], [16, 14.5], [32, 28.9], [64, 57.7]]
    - note: "Comparación directa: Amdahl (tamaño de problema fijo) satura en $1/f_s$; Gustafson (tamaño de problema creciente) sigue subiendo con $p$. Ambas parten del mismo $f_s=0.1$, pero responden preguntas distintas."
      params: { fs: 0.1, p: 64 }
      highlight: ["amdahl-fs01", "gustafson-fs01"]
      series:
        - id: amdahl-fs01
          label: "Amdahl, f_s=0.1 (strong scaling)"
          points: [[1, 1], [2, 1.818], [4, 3.077], [8, 4.706], [16, 6.4], [32, 7.805], [64, 8.767]]
        - id: gustafson-fs01
          label: "Gustafson, f_s=0.1 (weak scaling)"
          points: [[1, 1], [2, 1.9], [4, 3.7], [8, 7.3], [16, 14.5], [32, 28.9], [64, 57.7]]
        - id: ideal-linear
          label: "Speedup ideal S=p"
          points: [[1, 1], [2, 2], [4, 4], [8, 8], [16, 16], [32, 32], [64, 64]]
---

<!--
Esqueleto fijo. Las 9 secciones son obligatorias y van en este orden.
-->

## ¿Qué problema resuelve?

Una vez que un problema se descompone en tareas y se organiza como un
[DAG de tareas/canales](/topics/dag-cost-model) (span, trabajo), queda la
pregunta que le importa a quien va a correr el programa: si agrego más
procesadores, ¿cuánto más rápido va a ejecutar, y hasta dónde vale la pena
seguir agregando? Este tema da las métricas (speedup, eficiencia) y las dos
leyes que responden esa pregunta bajo dos supuestos distintos sobre el
tamaño del problema.

## Intuición

Imagina que divides un trabajo entre `p` personas. El speedup mide cuántas
veces más rápido terminas comparado con una sola persona. Pero no todo el
trabajo se puede repartir: siempre queda una parte que una sola persona debe
hacer sola (por ejemplo, coordinar al resto). Esa parte secuencial es la que
termina limitando cuánto ayuda agregar más gente. La Ley de Amdahl formaliza
ese límite cuando el trabajo total es fijo; la Ley de Gustafson muestra que,
si en cambio agrandas el trabajo a medida que agregas gente (cada quien
sigue con su misma carga), el límite desaparece.

## Estructura interna

**Speedup y eficiencia.** Dado el tiempo secuencial `Ts` y el tiempo en
paralelo con `p` procesadores `Tp`:

$$S = \frac{T_s}{T_p}, \qquad E(n) = \frac{S}{p} = \frac{T_s}{p \cdot T_p}$$

En general $S \le p$, por lo que $E \le 1$; si $S = p$ (speedup lineal), $E = 1$.

**Ley de Amdahl (strong scaling).** Responde: con un problema de tamaño
*fijo*, ¿qué tan rápido corre con `p` procesos? El tiempo secuencial
normalizado a 1 se separa en fracción secuencial `f_s` y paralela `f_p`
(`f_s + f_p = 1`):

$$T_s = f_s + f_p, \qquad T_p = f_s + \frac{f_p}{p}$$

$$S = \frac{f_s + f_p}{f_s + f_p/p} = \frac{1}{f_s + f_p/p}, \qquad E = \frac{1}{p\left(f_s + \frac{1-f_s}{p}\right)}$$

Cuando `p → ∞`, `S → 1/f_s`: el speedup queda acotado por la fracción
secuencial, sin importar cuántos procesadores se agreguen.

**Ley de Gustafson (weak scaling).** Responde una pregunta distinta: dada
una solución paralela, si el problema *crece* junto con `p` (cada proceso
mantiene su misma carga `f_p`), ¿cuánto más rápido es respecto a resolver
ese problema más grande en forma secuencial? Aquí el tiempo en paralelo se
mantiene fijo (`T_p = f_s + f_p`) y el que crece es el tiempo secuencial
equivalente:

$$T_s = f_s + p \cdot f_p$$

$$S = \frac{f_s + p \cdot f_p}{f_s + f_p} = f_s + p \cdot f_p, \qquad E = \frac{f_s + p \cdot f_p}{p}$$

El speedup escala con `p` en vez de saturar.

**Variante generalizada con exponente α.** Algunos autores derivan Gustafson
bajo un tercer supuesto: el tamaño del problema crece como `p^α` (`α` entero
`≥ 0`):

$$T_s = f_s + f_p \cdot p^\alpha, \qquad T_p = f_s + f_p \cdot p^{\alpha - 1}$$

$$S = \frac{f_s + f_p \cdot p^\alpha}{f_s + f_p \cdot p^{\alpha - 1}}, \qquad E = \frac{S}{p}$$

Para `α = 0` esto colapsa exactamente en Amdahl (`E = 1/(f_s \cdot p + (1-f_s))`);
para `α = 1`, en `E = (f_s \cdot p + (1 - f_s))^{-1}`. El mismo marco también
puede escribirse en función del *performance* `P = trabajo/tiempo`, con
`P_s = (f_s + f_p p^\alpha)/T_s = 1`, `P_p = (f_s + f_p p^\alpha)/T_p` y
`S = P_p/P_s`.

**Escalabilidad.** Es una propiedad distinta de ambas leyes: evalúa si se
puede mantener una eficiencia constante incrementando *a la vez* el número
de procesos `p` y el tamaño de la carga `n` — es decir, si un problema
grande se resuelve con la misma eficiencia que uno pequeño. La Ley de Amdahl
no puede describir esta propiedad porque es independiente del número de
procesos que efectivamente se usan (sólo depende de `f_s`).

**FLOP y FLOPS.** IEEE754 especifica un número de coma flotante (FLOP) de
precisión simple de 32 bits base-2. El *desempeño* de un sistema paralelo
suele expresarse en FLOP por segundo (FLOPS): la cantidad máxima de
operaciones de coma flotante que ejecuta por unidad de tiempo. Los
microprocesadores que generan 2-4 operaciones de doble precisión por ciclo
de reloj, a frecuencias de 2-3 GHz, alcanzan 4-12 GFLOPS por core. La
velocidad de memoria se mide en GB/seg, mientras el cómputo se mide en
GFLOP/seg — la distinción importa porque en muchos problemas el cuello de
botella es mover datos, no calcular con ellos.

## Operaciones

Este tema no tiene subtemas: `theory.md` cubre speedup, eficiencia, Amdahl,
Gustafson, la variante con exponente, escalabilidad y FLOPS en una sola
pieza.

## Análisis de complejidad

La derivación de Amdahl (estilo del profesor): se parte de que el trabajo
total normalizado es $T_s = f_s + f_p = 1$. Al paralelizar sólo la parte $f_p$
entre $p$ procesadores, el tiempo en paralelo es $T_p = f_s + f_p/p$ (la parte
secuencial no cambia, la paralela se divide entre $p$). El speedup es el
cociente $T_s/T_p$, que da $S = 1/(f_s + f_p/p)$. Tomando el límite $p \to \infty$, el
término $f_p/p$ desaparece y queda $S \to 1/f_s$: no importa cuántos
procesadores agregues, jamás superas $1/f_s$.

La derivación de Gustafson invierte la pregunta: en vez de fijar el trabajo
total y variar $p$, se fija el *tiempo* en paralelo ($T_p = f_s + f_p$, la
carga que cada proceso hace en un tiempo unitario) y se pregunta cuánto
tiempo *habría tomado* resolver secuencialmente ese mismo trabajo, ahora
$p$ veces más grande en su parte paralela: $T_s = f_s + p \cdot f_p$. El cociente
$T_s/T_p$ da directamente $S = f_s + p \cdot f_p$, lineal en $p$.

**Ejemplo — eliminación gaussiana (FLOP y tiempo).** Un sistema `Ax = b` con
`n` ecuaciones necesita aproximadamente `n³` FLOP. A 1 GFLOPS:

| n | FLOP | tiempo (seg) |
|---|---|---|
| 10 | 10³ | 10⁻⁶ |
| 100 | 10⁶ | 0.001 |
| 1 000 | 10⁹ | 1 |
| 10 000 | 10¹² | 1 000 |
| 100 000 | 10¹⁵ | 10⁶ |
| 1 000 000 | 10¹⁸ | ≈ 32 años |

Además, una matriz de `10⁶ × 10⁶ = 10¹²` elementos ocupa aproximadamente
8 TB. Esta tabla muestra por qué `n³` importa en la práctica: crecer `n` en
un orden de magnitud crece el tiempo en tres órdenes.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`: las dos fórmulas centrales (speedup de
Amdahl y de Gustafson) con su razonamiento. La variante con exponente `α` y
la eficiencia son formas derivadas de esas mismas dos, ya desarrolladas
arriba.

## Ejemplos

**Ejercicio de eficiencia (participación).** Cuatro desarrolladores
paralelizan un algoritmo secuencial en un cluster de 1000 procesos, y cada
uno reporta un problema distinto:

1. Usa el 80% del tiempo en comunicación.
2. Usa el 20% del tiempo en comunicación.
3. No logra paralelizar el 10% del algoritmo secuencial.
4. No logra paralelizar el 90% del algoritmo secuencial.

*(derivado; no aparece explícito en el material — el enunciado pide estimar,
no trae la resolución)*. Interpretando los casos 3 y 4 directamente con
Amdahl ($f_s = 0.1$ y $f_s = 0.9$ respectivamente, $p = 1000$):

- Caso 3: $E = 1/(p \cdot f_s + (1-f_s)) = 1/(1000 \cdot 0.1 + 0.9) \approx 1/100.9 \approx 0.0099$.
- Caso 4: $E = 1/(1000 \cdot 0.9 + 0.1) = 1/900.1 \approx 0.0011$.

Los casos 1 y 2 no son una fracción secuencial en sentido estricto sino
tiempo perdido en comunicación ($T_{comm}$), que juega un rol equivalente al
de $f_s$ en cuanto limita la eficiencia alcanzable: a mayor proporción de
tiempo en comunicación, menor eficiencia, con el caso 1 (80%) claramente
peor que el caso 2 (20%). Entre los cuatro, el desarrollador 2 (20% en
comunicación) es quien logra la mejor eficiencia, y el desarrollador 4 (90%
sin paralelizar) la peor.

## Comparación con temas relacionados

| | Ley de Amdahl | Ley de Gustafson |
|---|---|---|
| Pregunta que responde | ¿Qué tan rápido corre un problema de tamaño fijo con $p$ procesos? | ¿Cuánto más rápido es resolver un problema creciente en paralelo vs. secuencial? |
| Tamaño del problema | Fijo (*strong scaling*) | Crece con $p$ (*weak scaling*) | 
| Comportamiento de $S$ | Satura en $1/f_s$ | Crece linealmente con $p$ |
| Describe escalabilidad | No (independiente de $p$) | Sí, junto con el crecimiento de $n$ |

## Prueba de dominio

- Derivar $T_p$ y $S$ de Amdahl desde $T_s = f_s + f_p$ sin mirar la fórmula.
- Explicar por qué $S \to 1/f_s$ cuando $p \to \infty$, y qué implica para decidir
  cuánto vale la pena paralelizar.
- Derivar $S$ de Gustafson y explicar por qué no satura como Amdahl.
- Distinguir cuándo una pregunta de desempeño es de *strong scaling* y
  cuándo de *weak scaling*, y elegir la ley correcta para cada una.
- Explicar por qué la escalabilidad (eficiencia constante con $p$ y $n$
  creciendo juntos) no puede describirse sólo con Amdahl.
- Usar la tabla de eliminación gaussiana para razonar sobre por qué `n³`
  hace que crecer el tamaño del problema sea costoso incluso con hardware
  muy rápido.
