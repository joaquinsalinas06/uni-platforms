---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      El profesor exige dos propiedades para aplicar esta técnica:
      conmutatividad e invertibilidad. Da la definición de cada una, en tus
      propias palabras, sin usar la palabra "orden" en ninguna de las dos.
    hints:
      - "Conmutatividad habla de dos operaciones distintas comparadas entre sí; invertibilidad habla de una operación y su propia inversa."
      - "Invertibilidad no dice nada sobre otra operación: sólo que existe una que 'deshace' a la primera."
    solution: >-
      Conmutativas: aplicar `opₓ` y luego `opᵧ` produce el mismo resultado
      que aplicar `opᵧ` y luego `opₓ` — cualquiera de las dos secuencias
      llega al mismo estado final. Invertibles: para `opₓ` existe otra
      operación `opₓ⁻¹` tal que aplicar ambas en sucesión (`opₓ` seguida de
      `opₓ⁻¹`) deja la estructura exactamente en el estado en el que estaba
      antes de aplicar `opₓ`.
  - level: 2
    statement: >-
      Sobre el acumulador del ejemplo normal (tabla hash, historial real
      `Insert("b")` en t=1, `Insert("c")` en t=2), traza paso a paso qué
      pasa al insertar retroactivamente `Insert("a")` en t=0 y luego borrar
      retroactivamente esa misma operación. Da el estado de la tabla después
      de cada paso.
    hints:
      - "Insertar una llave nueva conmuta con insertar cualquier otra llave distinta: usa Insert(t,op) ≡ Insert(ahora,op)."
      - "Borrar Insert('a') retroactivamente es aplicar su inversa, Delete('a'), ahora."
    solution: >-
      Estado inicial (antes del insert retroactivo): `H = {b, c}`.
      Insertar retroactivamente `Insert("a")` en t=0 se resuelve como
      `Insert(ahora, Insert("a"))`, porque insertar una llave nueva conmuta
      con insertar cualquier otra distinta: `H = {a, b, c}`. Borrar
      retroactivamente esa operación se resuelve como
      `Delete(t=0) ≡ Insert(ahora, Delete("a"))`, la inversa de
      `Insert("a")`: `H = {b, c}` — vuelve exactamente al estado anterior.
  - level: 3
    statement: >-
      Implementa en C++ una clase `Accumulator` con un entero interno y un
      método `add(int delta)` que suma `delta` al total. Agrega
      `insert_retroactive(int delta)` (usa la equivalencia
      `Insert(t, op) ≡ Insert(ahora, op)`) y `delete_retroactive(int delta)`
      (usa `op⁻¹` de `add`). Verifica con `assert` que insertar `+2`
      retroactivamente y luego borrarlo devuelve el total a su valor
      original.
    hints:
      - "add ya es conmutativa e invertible: op = Add(Δ), op⁻¹ = Add(−Δ)."
      - "insert_retroactive y delete_retroactive pueden ser una sola línea cada una, llamando a add con el signo correcto."
    solution: >-
      `class Accumulator { public: void add(int delta) { total_ += delta; }
      void insert_retroactive(int delta) { add(delta); } void
      delete_retroactive(int delta) { add(-delta); } int total() const {
      return total_; } private: int total_ = 0; };` — con `Accumulator a;
      a.add(4); int before = a.total(); a.insert_retroactive(2);
      a.delete_retroactive(2); assert(a.total() == before);` el total
      vuelve a su valor original porque `insert_retroactive(2)` y
      `delete_retroactive(2)` son operación e inversa exacta.
  - level: 4
    statement: >-
      Se tiene una estructura con la operación `SetBit(i)` (pone el bit `i`
      de un entero en 1; si ya estaba en 1, no cambia nada) y su aparente
      inversa `ClearBit(i)` (pone el bit `i` en 0). ¿`SetBit` es invertible
      en el sentido que exige esta técnica? Justifica con el caso donde el
      bit ya estaba en 1 antes de aplicar `SetBit`.
    hints:
      - "Invertibilidad exige que aplicar op y luego op⁻¹ deje la estructura EXACTAMENTE como estaba antes — no sólo que llegue a un estado 'razonable'."
      - "Compara el estado antes de SetBit(i) en los dos casos posibles: bit ya en 1, y bit en 0."
    solution: >-
      No, no siempre. Si el bit `i` ya estaba en 1 antes de `SetBit(i)`, el
      estado no cambia y `ClearBit(i)` después sí lo cambia (lo apaga) —
      no vuelve al estado original, lo altera. La inversa correcta
      dependería de qué había *antes*, algo que `ClearBit(i)` fijo no puede
      capturar sin guardar ese estado aparte. Por eso `SetBit`/`ClearBit`
      como par fijo no cumplen invertibilidad en el sentido estricto que
      pide la técnica (aplicar op y luego op⁻¹ debe devolver exactamente el
      estado previo, sea cual sea).
  - level: 5
    statement: >-
      Diseña la operación retroactiva correspondiente a "restar Δ del
      contador" (`Sub(Δ)`) para el mismo acumulador del ejercicio 3, sin
      reimplementar `insert_retroactive`/`delete_retroactive` desde cero:
      exprésala en términos de las dos ya existentes. Explica en una frase
      por qué basta con eso.
    hints:
      - "Sub(Δ) es literalmente Add(−Δ): no es una operación nueva de la estructura, es un caso particular de Add."
      - "Si Sub ya es Add con el signo invertido, su propio insert/delete retroactivo son los mismos de Add, con el signo invertido."
    solution: >-
      `insert_retroactive_sub(Δ)` es simplemente
      `insert_retroactive(-Δ)`, y `delete_retroactive_sub(Δ)` es
      `delete_retroactive(-Δ)`. Basta con eso porque `Sub(Δ)` no es una
      operación algebraicamente distinta de `Add`: es `Add(-Δ)`, y ya se
      demostró que `Add` conmuta y es invertible para cualquier argumento
      entero (positivo o negativo); no hace falta un nuevo argumento de
      conmutatividad/invertibilidad para `Sub`.
  - level: 6
    statement: >-
      Demuestra formalmente por qué conmutatividad e invertibilidad, juntas,
      son *suficientes* para que `Delete(t)` produzca el mismo presente que
      nunca haber insertado `op` en `t`. Es decir: sea S la secuencia de
      operaciones reales entre `t` y el presente. Muestra que aplicar `op`
      en `t`, dejar correr S, y luego aplicar `op⁻¹` ahora, llega al mismo
      estado que aplicar sólo S (sin `op` en absoluto).
    hints:
      - "Usa conmutatividad para 'mover' op desde el tiempo t hasta el presente, cruzando cada operación de S una por una, sin cambiar el resultado final."
      - "Una vez que op está justo antes del punto donde se aplicaría op⁻¹, son operación e inversa consecutivas: por definición de invertibilidad se cancelan y no queda rastro."
    solution: >-
      Sea D el estado justo antes de `t`. Aplicar `op` da D' = op(D), y
      luego correr S da el presente real P = S(op(D)). Como cada operación
      de S conmuta con `op` (hipótesis: `op` conmuta con toda otra
      operación), se puede reordenar S(op(D)) como op(S(D)) — moviendo `op`
      operación por operación hasta el final de la secuencia sin cambiar el
      resultado, por la definición misma de conmutatividad aplicada
      repetidamente. Entonces P = op(S(D)). Aplicar ahora `op⁻¹` sobre P da
      `op⁻¹(op(S(D)))`. Por definición de invertibilidad, `op⁻¹` deshace
      exactamente el efecto de `op`, así que `op⁻¹(op(X)) = X` para
      cualquier estado X; tomando X = S(D): `op⁻¹(op(S(D))) = S(D)`. Y
      `S(D)` es exactamente el estado que resultaría de correr S sin haber
      insertado `op` en absoluto. Por lo tanto `Delete(t)` reducido a
      `Insert(ahora, op⁻¹)` llega al mismo presente que nunca haber
      insertado `op` — que es lo que la retroactividad de "borrar" debe
      garantizar, y ambas propiedades (conmutatividad para el reordenamiento,
      invertibilidad para la cancelación final) son necesarias en pasos
      distintos de este argumento.
---

Los niveles 1-3 fijan las dos propiedades y su aplicación directa; el 4 y el
5 prueban los límites de "invertible" y de "es la misma operación con otro
signo"; el 6 demuestra por qué las dos propiedades juntas —y no una sola—
bastan.
