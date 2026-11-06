---
kind: examples
title: Casos resueltos
---

Usaremos el SA de clase para banana con centinela: [6,5,3,1,0,4,2]. LCP[r] compara el sufijo de rango r con el anterior.

## Herencia de tres letras a dos
Para i=1, el sufijo anana tiene por vecino anterior a ana. Coinciden en ana, tres letras. Al pasar a i=2 se elimina la a inicial. Nana y na ya comparten na. El vecino anterior de nana es precisamente na en este ejemplo. Kasai arranca con h=2 y la comparación siguiente encuentra la diferencia. No necesita volver a probar n y a.

## El RMQ entre sufijos no adyacentes
Compara los rangos 1 y 3, cuyos sufijos son a y anana con sus centinelas. Entre ellos hay dos pares adyacentes. Sus LCP son 1 y 3. Ambos extremos comparten al menos la longitud mínima 1. No pueden compartir más porque uno de los pares intermedios ya deja de coincidir al pasar de una letra. En la tabla se consulta LCP[2..3], omitiendo la entrada 1, que compara contra un sufijo fuera del intervalo.

## Substrings distintos y repetición más larga
Hay 21 substrings no vacíos de banana si cuentas posiciones. En orden de sufijos, los prefijos que se repiten con uno anterior son exactamente los cubiertos por su LCP con el vecino anterior. Se restan 1+3+2=6, quedando 15. El mayor LCP es 3, así que la repetición más larga mide tres y es ana. Esta pregunta usa máximo global; la consulta de similitud de un par usa mínimo dentro de un intervalo.

## Mucha coincidencia acumulada no significa mucho trabajo nuevo

Para un texto formado por cuatro aes y un centinela, los sufijos se ordenan de más corto a más largo después del centinela. Los LCP adyacentes son 0, 1, 2 y 3. Comparar cada par desde cero examinaría una cantidad de letras que crece rápidamente al alargar la racha.

Kasai empieza en la primera posición del texto, encuentra una coincidencia de tres y pasa a la siguiente posición con dos ya garantizadas. El siguiente LCP vale dos, así que sólo debe comprobar el punto donde deja de coincidir. Luego hereda uno. Los valores de la tabla pueden sumar mucho más que el trabajo necesario para producirlos.

## Recorrer el texto aunque los resultados se escriban por rango

Usa banana con centinela. SA=[6,5,3,1,0,4,2]. LCP[r] compara el sufijo de rango r con el anterior.

1. Construye el inverso: las posiciones 0 a 6 tienen rangos [4,3,6,2,5,1,0].
2. En i=0, rango 4, el vecino anterior es posición 1. b y a difieren. Guarda 0 en LCP[4].
3. En i=1, rango 3, el vecino anterior es posición 3. Empieza con h=0.
4. Compara a con a, n con n y a con a. Se acumulan tres letras iguales.
5. La siguiente letra es n frente al centinela. Guarda 3 en LCP[3] y conserva h=2.
6. En i=2, rango 6, el vecino es posición 4. Comienza después de las dos letras que ya se garantizan.
7. La siguiente letra vuelve a diferir. Guarda 2 en LCP[6] y conserva h=1.
8. En i=3, rango 2, el vecino es posición 5. Ya coinciden en a y el carácter siguiente difiere. Guarda 1 en LCP[2].
9. En i=4, el vecino empieza por b y el sufijo actual por n. Guarda 0 en LCP[5].
10. En i=5, el vecino es el centinela. Guarda 0 en LCP[1].
11. En i=6, el sufijo tiene rango 0 y no hay vecino anterior. Esa entrada queda sin valor.

**Comprobación.** En orden de rangos queda [—,0,1,3,0,0,2]. Heredar h reduce comparaciones nuevas, aunque la tabla final contenga prefijos largos.
