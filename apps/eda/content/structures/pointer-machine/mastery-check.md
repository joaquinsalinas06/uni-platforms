---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué el curso necesita fijar un modelo de cómputo antes de poder decir que una operación cuesta O(1)."
  - "Las tres reglas de la máquina de punteros (O(1) campos por nodo, único nodo raíz, O(1) por operación) sin verlas escritas."
  - "Qué distingue al modelo pointer machine de una máquina RAM con arreglos: por qué no hay acceso indexado ni aritmética de direcciones."
  - "Por qué llegar a un nodo a profundidad d cuesta O(d) bajo este modelo, y qué regla concreta lo obliga."
canDo:
  - "Trazar el costo de llegar a cualquier nodo de una estructura enlazada usando sólo las tres reglas, sin atajos."
  - "Reconocer cuándo una operación propuesta viola la regla de costo O(1) porque en realidad toca un número no acotado de nodos."
  - "Explicar, para fat-nodes y path-copying, qué restricción concreta de este modelo obliga a cada una de sus técnicas."
---

Si algo de la lista no sale sin ver el mazo, repetir primero el ejercicio de
nivel 6 (la demostración de por qué el costo es Ω(d)) — de ahí sale por qué
el modelo importa para todo lo que viene después en la semana.
