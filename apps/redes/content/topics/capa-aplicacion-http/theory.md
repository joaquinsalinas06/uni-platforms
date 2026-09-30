---
kind: theory
title: "Capa de Aplicación y Protocolo HTTP (1.0 / 1.1 / 2)"
---

## 1. Principios de la Capa de Aplicación y Paradigmas de Red

La capa de aplicación es el nivel superior de la arquitectura de Internet donde se ejecutan los procesos de usuario. A diferencia de las capas inferiores implementadas en el kernel del sistema operativo y en conmutadores de hardware, las aplicaciones de red son programas distribuidos que se ejecutan exclusivamente en los sistemas terminales (*hosts* en la periferia de la red).

### 1.1 Arquitecturas de Red de Aplicación
Los servicios de red se diseñan habitualmente bajo dos paradigmas estructurales:

1. **Arquitectura Cliente-Servidor**:
   - **Servidor**: Host permanentemente encendido (*always-on*), con una dirección IP fija y conocida (o resuelta vía DNS), a menudo alojado en centros de datos masivos para permitir el escalado vertical y horizontal. Responde pasivamente a las solicitudes.
   - **Clientes**: Hosts que inician la comunicación activa bajo demanda. Pueden tener direcciones IP dinámicas y conectarse de manera intermitente. Los clientes no se comunican directamente entre sí.
   - *Ejemplos*: La Web (HTTP), el correo electrónico (SMTP/IMAP), sistemas de bases de datos centralizados.
2. **Arquitectura Peer-to-Peer (P2P)**:
   - No existe un servidor central continuo. Los sistemas terminales interactúan directamente entre sí como pares (*peers*), actuando simultáneamente como clientes y como servidores (*servents*).
   - Posee la propiedad intrínseca de **auto-escalabilidad** (*self-scalability*): cada nuevo par que se incorpora aporta capacidad de subida y procesamiento a la red al mismo tiempo que consume recursos.

### 1.2 La Abstracción del Socket de Red
Para comunicarse a través de la red, un proceso emisor transfiere sus mensajes hacia la capa de transporte a través de una interfaz de programación denominada **socket**:
- Un socket actúa como una **puerta lógica** entre el espacio de usuario (donde reside la lógica de aplicación) y el espacio de kernel del sistema operativo (donde reside la pila de transporte TCP/IP).
- El proceso creador del socket tiene control sobre los parámetros de la capa de aplicación, pero solo puede ajustar unos pocos parámetros de transporte (e.g., tamaño de búfer de recepción y emisión, tipo de servicio de transporte: TCP o UDP).

### 1.3 Requerimientos de Servicio hacia la Capa de Transporte
Las diferentes aplicaciones imponen distintas restricciones a los protocolos de transporte:

| Aplicación | Tolerancia a Pérdida | Sensibilidad al Throughput | Sensibilidad al Retardo / Jitter | Protocolo de Transporte Recomendado |
| :--- | :--- | :--- | :--- | :--- |
| **Transferencia de archivos (FTP)** | Cero pérdida (confiable) | Elástico (aprovecha lo disponible) | No sensible | **TCP** |
| **Navegación Web (HTTP)** | Cero pérdida (confiable) | Elástico | Moderadamente sensible | **TCP** (HTTP/1.1, HTTP/2) o **QUIC** (HTTP/3) |
| **Correo electrónico (SMTP)** | Cero pérdida (confiable) | Elástico | No sensible | **TCP** |
| **Telefonía IP / Videoconferencia** | Tolerante a pérdidas leves | Audio: 5-64 kbps, Video: 100 kbps - 5 Mbps | Crítica ($< 150-200\,\text{ms}$) | **UDP** o TCP |
| **Juegos en red interactivos** | Tolerante a pérdidas leves | Pocos kbps | Extrema ($< 50-100\,\text{ms}$) | **UDP** |

---

## 2. El Protocolo HTTP: Fundamentos y Arquitectura

El protocolo de transferencia de hipertexto (**HTTP** - *HyperText Transfer Protocol*) es el protocolo base de la World Wide Web. Define cómo los clientes web (navegadores) solicitan documentos y cómo los servidores web (e.g., Apache, Nginx) los suministran.

