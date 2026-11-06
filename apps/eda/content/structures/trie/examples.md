---
kind: examples
title: Casos resueltos
---

Usamos el conjunto de clase {he,she,his,hers}. Cada letra añadida al camino representa una transición.

## Un prefijo compartido crea menos nodos
Inserta he y luego hers. La raíz, h y he ya existen, así que la segunda inserción añade sólo her y hers. He conserva la marca terminal aunque se vuelva interno. Si se borrara su marca al añadir un hijo, dejaría de reconocerse una palabra válida.

## Tres formas de terminar una búsqueda
Busca he: se consumen todas las letras y el nodo es terminal. Busca her: se consumen todas, pero el nodo sólo representa un prefijo, así que la consulta exacta falla. Busca hera: al intentar la a falta una arista y se termina antes de consumirla. Las tres consultas recorren parte del mismo camino, y el resultado depende tanto del camino como de la marca final.

## Una bifurcación comparte sólo lo que coincide
Al insertar his tras he, se comparte h. A partir de allí, la i sale por una rama distinta de la e. Se crean hi e his. Al insertar she, se crea una rama desde la raíz porque el primer carácter es distinto. Que he aparezca como sufijo de she no implica que ambos nodos se fusionen: la estructura comparte prefijos.

## Insertar una palabra que ya era prefijo

Tras insertar hers, busca her. El camino ya existe, pero her no pertenece al conjunto si no fue marcada. Ahora inserta her explícitamente. Recorre las tres letras sin crear ningún nodo y marca el nodo final. Desde entonces, tanto her como hers son palabras válidas. La rama de hers no requiere ninguna modificación.

Este caso separa el costo de recorrer del costo de asignar nodos. La operación sigue leyendo tres letras, aunque sólo cambie una marca. Inversamente, insertar una palabra que diverge desde la primera letra puede crear una cadena completa de nodos nuevos.

## Construir caminos y probar las tres formas de búsqueda

Usa el conjunto de clase {he,she,his,hers}.

1. Empieza en la raíz, que representa el prefijo vacío.
2. Inserta h para comenzar he. El nodo h aún no representa una palabra completa.
3. Añade e y marca he como terminal.
4. Inserta she. La s sale por una rama distinta de h. Sigue con sh y marca she.
5. Inserta his. Se reutiliza la primera arista hacia h.
6. Bajo h, añade la rama i y luego s. Marca his como terminal.
7. Inserta hers. Recorre h y he sin asignar nodos nuevos.
8. Crea her y hers. Marca hers y conserva la marca de he.
9. Busca her. Las tres aristas existen, pero el estado final no está marcado.
10. Busca hera. El camino falla en la cuarta letra porque her sólo tiene la arista s.
11. Busca he. El camino termina en un nodo interno marcado y la consulta sí acierta.

**Comprobación.** Hay que comprobar el camino y la marca final. Contar las letras recorridas explica el costo aunque una inserción sólo cambie la marca.
