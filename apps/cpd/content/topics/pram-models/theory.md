---
kind: theory
title: "PRAM y sus extensiones"
visualization:
  type: timeline
  steps:
    - note: "PRAM clásico es completamente síncrono: los tres procesadores avanzan al mismo paso (lectura, cómputo, escritura) y nadie adelanta al resto. Esta es la idealización que las extensiones (APRAM, BSP, LogP...) van a relajar una por una."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "paso 1" }
        - { lane: p1, tStart: 0, tEnd: 1, label: "paso 1" }
        - { lane: p2, tStart: 0, tEnd: 1, label: "paso 1" }
        - { lane: p0, tStart: 1, tEnd: 2, label: "paso 2" }
        - { lane: p1, tStart: 1, tEnd: 2, label: "paso 2" }
        - { lane: p2, tStart: 1, tEnd: 2, label: "paso 2" }
---

## ¿Qué problema resuelve?

Después de conocer [speedup, eficiencia y las leyes de Amdahl/Gustafson](/topics/performance-metrics),
falta un modelo formal para *diseñar* un algoritmo paralelo antes de
preocuparse por el hardware real donde va a correr: ¿cómo se organiza el
cómputo cuando hay muchos procesadores trabajando a la vez sobre una misma
memoria? PRAM (Parallel Random Access Machine) es esa abstracción, y sus
extensiones formales (APRAM, Phase PRAM, LPRAM, BPRAM, BSP, LogP) van
progresivamente quitando idealizaciones para acercarse a sistemas reales.

## Intuición

PRAM extiende el modelo RAM (un procesador secuencial con memoria infinita
de acceso uniforme) agregando $p$ procesadores idénticos que comparten esa
misma memoria y se comunican exclusivamente leyendo y escribiendo en ella —
no hay red, no hay latencia, no hay caché. Es la transición conceptual:

    RAM -> PRAM -> Pseudocódigo paralelo -> Work y Span -> Speedup

Cada procesador ejecuta, en cada paso: lectura de memoria compartida,
cómputo local, escritura en memoria compartida. La idealización total de
PRAM (memoria de costo constante, sincronía perfecta) es justamente lo que
hace que sea fácil diseñar algoritmos ahí, pero también lo que obliga a
extenderlo cuando se quiere modelar sincronización, localidad o
comunicación real.

## Estructura interna

**Modelo RAM.** Un computador secuencial con memoria infinita de acceso
directo, con instrucciones de lectura, escritura y aritmética/lógica. Por
ejemplo, sumar $n$ números en RAM toma $T_s(n) = \Theta(n)$.

**Modelo PRAM.** Un conjunto de procesadores idénticos $\{P_1, \ldots, P_n\}$, cada
uno un RAM, ejecutando el mismo código de forma síncrona sobre una memoria
compartida. Se ignoran cachés, latencia real de memoria y costos físicos de
comunicación: `RAM = 1 procesador + memoria`, `PRAM = p procesadores +
memoria compartida`.

**Clasificación por acceso concurrente.** La variante central de PRAM es
cómo resuelve la lectura/escritura simultánea sobre la misma dirección:

- **EREW** (*exclusive read exclusive write*): cada posición de memoria es
  leída o escrita por un único procesador a la vez. Es la variante más
  restrictiva (ej. suma de vectores, reducción binaria).
- **CREW** (*concurrent read exclusive write*): varios procesadores pueden
  leer la misma dirección en el mismo paso, pero sólo uno puede escribir en
  ella. Ejemplo: todos los procesadores leen el mismo escalar $x$ para
  calcular $B_i = A_i + x$, cada uno escribe en su propio $B_i$.
- **ERCW** (*exclusive read concurrent write*): lectura exclusiva, escritura
  simultánea permitida. Poco usada en la práctica.
- **CRCW** (*concurrent read concurrent write*): tanto lectura como
  escritura pueden ser simultáneas (ej. Global OR). La escritura concurrente
  exige una regla de resolución de conflictos: modelo *común* (todos
  escriben el mismo dato), *arbitrario* (se admite cualquier dato, gana uno
  cualquiera), *combinado* (se acumula el resultado de todos, p.ej. una
  suma) o *prioritario* (gana el procesador de mayor prioridad).

Existe una jerarquía estricta de poder expresivo/algorítmico:

$$\text{EREW} \subset \text{CREW} \subset \text{CRCW}$$

**Métricas.** $T_p(n)$ (pasos con $p$ procesadores), $W(n)$ (trabajo total,
operaciones), $T_\infty(n)$ (span, tiempo con procesadores ilimitados), $P(n)$
(número de procesadores), y el costo $C_p(n) = T_p(n) \cdot P(n)$. Un algoritmo es
de **costo óptimo** si $C_p(n) = \Theta(T_s(n))$: no gasta más recursos totales de
los que gastaría el mejor algoritmo secuencial.

