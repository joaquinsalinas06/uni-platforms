---
title: "Semana 6 — Optimalidad dinámica II: Splay completo y el Lema de Acceso"
summary: "Las cinco operaciones del splay tree construidas sólo sobre Splay, y la prueba completa de por qué cuestan O(lg n) amortizado."
sourceFiles: ["raw-materials/week6/Sem6_Dynamic_Optimality_II.pdf"]
---

La semana 5 dejó dos deudas explícitas: el splay tree se presentó con sus tres
casos de rotación pero sin las operaciones que todo árbol de búsqueda necesita,
y su cota de `O(lg n)` amortizado se **enunció sin demostrarla**. Esta semana
paga las dos.

Primero el TDA: `Buscar`, `Separar`, `Unir`, `Insertar` y `Eliminar` se
construyen sin ningún recorrido extra del árbol — todo el trabajo lo hace
Splay, y ninguna de las cinco cuesta más del doble de una llamada a Splay.

Después el análisis. Se define el potencial `Φ = Σ r(x)` con `r(x) = lg s(x)`,
se enuncia el **Lema de Acceso** (Sleator & Tarjan, 1985) y se demuestra paso a
paso: el caso zig-zig, el lema de los logaritmos que lo cierra, zig-zag por
simetría, el caso base zig, y la suma telescópica.

De ese único lema salen las dos consecuencias: con pesos uniformes da
`O(lg n)` amortizado, y con pesos proporcionales a la frecuencia de acceso da
la cota de entropía que la semana 5 sólo había nombrado.
