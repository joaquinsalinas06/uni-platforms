---
kind: exercises
title: Preguntas de examen
items:
- level: 1
  statement: ¿Qué representa k durante la búsqueda?
  hints:
  - Mira simultáneamente prefijo del patrón y sufijo leído.
  solution: La longitud del prefijo de P que coincide con el sufijo actual del texto.
  label: reconocer
- level: 2
  statement: Traza la letra c de ababaca al construir π.
  hints:
  - Empieza en k=3.
  - Los candidatos se obtienen con π[k−1].
  solution: 3→1→0 y π[5]=0.
  label: trazar
- level: 3
  statement: Traza π para aaaa.
  hints:
  - En cada posición puedes extender un borde anterior.
  solution: '[0,1,2,3].'
  label: resolver
- level: 4
  statement: Después de reportar aba, ¿cómo se prepara una coincidencia solapada?
  hints:
  - El sufijo a también es prefijo.
  solution: Se conserva k=1, que permite reconocer la aparición que comparte esa a.
  label: comparar
- level: 5
  statement: ¿Qué avance se conserva cuando falla una comparación?
  hints:
  - Separa posición de texto de longitud reconocida.
  solution: El texto no retrocede. Baja k al borde candidato y se vuelve a probar el mismo carácter.
  label: justificar
- level: 6
  statement: ¿Cómo puede un carácter causar varios retrocesos y la búsqueda seguir siendo lineal?
  hints:
  - Suma cuánto puede subir k durante todo el recorrido.
  solution: Cada retroceso baja k y se paga con un incremento anterior. El total de incrementos es
    lineal.
  label: demostrar
---

Antes de abrir una pista, dibuja el estado inicial y escribe qué unidad de trabajo vas a contar.
