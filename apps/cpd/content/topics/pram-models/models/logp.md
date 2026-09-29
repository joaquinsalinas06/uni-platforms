---
kind: algorithm
title: "LogP"
order: 6
visualization:
  type: timeline
  steps:
    - note: 'El diagrama clásico de LogP: el emisor queda ocupado $o$ (overhead) preparando el envío, el mensaje transita $L$ (latencia) por la red, y el receptor queda ocupado otro $o$ procesándolo. $g$ es el intervalo mínimo entre dos envíos consecutivos del mismo procesador — el límite de ancho de banda.'
      lanes:
        - { id: sender, label: "P origen" }
        - { id: receiver, label: "P destino" }
      events:
        - { lane: sender, tStart: 0, tEnd: 1, label: "o (envío)", state: marked }
        - { lane: receiver, tStart: 3, tEnd: 4, label: "o (recepción)", state: marked }
      messages:
        - { fromLane: sender, toLane: receiver, tStart: 1, tEnd: 3, label: "L" }
    - note: 'Reducción con LogP — nivel 1 de $\log_2(4)=2$ iteraciones: los 4 procesadores activos envían y reciben un mensaje y hacen una suma. No hay barrera global: cada uno sigue en cuanto termina esta iteración.'
      caption: '$T \approx 1 \cdot (L+o+g)$'
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "envía+suma", state: active }
        - { lane: p2, tStart: 0, tEnd: 1, label: "envía+suma", state: active }
        - { lane: p1, tStart: 0, tEnd: 1, label: "recibe", state: active }
        - { lane: p3, tStart: 0, tEnd: 1, label: "recibe", state: active }
      messages:
        - { fromLane: p1, toLane: p0, tStart: 0.5, tEnd: 1, label: "x" }
        - { fromLane: p3, toLane: p2, tStart: 0.5, tEnd: 1, label: "x" }
    - note: 'Nivel 2 (la última de $\log_2(4)=2$ iteraciones): sólo P0 y P2 siguen con trabajo — combinan lo recibido en la iteración anterior. P1 y P3, ya sin trabajo, quedan muted.'
      caption: '$T \approx 2 \cdot (L+o+g)$'
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "envía+suma", state: active }
        - { lane: p1, tStart: 0, tEnd: 1, label: "sin trabajo", state: muted }
        - { lane: p2, tStart: 0, tEnd: 1, label: "recibe", state: active }
        - { lane: p3, tStart: 0, tEnd: 1, label: "sin trabajo", state: muted }
      messages:
        - { fromLane: p2, toLane: p0, tStart: 0.5, tEnd: 1, label: "x" }
    - note: 'Resultado final tras las $\log_2(4)=2$ iteraciones: P0 concentra la suma total, sin haber esperado ninguna barrera global. $T_{red} = \log(p) \cdot (L+o+g)$ — con $p=4$, dos iteraciones completas.'
      caption: '$T_{red} = \log_2(4) \cdot (L+o+g) = 2 \cdot (L+o+g)$'
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "suma total", state: answer }
        - { lane: p1, tStart: 0, tEnd: 1, label: "listo", state: muted }
        - { lane: p2, tStart: 0, tEnd: 1, label: "listo", state: muted }
        - { lane: p3, tStart: 0, tEnd: 1, label: "listo", state: muted }
---

## Qué hace

LogP modela la ejecución paralela asíncrona (procesadores que trabajan
independientemente, envían mensajes y siguen calculando sin esperar una
barrera global) haciendo explícitos los costos de comunicación mediante
cuatro parámetros: latencia, overhead, gap y número de procesadores.

## Intuición

Muchos sistemas reales no necesitan sincronizar globalmente después de cada
fase — se parecen más a APRAM que a BSP. LogP toma esa idea de asincronía y
le agrega el mismo nivel de detalle de costo de comunicación que BPRAM le
dio a las transferencias en bloque, pero separando el costo en piezas más
finas: cuánto tarda el mensaje en viajar, cuánto tiempo mantiene ocupado al
procesador que lo envía o recibe, y cuán seguido puede un procesador enviar
mensajes sin saturar la red.

## Algoritmo

No hay una única estructura de control; el modelo caracteriza el sistema
con cuatro parámetros:

- **$L$ (latency):** tiempo máximo de tránsito de un mensaje pequeño de un
  procesador a otro.
- **$o$ (overhead):** tiempo durante el cual un procesador está ocupado
  gestionando el envío o la recepción de un mensaje (no puede hacer otra
  cosa mientras tanto).
- **$g$ (gap):** intervalo mínimo entre dos transmisiones o recepciones
  consecutivas del mismo procesador — el límite de ancho de banda.
- **$P$:** número de procesadores.

## Pseudocódigo

```
d ← 1
while d < n do
    for i = 0 to floor(n/(2*d))-1 pardo
        x ← A[2*d*i + d]
        send(x, 2*d*i)
        y ← receive()
        A[2*d*i] ← A[2*d*i] + y
    d ← 2*d
```

## C++

No aplica: modelo formal sin código de ejemplo propio en el material.

## Complejidad

$$T_{mensaje} \approx L + o + g$$

Para la reducción de arriba, el `while` recorre $\log p$ iteraciones; en cada
una, cada procesador activo envía y recibe un mensaje y hace una suma:

$$T_{red} = \log p \cdot (L + o + g)$$

$$T_{logP} = O\!\left(\frac{n}{p} + \log p \cdot (L + o + g)\right)$$

**Reasoning:** $n/p$ es el cómputo local que cada procesador hace sobre su
porción de datos; $o \cdot \log p$ es el tiempo de CPU perdido gestionando
mensajes; $L \cdot \log p$ es la latencia acumulada de tránsito; $g \cdot \log p$ es el
límite de ancho de banda acumulado. LogP separa estos tres componentes de
comunicación (overhead, latencia, ancho de banda) donde BSP los junta todos
en un único parámetro `g` por palabra más una barrera `L`.

## Ejemplo

El mismo problema de reducción de $n$ elementos que se resolvió con BSP: en
LogP toma $\log p \cdot (L + o + g)$ en comunicación, contra $\log p \cdot (g + L)$
más el costo de barrera explícita en BSP. La diferencia clave no está sólo
en la fórmula sino en que LogP no impone una barrera global entre
iteraciones — cada procesador puede seguir avanzando en cuanto recibe lo que
necesita, sin esperar a que *todos* los demás terminen esa iteración.

## Casos especiales

Si $o = 0$ y $g = 0$ (sin overhead de CPU ni límite de ancho de banda),
LogP se reduce a un modelo de latencia pura ($T = L$ por mensaje). Si además
$L = 0$, colapsa en un modelo de comunicación gratuita, equivalente a PRAM
clásico con memoria compartida en vez de paso de mensajes.
