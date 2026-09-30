---
kind: theory
title: "Laboratorio: Wireshark y Captura Inicial de HTTP"
---

## 1. Fundamentos de un Analizador de Paquetes (*Packet Sniffer*)

Un analizador de protocolos o *packet sniffer* es una herramienta de software y hardware diseñada para interceptar, registrar y decodificar el tráfico de datos que fluye a través de una interfaz de red física o virtual. 

A diferencia del software de usuario convencional (navegadores web, reproductores multimedia) que solo recibe los datos expresamente dirigidos a los sockets que tiene abiertos, un analizador de paquetes opera en estrecha interacción con las capas inferiores del sistema operativo:

### 1.1 Arquitectura Interna de Wireshark
Wireshark se estructura en dos subsistemas principales:
1. **Mecanismo de Captura de Paquetes (*Packet Capture Library*)**:
   - En sistemas tipo Unix/Linux y macOS se basa en la biblioteca `libpcap`.
   - En sistemas Windows utiliza `Npcap` (o la histórica `WinPcap`).
   - Esta biblioteca interactúa directamente con los controladores de red (*network device drivers*) en el espacio de kernel del sistema operativo.
   - Pone a la tarjeta de interfaz de red (NIC) en **modo promiscuo** (*promiscuous mode*). En este modo, la tarjeta de red no descarta las tramas cuya dirección MAC de destino difiere de la suya propia, sino que copia y transfiere **todas** las tramas físicas que circulan por el canal hacia la memoria del sistema.
   - Debido al acceso directo a la capa de enlace, la captura de paquetes requiere privilegios elevados (superusuario `root` en Linux/macOS o Administrador en Windows).
2. **Analizador y Diseccionador de Protocolos (*Packet Dissector*)**:
   - Reside en el espacio de usuario.
   - Recibe los bytes crudos capturados por la biblioteca del kernel.
   - Interpreta la sintaxis y semántica de las cabeceras de cientos de protocolos (Ethernet, ARP, IPv4, IPv6, ICMP, TCP, UDP, DNS, HTTP, etc.), reconstruyendo la estructura jerárquica de capas.

---

## 2. Anatomía de la Interfaz Gráfica de Wireshark

Al realizar una captura, la ventana de Wireshark organiza la información en tres paneles visuales sincronizados:

### 2.1 Panel de Lista de Paquetes (*Packet-Listing Window*)
Muestra una tabla con una fila por cada paquete capturado. Las columnas predeterminadas incluyen:
- **No.**: Número secuencial del paquete dentro del archivo de captura (comenzando en 1).
- **Time**: Marca de tiempo del arribo del paquete, expresada por defecto en segundos transcurridos desde el inicio de la captura.
- **Source**: Dirección de origen (IP o MAC) del host que originó el paquete.
- **Destination**: Dirección de destino (IP o MAC).
- **Protocol**: Protocolo de nivel más alto identificado en el paquete (e.g., `HTTP`, `TCP`, `DNS`).
- **Length**: Longitud total del paquete capturado en bytes.
- **Info**: Resumen contextual conciso generado por el dissector (e.g., `GET /HTTP-wireshark-file1.html HTTP/1.1` o `HTTP/1.1 200 OK (text/html)`).

### 2.2 Panel de Detalles del Paquete (*Packet-Details Window*)
Presenta una vista jerárquica en forma de árbol que refleja con exactitud la pila de protocolos por la que fue encapsulado el paquete:
- **Frame**: Metadatos físicos de la captura generados por la interfaz (longitud en el medio, timestamp con precisión de microsegundos, número de interfaz).
- **Ethernet II**: Cabecera de capa de enlace (MAC de origen, MAC de destino y EtherType `0x0800` para IPv4).
- **Internet Protocol Version 4**: Cabecera de capa de red (direcciones IP origen/destino, TTL, Protocol `6` para TCP, Checksum).
- **Transmission Control Protocol**: Cabecera de capa de transporte (puerto de origen, puerto de destino, números de secuencia y ACK, flags TCP `[ACK]`, `[SYN]`, `[PSH]`).
- **Hypertext Transfer Protocol**: Datos de la capa de aplicación (solicitud o respuesta HTTP en texto ASCII decodificado).

