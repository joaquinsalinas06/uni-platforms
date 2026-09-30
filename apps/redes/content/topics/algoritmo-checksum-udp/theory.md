---
kind: theory
title: "Checksum de Internet (RFC 1071) y Pseudocabecera"
---

## 1. El Algoritmo de Verificación de Integridad de Internet

El **Checksum de Internet**, formalizado en la **RFC 1071**, es el mecanismo estándar de detección de errores empleado por los protocolos fundamentales de la pila TCP/IP, incluyendo IPv4, ICMP, UDP y TCP. Su propósito fundamental radica en identificar si los bits que conforman un paquete han sufrido alteraciones o inversiones (*bit flips*) durante su propagación por los medios físicos o en el procesamiento interno de los conmutadores y enrutadores intermedios.

A diferencia de los códigos de redundancia cíclica (**CRC**, *Cyclic Redundancy Check*) utilizados comúnmente en la capa de enlace de datos (como en las tramas Ethernet), el Checksum de Internet se seleccionó deliberadamente por su **extrema simplicidad y eficiencia de ejecución en software**, requiriendo únicamente operaciones aritméticas básicas de adición y desplazamiento a nivel de registro en procesadores convencionales.

---

## 2. Aritmética de Complemento a Uno y Acarreo Circular

El cálculo del checksum opera tratando el conjunto de bytes a proteger como una secuencia de **palabras enteras de 16 bits sin signo**. La adición de estas palabras se rige por las reglas estrictas de la **aritmética en complemento a uno** (*one's complement sum*).

### El Mecanismo del Acarreo Circular (End-Around Carry)
Cuando se suman dos números enteros de 16 bits en una ALU estándar de complemento a dos, la suma puede producir un acarreo saliente por el bit más significativo (el bit 16, considerando la numeración de 0 a 15). En aritmética en complemento a uno:
- El bit de desbordamiento (bit 16) no se descarta.
- **Debe sumarse de vuelta al bit menos significativo (bit 0) del resultado**.

Matemáticamente, la adición en complemento a uno de un conjunto de $M$ palabras de 16 bits $\{W_1, W_2, \dots, W_M\}$ equivale a sumar algebraicamente todos los valores y aplicar la reducción circular sobre los acarreos acumulados:
$$\text{Sum}_{1\text{'s}} = \left(\sum_{i=1}^{M} W_i\right) \pmod{2^{16} - 1}$$

### Procedimiento de Generación en el Emisor
1. Se inicializa el campo de checksum del encabezado del protocolo en ceros binarios (`0x0000`).
2. Si el número total de bytes a proteger es impar, se añade temporalmente un byte de relleno (*pad byte*) con valor cero (`0x00`) al final del búfer de datos únicamente a efectos del cálculo (este byte no se transmite en la red).
3. Se calcula la suma en complemento a uno de todas las palabras de 16 bits.
4. Se aplica la **inversión bit a bit** (operador $\sim$) sobre la suma obtenida:
   $$\text{Checksum} = \sim \text{Sum}_{1\text{'s}}$$
5. El valor de 16 bits resultante se escribe en el campo `Checksum` del encabezado.

### Verificación en el Receptor
El receptor aplica exactamente el mismo algoritmo sobre el datagrama recibido, **incluyendo el propio campo de checksum**:
$$\text{Verificación} = \left(\sum_{i=1}^{M} W_i + \text{Checksum}\right)_{1\text{'s}}$$

Debido a que $\text{Checksum} = \sim \text{Sum}_{1\text{'s}}$, la adición de cualquier número con su complemento a uno da como resultado una secuencia donde **todos los 16 bits son iguales a 1** (`0xFFFF`):
$$A + (\sim A) = \text{0xFFFF}$$

Si el receptor calcula el complemento a uno de este resultado final, obtiene:
$$\sim (\text{0xFFFF}) = \text{0x0000}$$

Si el cómputo final difiere de `0x0000` (o equivalentemente, si la suma previa difiere de `0xFFFF`), el receptor concluye inequívocamente que **al menos un bit fue alterado durante el tránsito**, procediendo al descarte silencioso del segmento.

---

## 3. Ejemplo Numérico Paso a Paso

Considérese la suma de dos palabras de 16 bits:
- $W_1 = \text{0xE666} = 1110\;0110\;0110\;0110_2$
- $W_2 = \text{0xD555} = 1101\;0101\;0101\;0101_2$

1. **Suma binaria estándar de 16 bits**:
   $$\begin{array}{r@{\quad}l}
     & 1110\;0110\;0110\;0110_2 \\
   + & 1101\;0101\;0101\;0101_2 \\
   \hline
   \mathbf{1} & 1011\;1011\;1011\;1011_2
   \end{array}$$
   Se genera un acarreo saliente de $1$ en la posición del bit 16.

2. **Aplicación del acarreo circular (End-Around Carry)**:
   Se suma el acarreo saliente al bit de menor peso:
   $$\begin{array}{r@{\quad}l}
     & 1011\;1011\;1011\;1011_2 \\
   + & 0000\;0000\;0000\;0001_2 \\
   \hline
     & 1011\;1011\;1011\;1100_2 = \text{0xBBBC}
   \end{array}$$

3. **Inversión bit a bit para obtener el Checksum**:
   $$\text{Checksum} = \sim(1011\;1011\;1011\;1100_2) = 0100\;0100\;0100\;0011_2 = \text{0x4443}$$

4. **Comprobación en Recepción**:
   $$\begin{array}{r@{\quad}l}
     & 1011\;1011\;1011\;1100_2 \quad (\text{Suma de los datos}) \\
   + & 0100\;0100\;0100\;0011_2 \quad (\text{Checksum recibido}) \\
   \hline
     & 1111\;1111\;1111\;1111_2 = \text{0xFFFF}
   \end{array}$$
   Invirtiendo el total: $\sim(\text{0xFFFF}) = \text{0x0000}$. La integridad queda formalmente validada.

---

## 4. Limitaciones Estructurales y Protección Débil

Aunque el Checksum de Internet es extraordinariamente rápido de calcular, ofrece una **protección estadística débil** en comparación con los esquemas basados en polinomios generadores como CRC-32:

1. **Detección de Errores de 1 Bit**: Garantizada al 100%. Cualquier inversión aislada de un bit altera inevitablemente la suma modular y genera un fallo de verificación.
2. **Falla ante Errores de 2 Bits Compensatorios**: Si un bit de una columna se invierte de $0 \to 1$ y en otra palabra de 16 bits el bit situado en la misma posición de columna se invierte de $1 \to 0$, **la suma aritmética permanece totalmente idéntica**. El receptor no detectará que ambos datos fueron corrompidos.
3. **Invarianza ante Reordenamiento de Palabras**: Debido a la propiedad conmutativa y asociativa de la adición, si dos palabras de 16 bits dentro de la carga útil intercambian de posición (por ejemplo, por un desbordamiento de búfer o error en memoria), la suma en complemento a uno arroja exactamente el mismo valor, enmascarando la transposición.

---

## 5. La Pseudocabecera (Pseudoheader) de IPv4 e IPv6

Una de las violaciones de abstracción de capas más notorias en la arquitectura TCP/IP ocurre en el cálculo del checksum de transporte: **la capa de transporte inspecciona y procesa campos de la capa de red**.

### Justificación Técnica
Un datagrama UDP podría cruzar la red sin corrupción en su cabecera UDP ni en su carga útil, pero el encabezado del paquete IP podría sufrir un error de enrutamiento (por ejemplo, corrupción de la dirección IP de destino). Si el host receptor equivocado procesa el datagrama, el segmento se entregaría a un proceso inocente que casualmente escuche en el mismo puerto.

Para impedir la entrega errónea de paquetes extraviados, el cálculo del checksum incluye una **pseudocabecera conceptual** que no se transmite por el cable físico:

### Estructura de la Pseudocabecera IPv4 (96 bits / 12 bytes)
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination IP Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Zero (8 bits)    |  Protocol (8 bits: 17)|    UDP Length |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
- **Source IP (32 bits)** y **Destination IP (32 bits)**: Aseguran que el paquete haya sido emitido por el host correcto y recibido por el destinatario legítimo.
- **Protocol (8 bits)**: Fijado en 17 (`0x11`) para UDP. Evita que un segmento UDP sea procesado por TCP o viceversa.
- **UDP Length (16 bits)**: Duplica el valor del campo de longitud de la cabecera UDP real para verificar su coherencia.
