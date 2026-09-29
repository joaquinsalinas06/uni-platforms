---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor define el costo amortizado como `ĉᵢ = cᵢ + Φ(Dᵢ) −
      Φ(Dᵢ₋₁)`. ¿Cuál de los tres símbolos de la derecha representa "el costo
      real de la operación i" y cuál representa "el estado de la estructura
      justo antes de esa operación"?
    hints:
      - "`cᵢ` no lleva Φ: es el único término que no depende de la función de potencial."
      - "El subíndice i−1 significa 'un paso atrás en la secuencia', no 'la operación anterior en sí'."
    solution: >-
      `cᵢ` es el costo real de la operación i. `Dᵢ₋₁` es el estado de la
      estructura después de la operación i−1, es decir, justo antes de que
      empiece la operación i.
  - level: 2
    statement: >-
      Para Union (páginas 34-35), el profesor da `cᵢ = O(1)` y `ΔΦ = 0`.
      Traza el cálculo completo de `ĉᵢ` a partir de la definición y explica
      en una frase por qué `ΔΦ = 0` aquí (qué es lo que Union no cambia del
      estado).
    hints:
      - "`Φ(H) = t(H) + 2·m(H)`: para que ΔΦ sea 0, ninguno de los dos términos puede cambiar."
      - "Union concatena dos listas circulares de raíces; no crea nodos nuevos ni marca ni desmarca ninguno."
    solution: >-
      `ĉᵢ = cᵢ + ΔΦ = O(1) + 0 = O(1)`. `ΔΦ = 0` porque concatenar dos listas
      circulares de raíces no cambia el número total de árboles en la lista
      de raíces (`t(H)`) ni el número de nodos marcados (`m(H)`): sólo une
      dos listas, no agrega ni quita árboles ni toca marcas.
  - level: 3
    statement: >-
      Implementa en C++ una función `delta_phi(int delta_t, int delta_m)`
      que, dado el cambio en el número de árboles (`Δt`) y el cambio en el
      número de nodos marcados (`Δm`), devuelva `ΔΦ` según
      `Φ(H) = t(H) + 2·m(H)`. Verifica con un `assert` que para Insert
      (`Δt = +1, Δm = 0`) da `+1`, y que para el caso general de
      Decrease-Key con `c` cortes (`Δt = +c`, y de los `c` nodos tocados los
      primeros `c−1` se desmarcan y el último se marca) da `4 − c`.
    hints:
      - "ΔΦ es lineal en Δt y Δm: `ΔΦ = Δt + 2·Δm`, directo de la fórmula de Φ."
      - "Para Decrease-Key: Δm = −(c−1) + 1 = 2 − c (se desmarcan c−1, se marca 1)."
    solution: >-
      `int delta_phi(int delta_t, int delta_m) { return delta_t + 2 *
      delta_m; }`. Para Insert: `delta_phi(1, 0) == 1`. Para Decrease-Key con
      `c` cortes: `delta_m = 2 - c`, entonces
      `delta_phi(c, 2 - c) == c + 2*(2 - c) == c + 4 - 2c == 4 - c`, que
      coincide con la cota del mazo `ΔΦ ≤ 4 − c`.
  - level: 4
    statement: >-
      El mazo aplica `Φ(H) = t(H) + 2·m(H)` sólo al montículo de Fibonacci.
      Si en cambio se analizara una estructura donde cada operación agrega
      exactamente un elemento "sin marcar" a una colección de tamaño `n`, y
      nunca se quita ninguno, ¿qué pasaría si eligieras `Φ = n` (el tamaño
      actual) en vez de `Φ = t + 2m`? ¿Sigue cumpliéndose la condición de
      validez (que Φ nunca caiga por debajo de su valor inicial)? Justifica
      sin recurrir a Fibonacci.
    hints:
      - "La condición de validez no depende de qué tan 'ajustada' sea la cota, sólo de que Φ nunca baje de Φ(D₀)."
      - "n sólo crece en esta estructura (nunca se quita nada): ¿puede Φ = n bajar alguna vez?"
    solution: >-
      Sí se cumple: como la colección sólo crece (nunca se quita un
      elemento), `n` es no decreciente a lo largo de toda la secuencia, así
      que `Φ(Dᵢ) = n(Dᵢ) ≥ n(D₀) = Φ(D₀)` para todo i. La condición de
      validez sólo pide que Φ nunca caiga bajo su valor inicial — no que la
      cota resultante sea ajustada. (Que la cota sea *útil* es una decisión
      de diseño distinta de que sea *válida*.)
  - level: 5
    statement: >-
      Diseña una función de potencial `Φ` (distinta de `t(H) + 2·m(H)`) para
      un montículo de Fibonacci que también haga que Decrease-Key sea O(1)
      amortizado, usando sólo `t(H)` y `m(H)` con otros coeficientes.
      ¿Qué condición deben cumplir los coeficientes para que el término `c`
      de los cortes en cascada se siga cancelando?
    hints:
      - "Repite el cálculo de ΔΦ de Decrease-Key con Φ = t(H) + k·m(H) para un coeficiente k genérico, en vez de fijar k = 2."
      - "El término c que hay que cancelar viene de Δt = +c; necesitas que el término en Δm compense ese +c en la suma final."
    solution: >-
      Con `Φ = t(H) + k·m(H)`: `Δt = +c`, y de los `c` nodos tocados,
      `c − 1` se desmarcan (`−k` cada uno) y 1 se marca (`+k`), así que
      `ΔΦ ≤ c + (−k(c−1) + k) = c + k(2 − c) = c(1 − k) + 2k`. Para que el
      término en `c` se cancele (coeficiente de `c` igual a cero) se necesita
      `1 − k = 0`, es decir `k = 2` — que es exactamente lo que eligió el
      profesor. Cualquier `k ≠ 2` deja un término `c(1−k)` que crece con `c`,
      y Decrease-Key deja de ser O(1) amortizado.
  - level: 6
    statement: >-
      Demuestra que la condición de validez ("Φ nunca cae por debajo de su
      valor inicial") es exactamente lo que hace falta para que
      `Σᵢ₌₁ⁿ ĉᵢ ≥ Σᵢ₌₁ⁿ cᵢ` (la suma de costos amortizados acota por arriba la
      suma de costos reales), partiendo sólo de la definición
      `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)` y usando la suma telescópica.
    hints:
      - "Suma la definición de ĉᵢ para i = 1 hasta n y separa la suma de c_i de la suma de las diferencias de Φ."
      - "En la suma de diferencias, Φ(D₁) − Φ(D₀) + Φ(D₂) − Φ(D₁) + ..., todos los términos intermedios se cancelan: sólo sobreviven Φ(Dₙ) y −Φ(D₀)."
    solution: >-
      `Σᵢ₌₁ⁿ ĉᵢ = Σᵢ₌₁ⁿ [cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)] = Σᵢ₌₁ⁿ cᵢ + Σᵢ₌₁ⁿ [Φ(Dᵢ) −
      Φ(Dᵢ₋₁)]`. La segunda suma telescopa: cada `Φ(Dᵢ)` con `1 ≤ i ≤ n−1`
      aparece una vez con signo `+` (en el término i) y una vez con signo `−`
      (en el término i+1), así que se cancela; sólo quedan `Φ(Dₙ)` (signo
      `+`, del último término) y `−Φ(D₀)` (signo `−`, del primer término). Por
      lo tanto `Σᵢ₌₁ⁿ ĉᵢ = Σᵢ₌₁ⁿ cᵢ + Φ(Dₙ) − Φ(D₀)`. Si Φ nunca cae bajo su
      valor inicial, `Φ(Dₙ) ≥ Φ(D₀)` para todo n, así que
      `Φ(Dₙ) − Φ(D₀) ≥ 0`, y entonces `Σᵢ₌₁ⁿ ĉᵢ ≥ Σᵢ₌₁ⁿ cᵢ`: la suma
      amortizada acota por arriba la suma real, que es la propiedad que hace
      útil al método. Si la condición fallara (Φ pudiera caer bajo `Φ(D₀)`),
      el término `Φ(Dₙ) − Φ(D₀)` podría ser negativo y la desigualdad se
      rompería.
---

Cuatro niveles usan directamente las cuatro aplicaciones del mazo (Insert,
Union, Decrease-Key, Extract-Min); los dos últimos piden generalizar o
demostrar el mecanismo en sí, más allá de Fibonacci.
