---
kind: operation
title: "El costo del método (amortized-cost)"
order: 2
cppSteps:
  - step-3-rollback-replay.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Mismo log de cuatro operaciones (ejemplo "Límite" de examples.md),
        pero ahora Insert(t=0.5, +100) — antes de la primera operación real.
      caption: "m = 4, r = 4"
      nodes:
        - { id: t1, value: "+5", parent: null }
        - { id: t2, value: "-2", parent: t1 }
        - { id: t3, value: "+10", parent: t2 }
        - { id: t4, value: "+1", parent: t3 }
    - note: >-
        Como t = 0.5 cae antes de todo, r = 4 = m: hay que deshacer el log
        completo, no sólo una parte — el peor caso del método.
      caption: "deshacer las 4 → contador = 0"
      highlight: ["t1", "t2", "t3", "t4"]
      nodes:
        - { id: t1, value: "+5", parent: null, state: marked }
        - { id: t2, value: "-2", parent: t1, state: marked }
        - { id: t3, value: "+10", parent: t2, state: marked }
        - { id: t4, value: "+1", parent: t3, state: marked }
    - note: >-
        Se aplica el cambio pedido sobre la estructura ya vacía.
      caption: "aplicar +100"
      highlight: ["t05"]
      nodes:
        - { id: t05, value: "+100", parent: null, state: active }
    - note: >-
        Rehacer las 4 operaciones cuesta lo mismo que deshacerlas: costo
        total O(4) × costo unitario — contra el O(2) del caso "Normal" de
        rollback-replay, el mismo r que crece linealmente con qué tan atrás
        cae t.
      caption: "costo = O(r) = O(4), el peor caso"
      highlight: ["t1", "t2", "t3", "t4"]
      nodes:
        - { id: t05, value: "+100", parent: null, state: active }
        - { id: t1, value: "+5", parent: t05, state: active }
        - { id: t2, value: "-2", parent: t1, state: active }
        - { id: t3, value: "+10", parent: t2, state: active }
        - { id: t4, value: "+1", parent: t3, state: active }
---

<!-- No es una operación ejecutable: es el análisis de costo de
     rollback-replay. Se documenta con las 9 secciones del template porque
     así lo exige el formato, pero cada sección describe el ARGUMENTO del
     profesor, no un algoritmo aparte. -->

## Qué hace

No ejecuta nada por sí sola: es el análisis que explica cuánto cuesta
[deshacer y rehacer](/structures/rollback-method/operations/rollback-replay),
y por qué, en general, no se puede hacer más barato con este método.

## Intuición

El costo no depende de nada sofisticado — no hay recurrencia que resolver
ni potencial que inventar. Es aritmética directa: si hay que deshacer `r`
operaciones y rehacer esas mismas `r`, el costo es $2r$ operaciones
individuales (más 1 por el cambio), y cada operación individual cuesta lo
que cueste la estructura subyacente. El profesor añade, además, que este
`r` no es sólo lo que el método de rollback necesita — es lo mínimo que
**cualquier** método necesitaría en general, vía un argumento de adversario.

## Algoritmo

El argumento completo tiene dos partes, tal como el profesor lo da:

**1. Cota superior — conteo directo (páginas 41-42, diapositiva 19).**
`Insert(t, op)` o `Delete(t)` deshacen las `r` operaciones posteriores a
`t`, aplican 1 operación, y rehacen esas mismas `r`. Si cada operación (y su
inversa) cuesta $O(1)$ u $O(\lg n)$ — el requisito de la técnica —, el costo
total es:

```
costo(Insert(t, op)) = r × (deshacer) + 1 × (aplicar) + r × (rehacer)
                     = O(r) × (costo de una operación individual)
```

Sin recurrencia ni amortización de por medio: es multiplicación directa del
número de operaciones tocadas por el costo unitario de cada una.

**2. Cota inferior — argumento de adversario informal (páginas 43-44,
diapositiva 20).** El profesor argumenta que $\Omega(r)$ es necesario **en
general**, no sólo para este método: "existen estructuras (y secuencias de
operaciones) donde modificar el tiempo `t` necesariamente cambia el
resultado de consultas que dependen de las `r` operaciones posteriores, así
que alguna estructura debe reflejar ese cambio en `Ω(r)` de sus partes." Es
un esbozo de necesidad, no una prueba formal — el profesor no exhibe la
familia de instancias concreta que lo demuestre.

**Los dos extremos del rango** (página 42): "Si `t` está muy cerca del
presente, `r` es pequeño y el método es barato; si `t` está muy atrás,
$r \approx m$ y es tan caro como rehacerlo todo" — el peor caso ocurre cuando
se modifica el principio de la historia.

## Pseudocódigo

No aplica un pseudocódigo propio — el argumento de costo se aplica sobre el
pseudocódigo ya dado en
[rollback-replay](/structures/rollback-method/operations/rollback-replay#pseudocódigo).
La fórmula que resume el análisis:

```
costo(Insert(t, op) o Delete(t)) = O(r) × (costo de una operación individual)
donde r = número de operaciones posteriores a t

Cota inferior: Ω(r) es necesaria en general (argumento de adversario informal)
```

## C++

Ver `full-implementation.cpp` en el editor de arriba: cuenta cuántas
operaciones se rehicieron en cada llamada, lo que hace observable el `r` de
este análisis en el caso barato (`t` cerca del presente) y en el caso caro
(`t` al principio de la historia).

## Complejidad temporal

$O(r)$ veces el costo de una operación individual — ver el desglose completo
arriba. Es el mismo resultado que
[rollback-replay](/structures/rollback-method/operations/rollback-replay#complejidad-temporal),
sólo que aquí se justifica el porqué en vez de sólo enunciarlo.

## Complejidad espacial

No aplica un análisis de espacio propio; ver la nota en
[rollback-replay](/structures/rollback-method/operations/rollback-replay#complejidad-espacial).

## Ejemplo

Ver [examples.md](/structures/rollback-method/examples), caso "Límite": ahí
se traza `r` pequeño contra `r` grande sobre la misma secuencia derivada.

## Casos límite

- **`r` pequeño** (`t` cerca del presente): el método es barato — el caso
  favorable que el profesor señala explícitamente.
- **$r \approx m$** (`t` al principio de la historia): tan caro como rehacer la
  secuencia completa desde cero — el peor caso.
- **La cota inferior $\Omega(r)$** es en sí un caso límite del análisis: muestra
  que ni este método ni ningún otro genérico puede evitar pagar $\Omega(r)$ en el
  peor caso, sin apoyarse en una propiedad extra de la estructura (que es
  justo lo que hacen las técnicas especializadas de las secciones
  anteriores y de
  [retroactive-priority-queue](/structures/retroactive-priority-queue)).
