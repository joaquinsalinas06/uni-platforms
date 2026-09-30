---
kind: theory
title: "Laboratorio: Análisis DNS con nslookup y Wireshark"
---

## 1. Objetivos y Fundamentos Experimentales

El presente laboratorio tiene como propósito analizar de manera empírica el funcionamiento del Sistema de Nombres de Dominio (DNS), contrastando los conceptos teóricos de la arquitectura jerárquica con el comportamiento real de los paquetes en la red. Mediante el uso combinado de utilidades de diagnóstico a nivel de línea de comandos (`nslookup`, `ipconfig`, `systemd-resolve`) y el analizador de protocolos de red **Wireshark**, se investiga:
1. La consulta activa y diferenciada de diversos tipos de registros de recursos (A, AAAA, MX, NS, ANY, PTR).
2. La distinción práctica entre respuestas autoritativas y no autoritativas (provenientes de caché).
3. La estructura binaria de las cabeceras de consulta y respuesta DNS transmitidas sobre UDP y TCP en el puerto 53.
4. El encadenamiento temporal estricto entre la resolución DNS, el establecimiento de conexión de la capa de transporte (TCP Three-Way Handshake) y la transferencia en la capa de aplicación (HTTP GET).
5. Las consecuencias de la conmutación de protocolo cuando se activa el flag de truncamiento (`TC = 1`).

## 2. Herramientas de Diagnóstico: nslookup y Gestión de Caché

### 2.1. La Utilidad nslookup
`nslookup` (*Name Server Lookup*) es una herramienta estándar de diagnóstico de red disponible de forma nativa en sistemas operativos Windows, Linux y macOS. Permite interactuar directamente con servidores DNS sin pasar por las capas intermedias de un navegador web:
- **Modo interactivo**: Se inicia ejecutando simplemente `nslookup`. El indicador de comandos cambia al símbolo `>`, permitiendo ingresar instrucciones como `set type=mx`, `server 8.8.8.8` o consultas directas de nombres.
- **Modo de comando directo**: Se invoca con la sintaxis `nslookup [-opciones] <dominio-objetivo> [servidor-dns]`. Por ejemplo:
  ```bash
  nslookup -type=MX utec.edu.pe
  nslookup -type=NS mit.edu
  nslookup www.mit.edu 8.8.8.8
  ```

### 2.2. Gestión y Purga del Caché del Resolver Local
Para observar el tráfico DNS real en Wireshark, es imprescindible forzar que el sistema operativo emita una consulta a la red en lugar de responder internamente desde su tabla de memoria. Las instrucciones para inspeccionar y vaciar el caché varían según la plataforma:
- **Windows**:
  - Inspección de entradas actuales: `ipconfig /displaydns`
  - Vaciado forzado: `ipconfig /flushdns`
  - Verificación de adaptadores y resolvers configurados: `ipconfig /all`
- **Linux (con systemd-resolved)**:
  - Estado de resolvers: `resolvectl status`
  - Vaciado forzado: `sudo systemd-resolve --flush-caches` o `resolvectl flush-caches`
- **macOS**:
  - Vaciado forzado del daemon de resolución: `sudo killall -HUP mDNSResponder`

## 3. Análisis de Consultas y Registros Específicos

### 3.1. Consultas de Servidores de Correo (Tipo MX) y Jerarquía de Prioridades
Al ejecutar `set type=mx` en `nslookup` e ingresar dominios como `cisco.com` o `gmail.com`, la respuesta contiene múltiples registros MX:
- Cada registro está acompañado de un entero que denota el nivel de preferencia (por ejemplo, preferencia 10 frente a preferencia 20).
- La especificación dicta que el agente de transferencia de correo emisor debe intentar la conexión SMTP priorizando el menor valor numérico.
- La existencia de múltiples registros provee tolerancia a fallos: si el servidor primario (menor costo) no responde en un intervalo de timeout, el remitente recurre de forma transparente al servidor secundario.
- **Diferencia entre raíz y subdominio www**: Realizar una consulta MX para `cisco.com` devuelve los servidores de correo legítimos, mientras que consultarlo para `www.cisco.com` habitualmente no devuelve registros MX. Las organizaciones no configuran MX en subdominios de navegación porque el correo electrónico se envía al dominio corporativo base (`usuario@cisco.com`), evitando redundancias innecesarias en los archivos de zona.

### 3.2. Respuestas Autoritativas vs No Autoritativas
En la salida de `nslookup`, una leyenda recurrente es `Non-authoritative answer` (*Respuesta no autoritativa*):
- **Respuesta no autoritativa**: Ocurre cuando el servidor DNS consultado (usualmente el resolver del ISP, de la universidad o un resolver público como 8.8.8.8) responde utilizando una copia previamente guardada en su memoria caché local, o cuando ha obtenido la información de un servidor intermedio sin poseer el archivo maestro de la zona.
- **Respuesta autoritativa**: Ocurre cuando la consulta se dirige directamente al servidor oficial designado por la organización (por ejemplo, interrogando a los servidores listados en los registros NS de MIT o Cisco). En este caso, el servidor marca el bit `AA = 1` en la cabecera DNS.

