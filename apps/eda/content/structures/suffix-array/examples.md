---
kind: examples
title: Casos resueltos
---

En los casos de clase el texto es banana seguido por un centinela menor que todas las letras. Los índices empiezan en cero.

## Por qué ana aparece en un intervalo
El orden de comienzos es [6,5,3,1,0,4,2]. El sufijo de 5 sólo tiene a antes del centinela. Los de 3 y 1 empiezan por ana. El siguiente, de 0, empieza por b. La primera frontera está en rango 2 y la segunda en rango 4 exclusivo. Las respuestas en el texto son posiciones 3 y 1. Rango de SA y posición de texto son coordenadas distintas.

## La ronda de dos caracteres todavía empata
Por una letra, 1, 3 y 5 están en la misma clase a. Por dos letras, 5 tiene a y centinela, mientras 1 y 3 tienen an. Para distinguir 1 y 3 mira cuatro caracteres: anan frente a ana seguido por centinela. Los tres primeros empatan y gana el de 3 porque su cuarto carácter es el menor. Los rangos anteriores codifican exactamente las dos mitades necesarias para decidir ese orden.

## Un intervalo vacío y un patrón que termina antes que el sufijo
Para buscar anaa, los dos candidatos que empiezan por ana fallan en la cuarta posición. Las dos fronteras coinciden y el intervalo está vacío. Para buscar na, los sufijos de 4 y 2 sí coinciden con el prefijo completo. No importa que uno todavía tenga letras después del patrón, porque la consulta pide prefijo del sufijo, no igualdad de cadenas completas.

## Un patrón ausente puede estar entre dos sufijos casi iguales

Busca anab en banana. Dentro de la región de sufijos que comienzan por ana, el de índice 3 termina tras ana y el de índice 1 continúa con n. El patrón sigue con b. En orden lexicográfico queda después del sufijo que termina y antes del que continúa con n, sin coincidir con ninguno. Las dos fronteras de búsqueda coinciden justo entre los candidatos.

Para justificar que la respuesta es vacía, no basta mostrar que un pivote falla. Explica que el orden permite delimitar el intervalo y que ninguna posición queda dentro de él.

## Resolver las clases que siguen empatadas en banana

Usa banana con centinela. La posición 6 es el centinela, que precede a cualquier letra.

1. Clasifica cada primera letra. Obtienes rangos [2,1,3,1,3,1,0].
2. Observa el empate entre los comienzos 1,3,5. Todavía sólo se sabe que empiezan por a.
3. Toma pares de rangos consecutivos para comparar prefijos de longitud dos.
4. El de posición 5 es a seguida del centinela. Ya se distingue de an.
5. Los de posiciones 1 y 3 siguen empatados en an. Asigna la misma clase a ambos.
6. Los de posiciones 2 y 4 siguen empatados en na. Asigna otra clase compartida.
7. Para longitud cuatro compara dos bloques de dos. Los sufijos 1 y 3 comparten el primer bloque an.
8. El de 1 continúa con an y el de 3 con a seguido del centinela. El de 3 queda antes.
9. Los de 2 y 4 se distinguen porque el de 4 termina antes que el de 2.
10. Ordena los rangos resultantes y lee los índices [6,5,3,1,0,4,2].
11. Busca ana: empieza en el rango 2 y termina antes del rango 4. Los índices de texto son 3 y 1.

**Comprobación.** En cada ronda se ordenan pares de rangos enteros. La cantidad de rondas viene de duplicar la longitud, no de que cada ronda lea todos los caracteres de cada sufijo.
