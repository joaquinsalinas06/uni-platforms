---
kind: subtopic
title: "Go-Back-N"
order: 1
---

## 1. Idea

Go-Back-N es una de las dos respuestas a "qué hace un protocolo con pipelining ante paquetes perdidos, corruptos o muy retrasados".

---

## 2. Conceptos

**Lo que dice el material:** solo el nombre. La slide *Considerations* lo presenta junto a selective repeat como uno de los "dos enfoques básicos de recuperación de errores en pipeline", y señala lo que ambos exigen:

- Un rango mayor de números de secuencia (un número único por paquete en tránsito).
- Buffers: el emisor guarda los paquetes enviados y no confirmados.

El material no desarrolla el algoritmo (tamaño de ventana, qué se retransmite, cómo se confirma). Para ver las ventanas dibujadas en general: [Protocolos de tubería](/topics/protocolos-pipeline-gbn-sr).

---

## 3. Ejemplo resuelto

No hay ejemplo numérico de Go-Back-N en las slides, ejercicios ni exámenes.

---

## 4. Errores típicos

- Completar el algoritmo con detalles de otros textos: no están en el material del curso.
