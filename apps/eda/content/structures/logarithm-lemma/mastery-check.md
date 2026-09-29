---
kind: mastery
title: Prueba de dominio
canExplain:
  - Por qué la prueba del zig-zig se atasca en "2 + r'(z) − r(x) ≤ 2(r'(x) − r(x))" y por qué el álgebra elemental no la cierra.
  - Qué dicen exactamente las dos hipótesis (a, b > 0 y a + b ≤ c) y qué se rompe si se quita cada una.
  - De dónde sale el −2 del enunciado, sin decir "es una constante del lema".
  - Por qué el máximo de lg a + lg b con a + b fijo está en a = b = c/2, y qué tiene que ver eso con que la cota no se pueda mejorar.
  - Por qué en la aplicación los conjuntos s'(z) y s(x) son disjuntos y ambos caben dentro de s'(x).
  - Qué parte del Lema de Acceso es este lema y qué parte no — dónde termina la aritmética y empieza el argumento de potencial.
canDo:
  - Reproducir la demostración por AM-GM de memoria, en sus cinco pasos, sin consultar el enunciado.
  - Verificar el lema con números para cualquier terna concreta y decir cuánta holgura sobra.
  - Instanciar a, b y c sobre un diagrama de zig-zig dado, y comprobar la hipótesis a + b ≤ c sobre ese dibujo.
  - Pasar de "lg a + lg b ≤ 2 lg c − 2" a "2 + r'(z) − r(x) ≤ 2(r'(x) − r(x))" haciendo el álgebra completa, sin saltos.
  - Construir un contraejemplo que muestre que el lema es falso si se elimina la hipótesis a + b ≤ c.
---

Si algo de la lista no sale: lo que casi siempre falta es la
**instanciación**, no la demostración. Vuelve al diagrama del inicio de
[la teoría](/structures/logarithm-lemma) y responde sobre el dibujo, antes de
tocar el álgebra, estas tres preguntas: qué nodos forman $a$, qué nodos forman
$b$, y por qué ninguno aparece en los dos. Si en cambio lo que falla es el
$-2$, rehaz el ejercicio de nivel 4 (cambiar de base): en cuanto la constante
deja de ser $-2$ se ve que es $-\lg 4$ y no un número mágico. Para lo que sigue
después de este lema —la telescópica y el enunciado completo— el tema es
[access-lemma](/structures/access-lemma).
