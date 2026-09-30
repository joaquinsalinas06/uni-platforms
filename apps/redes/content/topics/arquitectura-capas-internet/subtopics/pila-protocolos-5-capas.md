---
kind: subtopic
title: "La Pila de Protocolos de 5 Capas de Internet"
order: 1
---

## 1. Justificación y Filosofía de Diseño de la Pila TCP/IP

La arquitectura de Internet se estructura en torno a una pila de cinco capas funcionales orientadas a la práctica de la ingeniería de software y telecomunicaciones. A diferencia de modelos puramente teóricos como el modelo OSI, la pila de Internet nació de la necesidad práctica de interconectar redes dispares bajo el auspicio de ARPA y la IETF.

### Principio de Extremo a Extremo (*End-to-End Principle*)
Uno de los axiomas fundamentales de la arquitectura de la pila es el **Principio de Extremo a Extremo**: las funciones de la red deben implementarse en los sistemas terminales (en las capas superiores), a menos que implementarlas en los nodos intermedios proporcione una mejora de rendimiento sustancial sin comprometer la flexibilidad.
- Por esta razón, la fiabilidad de la transferencia (retransmisión de paquetes perdidos, control de congestión y control de flujo) se delega a la capa de transporte en los hosts extremos (TCP), manteniendo el núcleo de la red (enrutadores en la capa de red) lo más simple, rápido y escalable posible.

---

## 2. Anatomía Detallada de las 5 Capas

### 2.1 Capa 5: Capa de Aplicación
- **Entorno de ejecución**: Espacio de usuario de los sistemas terminales (*user-space applications*).
- **Entidades comunicantes**: Procesos de software distribuidos que intercambian mensajes a través de sockets de red.
- **Protocolos dominantes**:
  - `HTTP` (puerto 80 / 443): Transferencia de hipertexto y recursos multimedia en la web.
  - `DNS` (puerto 53): Sistema jerárquico de resolución de nombres de dominio en direcciones IP.
  - `SMTP` (puerto 25): Envío y retransmisión de correo electrónico entre servidores de correo.
  - `SSH` (puerto 22): Shell remota y túnel cifrado seguro.

### 2.2 Capa 4: Capa de Transporte
- **Entorno de ejecución**: Núcleo del sistema operativo (*Kernel*).
- **Entidades comunicantes**: Puertos lógicos asociados a procesos (16 bits, rango 0 a 65535).
- **Funcionalidad clave**:
  - **Multiplexación y Demultiplexación**: Uso de números de puerto de origen y destino para entregar los datos al socket correcto dentro del sistema operativo.
  - **Diferenciación de servicios**:
    - **TCP (RFC 793)**: Confiabilidad total, acuse de recibo acumulativo, retransmisiones automáticas, establecimiento de conexión mediante protocolo de enlace de 3 vías (*Three-Way Handshake*), y control de congestión adaptativo.
    - **UDP (RFC 768)**: Datagramas sin conexión, mínima sobrecarga (cabecera fija de 8 bytes frente a los 20 bytes de TCP), sin control de congestión ni retrasos por handshake.

### 2.3 Capa 3: Capa de Red
- **Entorno de ejecución**: Kernel del host y conmutadores de capa de red (enrutadores).
- **Entidades comunicantes**: Interfaces de red identificadas unívocamente por direcciones IP lógicas.
- **Funcionalidades gemelas**:
  - **Enrutamiento (*Routing*)**: Algoritmos de enrutamiento distribuidos (e.g., Dijkstra en OSPF, Bellman-Ford en RIP, políticas en BGP) que calculan la ruta óptima global que seguirán los paquetes desde el origen hasta el destino. Se ejecuta en el **plano de control**.
  - **Reenvío (*Forwarding*)**: Acción de hardware local en el enrutador que toma un paquete de su enlace de entrada y lo traslada a la interfaz de enlace de salida apropiada en microsegundos basándose en su tabla de reenvío. Se ejecuta en el **plano de datos**.

### 2.4 Capa 2: Capa de Enlace de Datos
- **Entorno de ejecución**: Tarjeta de interfaz de red (NIC) y su controlador de dispositivo de bajo nivel.
- **Entidades comunicantes**: Direcciones físicas de control de acceso al medio (**direcciones MAC**, 48 bits, e.g., `00:1A:2B:3C:4D:5E`).
- **Funcionalidad clave**:
  - Delimitación de tramas mediante banderas de sincronización (*framing*).
  - Detección de errores físicos mediante código CRC-32 (Cyclic Redundancy Check) o FCS (Frame Check Sequence).
  - Protocolos de acceso múltiple coordinado para canales compartidos: CSMA/CD en Ethernet heredado, CSMA/CA en Wi-Fi 802.11.

### 2.5 Capa 1: Capa Física
- **Entorno de ejecución**: Conectores físicos, transceptores ópticos, chips PHY de señal analógica.
- **Funcionalidad clave**:
  - Transformación de los bits lógicos (`0` y `1`) en señales físicas correspondientes: variaciones de voltaje en cables de cobre (e.g., codificación Manchester, PAM-4), pulsos de luz láser a través de fibras monomodo, o modulación por desplazamiento de fase y amplitud en radiofrecuencia (QAM-256).

---

## 3. Interfaces de Servicio vs. Interfaces Entre Pares (*Peers*)

En el modelo en capas, se distingue formalmente entre dos tipos de interfaces:
1. **Interfaz de Servicio (Vertical)**: Define las operaciones y primitivas que una capa local ofrece a la capa inmediatamente superior dentro del mismo host (e.g., la API de sockets entre la capa de aplicación y de transporte).
2. **Interfaz Entre Pares (Horizontal)**: Define las reglas sintácticas y semánticas de los mensajes intercambiados entre dos entidades que operan en la **misma capa** pero en hosts remotos distintos (e.g., el protocolo HTTP intercambiado entre el navegador y el servidor web).
