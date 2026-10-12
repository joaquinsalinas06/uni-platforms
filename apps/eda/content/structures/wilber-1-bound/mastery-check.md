---
kind: mastery
title: Prueba de dominio
canExplain:
  - "La definición de Wilber-1: árbol de referencia, accesos ignorados y qué se suma."
  - "Por qué cada alternancia da un rectángulo independiente más."
  - "La construcción de bit-reversal y por qué sus accesos alternan de lado en cada nodo."
  - "Por qué Wilber-1 = Θ(n lg n) implica OPT = Θ(n lg n) para esa secuencia."
  - "El límite de la técnica: por qué fijar P sin conocer la secuencia puede dejar a Wilber-1 Ω(lg lg n) lejos de OPT."
canDo:
  - "Calcular Wilber-1 de una secuencia corta sobre un árbol de referencia dado."
  - "Generar la secuencia bit-reversal de 2^k llaves."
  - "Escribir de memoria wilber1()."
---

Si falla el cálculo, rehaz la tabla del ejemplo normal de [examples.md](/structures/wilber-1-bound/examples): el error típico es contar el acceso al propio nodo $y$ como si fuera de uno de sus lados.