### 2.3 Panel de Contenido de Bytes (*Packet-Bytes Window*)
Muestra los bytes binarios exactos del paquete en formato crudo:
- A la izquierda se presenta el desplazamiento en bytes (*offset*) en formato hexadecimal.
- En el centro se exponen los valores binarios en hexadecimal (e.g., `47 45 54 20` corresponde a la cadena ASCII `GET `).
- A la derecha se muestra la representación en caracteres ASCII imprimibles (sustituyendo los bytes de control no imprimibles por puntos `.`).

---

## 3. Protocolo de Práctica: Captura Inicial de HTTP

Para observar la interacción básica de solicitud y respuesta HTTP sin interferencia de cifrado:

### 3.1 Procedimiento de Captura
1. **Configuración de Permisos en Linux**:
   ```bash
   sudo dpkg-reconfigure wireshark-common
   sudo usermod -aG wireshark $USER
   ```
2. **Inicio del Analizador**:
   - Ejecutar Wireshark y seleccionar la interfaz activa (e.g., `eth0`, `en0` o `wlan0`).
3. **Establecimiento del Filtro de Visualización**:
   - En la barra de filtro de visualización superior, escribir `http` y presionar Enter. Esto garantiza que solo los paquetes decodificados como HTTP aparezcan en el panel superior, ocultando temporalmente el tráfico de fondo del sistema operativo.
4. **Emisión de la Petición Web**:
   - Abrir un navegador e ingresar la URL del laboratorio:
     `http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file1.html`
   > **Nota Crítica**: El enlace debe usar estrictamente `http://` y no `https://`. Si se utilizase HTTPS, la capa TLS (Transport Layer Security) cifraría el flujo TCP completo, impidiendo a Wireshark diseccionar las cabeceras HTTP en texto plano.
5. **Detención de la Captura**:
   - Presionar el botón rojo cuadrado de parada en la barra de herramientas de Wireshark.

---

## 4. Análisis Detallado de las Tramas Capturadas

En la interacción básica, Wireshark aísla dos tramas HTTP principales:

### 4.1 Trama de Solicitud: HTTP GET
Al seleccionar el paquete con el método `GET`, el panel de detalles revela la estructura del mensaje de solicitud generado por el navegador:
- **Línea de Solicitud (*Request Line*)**:
  ```http
  GET /wireshark-labs/HTTP-wireshark-file1.html HTTP/1.1\r\n
  ```
- **Cabeceras HTTP Clave**:
  - `Host: gaia.cs.umass.edu`: Dominio solicitado (indispensable para alojamiento virtual multi-dominio en un mismo servidor IP).
  - `User-Agent`: Cadena identificadora del navegador, motor de renderizado y sistema operativo cliente.
  - `Accept`: Tipos MIME que el cliente es capaz de procesar (e.g., `text/html,application/xhtml+xml`).
  - `Accept-Language`: Preferencias idiomáticas del usuario (e.g., `es-ES,es;q=0.9,en;q=0.8`).
  - `Accept-Encoding`: Métodos de compresión soportados (e.g., `gzip, deflate`).
  - `Connection: keep-alive`: Solicitud para mantener abierta la conexión TCP subyacente.

### 4.2 Trama de Respuesta: HTTP 200 OK
Al seleccionar el paquete de respuesta devuelto por el servidor web `gaia.cs.umass.edu`:
- **Línea de Estado (*Status Line*)**:
  ```http
  HTTP/1.1 200 OK\r\n
  ```
- **Cabeceras de la Respuesta**:
  - `Date`: Fecha y hora exacta de generación de la respuesta en el servidor en formato GMT/UTC.
  - `Server`: Software del servidor web (e.g., `Apache/2.4.6 (CentOS)`).
  - `Last-Modified`: Marca temporal de la última edición del recurso HTML en el disco del servidor.
  - `ETag`: Hash de validación de entidad (*Entity Tag*).
  - `Content-Length`: Longitud exacta en bytes del cuerpo del mensaje HTML (e.g., `128 bytes`).
  - `Content-Type`: Tipo de medio del recurso devuelto (`text/html; charset=UTF-8`).
- **Cuerpo del Mensaje (*Entity Body*)**:
  - El código HTML textual transferido, que el navegador renderiza en la pantalla del usuario.
