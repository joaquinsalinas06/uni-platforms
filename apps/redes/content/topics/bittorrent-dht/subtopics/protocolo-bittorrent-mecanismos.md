---
kind: subtopic
title: "Mecanismos y Políticas del Protocolo BitTorrent"
order: 1
---

## 1. Arquitectura de Distribución Basada en Swarms

A diferencia de los protocolos punto a punto tradicionales de transferencia de archivos (como FTP o HTTP tradicional), BitTorrent descompone la transferencia en una cooperación simultánea entre múltiples nodos organizados en un **enjambre** (*swarm*):
- Todo el proceso gira en torno a un archivo central descriptor con extensión `.torrent`.
- El contenido del archivo original no se transfiere como una secuencia lineal continua de bytes, sino fragmentado en bloques independientes de $256\text{ KiB}$ denominados **chunks**.
- Cada chunk se somete a una función hash unidireccional criptográfica (SHA-1) generando un digest de 20 bytes almacenado de manera inmutable en el archivo `.torrent`.
- Los clientes pueden solicitar fragmentos en cualquier orden y a múltiples pares concurrentemente a través de conexiones TCP paralelas. Al finalizar la recepción de los 256 KiB de un chunk, la aplicación recalcula el hash SHA-1 localmente; si coincide exactamente con el valor declarado en el torrent, el bloque se marca como válido y el cliente notifica de inmediato a todos sus vecinos conectados mediante un mensaje de protocolo `HAVE`.

## 2. Política de Selección de Bloques: Rarest-First

Para maximizar la supervivencia de los fragmentos en la red y optimizar el rendimiento del intercambio, BitTorrent implementa el algoritmo **Rarest-First** (*el más raro primero*):
- Cada par mantiene una tabla con el recuento de copias disponibles de cada fragmento entre todos los pares con los que mantiene una conexión activa.
- Al seleccionar el siguiente chunk para descargar, el cliente elige aquel que tiene el menor número de réplicas en su vecindad (*frecuencia mínima*).
- **Ventajas directas**:
  1. *Diversificación acelerada*: Incrementa rápidamente el número de fragmentos diferentes en posesión de los nodos, asegurando que prácticamente cualquier par tenga bloques que resulten atractivos e intercambiables para sus pares adyacentes.
  2. *Resiliencia ante la desconexión del Seeder*: Si el único nodo que posee el archivo completo decide desconectarse, las piezas más escasas ya habrán sido distribuidas a varios leechers, garantizando que el archivo siga estando completamente reconstruible dentro del enjambre.

## 3. Política de Incentivos: Choking y Tit-for-Tat

BitTorrent soluciona el dilema del prisionero y la proliferación de nodos parásitos (*free-riders*) aplicando la heurística **Tit-for-Tat (TFT)** para regular el ancho de banda ascendente:

### El Estado de Choking (Estrangulamiento / Bloqueo)
- Cada par limita el número de vecinos a los cuales envía datos simultáneamente. Enviar a demasiados pares a la vez fragmentaría el ancho de banda TCP en flujos demasiado lentos, reduciendo la eficiencia de las ventanas de congestión.
- Por defecto, un nodo mantiene a la mayoría de sus vecinos en estado de **Choke** (bloqueados para subida).

### Desbloqueo Basado en Rendimiento (Cada 10 segundos)
- En intervalos periódicos de 10 segundos, el cliente calcula la velocidad media de descarga que ha recibido de cada par en la ventana de tiempo reciente.
- Desbloquea (*Unchoke*) a los **cuatro pares** que le han suministrado datos a la mayor tasa.
- Como contraprestación recíproca, estos pares receptores también le darán prioridad en sus respectivas listas de desbloqueo, estableciéndose una relación simbiótica de alto rendimiento.

### Desbloqueo Optimista (Optimistic Unchoking, Cada 30 segundos)
- Si solo se desbloqueara a los 4 pares más rápidos, ningún nodo nuevo sin datos podría ingresar al circuito de intercambio, y no se podrían descubrir conexiones potencialmente superiores.
- Para remediar esto, cada 30 segundos el par elige al azar a **un par bloqueado adicional** y comienza a transferirle fragmentos.
- Esto permite al nodo recién llegado recibir su primer fragmento completo y comenzar a compartirlo, permitiéndole competir en méritos propios bajo la regla Tit-for-Tat.
