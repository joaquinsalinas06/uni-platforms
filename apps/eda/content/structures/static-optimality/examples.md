---
kind: examples
title: Ejemplos
---

<!--
El mazo no instancia la cota de entropía con números: #36 la enuncia en
símbolos (O(Σ_x p_x lg(1/p_x))) y no llega a evaluar ninguna distribución
concreta. Los tres casos de abajo están *derivados* — se obtienen evaluando
esa misma fórmula sobre distribuciones elegidas a mano, y comparándola contra
la cota uniforme 3·lg n + 1 que sale de #35. Ninguna de las tres aparece en
las diapositivas.
-->

Los tres casos usan las mismas 8 llaves $\{1, \dots, 8\}$ y sólo cambian la
distribución de accesos $p$. Para poder comparar manzanas con manzanas, cada
uno reporta dos números: la entropía
$H = \sum_x p_x \lg(1/p_x)$ y la cota amortizada por acceso
$3H + 1$ que sale del [Lema de Acceso](/structures/access-lemma) con
$w_x \propto p_x$ (el álgebra está en la nota de apoyo de
[theory.mdx](/structures/static-optimality), sección "Análisis de
complejidad"). La referencia contra la que se comparan es siempre la misma:
con pesos uniformes, $3\lg 8 + 1 = 10$.

## Mínimo

*(derivado; no aparece en las diapositivas)*

**Distribución uniforme**: $p_x = 1/8$ para las ocho llaves. Es el caso más
pequeño que ya es interesante, porque es donde la cota de entropía **no gana
nada** — y entender por qué es entender qué está midiendo.

$$H = \sum_{x=1}^{8} \frac{1}{8} \lg 8 = \lg 8 = 3 \text{ bits}$$

Cota amortizada por acceso: $3 \cdot 3 + 1 = 10$, exactamente la misma que da
la elección de pesos uniformes ($3 \lg 8 + 1 = 10$). Las dos consecuencias
del Lema de Acceso coinciden numéricamente.

No es casualidad ni coincidencia de esta instancia: la distribución uniforme
es la de **máxima entropía** sobre $n$ valores, y su entropía vale
exactamente $\lg n$. Por eso la cota de entropía nunca puede ser peor que la
uniforme — el peor caso de la primera *es* la segunda. Cuando no hay ningún
sesgo que explotar, no hay nada que ganar: ninguna llave merece estar más
arriba que otra.

## Normal

*(derivado; no aparece en las diapositivas)*

**Distribución muy sesgada**: la llave 5 se busca el 80% de las veces, y el
20% restante se reparte por igual entre las otras siete
($p_x = 0.2/7 \approx 0.0286$ cada una).

$$H = 0.8 \lg \tfrac{1}{0.8} + 7 \cdot 0.0286 \lg \tfrac{1}{0.0286} \approx 0.258 + 1.026 = 1.283 \text{ bits}$$

Cota amortizada por acceso: $3 \cdot 1.283 + 1 \approx 4.85$, contra los $10$
de la cota uniforme. **Poco más de la mitad**, sobre exactamente el mismo
código y el mismo árbol: lo único distinto es qué pesos eligió el analista.

El desglose muestra de dónde sale la ganancia. El acceso a la llave caliente
cuesta a lo más $3 \lg(1/0.8) + 1 \approx 1.97$ amortizado —prácticamente una
constante— y se paga en el 80% de las búsquedas. Cada acceso a una llave fría
cuesta a lo más $3 \lg(1/0.0286) + 1 \approx 16.4$, bastante más que los 10 de
la cota uniforme, pero se paga en menos del 3% de las búsquedas. El promedio
ponderado es lo que baja.

Ese es todo el mecanismo de la optimalidad estática: no hacer todas las
búsquedas baratas, sino hacer baratas **las que se repiten**. Y el
[splay tree](/structures/splay-tree) lo consigue sin registrar en ningún lado
que 5 es la llave caliente.

> **Nota de apoyo** (no está en las diapositivas): el diagrama de la sección
> "Análisis de complejidad" de [theory.mdx](/structures/static-optimality) usa
> una tercera distribución, sobre 7 llaves y con potencias de 2
> ($p_5 = 1/2$, $p_3 = 1/4$, $p_6 = 1/8$, el resto $1/32$), cuya entropía da
> exactamente $2.000$ bits contra $\lg 7 \approx 2.807$. Se eligieron
> potencias de 2 allí para que todos los rangos $r(x) = \lg s(x)$ salieran
> enteros y la sustitución en el lema se pudiera seguir a mano; aquí se usa
> el 80% porque hace más visible el contraste.

## Límite

*(derivado; no aparece en las diapositivas)*

**Una sola llave**: $p_5 = 1$ y $p_x = 0$ para las otras siete. Es el sesgo
llevado al extremo.

$$H = 1 \cdot \lg 1 = 0 \text{ bits}$$

Cota amortizada por acceso: $3 \cdot 0 + 1 = 1$, es decir $O(1)$. La secuencia
es "buscar 5, buscar 5, buscar 5, ..." y el splay tree la atiende en tiempo
constante amortizado: el primer acceso sube 5 a la raíz vía
[`Splay`](/structures/splay-tree/operations/splay) y los siguientes la
encuentran ahí mismo.

Este caso es el **límite inferior** de la cota de entropía, no su peor caso.
Conviene dejarlo claro porque invierte la costumbre: en casi todos los temas
del curso, el caso límite es el que produce la peor cota de la tabla. Aquí es
al revés — la cota de entropía va de $0$ (todo el peso en una llave) a
$\lg n$ (distribución uniforme, el caso Mínimo de arriba). El caso patológico
de esta cota es el uniforme, y "patológico" significa apenas que no se gana
nada respecto de $O(\lg n)$, que ya era la garantía del splay tree.

Dos advertencias sobre este extremo:

> **Nota de apoyo** (no está en las diapositivas): el mazo pide que $w_x$ sea
> un **peso positivo** (#22), así que $p_x = 0$ no es literalmente una
> elección válida de pesos — estrictamente habría que usar $p_x = \varepsilon$
> para las llaves frías y hacer $\varepsilon \to 0$. Y en la fórmula de la
> entropía, el término $0 \cdot \lg(1/0)$ se toma como $0$ por la convención
> estándar de la entropía de Shannon (el límite de $p \lg(1/p)$ cuando
> $p \to 0^+$ es $0$). El profesor no discute ninguno de los dos puntos.

La otra advertencia es conceptual: que esta secuencia salga $O(1)$ **no** es
un resultado sobre optimalidad dinámica. Una secuencia con la misma
distribución de frecuencias pero orden distinto —por ejemplo bloques
alternados de llaves distintas— tiene la misma entropía y por lo tanto la
misma cota. La cota de entropía no ve el orden; ver el orden es lo que pide
[optimalidad dinámica](/structures/dynamic-optimality), que sigue abierta.
