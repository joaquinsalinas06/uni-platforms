---
kind: examples
title: Casos resueltos
---

Los ejemplos derivados separan búsqueda por máximos, movimiento de celdas y actualización del índice.

## Una actualización sin modificar el máximo
Con tramos [2,8], [12,16,20] y [25,35], el índice contiene [8,20,35]. Consulta 18. El 8 descarta el primer tramo entero. Dentro del segundo, 16 queda por debajo y 20 por encima, así que el sucesor es 20. Insertar 18 preserva ese máximo. El índice puede mantener [8,20,35] aunque haya cambiado el archivo.

El hueco físico debe quedar en una posición compatible con el orden. Si estaba después de 20, desplaza 20 una celda para insertar 18 delante. Eso es movimiento local, no una nueva búsqueda sobre el índice.

## Redistribuir cambia la frontera entre dos tramos
Tras añadir 18, el segundo tramo está lleno con [12,16,18,20]. Para insertar 19, toma ese tramo y el de [25,35] juntos. Ordena conceptualmente la región como [12,16,18,19,20,25,35]. Si la repartes dejando cuatro llaves en el primer tramo y tres en el segundo, el primer máximo baja de 20 a 19 y el segundo sigue en 35. Buscar 20 debe ir ahora al segundo tramo.

Si dejas el máximo viejo, una consulta puede ser enviada a un tramo que ya no contiene el candidato. La reparación del índice es parte del invariante, incluso cuando la cantidad total de llaves cambia poco.

## Contar el costo de mover un tramo alineado
Reescribir 16 celdas con B=4 escribe cuatro bloques si el intervalo empieza en una frontera. Si antes hay que leer el intervalo, agrega cuatro lecturas. El costo de cambiar el máximo y el de ubicar el tramo son cuentas distintas. Describir sólo las cuatro escrituras no es una cota de inserción completa.

## ¿Qué pasa si la llave supera todos los máximos?

Con máximos [8,20,35], consulta el sucesor de 36. Ningún tramo puede contener una llave estrictamente mayor porque incluso el último máximo queda por debajo. Si la operación era insertar 36, el lugar lógico está al final del último tramo. Puede haber espacio allí o puede tocar redistribuir. Después de la inserción, algún tramo debe reflejar el nuevo máximo global 36.

Este contraste muestra por qué una búsqueda que falla y una inserción usan información parecida pero no tienen el mismo efecto. La búsqueda puede terminar sin leer el archivo de llaves. La inserción todavía debe ubicar una celda y actualizar el resumen.

## Insertar dos llaves y descubrir qué resumen queda obsoleto

Derivado. Usa [2,8], [12,16,20] y [25,35] con cuatro celdas por tramo.

1. Anota los máximos 8,20,35. El índice y el archivo coinciden antes de actualizar.
2. Consulta 18 contra el 8. Descarta todo el primer tramo.
3. Compara 18 con el 20. El segundo tramo es el primero que puede contener su sucesor.
4. Dentro del tramo, identifica el hueco lógico entre 16 y 20.
5. Desplaza 20 hacia la celda libre y escribe 18. La última llave sigue siendo 20.
6. Pide insertar 19. Su lugar está entre 18 y 20, en un tramo que ya no tiene huecos.
7. Examina también el tramo siguiente. Juntos disponen de ocho celdas para siete llaves.
8. Ordena la región como 12,16,18,19,20,25,35. Hasta aquí decidiste el orden lógico.
9. Distribuye cuatro a la izquierda y tres a la derecha. El 20 cambia de tramo.
10. Actualiza el máximo izquierdo a 19 y conserva el máximo derecho 35.
11. Verifica con una consulta exacta por 20. El índice reparado descarta el tramo cuyo máximo es 19.

**Comprobación.** Mover llaves y corregir el índice son costos distintos. Con el máximo obsoleto, 20 se enviaría a un tramo donde ya no vive.
