---
kind: operation
title: <nombre de la operación>
order: 1
# Archivos en cpp/structures/<id>/, en orden progresivo.
cppSteps:
  - step-1-node.cpp
  - step-2-structure.cpp
  - step-3-<operacion>.cpp
  - full-implementation.cpp
# Opcional. Sólo si meta.yaml declara hasVisualization: true.
# Existe para entender el algoritmo paso a paso: qué nodo se visita, qué
# cambia, qué se conserva. No es decoración.
visualization:
  type: tree
  steps:
    - note: "<qué está pasando en este paso y por qué>"
      highlight: ["<id del nodo que se está mirando>"]
      nodes:
        - { id: n1, value: 1, parent: null }
---

<!-- Las 9 secciones son obligatorias y van en este orden. -->

## Qué hace

## Intuición

## Algoritmo

## Pseudocódigo

```
```

## C++

<Referencia al editor de arriba; el código vive en cpp/, no duplicado aquí.>

## Complejidad temporal

<Con el razonamiento, nunca sólo la notación.>

## Complejidad espacial

## Ejemplo

## Casos límite

<Vacío, un solo elemento, duplicados, el peor caso patológico.>

Los números de sección los pone la plataforma: títulos sin numerar.
