---
kind: mastery
title: Prueba de dominio
canExplain:
- Por qué el modelo cuenta transferencias de bloque y no comparaciones, y qué significa M/B ranuras.
- Por qué un escaneo cuesta ceil(N/B) y no N/B, incluido el bloque incompleto.
- Cómo la alineación del intervalo cambia el número de bloques tocados aunque la longitud sea la misma.
- Por qué la búsqueda binaria cuesta Θ(lg(N/B)) y de dónde sale el término constante.
- Por qué la cota inferior de búsqueda tiene base B+1 y se sigue de contar zonas por transferencia.
canDo:
- Trazar un escaneo de 19 registros con B = 4 y contar sus transferencias.
- Trazar una secuencia de accesos con una ranura y distinguir aciertos de fallos.
- Dibujar la mezcla de dos corridas con tres escaneos simultáneos y calcular su costo.
- Escribir la cota de búsqueda a partir de (B+1)^t >= N+1.
---

Antes de mirar, responde en voz alta: ¿qué unidad estás contando en cada pregunta, comparaciones o transferencias?
