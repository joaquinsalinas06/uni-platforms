---
kind: exercises
title: Ejercicios
items:
  - level: 1
    statement: >-
      Enuncia la definición de conjunto arboralmente satisfecho (#21) y di si estas dos afirmaciones son verdaderas o
      falsas, con una frase cada una: (a) "el par de puntos $(2,1)$ y $(2,5)$ exige un tercer punto"; (b) "un conjunto
      con un solo punto es arboralmente satisfecho".
    hints:
      - "La definición sólo se aplica a pares que NO comparten línea horizontal ni vertical."
      - "Si no hay ningún par, no hay nada que verificar."
    solution: >-
      Un conjunto es arboralmente satisfecho si para todo par de puntos que no comparten fila ni columna existe un
      tercer punto dentro del rectángulo que definen o en su borde. (a) Falsa: (2,1) y (2,5) comparten la columna 2,
      así que no definen un rectángulo no degenerado y no exigen nada. (b) Verdadera, vacuamente: no hay pares.
  - level: 2
    statement: >-
      Dado $P = \{(1,1), (3,2), (2,3)\}$, lista los pares que no comparten línea, el rectángulo de cada uno y di si
      $P$ es arboralmente satisfecho. Si no lo es, ¿qué par lo viola?
    hints:
      - "Hay tres pares y ninguno comparte fila ni columna."
      - "Para el par (1,1)-(3,2), el rectángulo es [1,3] x [1,2]: ¿cae (2,3) dentro?"
    solution: >-
      Pares: (1,1)-(3,2) con [1,3]x[1,2]: el único otro punto, (2,3), tiene tiempo 3 > 2, no cae dentro; el par VIOLA la
      condición. (1,1)-(2,3) con [1,2]x[1,3]: (3,2) tiene llave 3 > 2, no cae; también viola. (3,2)-(2,3) con [2,3]x[2,3]: (1,1)
      no cae; viola. P no es arboralmente satisfecho, y violan los tres pares.
  - level: 3
    statement: >-
      Usa el comprobador de la teoría para escribir un programa que, dado un conjunto $P$, imprima **todos** los pares
      que violan la condición. Pruébalo con $P = \{(1,1), (4,2)\}$.
    hints:
      - "Cambia el return false por guardar el par en un vector y sigue."
      - "Para no repetir pares, ordena cada uno con a.first < b.first."
    solution: |-
      ```cpp
      vector<pair<pair<int,int>,pair<int,int>>> violaciones(const vector<pair<int,int>>& P) {
        vector<pair<pair<int,int>,pair<int,int>>> out;
        for (auto a : P) for (auto b : P) {
          if (a.first >= b.first || a.second == b.second) continue;
          int t1 = min(a.second, b.second), t2 = max(a.second, b.second);
          bool tercero = false;
          for (auto c : P)
            if (c != a && c != b && a.first <= c.first && c.first <= b.first && t1 <= c.second && c.second <= t2) tercero = true;
          if (!tercero) out.push_back({a, b});
        }
        return out;
      }
      // Para {(1,1),(4,2)} devuelve exactamente un par: ((1,1),(4,2)).
      ```
  - level: 4
    statement: >-
      Para $P = \{(1,1), (4,2)\}$ encuentra **todos** los puntos $(x, t)$ con $1 \le x \le 4$ y $1 \le t \le 2$ que, agregados
      individualmente, vuelven a $P$ arboralmente satisfecho. ¿Alcanza con que el punto caiga dentro del rectángulo?
    hints:
      - "Agregar un punto crea pares nuevos con (1,1) y con (4,2): cada uno puede violar la condición."
      - "Los puntos que comparten línea con un extremo no crean ese par."
      - "Prueba los 8 puntos de la rejilla (4 llaves x 2 tiempos) menos los dos que ya están."
    solution: >-
      Sólo funcionan (1, 2) y (4, 1). Los otros seis puntos de la rejilla crean un par violado: p. ej. (2,2) crea
      (1,1)-(2,2) con [1,2]x[1,2] sin tercero; (3,1) crea (3,1)-(4,2) sin tercero. Caer dentro del rectángulo es NECESARIO
      (si no, el par original sigue sin tercero) pero NO suficiente: hace falta que el punto comparta fila o columna con
      ambos extremos, es decir, que sea una de las dos esquinas "virtuales" del rectángulo.
  - level: 5
    statement: >-
      Dada una secuencia de accesos a las llaves $1, 2, 3$ en ese orden (tiempos 1, 2, 3), diseña un conjunto arboralmente
      satisfecho que la contenga y tenga el menor número de puntos que puedas. Justifica por qué corresponde a un BST
      válido y por qué es mínimo.
    hints:
      - "Los tres accesos son (1,1), (2,2), (3,3): una diagonal. Cada par de la diagonal necesita un tercero."
      - "Piensa en agregar puntos sobre la columna de la llave que el algoritmo 'acaba de tocar' (los esquinas virtuales)."
    solution: >-
      Una opción con 5 puntos: (1,1), (1,2), (2,2), (2,3), (3,3). Los pares sin línea común son (1,1)-(2,2) [tercero (1,2)],
      (1,2)-(2,3) [tercero (2,2)], (2,2)-(3,3) [tercero (2,3)], (1,1)-(2,3) [terceros (1,2),(2,2)], (1,1)-(3,3), (1,2)-(3,3)
      [terceros (2,2),(2,3)]. Es arboralmente satisfecho, así que por el teorema #23 es una ejecución de BST válida: el algoritmo
      toca la llave anterior de paso (como al ascender con una rotación). Es mínimo porque sin los dos puntos extra el par
      (1,1)-(2,2) ya queda sin tercero, y con uno solo siempre queda otro par sin tercero.
  - level: 6
    statement: >-
      Demuestra la dirección "arboralmente satisfecho ⇒ BST válido" para el caso más chico: dos accesos $(a, 1)$ y $(b, 2)$ con $a \ne b$.
      Es decir, muestra que si el conjunto mínimo es satisfecho, existe un BST sobre $\{a, b\}$ cuya ejecución lo contiene, y que si no lo es,
      no existe.
    hints:
      - "Un BST sobre dos llaves tiene una de dos formas: a raíz o b raíz."
      - "El acceso 1 siempre toca la raíz. ¿Qué tiene que tocar el acceso 2?"
    solution: >-
      Dos llaves: o la raíz es a (con b como hijo) o la raíz es b (con a como hijo). Caso raíz a: el acceso 1 toca {a}; el acceso 2 (a b) toca {a, b}.
      Puntos: (a,1), (a,2), (b,2). El par (a,1)-(b,2) tiene en el borde del rectángulo a (a,2): satisfecho. Caso raíz b: acceso 1 toca {b, a};
      acceso 2 toca {b}: puntos (a,1), (b,1), (b,2); el par (a,1)-(b,2) tiene (b,1) en el borde: satisfecho. El conjunto mínimo {(a,1), (b,2)} NO
      es satisfecho (rectángulo vacío), y efectivamente ningún BST lo ejecuta con sólo esos dos puntos: toda ejecución toca al menos otro nodo. Se
      cumple el teorema: los conjuntos que sí vienen de un BST son exactamente los que agregan una esquina del rectángulo.
---

Los ejercicios 2–6 son todos sobre conjuntos pequeños que se pueden verificar a mano o con el comprobador de [theory.mdx](/structures/arborally-satisfied-set).
