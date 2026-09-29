---
kind: algorithm
title: "BSP (Bulk Synchronous Parallel)"
order: 5
visualization:
  type: timeline
  steps:
    - note: "Un superstep BSP tiene tres partes por procesador: cómputo local, comunicación, y una barrera global que cierra el superstep. Los cuatro procesos no necesitan terminar cómputo/comunicación al mismo tiempo, pero ninguno entra al siguiente superstep hasta que todos cruzan la barrera."
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 2, label: "cómputo" }
        - { lane: p0, tStart: 2, tEnd: 3, label: "comm" }
        - { lane: p1, tStart: 0, tEnd: 1, label: "cómputo" }
        - { lane: p1, tStart: 1, tEnd: 3, label: "comm" }
        - { lane: p2, tStart: 0, tEnd: 3, label: "cómputo" }
        - { lane: p3, tStart: 0, tEnd: 1.5, label: "cómputo" }
        - { lane: p3, tStart: 1.5, tEnd: 3, label: "comm" }
        - { lane: p0, tStart: 3, tEnd: 3, label: "barrera", state: marked }
        - { lane: p1, tStart: 3, tEnd: 3, label: "barrera", state: marked }
        - { lane: p2, tStart: 3, tEnd: 3, label: "barrera", state: marked }
        - { lane: p3, tStart: 3, tEnd: 3, label: "barrera", state: marked }
    - note: 'Reducción binaria bajo BSP — nivel 1 de $\log_2(4)=2$ supersteps: los 4 procesadores hacen cómputo local y comunican su resultado a su pareja del árbol. Todos siguen activos: nadie terminó su parte todavía.'
      caption: '$T \approx 1 \cdot (w+g \cdot h+L)$'
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p0, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p1, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p1, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p2, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p2, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p3, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p3, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p0, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p1, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p2, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p3, tStart: 2, tEnd: 2, label: "barrera", state: marked }
    - note: 'Nivel 2 (superstep 2, el último de $\log_2(4)=2$): sólo P0 y P2 siguen con trabajo — cada uno combina el resultado que le llegó de su pareja del nivel anterior. P1 y P3, ya sin trabajo, quedan muted.'
      caption: '$T \approx 2 \cdot (w+g \cdot h+L)$'
      lanes:
        - { id: p0, label: "P0" }
        - { id: p1, label: "P1" }
        - { id: p2, label: "P2" }
        - { id: p3, label: "P3" }
      events:
        - { lane: p0, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p0, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p2, tStart: 0, tEnd: 1, label: "cómputo", state: active }
        - { lane: p2, tStart: 1, tEnd: 2, label: "comm", state: active }
        - { lane: p1, tStart: 0, tEnd: 2, label: "sin trabajo", state: muted }
        - { lane: p3, tStart: 0, tEnd: 2, label: "sin trabajo", state: muted }
        - { lane: p0, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p1, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p2, tStart: 2, tEnd: 2, label: "barrera", state: marked }
        - { lane: p3, tStart: 2, tEnd: 2, label: "barrera", state: marked }
    - note: 'Resultado final tras los $\log_2(4)=2$ supersteps: P0 concentra la suma total del árbol de reducción; el resto ya cumplió su parte y queda muted. $T_{red} = \log(p) \cdot (1+g+L)$ — con $p=4$, dos supersteps completos.'
      caption: '$T_{red} = \log_2(4) \cdot (w+g \cdot h+L) = 2 \cdot (w+g \cdot h+L)$'
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

BSP (*Bulk Synchronous Parallel*) organiza la ejecución en una secuencia de
fases llamadas **supersteps**. Cada superstep tiene tres partes: cómputo
local, comunicación, y una barrera global de sincronización al final.

## Intuición

BSP es Phase PRAM con dos ingredientes agregados: cada procesador tiene
memoria local propia (como en LPRAM) y la comunicación entre procesadores
tiene un costo explícito por volumen (como en BPRAM). Conceptualmente:
`BSP ≈ Phase PRAM + localidad + comunicación + sincronización`. Es el
primer modelo de esta familia que junta todas las preocupaciones anteriores
en una sola fórmula de costo.

## Algoritmo

    cómputo local -> comunicación -> barrera

Una máquina BSP se caracteriza con tres parámetros $(p, g, L)$: $p$ número
de procesadores, $g$ costo de comunicación por palabra, $L$ costo de la
sincronización global entre supersteps.

## Pseudocódigo

```
step ← 1
while step < n do
    for i = 0 to floor(n/(2*step))-1 pardo
        A[2*step*i] ← A[2*step*i] + A[2*step*i + step]
    BSP_SYNC
    step ← 2*step
```

## C++

No aplica: modelo formal sin código de ejemplo propio en el material.

## Complejidad

$$T_{superstep} = w + g \cdot h + L$$

donde $w$ es el máximo trabajo local que hace algún procesador en ese
superstep, y $h$ el máximo número de palabras que envía o recibe algún
procesador. Con $S$ supersteps totales:

$$T_{BSP} = \sum_{s=1}^{S} (w_s + g \cdot h_s + L) = \sum w_s + g \sum h_s + S \cdot L$$

**Reasoning:** el costo de un superstep es la suma de su parte de cómputo
($w$), su parte de comunicación ($g \cdot h$, proporcional al volumen máximo
enviado/recibido por cualquier procesador) y el costo fijo de la barrera
($L$). Sumando sobre todos los supersteps aparece el término $S \cdot L$: cada
barrera adicional agrega un costo fijo, igual que en Phase PRAM, pero ahora
con $g \cdot h$ haciendo explícito también el volumen de comunicación.

## Ejemplo

Reducción binaria de $n$ elementos entre $p$ procesadores: se necesitan
$\log p$ niveles, cada uno modelado como un superstep. Si cada procesador
activo hace una suma y comunica una palabra, $w = h = O(1)$ por superstep:

$$T_{sp} = 1 + g + L, \qquad T_{red} = \log p \cdot (1 + g + L)$$

$$T_{BSP} = O\!\left(\frac{n}{p} + g \log p + L \log p\right)$$

En PRAM clásico esta misma reducción habría costado sólo $T_p = O(\log p)$:
BSP muestra que cada nivel además implica comunicación ($g$) y
sincronización ($L$), costos que PRAM ignora por completo.

## Casos especiales

Si $g = 0$ y $L = 0$ (comunicación y sincronización gratuitas), BSP colapsa
en Phase PRAM con localidad ignorada — y si además cada procesador sólo
usa memoria global, colapsa en PRAM clásico. Con $p = 1$ no hay comunicación
entre procesos ($h = 0$ siempre) y el modelo se reduce al costo puramente
secuencial $w$.
