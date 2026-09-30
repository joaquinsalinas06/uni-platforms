---
kind: subtopic
title: "La Pseudocabecera IP y la Independencia de Endianness (RFC 1071)"
order: 2
---

## 1. Justificación de la Pseudocabecera: Protección Cruzada de Capas

En una arquitectura de capas estricta, cada protocolo debería computar la integridad exclusivamente sobre su propio encabezado y los datos que encapsula. Sin embargo, en el diseño de TCP/IP se identificó una vulnerabilidad crítica: **el enrutamiento erróneo no detectable por la capa de transporte**.

Si un enrutador defectuoso invierte un bit en la dirección IP de destino del encabezado IP, o si una tabla de enrutamiento corrupta entrega el paquete a un host para el cual no estaba destinado:
- El paquete arriba a la máquina equivocada.
- La interfaz física procesa el paquete y extrae el segmento de transporte.
- Si el checksum de transporte se calculara únicamente sobre los datos UDP/TCP, la suma sería matemáticamente válida.
- Si por casualidad existe en ese host un proceso escuchando en el mismo puerto de destino, el proceso aceptaría los datos de una comunicación a la que no pertenece.

Para evitar esta falla de aislamiento, la capa de transporte exige incorporar una **pseudocabecera conceptual** derivada del paquete IP subyacente antes de computar el checksum.

---

## 2. Composición de la Pseudocabecera IPv4 e IPv6

### Pseudocabecera IPv4 (12 bytes / 96 bits)
La pseudocabecera estándar para IPv4 se compone de cinco campos:
1. **Source IP Address (32 bits)**: Dirección IP de origen extraída de la cabecera IP.
2. **Destination IP Address (32 bits)**: Dirección IP de destino final.
3. **Cero de relleno (8 bits)**: Octeto reservado fijado en `0x00`.
4. **Protocol (8 bits)**: Identificador de protocolo de transporte; para UDP es $17$ (`0x11`), y para TCP es $6$ (`0x06`).
5. **UDP Length (16 bits)**: Longitud total del segmento UDP (cabecera + payload) en bytes.

### Pseudocabecera IPv6 (40 bytes / 320 bits)
En IPv6, dado que el propio encabezado IPv6 no cuenta con un campo de checksum propio (para acelerar la conmutación en los enrutadores), la obligatoriedad del checksum de UDP se vuelve absoluta:
1. **Source Address (128 bits)**: Dirección IPv6 del emisor.
2. **Destination Address (128 bits)**: Dirección IPv6 del receptor final.
3. **Upper-Layer Packet Length (32 bits)**: Longitud en bytes del segmento de transporte.
4. **Next Header (8 bits)**: Protocolo de nivel superior ($17$ para UDP).

---

## 3. Independencia de Orden de Bytes (Endianness)

Una de las propiedades más elegantes y profundas de la suma en complemento a uno, demostrada analíticamente en la **RFC 1071**, es su **invarianza respecto al orden de bytes** (*Endianness independence*).

### El Teorema de Independencia
En una arquitectura Big-Endian (orden de bytes de red estándar), una palabra de 16 bits compuesta por los bytes contiguos $[B_0, B_1]$ se interpreta como:
$$W_{\text{BE}} = 2^8 \cdot B_0 + B_1$$

En una arquitectura Little-Endian (como los procesadores x86-64), esos mismos bytes en memoria se interpretan como:
$$W_{\text{LE}} = 2^8 \cdot B_1 + B_0$$

Si se suman $M$ palabras en complemento a uno en una máquina Little-Endian:
$$\sum_{i=1}^{M} W_{\text{LE}, i} = \sum_{i=1}^{M} (2^8 \cdot B_{2i-1} + B_{2i-2}) = 2^8 \sum_{i=1}^{M} B_{2i-1} + \sum_{i=1}^{M} B_{2i-2}$$

Mientras que en una máquina Big-Endian:
$$\sum_{i=1}^{M} W_{\text{BE}, i} = 2^8 \sum_{i=1}^{M} B_{2i-2} + \sum_{i=1}^{M} B_{2i-1}$$

Obsérvese que la suma calculada en la máquina Little-Endian es exactamente **la versión con bytes intercambiados** (*byte-swapped*) de la suma calculada en la máquina Big-Endian.

### Consecuencia Práctica
Un emisor en arquitectura Little-Endian no necesita ejecutar costosas instrucciones de conversión de orden de bytes (`htons`) sobre cada palabra de 16 bits del payload para calcular el checksum: puede sumar directamente las palabras tal como residen en su memoria nativa, invertir el resultado y transmitirlo. Cuando la máquina receptora (sea Big-Endian o Little-Endian) sume el segmento con el checksum transmitido, los dos bytes del resultado final convergerán invariablemente a `0xFFFF`.
