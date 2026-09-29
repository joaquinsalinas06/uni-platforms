---
kind: algorithm
title: <nombre del algoritmo o modelo>
order: 1
# Opcional. Sólo si este subtema tiene su propio código de ejemplo en
# cpp/topics/<id>/ (p.ej. un colectivo MPI concreto). La mayoría de los
# subtemas de este curso son puramente conceptuales/formulaicos y no llevan
# cppSteps — omitir el campo entero en ese caso.
cppSteps: []
# Opcional. Sólo si meta.yaml declara hasVisualization: true para este tema.
visualization:
  type: dag # xy-chart | dag | network-topology | timeline | memory-layout
  steps:
    - note: "<qué está pasando en este paso y por qué>"
      highlight: ["<id del nodo/proceso que se está mirando>"]
      nodes:
        - { id: n1, value: 1, parent: null }
---

<!-- Las secciones son obligatorias y van en este orden. -->

## Qué hace

## Intuición

## Algoritmo

## Pseudocódigo

```
```

## C++

<Sólo si cppSteps no está vacío: referencia al editor de arriba, el código
vive en cpp/, no duplicado aquí. Si no hay código para este subtema, omitir
esta sección con una línea que lo diga.>

## Complejidad

<Con el razonamiento completo, nunca sólo la notación — worst + reasoning
son obligatorios en meta.yaml.>

## Ejemplo

## Casos especiales

<p=1, tamaño de mensaje 0, f_s=0 o f_s=1, el caso donde el modelo colapsa en
otro más simple — lo que el material señale como caso límite para este
subtema en particular.>

Los números de sección los pone la plataforma: títulos sin numerar.
