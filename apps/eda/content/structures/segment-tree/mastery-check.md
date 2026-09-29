---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué Update y Query cuestan O(lg n): qué recorre cada uno y por qué no más."
  - Qué gana el segment tree frente a un arreglo plano, y qué gana el Fenwick tree frente al segment tree.
  - Por qué Update sólo toca el camino raíz-hoja de una posición, y por qué eso es justo lo que necesita path-copying para hacerlo persistente.
  - Cómo se reusa el mismo Update/Query cuando el segment tree se construye sobre el eje del tiempo en vez de sobre los datos.
canDo:
  - Implementar Build, Update y Query de memoria para una función asociativa arbitraria.
  - Trazar el camino que toca Update para cualquier posición, sin ejecutarlo mentalmente nodo por nodo.
  - Adaptar la implementación a otra función de combinación (suma, mínimo, máximo) cambiando sólo combinar y el neutro.
---

Si algo de esto no sale, vuelve a `operations/update.md` (es la operación
que conecta con path-copying y con retroactividad) antes de repasar Build o
Query.
