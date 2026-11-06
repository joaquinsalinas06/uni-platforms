---
kind: mastery
title: Prueba de dominio
canExplain:
- Por qué el Y-fast trie usa Θ(n) de espacio y el X-fast usa O(nw).
- Por qué el representante de un grupo es un valor fijo y no siempre una llave viva.
- Por qué el sucesor cruza a G(j+1) con su mínimo y el predecesor cruza a G(j-1) con su máximo.
- Por qué una partición o fusión de Θ(w) cuesta O(1) amortizado por operación.
- Por qué el sucesor y el predecesor de la consulta sólo miran G(j) y un grupo vecino.
canDo:
- Dibujar los grupos y los representantes de un conjunto dado con w conocido.
- Trazar el sucesor y el predecesor de una consulta, incluido el caso estricto sobre un representante.
- Partir un grupo de 2w+1 llaves y fusionar uno que baja de w/2, indicando qué cambia en el índice.
- Justificar la cota amortizada O(lg w) con el argumento de reorganización cada w/4 operaciones.
- Completar la tabla comparativa de vEB, vEB con hash, X-fast e Y-fast.
---
