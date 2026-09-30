---
kind: theory
title: "Modelo de Capas de Internet y Encapsulación"
---

## 1. Motivación y Principios de la Estratificación en Capas

El diseño de redes de comunicación a escala global representa uno de los desafíos de ingeniería más complejos de la computación, debido a la diversidad heterogénea de componentes: sistemas operativos dispares, medios de transmisión (cobre, fibra óptica, radiofrecuencia), arquitecturas de enrutamiento y aplicaciones con requerimientos variados.

Para gestionar esta complejidad, la arquitectura de Internet adopta el principio de **estratificación jerárquica en capas** (*layering*):

1. **Estructura Explícita y Modular**: Permite identificar y relacionar con precisión cada componente del sistema mediante modelos de referencia estandarizados.
2. **Desacoplamiento e Interoperabilidad**: Cada capa ofrece un conjunto de servicios bien definidos a la capa inmediatamente superior, ocultando los detalles internos de implementación. Si la implementación interna de una capa cambia (por ejemplo, reemplazar Ethernet por Wi-Fi en la capa de enlace), las capas superiores (red, transporte, aplicación) no requieren ninguna modificación.
3. **Mantenibilidad y Evolución**: Facilita la actualización de algoritmos, protocolos y hardware sin generar fallos en cascada a través de la pila tecnológica.

### Los Principios Arquitectónicos de Cerf y Kahn (1974)
La arquitectura de interconexión de redes (*internetworking*) que sustenta Internet se basa en los principios seminales formulados por Vinton Cerf y Robert Kahn:
- **Minimalismo y Autonomía**: Las redes individuales que se interconectan mantienen su autonomía operativa interna sin necesidad de alterar su infraestructura para formar parte de la red global.
- **Servicio de Mejor Esfuerzo (*Best-Effort Service*)**: La capa de red no garantiza que los datagramas lleguen a su destino, ni que lo hagan en orden o sin duplicados. Esta simplificación deliberada permite que los enrutadores operen a velocidades extremas.
- **Enrutamiento sin Estado (*Stateless Routing*)**: Los enrutadores del núcleo de la red no conservan información de estado respecto a las conexiones o sesiones individuales de los usuarios terminales. Cada paquete contiene toda la información de direccionamiento necesaria para ser reenviado de forma independiente.
- **Control Descentralizado**: No existe una entidad central ni un punto único de fallo que coordine el tráfico global o la asignación de rutas.

---

## 2. La Pila de Protocolos de Internet (5 Capas)

La arquitectura pragmática de Internet se estructura en **5 capas funcionales**, descritas de arriba hacia abajo:

### 2.1 Capa de Aplicación
- **Propósito**: Aloja los programas de red distribuidos que interactúan con el usuario o con otros servicios.
- **Unidad de Datos de Protocolo (PDU)**: **Mensaje**.
- **Protocolos representativos**: HTTP (World Wide Web), SMTP (correo electrónico), DNS (resolución de nombres de dominio), FTP (transferencia de archivos), SSH (acceso remoto seguro).
- **Implementación**: Se ejecuta íntegramente en el espacio de usuario (*user space*) de los sistemas terminales.

### 2.2 Capa de Transporte
- **Propósito**: Proporciona el servicio de comunicación lógica de proceso a proceso entre aplicaciones que residen en hosts distintos.
- **Unidad de Datos de Protocolo (PDU)**: **Segmento**.
- **Protocolos representativos**: 
  - **TCP (Transmission Control Protocol)**: Ofrece transferencia confiable de flujo de bytes orientada a conexión, control de flujo mediante ventana deslizante, control de congestión y entrega ordenada.
  - **UDP (User Datagram Protocol)**: Ofrece un servicio ligero, no orientado a la conexión, sin garantías de entrega, orden ni control de flujo (*best-effort*).
- **Implementación**: Reside en el núcleo del sistema operativo (*OS kernel*) de los hosts.

