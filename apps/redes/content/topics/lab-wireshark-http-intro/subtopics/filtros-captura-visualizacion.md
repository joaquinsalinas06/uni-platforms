---
kind: subtopic
title: "Filtros de Captura vs. Filtros de Visualización en Wireshark"
order: 1
---

## 1. Dos Mecanismos de Filtrado con Objetivos Distintos

En Wireshark existen dos sistemas de filtrado completamente independientes que operan en diferentes fases del flujo de procesamiento de paquetes: los **Filtros de Captura** (*Capture Filters*) y los **Filtros de Visualización** (*Display Filters*).

Comprender la diferencia operativa y arquitectónica entre ambos es indispensable para el trabajo experimental riguroso en redes:

| Criterio | Filtros de Captura (*Capture Filters*) | Filtros de Visualización (*Display Filters*) |
| :--- | :--- | :--- |
| **Punto de ejecución** | Espacio del Kernel del sistema operativo (mecanismo BPF). | Espacio de Usuario (motor de análisis de Wireshark). |
| **Momento de aplicación** | **Antes** de que el paquete se grabe en memoria o disco. | **Después** de que los paquetes han sido capturados y almacenados. |
| **Sintaxis** | Sintaxis de la biblioteca `libpcap` / `tcpdump`. | Sintaxis propietaria de Wireshark basada en campos de disección. |
| **Impacto en los datos** | **Destructivo**: Los paquetes que no coinciden se descartan permanentemente. | **No destructivo**: Los paquetes ocultos permanecen intactos en el archivo `.pcapng`. |
| **Profundidad de inspección** | Limitada a cabeceras básicas (IP, puertos, protocolos simples). | Profunda: inspecciona cualquier campo de cualquier protocolo decodificado. |

---

## 2. Filtros de Captura (*Capture Filters*)

Los filtros de captura se compilan como código de máquina para el filtro de paquetes de Berkeley (**BPF** - *Berkeley Packet Filter*). Se configuran antes de presionar el botón de inicio de captura en la pantalla de selección de interfaz.

### 2.1 Sintaxis y Estructura BPF
Un filtro BPF consta de una o más expresiones primitivas combinadas mediante operadores lógicos (`and`, `or`, `not`):
- **Por dirección IP**:
  ```text
  host 192.168.1.105
  src host 10.0.0.1
  dst host 172.16.5.20
  ```
- **Por subred / máscara**:
  ```text
  net 192.168.1.0/24
  ```
- **Por puerto de transporte**:
  ```text
  port 80
  src port 53
  portrange 2000-2500
  ```
- **Por protocolo de capa de red o transporte**:
  ```text
  tcp
  udp
  icmp
  ip6
  ```
- **Combinaciones lógicas compuestas**:
  ```text
  tcp port 80 and host 128.119.245.12
  not port 22 and not port 53
  ```

---

## 3. Filtros de Visualización (*Display Filters*)

Los filtros de visualización se ingresan en la barra verde superior de la interfaz principal mientras se analiza una captura viva o un archivo guardado. Permiten realizar búsquedas semánticas sobre cualquier capa de la pila de protocolos.

### 3.1 Operadores de Comparación y Lógicos
- **Igualdad**: `==` o `eq`
- **Desigualdad**: `!=` o `ne`
- **Comparación cuantitativa**: `>`, `<`, `>=`, `<=`
- **Conjunción lógica**: `&&` o `and`
- **Disyunción lógica**: `||` o `or`
- **Negación**: `!` o `not`
- **Pertenencia a conjunto**: `in {valor1, valor2, ...}`
- **Búsqueda de subcadena**: `contains` o `matches` (expresión regular)

### 3.2 Ejemplos Esenciales para el Análisis de Tráfico Web y Redes
1. **Filtrar únicamente tráfico HTTP**:
   ```text
   http
   ```
2. **Filtrar por método de solicitud específico**:
   ```text
   http.request.method == "GET"
   http.request.method == "POST"
   ```
3. **Filtrar por código de estado devuelto por el servidor**:
   ```text
   http.response.code == 200
   http.response.code == 304
   http.response.code == 404
   ```
4. **Filtrar por dirección IP de origen o destino**:
   ```text
   ip.addr == 128.119.245.12
   ip.src == 192.168.1.45 && ip.dst == 128.119.245.12
   ```
5. **Filtrar intercambio de establecimiento de conexión TCP (Handshake)**:
   ```text
   tcp.flags.syn == 1
   ```
6. **Filtrar flujo de una conversación TCP completa (*TCP Stream*)**:
   ```text
   tcp.stream eq 0
   ```
   Esta directiva aísla todos los paquetes pertenecientes a una misma conexión de socket TCP de inicio a fin.
