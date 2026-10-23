---
kind: subtopic
title: "Retransmisión rápida con tres ACK duplicados"
order: 2
---

## 1. Idea

TCP puede detectar un hueco antes de agotar el temporizador: varios segmentos posteriores llegan, pero el ACK acumulativo sigue pidiendo el mismo byte. Ex4 pregunta 2 exige fast retransmit al tercer duplicado.

## 2. Conceptos

Tras perder S2, el receptor recibe S1 y responde con el siguiente dato esperado. Al recibir S3, S4 y S5 fuera de orden, repite ese ACK tres veces. Son **cuatro ACK con el mismo número**: original más tres duplicados. TCP retransmite S2; si el receptor conservó S3–S5, el siguiente ACK cubre los cinco segmentos.

Los ACK duplicados señalan un posible hueco, no prueban por sí solos la causa física de la pérdida. El enunciado fija la pérdida de S2 y que no hay delayed ACK, por lo que sí permite contar los intercambios.

## 3. Ejemplo resuelto

Con números de segmento 1–5 y ACK TCP expresado como siguiente segmento esperado, los ACK son 2, 2, 2, 2 y 6. Total: seis envíos de datos (cinco iniciales más S2) y cinco ACK. En bytes, si cada segmento tiene M bytes y el primero empieza en Seq=1, los cuatro primeros ACK valen M+1 y el último 5M+1.

[Comparación con GBN y SR](/evaluaciones/laboratorio/ejercicios-4-tcp#pregunta-2-gbn-sr-y-tcp).

## 4. Errores típicos

- Retransmitir S2 después del segundo duplicado.
- Reiniciar todos los segmentos como GBN: TCP puede conservar lo que llegó fuera de orden.
- Medir RTT de la copia sin resolver la ambigüedad descrita por Karn.

Fuente: `Sem10_Excercises4-TCP`, preguntas 2 y 4.
