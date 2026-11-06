---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: '¿Qué guarda el suffix array: los sufijos completos o sólo sus posiciones de inicio?'
  hints:
  - Piensa en el tamaño de la estructura frente al texto.
  solution: Guarda sólo las posiciones de inicio, ordenadas según el sufijo que empieza en cada una.
  label: reconocer
- level: 2
  statement: '¿En qué ronda se separan los sufijos de posiciones 1 y 3 de banana$?'
  hints:
  - Los dos empiezan por an, así que la ronda de longitud 2 no los separa.
  - Compara anan con ana$ en el cuarto carácter.
  solution: En la ronda de longitud 4. ana$ queda antes que anan porque su cuarto carácter es el centinela.
  label: trazar
- level: 3
  statement: '¿Qué posiciones del texto devuelve la búsqueda de na en banana$?'
  hints:
  - Identifica los sufijos que empiezan por na en el orden SA.
  - El intervalo son dos filas consecutivas del arreglo SA.
  solution: Las posiciones 4 y 2, en ese orden, que son los sufijos na$ y nana$ en los rangos 5 y 6.
  label: resolver
- level: 4
  statement: '¿Cuál es el intervalo de rangos de ana en banana$, con extremo derecho exclusivo?'
  hints:
  - En el SA 6,5,3,1,0,4,2, busca el primer sufijo que no empieza por ana después del intervalo.
  solution: '[2,4). Los rangos 2 y 3 son ana$ y anana$; el rango 4 es banana$.'
  label: comparar
- level: 5
  statement: '¿Por qué el orden de la segunda componente se obtiene sin ordenar?'
  hints:
  - Si la lista está ordenada por el rango actual, recorrerla y restar la longitud da índices ya ordenados por su segunda componente.
  solution: Si la lista está ordenada por rango, la segunda componente de i es el rango de i más la longitud. Recorrer la lista y tomar i igual a la posición menos la longitud la deja ordenada por esa segunda componente. Luego basta un counting sort estable por la primera.
  label: justificar
- level: 6
  statement: '¿Por qué una ronda con counting sort cuesta O(n) y no O(n lg n)?'
  hints:
  - Las llaves son enteros en [0,n).
  - Cuenta cuántas veces tiene que recorrer el arreglo.
  solution: El counting sort recorre el arreglo de llaves una vez para contar, otra para acumular y otra para colocar. Como las llaves son enteros menores que n, cada pasada es O(n). Por eso la ronda es O(n) y el total es O(n lg n) con lg n rondas.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
