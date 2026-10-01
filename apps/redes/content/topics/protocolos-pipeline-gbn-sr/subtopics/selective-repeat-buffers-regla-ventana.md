---
kind: subtopic
title: "Selective Repeat"
order: 2
---

## 1. Idea

Selective repeat es la otra respuesta a la recuperación de errores con pipelining.

---

## 2. Conceptos

**Lo que dice el material:** solo el nombre. La slide *Considerations* dice, para los protocolos con pipeline en general, que además del buffer mínimo del emisor (paquetes transmitidos y no confirmados) **el receptor también puede necesitar guardar paquetes recibidos correctamente**. No dice cuál de los dos enfoques lo requiere.

El material no desarrolla la regla de la ventana ni cómo se confirma cada paquete. Ver también: [Go-Back-N](/topics/protocolos-pipeline-gbn-sr/go-back-n-ventanas-acumulativas).

---

## 3. Ejemplo resuelto

No hay ejemplo de selective repeat en las slides, ejercicios ni exámenes.

---

## 4. Errores típicos

- Atribuir a selective repeat detalles que la slide no da (ventana del receptor, ACK individual): el material solo lo nombra.
