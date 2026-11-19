---
title: "Semana 15 — Dynamic Graphs II"
summary: "Link-cut trees; preparación del examen final"
sourceFiles: ["raw-materials/sem15/Sem15_Dynamic_Graphs_II.pdf"]
---

Heavy-Light es estático: una arista nueva cambia los tamaños y hay que rehacerlo. Los link-cut trees de Sleator y Tarjan mantienen un bosque que cambia (Link, Cut, FindRoot, agregados de camino) en $O(\lg n)$ amortizado, usando caminos preferidos guardados en splay trees y Heavy-Light sólo como herramienta de análisis.

Esta semana el profesor también entregó la **lista de ejercicios para el examen final** (32 ejercicios, no evaluada) y el **simulacro de examen final** (6 problemas). Ambos están resueltos paso a paso en la página [Examen final](/final). Los PDF no incluyen soluciones: son **resolución propia**, verificadas con código donde la pregunta es numérica.
