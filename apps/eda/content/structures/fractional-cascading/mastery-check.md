---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué promover sólo la mitad de cada lista basta, y por qué promover todo dispara el tamaño a Θ(kn).
  - Por qué un puente ahorra la búsqueda binaria en cada lista siguiente, en vez de sólo apuntar a un valor.
  - Qué significa k en O(k + lg n) en este mazo, y por qué es distinto del k del resto del curso.
  - Qué gana y qué pierde fractional cascading frente a repetir una búsqueda binaria por lista.
canDo:
  - Construir L'1, ..., L'k de abajo hacia arriba, con sus puentes, sobre un conjunto nuevo de listas.
  - Trazar una consulta completa (búsqueda binaria + puentes) sin equivocarme en los ajustes O(1).
  - Reconocer, dado un ejemplo con k listas, si el tamaño total respeta la cota O(n) o si algo se promovió de más.
---

Si algo de la lista no sale, vuelve al argumento de la serie geométrica en
[theory.md](/structures/fractional-cascading#analisis-de-complejidad) antes
de repetir los ejercicios: casi todos los errores de este tema vienen de
confundir el puente con un puntero directo al valor, en vez de con una
posición aproximada que aún requiere un ajuste O(1).
