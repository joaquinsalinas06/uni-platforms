---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué la construcción de D4 es exactamente la de D3-separation-node,
    sobre z en vez de y — qué cambia (dimensión, satélite) y qué se hereda
    sin cambios (el árbol de rango, el nodo de separación)."
  - "Qué gana y qué pierde D4 frente a D3: cierra la caja completa en 3D,
    pero todavía paga O(lg² n + k) por consulta porque cada nivel hace su
    propia búsqueda binaria real."
  - "Por qué el mapa de conocimiento no le da a D4 una operación de consulta
    propia."
canDo:
  - "Trazar la construcción de D4 sobre un conjunto pequeño de puntos,
    identificando qué satélite (D3 normal o invertida) cuelga de cada nodo."
  - "Escribir el build de D4 reutilizando el mismo código parametrizado en
    dimensión que D3, sin duplicar la lógica del árbol de rango."
  - "Ubicar a D4 dentro de la pila D1-D2-D3-D4 y explicar hacia dónde apunta
    (fractional cascading generalizado) sin desarrollarlo."
---

Si algo de esto no sale, vuelve primero a
[D3-separation-node](/structures/d3-separation-node): D₄ no tiene mecanismo
propio que no esté ya ahí.
