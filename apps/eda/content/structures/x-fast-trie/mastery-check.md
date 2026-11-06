---
kind: mastery
title: Prueba de dominio
canExplain:
- Por qué la existencia de prefijos permite búsqueda binaria sobre la longitud, y qué significa que el prefijo más largo de $x$ determine el nivel $\ell$.
- Por qué el sucesor cuando falta el hijo izquierdo es un mínimo de la rama derecha, y cuándo el vecino se busca en la lista de hojas.
- De dónde sale la cota de espacio $O(nw)$, qué cuenta cada llave y por qué $T$ no tiene $n \cdot 2^w$ entradas.
canDo:
- Dibujar el trie de un conjunto de llaves de $w$ bits con sus aristas 0/1 y la lista de hojas.
- Trazar la búsqueda de niveles para una consulta $x$ e indicar $\text{lo}$, $\text{hi}$, $\text{mid}$ en cada paso.
- Calcular sucesor y predecesor cuando falta cualquiera de las dos ramas, y señalar cuándo el vecino no existe.
- Derivar $O(\lg w)$ para la consulta y $\Theta(w)$ para la actualización, sin recurrir a la memoria.
---

Antes de la prueba, sin mirar las diapositivas, dibuja el trie de un conjunto de cuatro llaves de 4 bits y traza una consulta de sucesor completa.
