---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué Union en el montículo binario cuesta Θ(n) y por qué organizar
    los árboles como bits binarios lo arregla a O(lg n).
  - Por qué el invariante "a lo mucho un árbol B_k por orden" es lo mismo
    que decir que la lista de raíces es la representación binaria de n.
  - Por qué Binomial-Link es O(1) y por qué eso es lo que permite que
    Union, Insert y Extract-Min sean O(lg n) y no más.
  - Por qué Insert cuesta O(lg n) en el peor caso pero O(1) amortizado,
    usando la analogía del contador binario.
  - Qué gana y qué pierde el montículo binomial frente al
    montículo binario (Union barato, pero constante mayor en Insert y
    Find-Min) y frente al montículo de Fibonacci (que pospone el trabajo
    hasta Extract-Min en vez de mantener el invariante todo el tiempo).
canDo:
  - Trazar Union de dos montículos binomiales dados por sus listas de
    raíces, incluyendo el caso de tres raíces consecutivas del mismo grado,
    sin equivocarme.
  - Implementar Binomial-Link, Union, Insert y Extract-Min de memoria en
    C++, sin mirar `cpp/structures/binomial-heap/`.
  - Trazar Decrease-Key y Delete sobre un árbol dado, identificando
    correctamente hasta dónde sube el intercambio de llaves.
  - Convertir cualquier n en su representación binaria y decir, sin
    dibujar el montículo completo, cuántos árboles y de qué órdenes lo
    componen.
---

Si algo de la lista no sale, vuelve a
[binomial-link.md](/structures/binomial-heap/operations/binomial-link):
todas las demás operaciones se explican en términos de esa pieza, y la
mayoría de los errores de trazado vienen de aplicar mal su precondición
(qué raíz se vuelve hija de cuál).
