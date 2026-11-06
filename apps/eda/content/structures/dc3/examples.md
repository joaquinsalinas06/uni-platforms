---
kind: examples
title: Casos resueltos
---

Los nombres de ternas retoman mississippi, de clase. Los ejemplos de mezcla explican por qué hacen falta una o dos letras.

## Dos ternas iguales obligan a mirar sus colas
En residuo 1, los comienzos 1 y 4 dan iss. Para decidir su orden, salta esa terna. A partir de 4 y 7, ambos sufijos de cola empiezan por i. El siguiente carácter es s en la primera cola y p en la segunda. Por tanto el sufijo que empezó en 4 va antes que el de 1. Asignarles el mismo nombre de terna era correcto; usar ese nombre como rango final habría perdido la diferencia.

## Mezclar un residuo 0 con un residuo 2
Compara los sufijos de posiciones 3 y 2. Ambos empiezan con s. La segunda letra es i en posición 3 y s en posición 2, así que gana el de 3. Si ambas primeras letras hubieran empatado, compararías rangos de las posiciones 5 y 4. Sus residuos son 2 y 1, y ambos están en la muestra. La comparación puede parar antes de mirar el rango cuando una letra ya decide.

## Un residuo 1 requiere sólo una letra antes de mirar rangos
Para comparar una posición de residuo 0 con otra de residuo 1, retira una letra de cada una si empatan. Las colas caen en residuos 1 y 2. Si intentaras aplicar esa misma regla al caso 0 contra 2, la segunda cola caería en residuo 0 y su rango no estaría en la muestra. La cantidad de letras depende de qué pareja de clases estás mezclando.

## Qué pasa cuando todos los nombres son distintos

Para un texto corto con letras distintas, las ternas de muestra empiezan en letras distintas, así que radix ya las ordena sin empates. Una vez que los nombres son únicos, el orden de esos nombres es el orden de los sufijos de muestra. La recursión se evita. Todavía queda ordenar el residuo cero y mezclarlo con la muestra.

Esto contrasta con mississippi, donde un mismo nombre puede aparecer en varias posiciones. Allí sí importa cómo continúa la secuencia de nombres. La cota lineal de DC3 incluye el caso con recursión, porque el tamaño del problema reducido disminuye geométricamente.

## Pasar de ternas empatadas a una comparación de mezcla

Usa mississippi, ejemplo de clase. Distingue los rangos de muestra de los nombres de ternas.

1. Enumera posiciones desde cero. Deja fuera de la muestra 0,3,6,9 porque su residuo es cero.
2. En residuo uno toma posiciones 1,4,7,10. Sus ternas son iss, iss, ipp e i seguida de dos centinelas.
3. En residuo dos toma 2,5,8. Sus ternas son ssi, ssi y ppi.
4. Ordena ternas distintas: i con centinelas, ipp, iss, ppi, ssi.
5. Numera en ese orden. Las dos iss comparten nombre 2 y las dos ssi comparten nombre 4.
6. Construye la secuencia reducida por residuos. Los nombres repetidos indican que los rangos finales aún no se conocen.
7. Resuelve el orden entre colas empatadas. En particular, el sufijo que comienza en 4 precede al que comienza en 1.
8. Usa los rangos de muestra para ordenar el residuo cero por primera letra y rango de la cola en i+1.
9. En la mezcla considera las posiciones 3 y 2. Sus residuos son cero y dos.
10. Compara las primeras letras s y s. Al empatar, mira las segundas: i frente a s. Emite el sufijo de 3.
11. Si hubieran empatado ambas letras, usarías los rangos de posiciones 5 y 4, ambas de muestra.

**Comprobación.** El número de letras depende de los residuos. Tras una decisión se emite una cabeza y se avanza en una sola lista, como en cualquier mezcla ordenada.
