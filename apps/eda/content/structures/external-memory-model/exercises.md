---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  label: reconocer
  statement: '¿Cuántas transferencias cuesta leer un registro que ya está en RAM?'
  hints:
  - 'El modelo sólo cuenta transferencias entre RAM y almacenamiento externo.'
  - 'Pregunta si esa lectura necesita traer un bloque nuevo.'
  solution: 'Cero. El registro ya está en RAM, así que no cruza ninguna frontera de bloque.'
- level: 2
  label: trazar
  statement: 'Traza un escaneo de N = 19 registros con B = 4. ¿Cuántas transferencias hace? Usa $\lceil N/B\rceil$.'
  hints:
  - 'Corta el archivo en grupos de cuatro posiciones consecutivas.'
  - 'El último grupo tiene tres registros, pero cuesta lo mismo que uno lleno.'
  solution: '$\lceil 19/4\rceil = 5$ transferencias: cuatro bloques llenos y uno con tres registros.'
- level: 3
  label: resolver
  statement: 'Dos intervalos tienen seis registros: [0, 5] y [3, 8]. Con B = 4, ¿cuántos bloques toca cada uno?'
  hints:
  - 'Calcula el bloque del extremo izquierdo y el del extremo derecho dividiendo entre 4 y redondeando hacia abajo.'
  - 'El número de bloques es la diferencia de esos dos índices más uno.'
  solution: '[0, 5] toca los bloques 0 y 1, es decir 2. [3, 8] toca los bloques 0, 1 y 2, es decir 3. La misma longitud puede costar una transferencia más según la alineación.'
- level: 4
  label: comparar
  statement: 'Con B = 4 y RAM de una sola ranura, se piden las posiciones 0, 4, 1, 5 en ese orden. ¿Cuántas transferencias hay? ¿Y con dos ranuras?'
  hints:
  - 'Las posiciones 0 y 1 pertenecen al bloque 0, y las posiciones 4 y 5 al bloque 1.'
  - 'Simula la ranura después de cada petición. Con una ranura, cada cambio de bloque expulsa al anterior.'
  solution: 'Con una ranura son 4 transferencias, porque cada petición cambia de bloque. Con dos ranuras son 2: ambos bloques quedan retenidos y las peticiones 1 y 5 son aciertos.'
- level: 5
  label: justificar
  statement: 'Una copia de 10 registros con B = 4 lee el archivo original y escribe otro archivo. ¿En qué cambia el costo frente a contar los registros?'
  hints:
  - 'Separa las lecturas de las escrituras y cuenta cada una por separado.'
  - 'El último bloque de salida puede estar incompleto, pero se escribe igual.'
  solution: 'La copia lee 3 bloques y escribe 3, incluido el parcial. Contar sólo lee 3 bloques y mantiene el acumulador en RAM, sin escribir nada.'
- level: 6
  label: demostrar
  statement: 'Justifica por qué la cota inferior de búsqueda tiene base $B+1$ y no $B$ ni $2$. Escribe la desigualdad de la que sale $t \ge \log_{B+1}(N+1)$.'
  hints:
  - 'Dibuja B llaves ordenadas. ¿Cuántas zonas dejan esos separadores?'
  - 'Si t transferencias pueden distinguir como mucho (B+1)^t respuestas, ¿qué desigualdad debe cumplirse para cubrir los N+1 huecos?'
  solution: 'B llaves dejan B+1 zonas, una por cada hueco entre separadores más los dos extremos. Una transferencia distingue hasta B+1 zonas, así que t transferencias distinguen hasta (B+1)^t respuestas. Para cubrir N+1 huecos, (B+1)^t >= N+1, y por tanto t >= log_{B+1}(N+1).'
---

Antes de abrir una pista, dibuja el estado inicial de la RAM y escribe qué unidad de trabajo vas a contar: registros examinados o transferencias.
