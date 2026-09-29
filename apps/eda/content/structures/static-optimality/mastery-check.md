---
kind: mastery
title: Prueba de dominio
canExplain:
  - "La distinción entre optimalidad estática y optimalidad dinámica: contra qué se compara cada una (el mejor árbol fijo para p, contra OPT(S), el mejor algoritmo offline que sí rota), y por qué la primera es un teorema probado en esta sesión mientras la segunda sigue siendo una conjetura abierta."
  - "Por qué un solo lema —el Lema de Acceso— prueba las dos consecuencias, y qué es exactamente lo único que cambia entre una prueba y la otra."
  - "Por qué con w_x = 1 el tamaño s(x) degenera en el número de nodos del subárbol de x, y de ahí sale r(raíz) = lg n y la cota O(lg n) para cualquier x."
  - "Por qué la cota de entropía nunca es peor que lg n, y en qué caso exacto las dos coinciden (la distribución uniforme, la de máxima entropía)."
  - "Por qué el splay tree alcanza la cota de entropía sin conocer la distribución de accesos: dónde viven los pesos (en el análisis) y dónde no (en el código)."
  - "Qué información de la secuencia NO mira la cota de entropía — el orden — y por qué esa ceguera es justo la que deja intacta la pregunta de optimalidad dinámica."
canDo:
  - "Calcular la entropía Σ_x p_x lg(1/p_x) de una distribución dada y compararla con lg n, sin calculadora cuando las probabilidades son potencias de 2."
  - "Calcular s(x) y r(x) a mano sobre un árbol concreto, para pesos uniformes y para pesos por frecuencia, y sustituir en el Lema de Acceso para obtener la cota de un acceso."
  - "Explicar, dada una llave frecuente que está al fondo del árbol, por qué su cota amortizada es barata pese a su profundidad."
  - "Exhibir dos secuencias con la misma distribución de frecuencias pero costo real muy distinto, y usarlas para delimitar qué promete y qué no promete la cota de entropía."
  - "Citar sin reexplicarlo el enunciado del Lema de Acceso, y ubicar de dónde sale cada símbolo (w_x, s(x), r(x), r(t))."
---

Si algo de la lista no sale, el orden de repaso es éste. Si falla la cuenta
(s, r, la sustitución), volver al diagrama de cabecera de
[theory.mdx](/structures/static-optimality), que recorre la sustitución con
pesos uniformes paso a paso, y después al diagrama de la sección "Análisis de
complejidad", que la repite con pesos por frecuencia sobre el mismo árbol. Si
falla el enunciado del lema mismo, el problema no está aquí sino en
[access-lemma](/structures/access-lemma) — este tema lo usa como caja negra.
Y si lo que se confunde es estática con dinámica, ir directo a la tabla de
"Comparación con estructuras relacionadas": la clave es qué libertad tiene la
referencia contra la que se compara, porque un árbol fijo no puede explotar
el orden de la secuencia y [OPT(S)](/structures/dynamic-optimality) sí.
