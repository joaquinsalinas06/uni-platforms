---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué la condición Query(x, A∪B) = f(Query(x,A), Query(x,B)) con f en O(1) es lo único que hace falta para montar un segment tree sobre el tiempo."
  - "Por qué construir el segment tree SOBRE EL EJE DEL TIEMPO (en vez de sobre un arreglo de datos) es el mismo árbol, el mismo Update y el mismo Query que ya conoce de /structures/segment-tree — nada nuevo que analizar."
  - "Por qué el overhead de O(lg m) es multiplicativo (O(q · lg m)) y no aditivo, y de dónde sale exactamente ese factor."
  - "Por qué Delete-Min no es un problema descomponible simple, con un contraejemplo concreto (no sólo citar la conclusión del profesor)."
  - "Qué gana y qué pierde este método frente a retroactividad conmutativa e invertible: completa vs. parcial, sin requisito de conmutatividad/invertibilidad vs. overhead cero."
canDo:
  - "Verificar si un problema de búsqueda dado es descomponible, encontrando su f o un contraejemplo, sin ayuda."
  - "Trazar Insert/Delete/Query retroactivos sobre un segment tree de tiempo pequeño (m ≤ 8), identificando qué nodos toca cada uno."
  - "Adaptar la construcción a una f distinta (mín, máx, ∨) sin cambiar la estructura del árbol, sólo combinar() y el elemento neutro."
  - "Explicar de memoria, sin mirar apuntes, por qué este método NO sirve para toda estructura retroactiva (a diferencia de rollback)."
---

Si algo de esta lista no sale de corrido, vuelve primero a la definición de
descomponibilidad en `operations/decomposability.md` — casi todo lo demás en
este tema es reducción a partir de esa condición y del segment tree ya
conocido.
