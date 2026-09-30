---
kind: theory
title: "Distribución P2P vs Cliente-Servidor y Escalabilidad"
---

## 1. De la Arquitectura Cliente-Servidor a las Redes Entre Pares

En el paradigma tradicional **Cliente-Servidor**, existe una asimetría radical entre los roles de las entidades de red:
- Un conjunto reducido de servidores centrales dedicados almacena la información, atiende de manera reactiva las peticiones entrantes y soporta toda la carga computacional y de ancho de banda.
- Los clientes son consumidores pasivos que inician conexiones, descargan datos y no aportan sus propios recursos al sistema.
- A medida que la cantidad de usuarios simultáneos $N$ crece, la infraestructura del servidor central debe escalarse verticalmente (servidores más costosos) u horizontalmente (granjas de servidores, balanceadores de carga y redes CDN), imponiendo costos operativos y de ancho de banda exorbitantes.

La arquitectura **Peer-to-Peer (P2P)** subvierte esta dicotomía:
- Los sistemas carecen de una jerarquía fija; los nodos participantes (*peers* o pares) actúan simultáneamente como clientes y como servidores (*servents*).
- Los peers son computadores terminales (hosts de usuarios residenciales, oficinas, etc.) conectados de forma intermitente a Internet que se comunican directamente entre sí sin intermediación obligatoria de servidores centrales.
- La propiedad distintiva de P2P es la **autoescalabilidad (*self-scalability*)**: cada nuevo peer que se incorpora al sistema para descargar un archivo aporta automáticamente su propio ancho de banda de subida (*upload*) para distribuir fragmentos hacia los demás nodos, balanceando intrínsecamente la demanda con la oferta.

## 2. Redes Superpuestas (Overlay Networks)

Los sistemas P2P operan en la capa de aplicación implementando una **red superpuesta** (*overlay network*):
- Una red superpuesta es una red virtual lógica construida por encima de la red física y de encaminamiento de Internet (IP).
- **Nodos del Overlay**: Son los procesos de aplicación que ejecutan el software P2P en los hosts finales.
- **Enlaces Lógicos (Tunnels)**: Los enlaces que unen dos nodos en el grafo del overlay no corresponden a cables físicos directos, sino a **túneles de transporte** (conexiones TCP o flujos de datagramas UDP) que atraviesan múltiples routers físicos subyacentes.
- **Encaminamiento en la Capa de Aplicación**: En una red overlay, los nodos toman sus propias decisiones de reenvío a nivel de software. Un paquete viaja de un nodo overlay $A$ a un nodo overlay $C$ pasando por un nodo overlay intermedio $B$, aunque los routers IP físicos desconozcan por completo dicha lógica de aplicación.

Históricamente, la evolución de los overlays P2P atravesó diversas etapas:
1. **Directorio Centralizado (Napster)**: Los archivos se transferían de par a par, pero la indexación y búsqueda dependían de un servidor central (punto único de falla y vulnerabilidad legal).
2. **Overlay No Estructurado con Inundación de Consultas (Gnutella)**: Red completamente descentralizada donde cada nodo reenvía las consultas a todos sus vecinos lógicos dentro de un radio acotado por un contador de saltos (*TTL*), lo que provocaba congestión masiva de tráfico broadcast.
3. **Overlays Jerárquicos con Supernodos (KaZaA, Skype temprano)**: Nodos con mayor ancho de banda y disponibilidad actúan como concentradores de búsqueda para nodos periféricos.
4. **Overlays Estructurados (DHT) y Swarming (BitTorrent)**: Asignación determinista de claves y distribución segmentada de alta eficiencia.

## 3. Modelo Matemático Comparativo de Distribución de Archivos

Consideremos el problema fundamental de ingeniería: **¿Cuánto tiempo demora distribuir un archivo de tamaño $F$ bits desde un servidor inicial a un grupo de $N$ clientes?**

### Definición de Parámetros del Sistema
- $F$: Tamaño total del archivo en bits.
- $N$: Número de clientes receptores que desean obtener la totalidad del archivo.
- $u_s$: Tasa de subida (*upload rate*) del servidor original en bits por segundo (bps).
- $d_i$: Tasa de bajada (*download rate*) del cliente $i$-ésimo ($i = 1, \dots, N$).
- $d_{\min} = \min_{i} \{d_i\}$: Tasa de descarga del cliente más lento del conjunto.
- $u_i$: Tasa de subida del cliente $i$-ésimo ($i = 1, \dots, N$).

Se asume que la red central de Internet posee capacidad suficiente en el núcleo (*core*) y que los cuellos de botella se localizan exclusivamente en los enlaces de acceso de los participantes.

---

### 3.1. Cota Inferior en Arquitectura Cliente-Servidor ($D_{\text{cs}}$)

En el modelo cliente-servidor:
1. **Restricción de Subida del Servidor**: El servidor debe enviar de forma independiente y secuencial $N$ copias completas del archivo a través de su enlace de acceso. El volumen total inyectado es $N \cdot F$ bits. Por consiguiente, el tiempo que el servidor tarda en enviar los datos no puede ser inferior a:
   $$T_{\text{up, server}} \ge \frac{N \cdot F}{u_s}$$

2. **Restricción de Bajada del Cliente más Lento**: Cada cliente debe recibir los $F$ bits del archivo. El cliente con la tasa de descarga más desfavorable ($d_{\min}$) requerirá al menos:
   $$T_{\text{down, min}} \ge \frac{F}{d_{\min}}$$

Combinando ambas condiciones limitantes independientes, el tiempo mínimo de distribución en cliente-servidor está acotado por:
$$D_{\text{cs}} \ge \max \left\{ \frac{N \cdot F}{u_s}, \frac{F}{d_{\min}} \right\}$$

