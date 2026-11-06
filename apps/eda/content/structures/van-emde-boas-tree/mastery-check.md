---
kind: mastery
title: Prueba de dominio
canExplain:
- Por qué un clúster guarda su máximo y por qué eso basta para recorrer una sola rama en Sucesor.
- Por qué la recurrencia T(u) ≤ T(√u) + O(1) da O(lg lg u), dibujando los niveles.
- Qué se guarda en V.min fuera de los clústeres y por qué el mínimo no se repite dentro de un clúster.
- Por qué insertar o eliminar en un clúster de un solo elemento cuesta O(1) y sólo el resumen puede recurrir.
canDo:
- Trazar Sucesor y Predecesor de una llave dada, indicando cada comparación y la rama elegida.
- Reconstruir una llave global desde su prefijo y sufijo, y al revés.
- Actualizar el resumen al insertar el primer elemento de un clúster o al eliminar el último.
- Explicar por qué la versión compacta usa una tabla hash y qué espacio resulta.
---

Sin mirar el material, responde: ¿qué comparación decide la rama de Sucesor, y qué estructura contiene la otra rama?
