---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué w_x, s(x), r(x) y Φ son 'definiciones solo para el análisis, no para el código' (#22), y qué pasaría si alguien intentara guardarlas en el nodo."
  - "Por qué la cota del lema se escribe en términos de r(t) − r(x) y no de n, y cómo se convierte en O(lg n) al fijar w_x = 1."
  - "Por qué la estrategia es 'un paso a la vez' (#25): qué se cancela en la suma telescópica y qué sobrevive."
  - "Por qué en zig-zig sólo cambian de rango x, y y z, y por qué eso hace que ΔΦ tenga seis términos y no n."
  - "Por qué r′(x) = r(z) es una igualdad exacta y no una desigualdad, y en qué término de la derivación se sustituye."
  - "Por qué el lema de los logaritmos se instancia con a = s′(z), b = s(x), c = s′(x), y cuál es la justificación geométrica de que a + b ≤ c (disjuntos, y ambos dentro del subárbol de x después)."
  - "De dónde sale el 3 (del zig-zig) y de dónde sale el +1 (del zig), y por qué el +1 no se multiplica por el número de pasos."
  - "Qué gana y qué pierde frente al enunciado sin prueba de la semana 5: la misma cota O(lg n), pero ahora con el Φ explícito que la produce y con la generalidad de los pesos arbitrarios."
canDo:
  - "Calcular Φ = Σ lg s(x) a mano sobre un árbol de 5-7 nodos, balanceado o en cadena, sin ver la tabla."
  - "Trazar un Splay completo anotando costo real, ΔΦ y costo amortizado paso a paso, y verificar al final que el total respeta 3(r(t) − r(x)) + 1."
  - "Reproducir la derivación completa del paso zig-zig de memoria, desde 2 + ΔΦ hasta ≤ 3(r′(x) − r(x)), diciendo en cada línea qué desigualdad de contención de subárboles se está usando."
  - "Derivar el álgebra de zig-zag por mi cuenta, eligiendo bien a, b y c — el profesor no la da (#31)."
  - "Derivar la cota del zig y explicar por qué es el único paso que arrastra un término aditivo."
  - "Exhibir el caso donde 3(r(t) − r(x)) vale 0 y argumentar desde ahí que el +1 es indispensable."
---

Si algo de la lista no sale sin ver el mazo, el orden de repaso es: primero
las tres definiciones de #22 (sin ellas nada de la prueba tiene sentido),
después el nivel 4 de `exercises.md` (dónde se usa exactamente r′(x) = r(z)),
y sólo entonces el álgebra del zig-zig completo. Si el que falla es el paso
del lema de los logaritmos, el problema no está aquí sino en
[/structures/logarithm-lemma](/structures/logarithm-lemma); si el que falla
es qué significa ĉ = c + ΔΦ, está en
[/structures/potential-method](/structures/potential-method).