### 3.3. Consultas Directas y Políticas de Rechazo (Refused Queries)
Cuando se ejecuta una consulta directa especificando un servidor DNS institucional remoto (e.g., `nslookup www.aiit.or.kr bitsy.mit.edu`):
- El cliente envía la consulta con destino a la IP de `bitsy.mit.edu` en lugar de su resolver local habitual.
- Frecuentemente, el servidor universitario responde con un código de error **REFUSED (RCODE 5)** o no responde.
- Esto responde a políticas de seguridad estándar: los servidores DNS autoritativos y resolvers corporativos restringen la **recursión abierta** (*Open Resolver*), impidiendo que clientes externos a su red resuelvan dominios de terceros a través de ellos, evitando así que su infraestructura sea utilizada como reflector en ataques masivos de amplificación DDoS.

## 4. Inspección de Paquetes en Wireshark

Al aplicar el filtro de captura o visualización `dns` en Wireshark, cada transacción se compone de dos datagramas UDP: la consulta (*Query*) y la respuesta (*Response*).

### 4.1. Capa de Transporte (UDP vs TCP)
- **Protocolo**: En condiciones normales, DNS utiliza **UDP** como mecanismo de transporte. En la cabecera IP, el campo *Protocol* tiene el valor decimal **17** (`0x11` en hexadecimal).
- **Puertos**:
  - En la consulta: Puerto de origen efímero asignado dinámicamente por el sistema operativo (e.g., `54210`), y puerto de destino **53**.
  - En la respuesta: Puerto de origen **53**, y puerto de destino igual al puerto efímero de la consulta (`54210`).
- **Justificación de UDP**: Permite obtener la traducción en un único intercambio de ida y vuelta (0 RTT de sobrecarga previa), sin el costo computacional ni el retardo adicional de 1 RTT que demandaría el handshake SYN/ACK de TCP.

### 4.2. Inspección de la Cabecera y Banderas (Flags)
Al expandir la cabecera del protocolo DNS en Wireshark:
- **Transaction ID**: Valor de 16 bits idéntico en la consulta y en la respuesta.
- **Flags en la consulta**:
  - `Flags: 0x0100`: Corresponde al bit `Query (0)` con el flag `Recursion Desired (RD = 1)` activo.
- **Flags en la respuesta**:
  - `Flags: 0x8180`: Corresponde a `Response (1)`, `Recursion Desired (1)`, `Recursion Available (1)`, `Authoritative (0)` y `Reply code: No error (0)`.
- **Flag de Truncamiento (TC)**:
  Si una respuesta DNS excede la capacidad de 512 bytes de un paquete UDP clásico (situación que puede presentarse al consultar `nslookup -type=ANY google.com`), el servidor responde con `TC = 1`. Wireshark evidencia que el cliente genera de inmediato un segmento **TCP SYN** al puerto 53 para reintentar la transacción completa sobre TCP.

## 5. El Intercambio Temporal: Secuencia DNS $\to$ TCP $\to$ HTTP

El rastreo conjunto con el filtro `dns || tcp || http` revela la secuencia estricta indispensable para la navegación web:
1. **Fase DNS**:
   - El navegador no puede enviar ningún paquete IP al servidor web sin conocer su dirección de destino.
   - Envío de *DNS Standard query A www.sitio.com*.
   - Recepción de *DNS Standard query response* con la dirección IP correspondiente.
   - Retardo medido: $\Delta t_{\text{DNS}} = t_{\text{DNS\_resp}} - t_{\text{DNS\_query}}$.
2. **Fase de Conexión TCP**:
   - Una vez obtenida la IP, la pila del cliente inicia el handshake de 3 vías con el servidor web en el puerto 80 (HTTP) o 443 (HTTPS).
   - Envío de segmento `[SYN]`.
   - Recepción de segmento `[SYN, ACK]`.
   - Envío de segmento `[ACK]`.
   - Retardo medido: $\Delta t_{\text{TCP}} = t_{\text{TCP\_ACK}} - t_{\text{TCP\_SYN}} \approx \text{RTT}_0$.
3. **Fase de Aplicación HTTP**:
   - El cliente envía la solicitud `GET / HTTP/1.1`.
   - El servidor web procesa la petición y entrega el contenido con el código de estado `HTTP/1.1 200 OK`.
   - Retardo medido: $\Delta t_{\text{HTTP}} = t_{\text{HTTP\_200}} - t_{\text{HTTP\_GET}}$.

El retardo total acumulado experimentado por el usuario antes de visualizar el primer byte de información es:
$$T_{\text{sesion}} = \Delta t_{\text{DNS}} + \Delta t_{\text{TCP}} + \Delta t_{\text{HTTP}}$$

Si el usuario refresca la página inmediatamente sin limpiar el caché, la fase DNS toma $0\text{ ms}$ (eliminada por completo gracias al caché local del sistema operativo), e incluso la fase TCP puede evitarse si la conexión persistente (*HTTP Keep-Alive*) continúa abierta, reduciendo radicalmente el tiempo de carga.
