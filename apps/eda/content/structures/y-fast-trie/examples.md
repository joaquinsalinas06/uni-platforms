---
kind: examples
title: Casos resueltos
---

En los ejemplos, los máximos representan los grupos y la consulta pide vecinos estrictos. Los grupos de tres llaves simplifican el dibujo.

## El grupo elegido sí contiene candidato
Los grupos son [1,4,7], [10,13,15] y [18,20,23]. Para el predecesor de 14, el primer máximo que alcanza la consulta es 15. Abre ese grupo. Dentro, 13<14 y 15>14, de modo que 13 es el vecino buscado. Todos los grupos previos terminan a lo sumo en 7. El índice superior localiza un grupo; el resultado se decide abajo.

## Cruzar al grupo previo
Para q=9, el máximo 15 también selecciona el segundo grupo. Sin embargo su mínimo, 10, ya supera 9. La búsqueda local falla y toca mirar el grupo anterior. Su máximo 7 es la respuesta. Si la consulta fuera 0 y el grupo elegido fuera el primero, el vecino no existiría. Esta comprobación es importante incluso cuando la consulta superior funcionó correctamente.

## Una división cambia el índice superior
En una maqueta de capacidad cuatro, el grupo [10,11,13,15] recibe 12. Reparte en [10,11] y [12,13,15]. El índice tenía el representante 15, que se conserva para la segunda mitad. Ahora aparece 11 para la primera. Las próximas consultas a 10 y a 14 van a grupos distintos. En la estructura real, el tamaño permitido se elige del orden de w para dejar holgura suficiente.

## La consulta coincide con un representante

En [1,4,7], [10,13,15], [18,20,23], consulta 15. Si quieres pertenencia, el 15 ya está en el segundo grupo. Si quieres predecesor estricto, la respuesta local es 13. Si quieres sucesor estricto, ningún valor del grupo supera 15 y hay que buscar el mínimo del siguiente, 18.

El índice localiza el mismo grupo para las tres preguntas. La diferencia está en la comparación final y en si se permite la igualdad. En el último grupo, consultar el sucesor de su máximo daría ausencia: no existe un grupo vecino donde continuar.

## Cruzar una frontera y luego ver cómo una división la cambia

Derivado. Usa grupos [1,4,7], [10,11,13,15], [18,20,23] y capacidad pedagógica cuatro.

1. Guarda los representantes 7,15,23 en el índice superior.
2. Pide predecesor de 9. Busca el primer representante que alcanza 9.
3. El 7 se queda corto. El 15 dirige al segundo grupo.
4. Examina su mínimo, 10. No hay candidato menor que 9 dentro del grupo.
5. Vuelve al grupo anterior y toma su máximo 7. No necesitas recorrer todas sus llaves.
6. Inserta 12. Su rango lo envía al grupo que termina en 15.
7. Colócalo entre 11 y 13. El grupo ahora tiene cinco entradas.
8. Divide en [10,11] y [12,13,15]. Los dos grupos mantienen rangos contiguos.
9. Añade 11 arriba y conserva 15 para el grupo derecho. Ahora el índice es [7,11,15,23].
10. Prueba q=12 con predecesor estricto. Seleccionas el grupo de 15, pero allí no hay ninguna llave menor. Cruzas al grupo anterior y devuelves 11.

**Comprobación.** Cambiar representantes altera qué grupo se abre. El orden global y las respuestas siguen definidos por todas las llaves, no sólo por las que indexas.
