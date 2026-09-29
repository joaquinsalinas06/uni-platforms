---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Que Zig, Zig-Zig y Zig-Zag no son tres mecanismos distintos sino tres combinaciones de una sola primitiva, Rotar — y decir de memoria la tabla (Sem6 #9): Zig = Rotar(x); Zig-Zig = Rotar(padre(x)); Rotar(x); Zig-Zag = Rotar(x); Rotar(x)."
  - "Por qué zig-zig rota primero el par (padre, abuelo) y no el par (x, padre) — y por qué el orden inverso (move-to-root) no logra la cota amortizada."
  - "Qué hace Buscar(k) cuando k NO está en el árbol (splay del último nodo visitado, devolver falso) y por qué ese último nodo es siempre el predecesor o el sucesor de k."
  - "La diferencia entre costo real (O(1) por zig/zig-zig/zig-zag, hasta O(n) por una llamada completa a Splay) y costo amortizado (O(log n) sobre cualquier secuencia)."
  - "Por qué zig-zag no tiene la misma distinción de orden que zig-zig: por qué ahí rotar x dos veces seguidas SÍ es correcto."
  - "Por qué el splay tree exhibe las propiedades de secuencias (acceso secuencial, puntero dinámico, conjunto de trabajo, cota de entropía) que un BST estático no puede — y por qué eso lo hace candidato a optimalidad dinámica, sin serlo demostradamente."
canDo:
  - "Escribir el bucle de Splay(x) de memoria (Sem6 #10), incluida la condición que distingue zig-zig de zig-zag y la guarda que lo vuelve un no-op si x ya es la raíz."
  - "Trazar Splay(x) a mano sobre un árbol de al menos 3 niveles, identificando en cada iteración si el caso es zig, zig-zig o zig-zag, sin ver el material."
  - "Trazar una búsqueda fallida completa: descenso, qué queda en `ultimo`, qué caso de Splay se aplica sobre él y qué forma final tiene el árbol."
  - "Implementar zigZig y zigZag en C++ reutilizando rotate(Node*), con el orden de llamadas correcto en cada caso."
  - "Diseñar una secuencia de búsquedas donde el splay tree salga asintóticamente más barato que un BST estático, y explicar qué propiedad de search-sequence-properties está explotando."
---

Si el nivel 6 de `exercises.md` (por qué move-to-root falla) no sale sin ver
la solución, repetir primero el paso de `zigZig` en `full-implementation.cpp`
imprimiendo el árbol después de cada rotación — ver la forma intermedia es
lo que hace evidente la diferencia.
