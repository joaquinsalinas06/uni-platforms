---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué una estructura efímera no basta cuando el problema pide consultar el pasado, y qué 'dimensión de tiempo' agrega la persistencia."
  - "Qué distingue parcial, total y confluente en términos de la forma del grafo de versiones (línea, árbol, DAG) — no de memoria, sino de qué operaciones habilita cada uno."
  - "Por qué funcional no es un nivel más, sino una técnica que puede lograr cualquiera de los otros tres."
  - "Qué técnica de este curso resuelve cada nivel (fat-nodes para parcial y total, path-copying para funcional) y por qué confluente queda sin técnica propia."
canDo:
  - "Dado un problema descrito en prosa, decidir en una frase qué nivel de persistencia necesita y por qué el nivel inmediatamente más simple no alcanza."
  - "Trazar el grafo de versiones que resulta de una secuencia de escrituras, y decir si esa secuencia es válida bajo parcial, bajo total, o si necesita confluente."
  - "Distinguir, frente a un enunciado nuevo, si el problema pide un nivel de persistencia distinto o sólo una técnica de implementación distinta (funcional vs. no funcional) del mismo nivel."
---

Si algo de la lista no sale, volver primero a la tabla de la sección "Tabla
de complejidad" de theory.md — de esas cuatro filas sale toda la decisión de
nivel.
