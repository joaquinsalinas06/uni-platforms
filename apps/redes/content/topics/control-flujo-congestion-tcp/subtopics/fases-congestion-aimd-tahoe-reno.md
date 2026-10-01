---
kind: subtopic
title: "Congestión: qué cubre el material"
order: 2
---

## 1. Idea

El nombre del subtema hablaba de fases de congestión (AIMD, Tahoe, Reno). **Nada de eso está en el material del curso.** Lo que sí hay sobre congestión:

---

## 2. Conceptos

- **TCP tiene control de congestión; UDP no** (slides de transporte y de UDP).
- **UDP puede enviar tan rápido como quiera** y funciona aun con la red congestionada (razón de uso, slide *Why is there a UDP?*).
- Si se necesita control de congestión sobre UDP (HTTP/3 sobre QUIC), se agrega **en la capa de aplicación**.
- En el laboratorio, la prueba de estrés y la inundación UDP (*UDP flood*) muestran el efecto de enviar sin ningún control: pérdidas y picos de tráfico en el receptor.
- Los ejercicios plantean, sin respuesta en el material, cómo QUIC logra confiabilidad, secuenciación y control de congestión sobre UDP.

---

## 3. Ejemplo resuelto

No hay ejemplos numéricos de ventana de congestión en slides, ejercicios ni exámenes.

---

## 4. Errores típicos

- Estudiar `cwnd`, slow start o AIMD para este curso: no se evalúan en el material disponible.
