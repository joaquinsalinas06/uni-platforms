---
kind: subtopic
title: "Inspección de Tramas y Análisis del Mensaje HTTP Inicial"
order: 2
---

## 1. Desglose Estructurado de la Interacción HTTP GET / 200 OK

En la experiencia inicial del laboratorio de redes, un cliente web interactúa con el servidor de prueba académico `gaia.cs.umass.edu` solicitando el archivo de texto simple `HTTP-wireshark-file1.html`. Al capturar este evento con Wireshark y filtrar con `http`, se analiza la anatomía completa de las dos tramas que componen la transacción:

### 1.1 Trama de Solicitud (Cliente $\to$ Servidor)
La selección de la trama `GET` en el panel de detalles despliega la jerarquía de protocolos anidados:

1. **Frame (Capa Física)**:
   - Indica el número de bytes capturados en el medio físico (típicamente entre 400 y 600 bytes, correspondientes a cabeceras más la solicitud HTTP).
   - Timestamp de alta precisión que marca el instante exacto de recepción en la NIC.
2. **Ethernet II (Capa de Enlace)**:
   - `Destination MAC`: Corresponde a la dirección física del enrutador por defecto (*default gateway*) de la red local del cliente, no a la del servidor remoto.
   - `Source MAC`: Dirección física del adaptador de red del cliente.
   - `Type: IPv4 (0x0800)`: Declara que la carga útil es un datagrama de red IPv4.
3. **Internet Protocol Version 4 (Capa de Red)**:
   - `Source IP`: Dirección IPv4 privada asignada al host cliente (e.g., `192.168.1.100` o asignación institucional).
   - `Destination IP`: Dirección IPv4 pública de `gaia.cs.umass.edu` (e.g., `128.119.245.12`).
   - `Time to Live (TTL)`: Valor inicial fijado por el sistema operativo cliente (típicamente 64 en Linux/macOS o 128 en Windows).
   - `Protocol: TCP (6)`: Especifica el protocolo de transporte receptor.
4. **Transmission Control Protocol (Capa de Transporte)**:
   - `Source Port`: Puerto efímero generado aleatoriamente por el sistema operativo cliente para esa conexión (e.g., `54321`).
   - `Destination Port: 80`: Puerto estándar para el servicio web HTTP no seguro.
   - `Sequence Number: 1` y `Acknowledgment Number: 1` (números relativos en Wireshark).
5. **Hypertext Transfer Protocol (Capa de Aplicación)**:
   ```http
   GET /wireshark-labs/HTTP-wireshark-file1.html HTTP/1.1\r\n
   Host: gaia.cs.umass.edu\r\n
   User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...\r\n
   Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n
   Accept-Language: en-US,en;q=0.5\r\n
   Accept-Encoding: gzip, deflate\r\n
   Connection: keep-alive\r\n
   \r\n
   ```
   Cada línea termina estrictamente con la secuencia binaria ASCII Carriage Return y Line Feed (`\r\n` o `0x0D 0x0A`). La línea vacía final (`\r\n` solitario) señaliza el fin de las cabeceras.

---

## 2. Trama de Respuesta (Servidor $\to$ Cliente)

Al seleccionar la trama de respuesta `HTTP/1.1 200 OK`:

```http
HTTP/1.1 200 OK\r\n
Date: Mon, 15 Aug 2026 14:22:10 GMT\r\n
Server: Apache/2.4.6 (CentOS)\r\n
Last-Modified: Mon, 15 Aug 2026 14:21:45 GMT\r\n
ETag: "80-5a3d-4c31e9a0"\r\n
Accept-Ranges: bytes\r\n
Content-Length: 128\r\n
Keep-Alive: timeout=5, max=100\r\n
Connection: Keep-Alive\r\n
Content-Type: text/html; charset=UTF-8\r\n
\r\n
<html>
Congratulations!  You have downloaded the first Wireshark lab HTML file!
</html>
```

### Significado de los Campos Clave de Respuesta
- **Línea de Estado**: `HTTP/1.1` indica la versión del protocolo implementada por el servidor web Apache. El código `200` y la frase `OK` confirman que el recurso solicitado fue encontrado y se transfiere exitosamente en el cuerpo de la respuesta.
- **`Date`**: Momento en que el servidor web despachó la respuesta.
- **`Last-Modified`**: Fecha en que el recurso en disco fue modificado por última vez.
  > **Nota del servidor pedagógico de UMass**: En este laboratorio en vivo, el servidor `gaia.cs.umass.edu` actualiza automáticamente el timestamp del archivo `file1.html` una vez por minuto. Por ello, la fecha de `Last-Modified` siempre se ubica dentro de los últimos 60 segundos previos a la descarga.
- **`Content-Length`**: Tamaño exacto del payload HTML (`128` bytes). Permite al cliente saber cuándo finaliza el mensaje sin cerrar la conexión TCP.
- **`Keep-Alive`**: Especifica los parámetros de persistencia de la conexión (e.g., esperar hasta 5 segundos de inactividad o un máximo de 100 peticiones adicionales).

---

## 3. Resolución Rigurosa de las Preguntas del Laboratorio (Checkpoint 01)

1. **¿Qué versiones de HTTP ejecutan el navegador y el servidor?**
   - El navegador cliente especifica `HTTP/1.1` en la línea de solicitud.
   - El servidor responde con `HTTP/1.1` en la línea de estado. Ambos negocian y utilizan la versión 1.1 de forma idéntica.
2. **¿Qué idiomas indica el navegador que puede aceptar?**
   - Se determina inspeccionando la cabecera `Accept-Language:`. Por ejemplo, `en-US,en;q=0.5` declara preferencia por inglés estadounidense (ponderación $q=1.0$ implícita) seguido por inglés general ($q=0.5$).
3. **¿Cuáles son las direcciones IP del cliente y del servidor?**
   - Se extraen de la cabecera IPv4 en el panel de detalles: `Source IP` en la solicitud identifica al cliente, y `Destination IP` identifica al servidor `gaia.cs.umass.edu` (`128.119.245.12`).
4. **¿Cuál es el código de estado devuelto?**
   - Código `200` con frase asociada `OK`.
5. **¿Cuál es el tamaño de la entidad devuelta en bytes?**
   - Se cuantifica a través del valor numérico de la cabecera `Content-Length:` (en este experimento, 128 bytes).
6. **Manejo de peticiones accesorias (`favicon.ico`)**:
   - Muchos navegadores modernos emiten en paralelo una solicitud `GET /favicon.ico HTTP/1.1`. Esto corresponde a la petición automática del navegador para obtener el icono que se muestra en la pestaña visual. En el análisis del protocolo debe aislarse y filtrarse para no distorsionar el conteo de peticiones del documento principal.