**Por qué existen las extensiones.** PRAM asume `Tmemoria = O(1)` y no
representa explícitamente el tiempo de comunicación, sincronización ni
latencia. Cada extensión relaja exactamente uno de esos supuestos:

| Modelo | Supuesto que modifica | Extensión introducida |
|---|---|---|
| APRAM | Sincronización global | Asincronía |
| Phase PRAM | Sincronización "gratuita" | Fases y barreras explícitas |
| LPRAM | Acceso uniforme a memoria | Localidad (memoria local vs. global) |
| BPRAM | Acceso palabra por palabra | Transferencia por bloques |
| BSP | Combina las anteriores | Supersteps `(p, g, L)` |
| LogP | Asincronía + comunicación fina | Parámetros `L, o, g, P` |

## Operaciones

Cada extensión se cubre en su propio archivo, en el orden en que introducen
cada preocupación (asincronía → sincronización → localidad → bloques →
combinación completa → comunicación asíncrona fina):

1. [APRAM](/topics/pram-models/models/apram) — asincronía entre procesadores.
2. [Phase PRAM](/topics/pram-models/models/phase-pram) — fases con barrera global.
3. [LPRAM](/topics/pram-models/models/lpram) — memoria local vs. global.
4. [BPRAM](/topics/pram-models/models/bpram) — transferencia por bloques.
5. [BSP](/topics/pram-models/models/bsp) — supersteps $(p, g, L)$.
6. [LogP](/topics/pram-models/models/logp) — latencia, overhead y ancho de banda explícitos.

## Análisis de complejidad

El análisis de costo propio de PRAM (EREW/CREW/CRCW) se resuelve
algoritmo por algoritmo — ver [algoritmos PRAM y teorema de Brent](/topics/pram-algorithms).
Aquí el análisis relevante es de costo *óptimo*: $C_p(n) = T_p(n) \cdot P(n)$
debe ser $\Theta(T_s(n))$. Si el costo excede el tiempo secuencial óptimo, el
algoritmo paralelo desperdicia trabajo aunque termine rápido — está
"malgastando" procesadores. Cada extensión agrega su propio término de
costo (sincronización, comunicación, bloques) al lado de $W(n)/p + T_\infty(n)$
que ya da el [teorema de Brent](/topics/pram-algorithms/algorithms/brent-theorem).

## Tabla de complejidad

La tabla se genera desde `meta.yaml`: la condición de costo óptimo general,
el costo de un superstep BSP y el costo de un mensaje en LogP. El resto de
las fórmulas específicas de cada extensión (BPRAM, ejemplos de reducción)
están en su propio archivo bajo `models/`.

## Ejemplos

Los ejemplos resueltos (reducción binaria en Phase PRAM, reducción en BSP,
reducción en LogP, ejemplo de asincronía en APRAM) están cada uno dentro del
archivo de su extensión correspondiente, junto al modelo que ejemplifican.

## Comparación con temas relacionados

Las seis extensiones no forman una única secuencia lineal: cada una ataca
una preocupación distinta (ver tabla en "Estructura interna"). BSP combina
las ideas de Phase PRAM (supersteps y barreras), LPRAM (cómputo y memoria
local) y BPRAM (volumen de comunicación): `BSP ≈ Phase PRAM + localidad +
comunicación + sincronización`. LogP en cambio se acerca más a APRAM
(asincronía) pero modelando explícitamente latencia, overhead y ancho de
banda. La comparación detallada de cada extensión frente a PRAM clásico está
en su propio archivo bajo "Casos especiales".

> **Nota de apoyo** (no está en el material): la relación DAG-PRAM que
> mencionan las diapositivas (cada nivel paralelizable de un DAG se
> representa como un paso PRAM, y a la inversa) es útil para ubicar este
> tema junto al [modelo de costo DAG](/topics/dag-cost-model), pero el
> profesor no la desarrolla como parte formal de ninguna extensión.

## Prueba de dominio

- Explicar la diferencia entre EREW, CREW, ERCW y CRCW con un ejemplo de
  cada uno, y justificar por qué forman una jerarquía estricta.
- Explicar qué significa que un algoritmo PRAM sea de costo óptimo.
- Para cada extensión, decir qué supuesto de PRAM clásico relaja y con qué
  parámetro nuevo lo modela.
- Explicar por qué BSP y LogP se consideran modelos "combinados" frente a
  APRAM/Phase PRAM/LPRAM/BPRAM.
