---
title: Semana 5 — Fractional cascading y optimalidad dinámica
summary: Quitarle un factor log a la consulta del range tree, y la pregunta abierta de si existe un BST óptimo.
sourceFiles: ["raw-materials/week5/CS3014_Estructuras_de_Datos_Avanzadas_2s2026+%286%29.pdf", "raw-materials/week5/Sem5_Fractional_Cascading_II.pdf", "raw-materials/week5/Sem5_Dynamic_Optimality_I.pdf"]
---

Fractional cascading I plantea el problema general: buscar la misma clave en k
listas sin pagar `k log n`. Layered range tree es esa técnica aplicada al range
tree 2D, y baja la consulta a `O(log n)` — es exactamente lo que pide el
Proyecto 2.

Fractional cascading II generaliza la construcción a un grafo de listas de grado
acotado, pasando por las cuatro estructuras D₁ a D₄.

El tercer mazo cambia de tema: define el modelo de costo de un BST, las
propiedades de las secuencias de búsqueda, y deja abierta la conjetura de
optimalidad dinámica. El splay tree es el candidato.
