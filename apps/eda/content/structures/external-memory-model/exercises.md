---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué cuesta leer un registro que ya está en RAM?
  hints:
  - Cuenta transferencias, no accesos de CPU.
  solution: Cero E/S adicionales.
  label: reconocer
- level: 2
  statement: Traza un escaneo de 19 registros con B=4.
  hints:
  - Separa grupos de cuatro.
  - Incluye el grupo final.
  solution: Cinco transferencias.
  label: trazar
- level: 3
  statement: 'Dos intervalos tienen seis registros: [0,5] y [3,8]. Con B=4, ¿cuántos bloques toca
    cada uno?'
  hints:
  - Divide cada extremo entre cuatro y redondea hacia abajo.
  - Cuenta ambos bloques extremos.
  solution: '[0,5] toca 0 y 1. [3,8] toca 0, 1 y 2. La diferencia es alineación.'
  label: resolver
- level: 4
  statement: Con B=4 y un búfer, alternas índices 0,4,1,5. ¿Qué cambia si tienes dos ranuras?
  hints:
  - Los índices 0 y 1 comparten bloque.
  - Simula las ranuras después de cada visita.
  solution: Con una ranura las cuatro visitas cargan un bloque. Con dos, las dos últimas reutilizan
    los bloques ya residentes.
  label: comparar
- level: 5
  statement: Una copia de 10 registros usa B=4. ¿En qué cambia frente a contar los registros?
  hints:
  - Separa lecturas de escrituras.
  - Hay un bloque de salida parcial.
  solution: Ambas leen tres bloques. La copia también escribe tres, incluido el parcial. El conteo
    puede conservar un acumulador en RAM.
  label: justificar
- level: 6
  statement: Justifica el factor B+1 en la cota inferior.
  hints:
  - Dibuja los huecos que dejan B separadores ordenados.
  solution: Hay un hueco entre cada par y dos extremos, así que una lectura distingue hasta B+1 intervalos.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
