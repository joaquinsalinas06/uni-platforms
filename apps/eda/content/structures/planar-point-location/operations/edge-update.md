---
kind: operation
title: Actualización de aristas
order: 2
cppSteps: []
visualization:
  type: tree
  mode: tree
  steps:
    - note: >-
        `edge-update` no tiene intuición ni algoritmo propio en el mazo —
        el profesor sólo la enuncia como parte de la clasificación
        estático/dinámico del problema: "se permite insertar y eliminar
        aristas" (#17). Este diagrama traza qué caso sí desarrolla el
        material y cuál queda como cita de literatura.
      caption: "paso 1 de 6: la operación, enunciada sin algoritmo (#17)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: active
    - note: >-
        Para el mapa planar general, el mazo no deriva nada propio — sólo
        cita dos resultados de la literatura, sin desarrollarlos ni
        usarlos en el curso: Baumgarten, Jung y Mehlhorn (1994) dan
        consulta e inserción $O(\log n \cdot \log \log n)$ y eliminación
        $O(\log^2 n)$ (#60); Arge, Brodal y Georgiadis (2006) dan consulta
        $O(\log n)$, inserción $O(\log^{1+\epsilon} n)$ y eliminación
        $O(\log^{2+\epsilon} n)$ (#61).
      caption: "paso 2 de 6: mapa general — sólo citas de literatura (#60-61)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: muted
        - id: general
          value: "mapa general (cita de literatura, #60-61)"
          parent: eu
          state: active
    - note: >-
        El único caso donde el profesor sí desarrolla algo más allá del
        enunciado es el restringido a **mapas ortogonales** — mapas cuyas
        aristas son todas horizontales o verticales (#53). El mapa general
        queda fuera del curso, sin ser descartado como incorrecto: sólo sin
        desarrollar aquí.
      caption: "paso 3 de 6: el curso sólo desarrolla el caso ortogonal (#53)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: muted
        - id: general
          value: "mapa general (cita de literatura, #60-61)"
          parent: eu
          state: muted
        - id: ortho
          value: "mapa ortogonal (restringido)"
          parent: eu
          state: active
    - note: >-
        Ese caso restringido se resuelve manteniendo **retroactividad
        parcial** (#54) sobre la estructura que responde `locate` — ver
        [retroactivity](/structures/retroactivity). El mazo no describe el
        mecanismo de inserción/eliminación en sí, sólo que esta técnica es
        la que se aplica.
      caption: "paso 4 de 6: se reduce a retroactividad parcial (#54)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: muted
        - id: general
          value: "mapa general (cita de literatura, #60-61)"
          parent: eu
          state: muted
        - id: ortho
          value: "mapa ortogonal (restringido)"
          parent: eu
          state: muted
        - id: retro
          value: "retroactividad parcial"
          parent: ortho
          state: active
    - note: >-
        La retroactividad parcial "sólo funciona para segmentos
        completamente horizontales" (#53) — el mazo no explica qué pasa si
        hace falta insertar o eliminar una arista **no horizontal** dentro
        de este esquema; queda fuera de alcance del material, marcado aquí
        como el límite explícito de la técnica.
      caption: "paso 5 de 6: el límite del esquema — sólo horizontal (#53)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: muted
        - id: general
          value: "mapa general (cita de literatura, #60-61)"
          parent: eu
          state: muted
        - id: ortho
          value: "mapa ortogonal (restringido)"
          parent: eu
          state: muted
        - id: retro
          value: "retroactividad parcial"
          parent: ortho
          state: muted
        - id: limite
          value: "límite: sólo aristas horizontales"
          parent: retro
          state: marked
    - note: >-
        Con esa restricción, la consulta (`locate`) se mantiene en
        $O(\log n)$ tras la actualización (#55) — la única cota que el
        profesor fija para el escenario dinámico, y sólo para este caso
        restringido a mapas ortogonales.
      caption: "paso 6 de 6: la única cota que el curso fija — restringida (#55)"
      nodes:
        - id: eu
          value: "edge-update: insertar/eliminar arista"
          parent: null
          state: muted
        - id: general
          value: "mapa general (cita de literatura, #60-61)"
          parent: eu
          state: muted
        - id: ortho
          value: "mapa ortogonal (restringido)"
          parent: eu
          state: muted
        - id: retro
          value: "retroactividad parcial"
          parent: ortho
          state: muted
        - id: limite
          value: "límite: sólo aristas horizontales"
          parent: retro
          state: muted
        - id: cota
          value: "locate tras update: O(log n)"
          parent: limite
          state: answer
---

## Qué hace

En el escenario dinámico ("se permite insertar y eliminar aristas", #17,
frente al estático "los puntos y aristas no cambian", #16), modifica el mapa
planar insertando o eliminando una arista.

## Intuición

El mazo no da ninguna — sólo nombra la operación como parte de la
clasificación estático/dinámico del problema (#16-17). No hay ninguna
imagen mental que el profesor ofrezca para "cómo" se actualiza el mapa.

## Algoritmo

**No hay uno en el material.** El profesor enuncia la operación —
insertar/eliminar aristas en el escenario dinámico — pero no desarrolla
ningún algoritmo para ella (#17). Lo único que el mazo hace con mapas
dinámicos es el caso **restringido**: mapas ortogonales con retroactividad
parcial (#53-55), que cubre la consulta (`locate`) bajo cambios, no la
mecánica de `edge-update` en sí.

Lo que sí cita el mazo, sin derivarlo ni usarlo en el curso, son resultados
de la literatura para mapas generales dinámicos (#60-61):

- Baumgarten, Jung y Mehlhorn (1994): consulta e inserción
  $O(\log n \cdot \log \log n)$, eliminación $O(\log^2 n)$.
- Arge, Brodal y Georgiadis (2006): consulta $O(\log n)$, inserción
  $O(\log^{1+\epsilon} n)$, eliminación $O(\log^{2+\epsilon} n)$.

Son citas de cultura del área, no contenido del curso — de ahí que esta
operación no tenga entrada en la tabla de complejidad de `meta.yaml`.

## Pseudocódigo

```
(ninguno — el material no da pseudocódigo para esta operación)
```

## C++

No hay implementación para esta operación: escribir una inventaría un
algoritmo que el mazo nunca da. `cppSteps` queda vacío a propósito.

## Complejidad temporal

No la deriva el profesor. Ver los resultados de literatura citados arriba
(#60-61) — son referencias, no una cota que este curso establezca.

## Complejidad espacial

No la da el profesor.

## Ejemplo

No hay ejemplo del profesor para esta operación — el mazo no la ilustra con
ningún caso concreto de insertar o eliminar una arista.

## Casos límite

- **Mapa ortogonal vs. mapa general**: la única variante que el mazo
  desarrolla algo más allá del enunciado es la restringida a aristas
  horizontales, vía retroactividad parcial sobre `locate` (#53-55) — y aun
  así, sin describir el mecanismo de inserción/eliminación en sí, sólo la
  cota de la consulta resultante.
- **Retroactividad parcial "sólo funciona para segmentos completamente
  horizontales"** (#53): el mazo no explica qué pasa si se necesita
  eliminar/insertar una arista no horizontal en ese esquema — queda fuera
  de alcance del material.
