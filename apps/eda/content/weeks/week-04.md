---
title: Semana 4 — Búsqueda ortogonal por rangos y localización en el plano
summary: Consultar cajas en d dimensiones con range trees, y localizar un punto en una subdivisión del plano.
sourceFiles: ["raw-materials/week4/Sem4_Orthogonal_Range_Search.pdf", "raw-materials/week4/Sem4_Planar_Point_Location.pdf"]
---

Dos mazos. El primero construye el range tree desde el caso 1D —los `O(log n)`
subárboles canónicos— y lo anida dimensión por dimensión hasta `O(n log^(d-1) n)`
de memoria y `O(log^d n)` por consulta.

El segundo reduce la localización de puntos a *vertical ray shooting*, y de ahí a
un barrido que, combinado con persistencia, contesta consultas online.
