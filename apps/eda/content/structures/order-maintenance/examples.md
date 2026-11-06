---
kind: examples
title: Casos resueltos
---

Estos casos derivados tratan las etiquetas como nombres de orden. No hace falta conocer las direcciones físicas de los elementos.

## Insertar con una etiqueta disponible
A tiene etiqueta 4 y B tiene 8. Si X se inserta entre ellos, puede recibir 6. La comparación A<X se vuelve 4<6 y X<B se vuelve 6<8. El resto de la lista conserva sus etiquetas. Si insertas Y entre A y X, 5 sirve.

Si ahora pides Z entre A e Y, ya no hay entero entre 4 y 5. El orden A<Z<Y sí existe; lo que se agotó es el espacio de la representación numérica local.

## Relabelar preserva las comparaciones existentes
Antes del cambio tienes A:4, Y:5, X:6 y B:8. Puedes reasignar a A, Y, X y B las etiquetas 4, 8, 12 y 16, en ese orden. Z recibe 6. Compara antes y después cualquier par viejo: X sigue después de Y y antes de B. Una etiqueta concreta dejó de ser válida, pero el orden entre elementos se conserva.

El trabajo a cobrar en list labeling es cuántas etiquetas cambian. Aunque consultar el orden siga siendo una comparación, esta actualización toca varios elementos.

## Comparar por grupo, incluso si las etiquetas locales se invierten
X tiene par (2,8) y Z tiene par (5,3). X precede a Z porque 2<5. El segundo campo sólo se consulta cuando el primero coincide. Cambiar la etiqueta del grupo 5 de forma que conserve su posición relativa actualiza la representación de todos sus miembros sin renumerar individualmente sus etiquetas locales.

## Insertar repetidamente en el mismo hueco

Entre A:0 y B:16 coloca X:8. Si cada inserción siguiente pide quedar inmediatamente después de A, los puntos medios disponibles son 4, 2 y 1. La próxima petición se sitúa entre 0 y 1 y requiere relabeling. Si hubieras repartido las inserciones entre distintos huecos, los mismos cuatro cambios no necesariamente agotarían uno.

El costo de reparación depende de cómo llegan las operaciones. Una cota amortizada explica cómo repartir reetiquetados caros durante cualquier secuencia admisible. No equivale a suponer que todas las inserciones se distribuyen uniformemente por la lista.

## Agotar un hueco antes de tocar la lista superior

Derivado. Empieza con A:0 y B:16. Todas las inserciones se piden inmediatamente después de A.

1. La primera petición queda entre 0 y 16. Toma el punto medio 8 para X.
2. La segunda queda entre 0 y 8. Da 4 a Y. La etiqueta 8 de X se conserva.
3. La tercera queda entre 0 y 4. Da 2 a Z.
4. La cuarta queda entre 0 y 2. Da 1 a W.
5. La quinta pide un entero entre 0 y 1. No existe, aunque haya etiquetas libres en otros sitios.
6. Conserva el orden A,W,Z,Y,X,B y elige etiquetas locales espaciadas 0,4,8,12,16,20.
7. Usa 2 para el elemento nuevo. Comprueba que queda después de A y antes de W.
8. Separa lo que pagaste: reasignar etiquetas es trabajo de actualización; comparar dos etiquetas sigue siendo una operación.
9. En la versión de grupos, revisa si cambió la composición del grupo. Mientras sólo se relabela dentro, el representante de arriba se puede mantener.
10. Si además se cruza el umbral de tamaño, divide el grupo y registra el nuevo representante. Este paso modifica otro nivel.

**Comprobación.** Una racha concentrada consume espacio entre las mismas llaves. Los cargos amortizados se justifican con holgura, no suponiendo inserciones uniformes.
