---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué el bit menos significativo de i determina el rango que cubre tree[i].
  - Por qué Update sube con "i += lowbit(i)" y Prefix-query baja con "i -= lowbit(i)".
  - Qué gana y qué pierde el Fenwick tree frente al segment tree, y por qué el profesor los ofrece como alternativas sólo en el caso simple del barrido.
canDo:
  - Implementar Update y Prefix-query de memoria.
  - Calcular lowbit(i) a mano para cualquier i y trazar el camino que recorre cada operación.
  - Explicar por qué esta estructura no sirve para mínimo o máximo.
---

Si algo de esto no sale, vuelve al diagrama de rangos en `theory.md` antes
de repasar las operaciones.
