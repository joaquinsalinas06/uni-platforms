---
kind: examples
title: Casos resueltos
---

El ejemplo de clase usa patrones he, she, his y hers. Separa estado alcanzado, enlaces de fallo y terminales reportados.

## Una misma letra completa dos patrones
Lee ushers. La u deja el estado vacío. Las letras s y h llevan a sh. La e completa she. Ese nodo es terminal y su fallo lleva a he, también terminal. Reporta ambos en la misma posición final 3. Los inicios son 1 y 2 respectivamente. Un recorrido que sólo reporte el nodo actual detecta she y pierde he.

## La r necesita reutilizar un sufijo
Tras she llega r. No hay arista directa. El fallo de she conserva he y desde allí r forma her. Todavía no se reporta nada porque her no es terminal. La s siguiente completa hers. El texto avanzó una posición al consumir r, aunque internamente se necesitara cambiar de estado antes de tomar la transición.

## Contar sin listar cada aparición
En la traza anterior, una visita a she contribuye una a she y, al propagar por fallo, una a he. El paso por her aporta al estado cuyo conteo corresponda a su propio fallo, y la visita final a hers aporta una a hers. Si sólo necesitas totales por patrón, acumula visitas a los estados alcanzados y propágalas desde los más profundos. Para este texto los conteos son he=1, she=1, his=0 y hers=1.

## La salida correcta puede pasar por un estado que no es terminal

Considera un ejemplo derivado con patrones a, ba y xbaq. Lee xba. El estado final corresponde al prefijo xba de xbaq, que todavía no es palabra completa. Su fallo lleva a ba, que sí es terminal, y el fallo de ba lleva a a, también terminal. Ambas coincidencias deben reportarse. No hay ninguna aparición de xbaq porque falta q.

Este caso muestra que comprobar sólo si el estado actual es terminal descarta coincidencias válidas. En una implementación del autómata, los enlaces de salida saltan directamente a terminales. En una traza manual, sigue los fallos y marca qué estados corresponden a patrones completos.

## Construir tres fallos y usarlos sin rebobinar el texto

Patrones de clase he, she, his y hers. Texto ushers, índices desde cero.

1. Los estados h y s son hijos de la raíz. Sus fallos apuntan al prefijo vacío.
2. Para sh, el sufijo h existe en el trie. Registra fallo(sh)=h.
3. Para she, extiende el fallo de sh con e. Desde h existe la transición a he.
4. Marca he como salida de she porque también termina un patrón.
5. Lee u desde la raíz. No inicia ningún patrón y permanece en el estado vacío.
6. Lee s y pasa a s. Lee h y pasa a sh. Aún no termina un patrón.
7. Lee e y pasa a she. Reporta she en [1,3].
8. Usa la salida he y repórtala en [2,3]. Ambas coincidencias terminan en la misma letra.
9. Lee r. She no tiene arista r. Sigue el fallo hacia he antes de consumir r.
10. Consume r desde he y llega a her. Es un estado válido y todavía no es un patrón completo.
11. Consume s y llega a hers. Reporta la tercera coincidencia en [2,5].

**Comprobación.** Se leyeron seis caracteres y se emitieron tres coincidencias. Seguir un fallo durante una transición no retrocede a una posición anterior del texto.
