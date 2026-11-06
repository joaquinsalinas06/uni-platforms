---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: >-
    ¿Por qué el archivo deja huecos entre las llaves en lugar de compactarlas al final?
  hints:
  - >-
    Piensa en cuántas celdas hay que correr para insertar una llave pequeña delante de todas las demás.
  solution: >-
    Un hueco cercano permite insertar corriendo una o pocas celdas, en vez de mover todo el archivo.
  label: reconocer
- level: 2
  statement: >-
    En el archivo $3,\cdot,7,9,\cdot,16,21,42$ se inserta $8$ entre $7$ y $9$ corriendo el $9$ al hueco. ¿Cuál es el máximo de la ventana de celdas 2 a 3 después de la inserción?
  hints:
  - >-
    Mira qué queda en las celdas 2 y 3 después de correr el $9$.
  solution: >-
    $8$. Las celdas quedan $7$ y $8$.
  label: trazar
- level: 3
  statement: >-
    En el mismo archivo se quiere insertar $50$ después de $42$. ¿Por qué no basta con correr $16$, $21$ y $42$ una celda a la izquierda?
  hints:
  - >-
    Cuenta cuántas llaves tendría la ventana de celdas 4 a 7 después de la inserción, y compara con su umbral de tres.
  solution: >-
    La ventana 4 a 7 quedaría con cuatro llaves en cuatro celdas, por encima de su umbral de tres. Hay que subir a la ventana completa y repartir.
  label: resolver
- level: 4
  statement: >-
    Una región de $8$ celdas contiene $7$ llaves y está alineada con bloques de $B=4$ celdas. ¿Cuántos bloques se reescriben para repartirla?
  hints:
  - >-
    Las ocho celdas se dividen en bloques de cuatro.
  solution: >-
    Dos bloques.
  label: comparar
- level: 5
  statement: >-
    ¿Por qué, por inserción, cada nivel de ventanas aporta $\lg N$ celdas movidas en promedio?
  hints:
  - >-
    Una ventana de $2^k$ celdas se reescribe, en promedio, una vez cada $2^k/\lg N$ inserciones que caen dentro de ella.
  solution: >-
    Se reescriben $2^k$ celdas cada $2^k/\lg N$ inserciones; dividiendo, cada inserción recibe $\lg N$ celdas. Esto usa el espaciado de densidades, que es un hecho de la estructura PMA.
  label: justificar
- level: 6
  statement: >-
    Con $N=1024$ llaves y grupos de tamaño $\lg N = 10$, ¿cuántos representantes tiene el índice superior de la indirección?
  hints:
  - >-
    Divide $N$ entre el tamaño de un grupo.
  solution: >-
    Alrededor de $N/\lg N = 1024/10 \approx 102$ representantes.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial del archivo y escribe qué celdas cambian. Cuenta celdas y bloques antes de contar llaves.