### 2.3 Capa de Red
- **Propósito**: Responsable del enrutamiento (*routing*) y reenvío (*forwarding*) de paquetes desde el host emisor original hasta el host receptor final a través de una malla de enrutadores intermedios.
- **Unidad de Datos de Protocolo (PDU)**: **Datagrama**.
- **Protocolos representativos**: IP (IPv4 e IPv6), protocolos de enrutamiento (OSPF, BGP, RIP), protocolos de control y señalización (ICMP).
- **Implementación**: Reside en el sistema operativo de los hosts y en el plano de control/datos de los enrutadores.

### 2.4 Capa de Enlace de Datos
- **Propósito**: Transfiere unidades de datos entre dos nodos vecinos directamente conectados por un canal de comunicación físico (de host a router, de router a router, o de router a host). Gestiona el control de acceso al medio (MAC) y la detección de errores a nivel de enlace.
- **Unidad de Datos de Protocolo (PDU)**: **Trama** (*Frame*).
- **Protocolos representativos**: Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), PPP, DOCSIS.
- **Implementación**: Implementada en hardware de adaptadores de red (tarjetas NIC) y controladores de dispositivo (*device drivers*).

### 2.5 Capa Física
- **Propósito**: Coordina la modulación, codificación y transmisión física de bits individuales sobre el medio de transmisión físico.
- **Unidad de Datos de Protocolo (PDU)**: **Bit** (señal eléctrica, óptica o electromagnética).
- **Especificaciones**: Voltajes, conectores físicos (RJ-45, fibra SC/LC), frecuencias de portadora, tasas de modulación (QAM, PAM).

---

## 3. Comparación con el Modelo de Referencia OSI (7 Capas)

El modelo de interconexión de sistemas abiertos (OSI) de la ISO definió formalmente una jerarquía de 7 capas:

| Nivel | Capa OSI | Pila Internet (TCP/IP) | Funciones Principales |
| :--- | :--- | :--- | :--- |
| **7** | Aplicación | Aplicación | Interfaz con la aplicación de usuario |
| **6** | Presentación | *(Absorbida en Aplicación)* | Representación de datos, serialización, compresión, cifrado |
| **5** | Sesión | *(Absorbida en Aplicación)* | Delimitación, sincronización y puntos de control de diálogo |
| **4** | Transporte | Transporte | Comunicación lógica de proceso a proceso (multiplexación por puertos) |
| **3** | Red | Red | Direccionamiento lógico y enrutamiento global |
| **2** | Enlace de datos | Enlace de datos | Transferencia confiable de tramas entre nodos adyacentes |
| **1** | Física | Física | Transmisión de bits crudos sobre el canal |

### ¿Por qué Internet no implementa las capas de Presentación y Sesión de forma separada?
En la filosofía de diseño de Internet, las funciones de presentación (e.g., compresión gzip, serialización JSON/XML, cifrado TLS) y sesión (e.g., reanudación de sesiones web mediante tokens o cookies) son servicios específicos de cada aplicación. Obligar a todas las aplicaciones a atravesar capas intermedias rígidas añade sobrecarga de procesamiento innecesaria. Si una aplicación necesita cifrado o serialización, implementa esas bibliotecas directamente en la capa de aplicación.

---

## 4. La Arquitectura en Forma de "Reloj de Arena" (*Hourglass Model*)

La arquitectura de Internet se visualiza clásicamente con una estructura de reloj de arena:
- **Cúspide ancha**: Gran variedad de aplicaciones y protocolos de aplicación (HTTP, SMTP, DNS, RTP, SSH, Torrent).
- **Cintura estrecha (Punto Focal Único)**: **El Protocolo de Internet (IP)**. Todo el tráfico global debe converger obligatoriamente sobre datagramas IP. No existe alternativa en la capa de red si se desea interoperar globalmente.
- **Base ancha**: Múltiples medios físicos y tecnologías de enlace de datos (Ethernet, Wi-Fi, 4G/5G, fibra óptica, satélite).

