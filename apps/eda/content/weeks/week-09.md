---
title: "Semana 9 — Optimalidad dinámica IV y V: cotas inferiores, Wilber y Tango Trees"
summary: "Cómo demostrar que ningún BST puede hacerlo mejor (rectángulos independientes, Wilber-1 y Wilber-2), el primer algoritmo con garantía demostrada (Tango Trees) y Signed-Greedy."
sourceFiles: ["raw-materials/week9/Sem9_Dynamic_Optimality_IV.pdf", "raw-materials/week9/Sem9_Dynamic_Optimality_V.pdf"]
---

La semana 6 cerró con un algoritmo conjeturado óptimo (Greedy) pero sin ninguna **cota inferior** demostrada contra la cual medirlo. Esta semana la construye.

Primero, el **método de los rectángulos independientes**: de él sale $\mathrm{OPT} \ge |I| + \frac{1}{2}\mathrm{MIS}$, con prueba completa por un argumento de carga. De ese teorema salen dos cotas calculables:
**Wilber-2** (alternancias entre puntos visibles, que explica por qué los Splay Trees son óptimos llave-independientes) y **Wilber-1** (alternancias izquierda/derecha sobre un árbol de referencia fijo, que da $\Theta(n \lg n)$ para la secuencia bit-reversal).

Después, los **Tango Trees**: una estructura construida exactamente sobre Wilber-1 —caminos de hijo preferido, un árbol auxiliar por camino— que es $O(\lg\lg n)$-competitiva, el primer avance real más allá de balancear.
Por último, **Signed-Greedy** ($\max\{\text{Greedy}^+, \text{Greedy}^-\}$): otra cota inferior, del mismo orden que la mejor cota de rectángulos independientes, y la diferencia de fondo entre una cota inferior y un algoritmo real.
