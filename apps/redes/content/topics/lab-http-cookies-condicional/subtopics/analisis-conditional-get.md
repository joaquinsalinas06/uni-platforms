---
kind: subtopic
title: "Análisis de HTTP Conditional GET en Wireshark"
order: 1
---

## Mecanismo de Descarga Condicional en HTTP

El mecanismo de **Conditional GET** es una funcionalidad fundamental de HTTP/1.1 (RFC 7232 y RFC 9110) diseñada para permitir que los clientes y proxies de almacenamiento en caché (*web caches*) validen la frescura de un objeto almacenado localmente sin necesidad de retransmitir el cuerpo del mensaje si el contenido no ha cambiado.

Cuando un navegador solicita un objeto web por primera vez, el servidor web envía una respuesta con código de estado `200 OK` que incluye el cuerpo del archivo y dos encabezados de validación críticos:

```http
HTTP/1.1 200 OK
Date: Wed, 01 Oct 2026 14:20:00 GMT
Server: Apache/2.4.52 (Ubuntu)
Last-Modified: Mon, 15 Sep 2026 08:30:00 GMT
ETag: "3a8b-5dc1234a5b6c0"
Content-Length: 15403
Content-Type: text/html; charset=UTF-8
```

1. **`Last-Modified`**: Marca temporal en formato HTTP-date que indica el último momento en que el archivo fue modificado en el sistema de archivos del servidor.
2. **`ETag` (*Entity Tag*)**: Un identificador opaco o hash criptográfico generado por el servidor para esa versión específica del recurso.

### Estructura de la Segunda Petición (Conditional GET)

Cuando el usuario recarga la página o el navegador requiere el recurso nuevamente, consulta su caché local. Al encontrar que el objeto ha expirado según su directiva `Cache-Control` o `Expires`, pero posee una copia local, el cliente emite una petición condicional inyectando el encabezado `If-Modified-Since` (o `If-None-Match`):

```http
GET /lab1/index.html HTTP/1.1
Host: redes.utec.edu.pe
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: text/html,application/xhtml+xml
If-Modified-Since: Mon, 15 Sep 2026 08:30:00 GMT
If-None-Match: "3a8b-5dc1234a5b6c0"
Connection: keep-alive
```

El servidor compara la fecha recibida con la marca de modificación real del archivo en disco.

---

## Inspección de Paquetes en Wireshark

Al capturar esta secuencia en Wireshark aplicando el filtro de visualización `http`:

### Paquete 1: Petición Inicial
- **Filtro**: `http.request.method == "GET"`
- **Frame details**: Contiene los encabezados estándar. No incluye `If-Modified-Since`.
- **Transmission Time**: El servidor responde con múltiples segmentos TCP debido a que el tamaño del archivo excede el MSS (1460 bytes).

### Paquete 2: Respuesta Inicial
- **Frame details**: `HTTP/1.1 200 OK`
- **Reassembled TCP Segments**: En el árbol de disección de Wireshark se aprecia el bloque `[Reassembled PDU in frame: X]`.
- **Payload**: Wireshark muestra los 15,403 bytes descargados efectivamente en la capa de transporte.

### Paquete 3: Petición Condicional
- **Árbol de Wireshark**: Bajo `Hypertext Transfer Protocol`, se observa el campo `If-Modified-Since: Mon, 15 Sep 2026 08:30:00 GMT\r\n`.

### Paquete 4: Respuesta del Servidor (304 Not Modified)
```http
HTTP/1.1 304 Not Modified
Date: Wed, 01 Oct 2026 14:35:12 GMT
Server: Apache/2.4.52 (Ubuntu)
ETag: "3a8b-5dc1234a5b6c0"
Connection: keep-alive
```

En la captura de Wireshark se constatan tres propiedades determinantes:
1. **Ausencia de `Content-Length` o `Content-Type`**: Dado que no existe entidad en el mensaje, no se envía carga útil.
2. **Tamaño del Segmento TCP**: La respuesta completa cabe en un único segmento TCP de aproximadamente 180 a 220 bytes (solo cabeceras HTTP y TCP/IP).
3. **Bandwidth Savings**: Si el archivo pesaba 15 KB, el ahorro de ancho de banda supera el 98% en cada validación positiva.

---

## Análisis Cuantitativo de Latencia y Tráfico

Consideremos un enlace de acceso institucional con tasa $R = 10\text{ Mbps}$ y un $RTT = 80\text{ ms}$ hacia el servidor de origen.

Para un objeto de $S = 2\text{ MB} = 16\text{ Mbits}$:

1. **Descarga Completa (`200 OK`)**:
   $$\text{Tiempo de transmisión} = \frac{S}{R} = \frac{16 \times 10^6\text{ bits}}{10 \times 10^6\text{ bps}} = 1.6\text{ s}$$
   $$\text{Tiempo total} = RTT + \frac{S}{R} = 0.08\text{ s} + 1.6\text{ s} = 1.68\text{ s}$$

2. **Validación Condicional (`304 Not Modified`)**:
   $$S_{304} \approx 200\text{ bytes} = 1600\text{ bits}$$
   $$\text{Tiempo de transmisión} = \frac{1600}{10^7} = 0.00016\text{ s} = 0.16\text{ ms}$$
   $$\text{Tiempo total} = RTT + \frac{S_{304}}{R} \approx 80.16\text{ ms}$$

El ahorro en tiempo de respuesta percibido por el usuario es de más del 95%, reduciendo drásticamente la congestión en los routers de frontera.