Esta cintura estrecha es la responsable del éxito y la longevidad de Internet: cualquier nueva aplicación puede funcionar sobre la red existente con solo usar IP, y cualquier nueva tecnología física de enlace puede integrarse de inmediato si es capaz de transportar datagramas IP.

---

## 5. El Proceso de Encapsulación y Desencapsulación

Cuando una aplicación genera datos para ser transmitidos a través de la red, la información recorre la pila de protocolos sufriendo un proceso de **encapsulación**:

1. **Capa de Aplicación**: Se crea el **Mensaje de Aplicación** ($M$), por ejemplo una solicitud `GET /index.html HTTP/1.1`.
2. **Capa de Transporte**: Recibe $M$, añade una cabecera de transporte ($H_t$) que contiene los puertos de origen y destino, secuencias de control y sumas de comprobación. El resultado es el **Segmento**:
   $$\text{Segmento} = [H_t \,|\, M]$$
3. **Capa de Red**: Recibe el segmento como su carga útil (*payload*), añade una cabecera de red ($H_n$) con las direcciones IP de origen y destino, campos TTL y protocolo superior. El resultado es el **Datagrama**:
   $$\text{Datagrama} = [H_n \,|\, H_t \,|\, M]$$
4. **Capa de Enlace**: Recibe el datagrama y añade una cabecera de enlace ($H_l$) con direcciones MAC físicas y un trailer de verificación de errores ($T_l$ o CRC). El resultado es la **Trama**:
   $$\text{Trama} = [H_l \,|\, H_n \,|\, H_t \,|\, M \,|\, T_l]$$
5. **Capa Física**: La trama completa se modula y transmite como una secuencia de bits a través del medio.

En el extremo receptor, o en los nodos intermedios, ocurre el proceso inverso (**desencapsulación**):
- Un enrutador intermedio recibe la trama física, desencapsula hasta la capa de red (examinando $H_n$ para determinar el siguiente salto), pero **nunca desencapsula las cabeceras de transporte o aplicación** ($H_t$ o $M$), respetando la transparencia extremo a extremo.

---

## 6. Métricas de Eficiencia y Overhead de Encapsulación

La adición de cabeceras en cada capa introduce una sobrecarga de datos de control (*protocol overhead*).

Sean:
- $L_{\text{data}}$: Longitud en bytes de los datos de aplicación.
- $H_{\text{transporte}}$: Tamaño de la cabecera de transporte (20 bytes para TCP estándar, 8 bytes para UDP).
- $H_{\text{red}}$: Tamaño de la cabecera de red (20 bytes para IPv4 sin opciones, 40 bytes para IPv6).
- $H_{\text{enlace}}$: Tamaño de la cabecera y cola de enlace (18 bytes para Ethernet: 14 bytes cabecera + 4 bytes FCS/CRC).

El tamaño total de la trama física $L_{\text{total}}$ es:

$$L_{\text{total}} = L_{\text{data}} + H_{\text{transporte}} + H_{\text{red}} + H_{\text{enlace}}$$

La **eficiencia de transmisión de carga útil** ($\eta$) y el **porcentaje de overhead** se calculan como:

$$\eta = \frac{L_{\text{data}}}{L_{\text{total}}}$$

$$\text{Overhead (\%)} = \frac{L_{\text{total}} - L_{\text{data}}}{L_{\text{total}}} \times 100\% = (1 - \eta) \times 100\%$$

Si una aplicación envía un mensaje diminuto de solo 1 byte (por ejemplo, una pulsación de tecla en una sesión Telnet interactiva) sobre TCP/IPv4/Ethernet:
- $L_{\text{data}} = 1 \text{ byte}$
- $H_{\text{TCP}} = 20 \text{ bytes}$, $H_{\text{IPv4}} = 20 \text{ bytes}$, $H_{\text{Ethernet}} = 18 \text{ bytes}$
- $L_{\text{total}} = 1 + 20 + 20 + 18 = 59 \text{ bytes}$
- $\eta = \frac{1}{59} \approx 1.69\%$, lo que implica un **Overhead superior al 98.3%**.