### 2.1 Estructura de Objetos de la Web y URLs
Una página web no es habitualmente un archivo único, sino una colección de **objetos** discretos. Un objeto puede ser un archivo HTML base, una imagen JPEG, un archivo de estilos CSS, un script JavaScript o un clip de audio.
- Cada objeto es direccionable de manera unívoca a través de un **Localizador Uniforme de Recursos (URL)**:
  $$\text{URL} = \underbrace{\text{http://}}_{\text{Esquema}} \underbrace{\text{www.ejemplo.edu}}_{\text{Nombre de Host}} \underbrace{\text{:80}}_{\text{Puerto (opcional)}} \underbrace{\text{/departamento/documento.html}}_{\text{Ruta del Recurso}}$$

### 2.2 Naturaleza sin Estado (*Stateless Nature*)
HTTP es un protocolo inherentemente **sin estado** (*stateless*):
- El servidor web no retiene ninguna memoria ni contexto sobre las peticiones previamente atendidas a un cliente determinado. Si un cliente solicita el mismo recurso dos veces consecutivas en un lapso de cinco segundos, el servidor procesa la segunda petición exactamente igual que la primera.
- **Razón de diseño**: Mantener "estado" en servidores que atienden millones de conexiones concurrentes requiere conservar tablas complejas de sesiones. Si un servidor se reinicia o se pierde la conexión, el estado se desincronizaría entre cliente y servidor. La simplicidad *stateless* permite a los servidores web escalar a niveles masivos y recuperarse trivialmente de fallos.

---

## 3. Conexiones No Persistentes vs. Persistentes

Históricamente, la forma en que HTTP utiliza las conexiones TCP subyacentes ha sufrido una transformación crítica para optimizar el rendimiento:

### 3.1 HTTP No Persistente (HTTP/1.0)
En HTTP no persistente, **cada objeto web transferido requiere la apertura y cierre de una conexión TCP completamente independiente**.

#### Pasos para la descarga de una página web con $M$ imágenes embebidas:
1. El cliente inicia una conexión TCP con el servidor (envío de segmento `SYN`).
2. El servidor responde con un segmento `SYN-ACK`. Se completa el *handshake* en **1 RTT**.
3. El cliente envía el mensaje `GET /index.html` combinándolo con el `ACK` del handshake. El servidor procesa la solicitud y devuelve el archivo HTML base. Esto toma **1 RTT** adicional más el tiempo de transmisión del archivo base ($S_{\text{base}} / R$).
4. El servidor cierra la conexión TCP.
5. El navegador examina el archivo HTML base y descubre referencias a $M$ objetos embebidos.
6. Para **cada uno** de los $M$ objetos, el navegador debe repetir exactamente el proceso: abrir una nueva conexión TCP (1 RTT) y emitir la solicitud/respuesta HTTP (1 RTT), acumulando $2 \cdot \text{RTT} + S_i/R$ por cada objeto.

Si los $M$ objetos se descargan secuencialmente, el tiempo total es:

$$T_{\text{no-persistente}} = 2 \cdot \text{RTT} + \frac{S_{\text{base}}}{R} + \sum_{i=1}^M \left( 2 \cdot \text{RTT} + \frac{S_i}{R} \right)$$

**Desventajas**:
- Desperdicio masivo de RTTs en handshakes redundantes.
- Sobrecarga severa de memoria y descriptores de socket en el sistema operativo del servidor.
- Cada nueva conexión inicia en la fase de **Arranque Lento (*Slow Start*)** de TCP, transmitiendo a una velocidad muy inferior a la capacidad del enlace.

### 3.2 HTTP Persistente (HTTP/1.1 por Defecto)
En HTTP persistente, el servidor mantiene abierta la conexión TCP después de enviar una respuesta. Las solicitudes y respuestas posteriores entre el mismo cliente y servidor se canalizan a través de la **misma conexión TCP abierta**.

#### 1. Persistente sin Encauzamiento (*without Pipelining*):
El cliente envía una nueva solicitud solo después de haber recibido completamente la respuesta del objeto anterior:
- Conexión inicial + HTML base: $2 \cdot \text{RTT} + S_{\text{base}}/R$.
- Cada objeto embebido: **solo 1 RTT** (solicitud/respuesta, sin handshake TCP) más el tiempo de transmisión.

$$T_{\text{persistente-sin-pipe}} = 2 \cdot \text{RTT} + \frac{S_{\text{base}}}{R} + \sum_{i=1}^M \left( \text{RTT} + \frac{S_i}{R} \right)$$

#### 2. Persistente con Encauzamiento (*with Pipelining*):
El cliente envía las solicitudes de todos los objetos referenciados en una ráfaga continua inmediatamente después de descubrir las referencias en el HTML base, sin esperar las respuestas individuales:
- Idealmente, todos los objetos se solicitan en un solo viaje de ida, requiriendo únicamente **1 RTT acumulado** para las solicitudes de los $M$ objetos (asumiendo suficiente ancho de banda):

$$T_{\text{pipelining}} \approx 2 \cdot \text{RTT} + \frac{S_{\text{base}}}{R} + \text{RTT} + \sum_{i=1}^M \frac{S_i}{R}$$

---

## 4. Sintaxis y Formato de los Mensajes HTTP

Los mensajes HTTP son secuencias de texto ASCII legible estructuradas en líneas terminadas en CRLF (`\r\n`).

### 4.1 Mensaje de Solicitud HTTP (*Request Message*)
Estructura general:
```http
[Línea de Solicitud: Método URI Versión] \r\n
[Cabecera 1]: [Valor 1] \r\n
[Cabecera 2]: [Valor 2] \r\n
...
\r\n
[Cuerpo de la Entidad (opcional, en POST o PUT)]
```

#### Métodos HTTP Estándar:
- **`GET`**: Solicita un recurso identificado por el URI. Los parámetros pueden enviarse codificados en el URI de consulta (*query string*).
- **`POST`**: Envía datos en el cuerpo de la entidad para ser procesados por el recurso identificado (e.g., envío de formularios).
- **`HEAD`**: Idéntico a `GET`, pero el servidor devuelve únicamente la línea de estado y las cabeceras, **omitiendo por completo el cuerpo de la entidad**. Se usa para depuración o para verificar si un recurso fue modificado sin descargarlo.
- **`PUT`**: Sube o reemplaza íntegramente el recurso ubicado en la ruta especificada.
- **`DELETE`**: Solicita la eliminación del recurso especificado en el servidor.

### 4.2 Mensaje de Respuesta HTTP (*Response Message*)
Estructura general:
```http
[Línea de Estado: Versión Código Frase] \r\n
[Cabecera 1]: [Valor 1] \r\n
[Cabecera 2]: [Valor 2] \r\n
...
\r\n
[Cuerpo de la Entidad: Datos del Objeto HTML, Imagen, etc.]
```

#### Códigos de Estado Fundamentales:
- **`1xx (Informativos)`**: `100 Continue`, `101 Switching Protocols`.
- **`2xx (Éxito)`**: 
  - `200 OK`: La solicitud fue exitosa y el recurso se envía en el cuerpo.
  - `201 Created`: Recurso creado exitosamente (tras un POST o PUT).
  - `204 No Content`: Solicitud atendida exitosamente pero sin cuerpo en la respuesta.
- **`3xx (Redirección)`**:
  - `301 Moved Permanently`: El recurso cambió de ubicación definitivamente; el nuevo URI viaja en la cabecera `Location:`.
  - `302 Found` / `307 Temporary Redirect`: Redirección temporal.
  - `304 Not Modified`: El recurso no ha sufrido cambios desde la fecha indicada en la cabecera condicional del cliente; el cuerpo viaja vacío.
- **`4xx (Errores del Cliente)`**:
  - `400 Bad Request`: Sintaxis de solicitud malformada o ininteligible por el servidor.
  - `401 Unauthorized`: El recurso requiere autenticación del usuario.
  - `403 Forbidden`: El servidor comprende la petición pero rehúsa autorizarla.
  - `404 Not Found`: El recurso solicitado no existe en la ruta indicada.
- **`5xx (Errores del Servidor)`**:
  - `500 Internal Server Error`: Condición inesperada en el software del servidor.
  - `502 Bad Gateway`: Error de comunicación con un servidor upstream en un proxy.
  - `503 Service Unavailable`: Servidor sobrecargado temporalmente o en mantenimiento.
  - `505 HTTP Version Not Supported`: El servidor no soporta la versión del protocolo HTTP especificada en la solicitud.

---

## 5. Evolución del Protocolo: HTTP/1.1 vs. HTTP/2 vs. HTTP/3

### 5.1 Limitaciones de HTTP/1.1 y el Bloqueo de Cabeza de Línea (HOL Blocking)
En HTTP/1.1, aunque se use una conexión persistente, las respuestas deben entregarse en el orden estricto en que fueron solicitadas. Si un objeto grande o complejo tarda en generarse en el servidor, todos los objetos subsiguientes quedan retenidos detrás de él, problema conocido como **Head-of-Line (HOL) Blocking a nivel de aplicación**.

### 5.2 Innovaciones de HTTP/2 (RFC 7540)
- **Capa de Enmarcado Binario (*Binary Framing Layer*)**: Reemplaza el texto ASCII por tramas binarias compactas (`HEADERS`, `DATA`, `SETTINGS`, etc.).
- **Multiplexación Total sobre una Sola Conexión TCP**: Permite entrelazar múltiples flujos (*streams*) bidireccionales independientes dentro del mismo socket TCP, eliminando el HOL blocking de aplicación.
- **Priorización de Streams**: El cliente asigna pesos y dependencias a los recursos para que el navegador reciba primero el CSS y el HTML antes que las imágenes secundarias.
- **Server Push**: El servidor puede enviar proactivamente recursos al cliente (e.g., enviar la hoja de estilos `style.css` junto con `index.html` antes de que el cliente la solicite).
- **Compresión de Cabeceras HPACK**: Reduce drásticamente la sobrecarga de cabeceras repetitivas mediante tablas dinámicas e índices Huffman.

### 5.3 HTTP/3 y el Protocolo QUIC (RFC 9000)
A pesar de la multiplexación de HTTP/2, subsiste una debilidad intrínseca: opera sobre TCP. Si un solo segmento TCP se pierde en la red, la cola de recepción de TCP detiene **todos los flujos multiplexados** hasta que el segmento perdido sea retransmitido, sufriendo **HOL Blocking a nivel de transporte**.

**HTTP/3 resuelve este cuello de botella migrando a QUIC sobre UDP**:
- Cada stream de datos es verdaderamente independiente en la capa de transporte: la pérdida de un paquete en un stream no interrumpe la entrega de los otros streams.
- Cifrado obligatorio y unificado mediante **TLS 1.3**, logrando establecimiento de conexión en 0-RTT (*Zero Round-Trip Time*) en conexiones reanudadas.
- Migración de conexión mediante identificadores de conexión (*Connection ID*), permitiendo cambiar de red Wi-Fi a red móvil celular sin interrumpir las descargas activas.

---

## 6. Ejercicio de Examen Resuelto: Tiempo de Descarga HTTP

### Enunciado (Basado en Examen Parcial UTEC)
Un usuario desea descargar una página web compuesta por un archivo HTML base y $M = 3$ imágenes pequeñas. El nombre de dominio no está en la caché local del host y requiere consultar **dos servidores DNS secuencialmente** de forma iterativa ($\text{RTT}_1 = 50\,\text{ms}$, $\text{RTT}_2 = 70\,\text{ms}$). Una vez obtenida la dirección IP, se accede al servidor web con una latencia $\text{RTT}_s = 100\,\text{ms}$. El archivo HTML base tiene un tamaño despreciable ($S_{\text{base}} \approx 0$). Cada una de las 3 imágenes tiene un tamaño de $S = 2\,\text{Mbits}$. La tasa de transmisión del enlace es $R = 10\,\text{Mbps}$.

Calcule el tiempo total transcurrido desde que el usuario hace clic hasta recibir completamente todas las imágenes bajo:
1. **Caso A**: HTTP No Persistente (conexiones TCP secuenciales).
2. **Caso B**: HTTP Persistente sin pipelining.
3. **Caso C**: HTTP Persistente con pipelining.

### Solución Paso a Paso:

#### 1. Tiempo de Resolución DNS Previo
La resolución DNS es obligatoria e idéntica para todos los casos:

$$T_{\text{DNS}} = \text{RTT}_1 + \text{RTT}_2 = 50\,\text{ms} + 70\,\text{ms} = 120\,\text{ms}$$

#### 2. Tiempo de Transmisión de cada Imagen
$$t_{\text{trans}} = \frac{S}{R} = \frac{2 \times 10^6\,\text{bits}}{10 \times 10^6\,\text{bps}} = 0.2\,\text{s} = 200\,\text{ms}$$

#### 3. Caso A: HTTP No Persistente Secuencial
- Para el archivo HTML base:
  - 1 Handshake TCP: $1 \cdot \text{RTT}_s$
  - 1 Solicitud/Respuesta HTTP: $1 \cdot \text{RTT}_s + \frac{S_{\text{base}}}{R} \approx 1 \cdot \text{RTT}_s$
  - Subtotal base: $2 \cdot \text{RTT}_s = 200\,\text{ms}$
- Para cada una de las 3 imágenes secuenciales:
  - Cada imagen requiere 1 conexión TCP ($1 \cdot \text{RTT}_s$) + 1 petición HTTP ($1 \cdot \text{RTT}_s$) + transmisión ($t_{\text{trans}}$):
  $$T_{\text{imagen}} = 2 \cdot \text{RTT}_s + t_{\text{trans}} = 2 \cdot (100\,\text{ms}) + 200\,\text{ms} = 400\,\text{ms}$$
- Para las 3 imágenes: $3 \times 400\,\text{ms} = 1200\,\text{ms}$.
- **Tiempo Total Caso A**:
  $$T_{\text{total, A}} = T_{\text{DNS}} + 2 \cdot \text{RTT}_s + 3 \cdot (2 \cdot \text{RTT}_s + t_{\text{trans}}) = 120 + 200 + 1200 = 1520\,\text{ms} = 1.52\,\text{s}$$

#### 4. Caso B: HTTP Persistente sin Pipelining
- Para el archivo HTML base:
  - Handshake TCP inicial: $1 \cdot \text{RTT}_s$
  - Solicitud/Respuesta HTML base: $1 \cdot \text{RTT}_s$
  - Subtotal base: $2 \cdot \text{RTT}_s = 200\,\text{ms}$
- Para cada una de las 3 imágenes:
  - La conexión TCP ya está abierta. Cada imagen requiere secuencialmente solo 1 petición HTTP ($1 \cdot \text{RTT}_s$) + transmisión ($t_{\text{trans}}$):
  $$T_{\text{imagen}} = \text{RTT}_s + t_{\text{trans}} = 100\,\text{ms} + 200\,\text{ms} = 300\,\text{ms}$$
- Para las 3 imágenes: $3 \times 300\,\text{ms} = 900\,\text{ms}$.
- **Tiempo Total Caso B**:
  $$T_{\text{total, B}} = T_{\text{DNS}} + 2 \cdot \text{RTT}_s + 3 \cdot (\text{RTT}_s + t_{\text{trans}}) = 120 + 200 + 900 = 1220\,\text{ms} = 1.22\,\text{s}$$

#### 5. Caso C: HTTP Persistente con Pipelining
- Base: $T_{\text{DNS}} + 2 \cdot \text{RTT}_s = 320\,\text{ms}$.
- Pipelining de imágenes: Las 3 solicitudes se envían juntas en un solo RTT de ida y vuelta, y los datos se transmiten consecutivamente:
  $$T_{\text{imágenes}} = \text{RTT}_s + 3 \cdot t_{\text{trans}} = 100\,\text{ms} + 3 \cdot (200\,\text{ms}) = 700\,\text{ms}$$
- **Tiempo Total Caso C**:
  $$T_{\text{total, C}} = 120 + 200 + 700 = 1020\,\text{ms} = 1.02\,\text{s}$$
