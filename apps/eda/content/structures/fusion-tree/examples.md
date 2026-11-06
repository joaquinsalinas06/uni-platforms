---
kind: examples
title: Casos resueltos
---

Estos casos derivados separan la representación de las llaves, el rango aproximado de una consulta y su corrección.

## Dos posiciones bastan para ordenar las llaves almacenadas
Las llaves 0000, 0010 y 1000 se distinguen por la primera bifurcación en el bit 3 y la siguiente en el bit 1, numerando desde la derecha a partir de cero. Extraer esos bits da 00, 01 y 10. Cuando comparas 0000 con 0010, el primer bit distinto es el 1 y se preserva. Cuando comparas 0010 con 1000, el primero es el 3 y también se preserva. Por eso el orden de estas llaves sobrevive a comprimir.

## Una consulta ajena cae en otro hueco
Para q=0100, los bits elegidos son 00. Su sketch empata con el de 0000, pero q también es mayor que 0010. El bit 2 fue omitido porque todas las llaves de la rama con bit 3 igual a cero tenían bit 2 igual a cero. La consulta trae un 1 allí. El orden real queda 0000 < 0010 < 0100 < 1000. El predecesor correcto es 0010. El resultado provisional en sketches no basta para una consulta externa.

## Qué resultado produce la comparación por campos
Supón campos de separadores 00, 01 y 10. Compara todos contra el sketch 01. La máscara conceptual indica que los dos primeros separadores son menores o iguales y el tercero no. Si usas desigualdad estricta, la máscara sólo marca el primero. La variante de rango que necesites determina qué igualdad se admite. Los bits de guarda separan los resultados de cada campo en la palabra.

## Una consulta que sí puede decidirse en el orden comprimido

Consulta 0010, que está almacenada. Su sketch 01 difiere de los otros dos y coincide con el del separador central. Verificar la igualdad de las palabras completas confirma la llave. Si el enunciado pide predecesor estricto, se toma el separador anterior, 0000. Si pide sucesor estricto, el posterior es 1000.

Compáralo con 0100, cuyo sketch coincide con 0000 pero cuya palabra completa no coincide. La verificación distingue igualdad real de empate tras comprimir. Un sketch ordena las llaves ya almacenadas porque conserva sus bifurcaciones; un empate de la consulta por sí solo no certifica pertenencia.

## Reconstruir el rango cuando el sketch de la consulta engaña

Derivado. Llaves de cuatro bits 0000, 0010, 1000. Consulta 0100.

1. Dibuja la bifurcación superior. El bit 3 separa 1000 de las otras dos.
2. Dentro de la rama 0, las llaves 0000 y 0010 difieren primero en el bit 1.
3. Conserva los bits 3 y 1 en ese orden. Las posiciones 2 y 0 no separan las llaves almacenadas.
4. Calcula los sketches 00, 01 y 10. El orden interno de las tres llaves se conserva.
5. Comprime 0100. Sus bits 3 y 1 valen cero, así que obtienes 00.
6. Compara con los campos almacenados. Hay empate con el primero, aunque la consulta completa sea distinta.
7. Recupera los bits completos. En la rama 0, 0100 tiene un 1 en la posición 2 donde ambas llaves almacenadas tienen 0.
8. Esa diferencia decide antes que el bit 1. Por tanto 0100 supera tanto 0000 como 0010.
9. Frente a 1000, decide el bit 3. La consulta queda por debajo de 1000.
10. Corrige el hueco: predecesor 0010 y sucesor 1000. Se conservó el primer desacuerdo real, no el de las versiones comprimidas.

**Comprobación.** El sketch preserva el orden de las llaves del nodo. La consulta puede requerir recuperar un bit que el nodo no necesitaba guardar para distinguirlas entre sí.
