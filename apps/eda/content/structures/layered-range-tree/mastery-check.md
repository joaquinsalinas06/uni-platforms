---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué reemplazar el BST secundario por un arreglo ordenado no pierde ninguna capacidad de consulta del range tree 2D.
  - Por qué el Layered Range Tree no necesita promover sólo la mitad de cada arreglo, a diferencia del caso general de fractional cascading.
  - Qué gana y qué pierde frente al range tree 2D ingenuo (consulta O(lg n) vs O(lg² n), mismo espacio O(n lg n)).
  - Por qué los puentes se calculan con dos punteros monótonos durante el merge y no con lower_bound por elemento.
  - Para qué sirve el centinela en los arreglos de puentes y qué pasaría sin él.
canDo:
  - Construir a mano, para un árbol pequeño, los arreglos ordenados y sus puentes izquierdo/derecho en cada nodo.
  - "Trazar una consulta 2D completa: encontrar los nodos canónicos en X, hacer la única búsqueda binaria en la raíz, y bajar pa/pb por los puentes hasta cada nodo canónico."
  - Explicar, sin código, por qué la consulta cuesta O(lg n) nodos canónicos × O(1) cada uno, en vez de × O(lg n).
  - Adaptar el argumento a d dimensiones y decir qué complejidad resulta de aplicar cascading en las dimensiones intermedias.
---

Si algo de la lista no sale, vuelve a
[fractional cascading](/structures/fractional-cascading) — el Layered Range
Tree no es más que esa técnica aplicada a una estructura donde el arreglo
del padre ya es, por construcción, la unión de los de sus hijos.
