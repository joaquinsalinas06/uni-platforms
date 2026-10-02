---
kind: subtopic
title: "Retransmisión: qué cubre el material"
order: 2
---

## 1. Idea

El nombre del subtema promete retransmisión rápida con tres ACK duplicados. **Eso no está en el material.** Aquí va lo que sí hay sobre retransmitir.

---

## 2. Conceptos

- **Por temporizador (timeout):** en rdt3.0 el emisor retransmite el paquete actual cuando vence el temporizador sin llegar el ACK ([rdt3.0](/topics/transferencia-confiable-rdt/subtopics/rdt3-temporizadores-stop-and-wait)). En los ejercicios, un resolver DNS que no recibe respuesta por UDP espera un tiempo (2,0 s en el enunciado) y reenvía la consulta (Ejercicios 3, pregunta 9).
- **Por ACK de otro número (rdt2.2):** en un protocolo sin NAK, un ACK con el número del paquete anterior ("ACK duplicado") equivale a un NAK y el emisor retransmite.
- **Timeout prematuro:** si el temporizador es menor que el RTT el emisor retransmite aunque el ACK venga en camino; el receptor detecta el duplicado por el número de secuencia.

---

## 3. Ejemplo resuelto

No hay ejemplo de retransmisión TCP en las slides ni en los exámenes. La traza del parcial 2025-II no contiene retransmisiones.

---

## 4. Errores típicos

- Atribuir a TCP la regla de "tres ACK duplicados": no está en el material.
