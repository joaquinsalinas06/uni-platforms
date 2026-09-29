---
kind: mastery
title: Prueba de dominio
canExplain:
  - "Por qué Separar es O(1) ADICIONAL y no O(1) a secas — qué trabajo pagó Buscar antes, y por qué la respuesta a '¿cuántas comparaciones más hacen falta?' es ninguna (#16)."
  - "Qué garantiza Buscar(k) cuando k NO está, por qué el último nodo visitado sólo puede ser el predecesor o el sucesor de k, y por qué esa garantía es exactamente la precondición de Separar (#13-14)."
  - "Por qué Eliminar no necesita el caso especial 'el nodo tiene dos hijos' que sí necesita un BST balanceado — es decir, por qué los dos hijos de la raíz cumplen solos la precondición de Unir (#19)."
  - "Por qué m, tras Splay(m), llega a la raíz de A sin hijo derecho, y por qué toda la corrección de Unir depende de ese hecho (#17)."
  - "El conteo del #20 operación por operación (Buscar 1, Insertar 1, Unir 1, Eliminar 2, Separar 0 propias) y, sobre todo, para qué sirve — que es transferir a las cinco operaciones cualquier cota que se pruebe sobre Splay, con una constante 2."
  - "Por qué el '2' del #20 es una cota superior y no una cuenta fija — en qué casos Eliminar gasta 1 llamada o ninguna."
canDo:
  - "Escribir de memoria el pseudocódigo de las cuatro operaciones (#15, #17, #18, #19), incluidos los casos de árbol vacío que el profesor pone en la primera línea."
  - "Trazar Insertar(k) y Eliminar(k) a mano sobre un árbol de al menos 3 niveles, dando el árbol después de cada paso y el número exacto de llamadas a Splay."
  - "Decir, mirando sólo la raíz r y la llave k, qué rama de Separar corre y cuál de los dos subárboles se desprende — sin volver a mirar el pseudocódigo."
  - "Implementar split, join, insert y delete en C++ sobre la base de splay-tree, acordándome de los punteros al padre que el pseudocódigo no modela."
  - "Instrumentar un contador de llamadas a Splay y verificar con assert que el conteo del #20 se cumple, incluidos los casos donde sale por debajo."
  - "Construir una operación nueva del TDA (por ejemplo EliminarRango) combinando sólo Buscar, Separar y Unir, y contar cuántas llamadas a Splay gasta."
---

Si el conteo del #20 se sabe de memoria pero no se sabe **para qué sirve**,
no está aprendido: volver a la sección de análisis de
[theory](/structures/splay-tree-adt) y quedarse con la frase "todo lo
que probemos sobre el costo de Splay se hereda automáticamente a las cinco".
Si lo que no sale es el nivel 6 de `exercises.md` (por qué `m` llega a la
raíz sin hijo derecho), correr `full-implementation.cpp` imprimiendo el
árbol después de cada rotación dentro del Splay de `join` — ver que `m.der`
nunca se asigna es lo que hace evidente el argumento. Si lo que falla es
distinguir costo real de amortizado, el problema está antes de este tema, en
[splay-tree](/structures/splay-tree); y si lo que falta es la demostración
de la cota que este tema hereda, está en
[access-lemma](/structures/access-lemma).
