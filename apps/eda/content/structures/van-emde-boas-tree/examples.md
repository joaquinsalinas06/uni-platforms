---
kind: examples
title: Casos resueltos
---

Usamos el estado de clase de universo 16 con S={2,3,4,5,7,14,15}. Cada consulta empieza en ese estado salvo indicación contraria.

## Un sucesor dentro del mismo clúster
Para 5, high=1 y low=1. El clúster 1 contiene sufijos {0,1,3}. Su máximo local es 3. Como 3>1, ya hay una llave mayor en el grupo actual y ninguna llave del próximo grupo puede vencerla. La consulta local da 3, que se recompone como 4·1+3=7.

Para 7, el sufijo ya es 3 y coincide con el máximo local. Esa comparación cambia la rama. Hace falta el resumen y éste salta al grupo 3, donde el mínimo local es 2. Se obtiene 14.

## Predecesor al cruzar un límite de grupo
Para 14, high=3 y low=2. El mínimo local es 2, así que no hay sufijo estrictamente menor dentro de ese clúster. El resumen {0,1,3} indica que el grupo ocupado anterior es 1. Toma su máximo local 3. El resultado es 7. Si no hubiera grupo ocupado anterior, todavía habría que comprobar el mínimo global, que se almacena aparte.

## Borrar el mínimo borra también una entrada del resumen
Borra 2. El grupo ocupado más bajo es 0 y contiene sólo el sufijo 3. La llave 3 sube al campo mínimo global. Retírala del grupo 0. Como el grupo queda vacío, quita 0 del resumen. El nuevo conjunto es {3,4,5,7,14,15} y el resumen queda {1,3}. El 3 sigue existiendo aunque ya no figure dentro de ningún clúster.

## Una inserción que sí cambia el mínimo global

Inserta 0 en el estado de clase. El mínimo pasa de 2 a 0. Como el mínimo anterior ya no ocupa ese campo, ahora hay que insertar 2 en la estructura interna. Su prefijo es 0 y su sufijo es 2. El clúster 0 ya tenía el sufijo 3, así que queda con {2,3} y el resumen conserva {0,1,3}. El nuevo 0 vive en el campo de mínimo y no se duplica dentro de su clúster.

Si omites reinsertar el antiguo mínimo, la estructura perdería la llave 2 aunque la única operación solicitada era insertar 0.

## Insertar 9 y luego borrar el mínimo sin perder llaves

Usa el estado de clase con universo 16, mínimo 2 y grupos de cuatro. Es una secuencia derivada a partir de las operaciones de clase.

1. Anota min=2 y max=15. El resumen inicial es {0,1,3}.
2. Descompón 9 como high=2 y low=1.
3. El nuevo valor no cambia los extremos globales. La modificación se concentra en el clúster 2.
4. El clúster 2 está vacío. Inicialízalo con min=max=1 sin descender más.
5. Inserta 2 en el resumen. Ahora anuncia {0,1,2,3}.
6. Pide borrar 2. Como es el mínimo global, no se busca directamente en un clúster.
7. Lee el menor índice del resumen: 0. En el clúster 0, el menor sufijo es 3.
8. Recompón la llave 3 y asciéndela al campo min. Ya está presente en el conjunto por esa vía.
9. Retira el sufijo 3 de su clúster para evitar duplicarlo. El grupo 0 queda vacío.
10. Elimina 0 del resumen. Los grupos 1,2,3 conservan sus elementos y el máximo sigue siendo 15.
11. Prueba el sucesor de 7. El grupo 1 ya no tiene candidato local y el resumen apunta ahora a 2. Su mínimo recompone 9.

**Comprobación.** Quedan {3,4,5,7,9,14,15}. Crear o vaciar un clúster singleton hace constante el cambio local; la modificación recursiva que queda está en el resumen.
