---
title: Semana 3 — Persistencia y retroactividad
summary: Cómo consultar (y modificar) el pasado de una estructura. Dos clases- persistencia el 25 de agosto, retroactividad el 28.
sourceFiles: ["raw-materials/week3/Sem_3_Persistencia-1.pdf", "raw-materials/week3/CS3014_Estructuras_de_Datos_Avanzadas_2s2026 (2).pdf"]
---

La primera clase define el modelo *pointer machine*, los cuatro niveles de
persistencia, y las dos técnicas para conseguirla: nodos gordos y path copying.

La segunda va un paso más lejos: la retroactividad no sólo consulta el pasado,
lo **modifica**, y hace que el presente se recalcule. Ahí aparecen la
conmutatividad e invertibilidad, los problemas de búsqueda descomponibles, el
rollback, y la cola de prioridad retroactiva con su idea de *puente*.
