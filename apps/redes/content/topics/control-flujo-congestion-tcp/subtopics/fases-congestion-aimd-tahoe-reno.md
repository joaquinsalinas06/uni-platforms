---
kind: subtopic
title: "Fases de congestión: AIMD, Tahoe y Reno"
order: 2
---

## 1. Idea

La continuación de TCP y Ex4 permiten desarrollar las fases que antes no estaban documentadas: slow start, congestion avoidance y recuperación ante pérdida.

## 2. Conceptos

- **Slow start:** crecimiento aproximado ×2 por RTT mientras cwnd está por debajo de ssthresh.
- **Congestion avoidance / AIMD:** crecimiento aproximado de 1 MSS por RTT; reducción multiplicativa ante pérdida.
- **Tahoe:** vuelve a 1 MSS ante tres ACK duplicados y ante timeout.
- **Reno:** fast retransmit y fast recovery ante tres duplicados; tras recuperarse, queda en ssthresh. Con timeout vuelve a 1 MSS.

Las ventanas se expresan en bytes o en múltiplos de MSS. El umbral después de la pérdida se calcula con el vuelo previo; la tabla de Ex4 supone vuelo igual a cwnd. [Detalle y gráfico](/topics/control-congestion-tcp-avanzado/subtopics/slow-start-aimd-tahoe-reno).

## 3. Ejemplo resuelto

Ex4 comienza con cwnd=1 MSS y ssthresh=8 MSS. Antes del evento de ronda 4 las ventanas por ronda son 1, 2, 4 y 8. Tras tres ACK duplicados, el umbral queda en 4: Tahoe reinicia en 1 y Reno, al completar fast recovery, queda en 4. [Tabla completa](/evaluaciones/laboratorio/ejercicios-4-tcp#pregunta-5-tahoe-y-reno).

## 4. Errores típicos

- Incrementar 1 MSS por ACK en congestion avoidance: la aproximación indicada es por RTT.
- Igualar el estado transitorio inflado de Reno con el estado posterior a recuperación.
- Leer estas ventanas desde Win en Wireshark: Win pertenece al receptor.

Fuentes: `Sem9_NetT-TCP2`, slides 23–25; `Sem10_Excercises4-TCP`, pregunta 5.