---

### 3.2. Cota Inferior en Arquitectura Peer-to-Peer ($D_{\text{P2P}}$)

En una red P2P, los clientes descargan bloques del archivo y de inmediato los reenvían a otros nodos:
1. **Restricción de Inyección Inicial**: El servidor debe subir al menos una copia íntegra del archivo hacia el enjambre (*swarm*) para que todos los fragmentos existan en la red:
   $$T_{\text{server}} \ge \frac{F}{u_s}$$

2. **Restricción de Bajada Individual**: Al igual que en cliente-servidor, ningún cliente puede completar la descarga más rápido de lo que permite su propio enlace de recepción:
   $$T_{\text{down}} \ge \frac{F}{d_{\min}}$$

3. **Restricción de Capacidad Agregada del Sistema**: Para que los $N$ clientes obtengan el archivo, el sistema en conjunto debe descargar $N \cdot F$ bits netos. La tasa global máxima a la que se pueden inyectar bits al sistema es la suma de la tasa del servidor más las tasas de subida de todos los clientes participantes:
   $$u_{\text{total}} = u_s + \sum_{i=1}^{N} u_i$$
   Por ende, el tiempo total para generar y compartir los $N \cdot F$ bits no puede ser inferior a:
   $$T_{\text{agregado}} \ge \frac{N \cdot F}{u_s + \sum_{i=1}^{N} u_i}$$

Integrando las tres restricciones, la cota inferior del tiempo de distribución P2P es:
$$D_{\text{P2P}} \ge \max \left\{ \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{N \cdot F}{u_s + \sum_{i=1}^{N} u_i} \right\}$$

---

## 4. Análisis de Escalabilidad Asintótica

La divergencia estructural entre ambos paradigmas se manifiesta con claridad analizando el comportamiento de las funciones de tiempo cuando la cantidad de nodos $N$ tiende a infinito ($N \to \infty$).

Supongamos, como en el caso práctico estándar, que todos los peers poseen capacidades homogéneas de subida $u_i = u$, y que la capacidad del enlace de bajada no es el factor limitante ($d_{\min} \ge u_s$):

### Comportamiento Asintótico en Cliente-Servidor:
$$D_{\text{cs}} = \max \left\{ \frac{N \cdot F}{u_s}, \frac{F}{d_{\min}} \right\} = \frac{N \cdot F}{u_s} \quad (\text{para } N \text{ suficientemente grande})$$
$$\lim_{N \to \infty} D_{\text{cs}} = \mathcal{O}(N)$$
El retardo crece de forma **estrictamente lineal**. Si el número de clientes se multiplica por 1000, el tiempo de distribución también se multiplica por 1000, saturando inevitablemente al servidor.

### Comportamiento Asintótico en P2P:
Analicemos el tercer término de la cota $D_{\text{P2P}}$ con $u_i = u$:
$$\frac{N \cdot F}{u_s + N \cdot u} = \frac{F}{\frac{u_s}{N} + u}$$
Tomando el límite cuando $N \to \infty$:
$$\lim_{N \to \infty} \frac{N \cdot F}{u_s + N \cdot u} = \frac{F}{u}$$
Por lo tanto:
$$\lim_{N \to \infty} D_{\text{P2P}} = \max \left\{ \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{F}{u} \right\} = \mathcal{O}(1)$$
El tiempo de distribución en P2P se vuelve **asintóticamente plano y constante** $\mathcal{O}(1)$. A medida que se añaden millones de receptores, cada uno aporta exactamente la capacidad de subida requerida para balancear su propia demanda.

---

## 5. Caso de Estudio Numérico Comparativo

Consideremos los parámetros definidos en las guías del curso:
- Tamaño del archivo: $\frac{F}{u} = 1\text{ hora}$.
- Capacidad de subida del servidor: $u_s = 10u$ (el servidor puede subir una copia completa en $\frac{F}{u_s} = \frac{1}{10}\text{ hora} = 6\text{ minutos}$).
- Capacidad de bajada: $d_{\min} \ge u_s$, por lo que $\frac{F}{d_{\min}} \le \frac{1}{10}\text{ hora}$.

Evaluemos el tiempo para diversos valores de $N$:

| Número de Peers ($N$) | Tiempo Cliente-Servidor ($D_{\text{cs}}$) | Tiempo P2P ($D_{\text{P2P}}$) |
| :---: | :---: | :---: |
| $N = 10$ | $\frac{10 \cdot F}{10 u} = 1.0\text{ hora}$ | $\max \{0.1, \frac{10}{10 + 10}\} = 0.5\text{ horas}$ |
| $N = 100$ | $\frac{100 \cdot F}{10 u} = 10.0\text{ horas}$ | $\max \{0.1, \frac{100}{10 + 100}\} = \frac{100}{110} \approx 0.91\text{ horas}$ |
| $N = 1000$ | $\frac{1000 \cdot F}{10 u} = 100.0\text{ horas}$ | $\max \{0.1, \frac{1000}{10 + 1000}\} = \frac{1000}{1010} \approx 0.99\text{ horas}$ |
| $N = 10000$ | $\frac{10000 \cdot F}{10 u} = 1000.0\text{ horas}$ ($\approx 41.6$ días) | $\approx 1.0\text{ hora}$ |

Este análisis numérico prueba el poder de las arquitecturas distribuidas: mientras que en el modelo centralizado la distribución de un archivo masivo a 10,000 nodos colapsa el servicio demorando más de un mes, en la red P2P la tarea concluye en tan solo **1 hora**, demostrando una eficiencia y ahorro de infraestructura inigualables.
