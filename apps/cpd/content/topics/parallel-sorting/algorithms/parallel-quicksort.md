---
kind: algorithm
title: "Quicksort en paralelo"
order: 2
cppSteps: []
visualization:
  type: dag
  steps:
    - note: "Quicksort con p = 8 procesos y un elemento por proceso. Un pivote elegido al azar parte los 8 procesos en una partición izquierda (elementos menores o iguales) y una derecha."
      nodes:
        - { id: q8, value: "QS 8", parent: null, state: active }
    - note: "Cada partición se ordena recursivamente y en paralelo con el mismo algoritmo, con la mitad de procesos."
      nodes:
        - { id: q8, value: "QS 8", parent: null }
        - { id: q4a, value: "QS 4", parent: q8, state: active }
        - { id: q4b, value: "QS 4", parent: q8, state: active }
    - note: "Tras log p niveles cada partición tiene un solo proceso. El costo de cada nivel es un broadcast del pivote y una suma de prefijos, ambos de costo log p. Por eso T(p) = T(p/2) + log p."
      nodes:
        - { id: q8, value: "QS 8", parent: null }
        - { id: q4a, value: "QS 4", parent: q8 }
        - { id: q4b, value: "QS 4", parent: q8 }
        - { id: q2a, value: "QS 2", parent: q4a, state: answer }
        - { id: q2b, value: "QS 2", parent: q4a, state: answer }
        - { id: q2c, value: "QS 2", parent: q4b, state: answer }
        - { id: q2d, value: "QS 2", parent: q4b, state: answer }
---

## Qué hace

Ordena con el principio de **divide y vencerás**: elige un pivote, separa los elementos menores y mayores y llama a la función de forma recursiva sobre cada parte. Secuencial, cuesta $O(n\log n)$ en promedio y $O(n^2)$ en el peor caso. La clase presenta el algoritmo de **Peter Sanders** como el mejor quicksort paralelo de propósito general.

## Intuición

Los procesos se agrupan en particiones. En cada partición se elige un pivote, se avisa a todos (broadcast), cada proceso sabe si su valor va a la izquierda o a la derecha, y una **suma de prefijos** sobre esa marca dice a qué posición mover cada valor. Luego cada mitad de procesos repite lo mismo por su cuenta.

## Algoritmo

**Secuencial** (diapositiva 17):

```
QS(d, p):  si p == 1 retornar
           k = selecciona_pivot(d, v)
           // reordena: d_0 < ... < d_k = v < d_{k+1} < ... < d_{p-1}
           QS([d_0..d_{k-1}], k);  QS([d_{k+1}..d_{p-1}], p-k-1)
```

**Paralelo con $n = p$** (un elemento por proceso, `QS(d, i, p)`):

1. Si $p = 1$, retornar.
2. Elegir al azar un proceso $j \in [0, p-1]$; su valor $v = d_j$ es el pivote.
3. *Broadcast* de $v$ a todos los procesos.
4. Cada proceso calcula `flag = (d <= v)`.
5. *Suma de prefijos* de las marcas: $j = \sum_{k=0}^{i} \text{flag}_k$; el último valor da $p'$, el número de elementos que van a la izquierda.
6. *Broadcast* de $p'$.
7. Si `flag`, enviar $d$ a la posición $j-1$; si no, a $p' + i - j$. Recibir el valor que llega.
8. Si $i < p'$ el proceso pertenece a la partición izquierda: `QS(d, i, p')`; si no, a la derecha: `QS(d, i-p', p-p')`.

**Paralelo con $n > p$:** cada proceso recibe $n/p$ elementos y los ordena en $O\!\left(\frac{n}{p}\log\frac{n}{p}\right)$; los datos viajan entre procesos en $O\!\left(\log p\,(\alpha + \frac{n}{p}\beta)\right)$ y, por el span $O(\log^2 p)$ de la versión PRAM, se suma $\alpha\log^2 p$.

## Pseudocódigo

```
QS(d, i, p):
    si p == 1: retornar
    j  <- aleatorio en [0, p-1];   v <- d_j
    broadcast(v)
    flag <- (d <= v)
    j  <- suma_prefijos(flag)       // j = sum_{k<=i} flag_k
    p' <- ultimo valor de j;        broadcast(p')
    si flag: enviar d a j-1   si no: enviar d a p' + i - j
    recibir d
    si i < p':  QS(d, i, p')   si no:  QS(d, i - p', p - p')
```

## Complejidad

Cada nivel hace un broadcast y una suma de prefijos, ambos $O(\log p)$, y el tamaño se parte en dos (en promedio):

$$T(p) = T(p/2) + \log p \;\Rightarrow\; T_p(n,p) \in O(\log^2 p).$$

Con $n > p$ (diapositiva 21):

$$T_p(n,p) = O\!\left(\frac{n\log n}{p} + \log p\left(\alpha + \beta\,\frac{n}{p}\right) + \alpha\log^2 p\right).$$

## Ejemplo

Con $p = 8$ el árbol de recursión tiene $\log_2 8 = 3$ niveles de partición; el costo total es $\log 8 + \log 4 + \log 2 = 3 + 2 + 1 = 6 = O(\log^2 p)$ en pasos de broadcast/prefijos.

## Casos especiales

- $p = 1$: caso base de la recursión.
- Un pivote desafortunado deja una partición vacía y otra de $p-1$: el peor caso ($O(n^2)$ en secuencial); por eso el pivote se elige **al azar**.

> **Nota de apoyo** (no está en el material): la expresión de la diapositiva 19 para $p'$ aparece cortada en el PDF (se lee `p' := j p-1`); aquí se interpreta, por el texto de la diapositiva 20, como "el valor de la suma de prefijos en el último proceso", es decir, el número de elementos menores o iguales que el pivote.
