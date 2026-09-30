---
kind: subtopic
title: "Modelado Matemático de la Distribución de Archivos"
order: 1
---

## 1. Planteamiento Formal del Problema

El objetivo del modelado es determinar el tiempo mínimo indispensable para que un conjunto de $N$ nodos terminales obtenga una réplica íntegra de un archivo de tamaño $F$ bits originalmente alojado en un único servidor.

Se consideran las siguientes variables y parámetros:
- $F$: Tamaño del archivo en bits.
- $N$: Número de pares solicitantes.
- $u_s$: Ancho de banda de subida (*upload rate*) del servidor emisor.
- $u_i$: Ancho de banda de subida del $i$-ésimo par ($i = 1, 2, \dots, N$).
- $d_i$: Ancho de banda de bajada (*download rate*) del $i$-ésimo par.
- $d_{\min}$: El valor mínimo del ancho de banda de descarga entre todos los clientes ($d_{\min} = \min_{1 \le i \le N} d_i$).

Se asume que la red central de tránsito está libre de congestión, de modo que las restricciones de velocidad residen en los enlaces de acceso de los participantes.

## 2. Derivación del Modelo Cliente-Servidor ($D_{\text{cs}}$)

En una infraestructura Cliente-Servidor tradicional:
1. El servidor centralizado debe abastecer a cada uno de los $N$ clientes transmitiendo copias independientes. Para enviar $N \cdot F$ bits con una capacidad de subida de $u_s$, el tiempo de transmisión del servidor satisface:
   $$T_1 \ge \frac{N \cdot F}{u_s}$$
2. Cada cliente debe recibir $F$ bits a través de su interfaz de acceso. El cliente con la tasa de descarga más reducida $d_{\min}$ experimentará un retardo de recepción de al menos:
   $$T_2 \ge \frac{F}{d_{\min}}$$
3. Dado que ambos procesos deben cumplirse simultáneamente, el tiempo global de distribución $D_{\text{cs}}$ no puede ser inferior al mayor de estos dos cuellos de botella:
   $$D_{\text{cs}} \ge \max \left\{ \frac{N \cdot F}{u_s}, \frac{F}{d_{\min}} \right\}$$

Cuando $N$ es grande, el término $\frac{N \cdot F}{u_s}$ domina de forma absoluta la ecuación, imponiendo una relación de dependencia lineal directa con respecto al número de clientes.

## 3. Derivación del Modelo Peer-to-Peer ($D_{\text{P2P}}$)

En una arquitectura Peer-to-Peer (P2P), los nodos receptores redistribuyen activamente porciones del archivo:
1. **Condición del Servidor de Origen**: Para que los datos circulen por la red, el servidor debe subir como mínimo una copia completa del archivo (o un conjunto de fragmentos que totalicen $F$ bits):
   $$T_{\text{servidor}} \ge \frac{F}{u_s}$$
2. **Condición de Bajada del Cliente más Lento**: Ningún cliente individual puede eludir la limitación física de su tasa de descarga. Por lo tanto, el cliente más lento requiere al menos:
   $$T_{\text{bajada}} \ge \frac{F}{d_{\min}}$$
3. **Condición de Capacidad Agregada de la Red**: El sistema completo debe asimilar un total neto de $N \cdot F$ bits de información. Las únicas fuentes de subida en la red son el servidor central y los $N$ pares participantes. Por consiguiente, la tasa de inyección combinada máxima es:
   $$u_{\text{sistema}} = u_s + \sum_{i=1}^N u_i$$
   Dividiendo el volumen total de bits entre la tasa agregada de subida:
   $$T_{\text{agregado}} \ge \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i}$$

Integrando las tres cotas independientes, el tiempo de distribución P2P está acotado por:
$$D_{\text{P2P}} \ge \max \left\{ \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{N \cdot F}{u_s + \sum_{i=1}^N u_i} \right\}$$

Esta cota demuestra que, al redistribuir la carga, el sistema aprovecha el potencial ocioso de los enlaces ascendentes de los propios consumidores de datos.
