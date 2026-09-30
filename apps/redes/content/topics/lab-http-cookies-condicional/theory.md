---
kind: theory
title: "Laboratorio: Análisis Avanzado HTTP con Wireshark"
---

## 1. Objetivos del Laboratorio Avanzado de HTTP

Este laboratorio experimental profundiza en las interacciones avanzadas del protocolo HTTP en la práctica:
1. Inspección empírica del mecanismo de **Conditional GET** y el código de respuesta `304 Not Modified`.
2. Segmentación de mensajes HTTP voluminosos a través de múltiples segmentos de la capa de transporte TCP.
3. Descarga concurrente de documentos con **objetos embebidos** alojados en servidores heterogéneos.
4. Análisis del esquema de **Autenticación HTTP Básica** (*HTTP Basic Authentication*), sus trazas de red y sus vulnerabilidades críticas de seguridad.

---

## 2. Experimento: Interacción HTTP Conditional GET

El objetivo es comprobar cómo el navegador y el servidor coordinan la validación de frescura de la caché sin transmitir datos redundantes.

### 2.1 Procedimiento Experimental
1. Limpiar completamente la memoria caché del navegador web.
2. Iniciar la captura de paquetes en Wireshark y filtrar con `http`.
3. Ingresar en el navegador la URL:
   `http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file2.html`
4. Observar la descarga del documento HTML breve (5 líneas de texto).
5. Sin cerrar el navegador ni la captura, presionar inmediatamente el botón de **Recargar / Refrescar (*F5*)** en la misma página.
6. Detener la captura de Wireshark.

### 2.2 Análisis de Trazas (Checkpoint 02)
- **Primera Petición GET**:
  - En la primera solicitud emitida tras limpiar la caché, el navegador **no incluye** la cabecera `If-Modified-Since`.
  - El servidor responde con `HTTP/1.1 200 OK`, entregando el cuerpo HTML completo y declarando la fecha de última modificación:
    ```http
    Last-Modified: Mon, 15 Aug 2026 15:00:12 GMT\r\n
    ETag: "48-53a-4b1029a1"\r\n
    Content-Length: 72\r\n
    ```
- **Segunda Petición GET**:
  - Al recargar la página, el navegador detecta que ya posee el archivo en su caché local. En consecuencia, formula una solicitud condicional inyectando la cabecera:
    ```http
    GET /wireshark-labs/HTTP-wireshark-file2.html HTTP/1.1\r\n
    Host: gaia.cs.umass.edu\r\n
    If-Modified-Since: Mon, 15 Aug 2026 15:00:12 GMT\r\n
    ```
- **Segunda Respuesta del Servidor**:
  - El servidor comprueba que el archivo en disco no ha variado desde esa fecha y responde:
    ```http
    HTTP/1.1 304 Not Modified\r\n
    Date: Mon, 15 Aug 2026 15:01:05 GMT\r\n
    Server: Apache/2.4.6 (CentOS)\r\n
    ETag: "48-53a-4b1029a1"\r\n
    \r\n
    ```
  - **No existe cuerpo de entidad (*Entity Body*)**: El servidor ahorra el envío de los datos y el navegador renderiza instantáneamente la copia que ya tenía almacenada en disco.

---

## 3. Experimento: Recuperación de Documentos Largos y Reensamblado TCP

Cuando un objeto web excede el tamaño máximo de segmento (**MSS**, típicamente 1460 bytes en Ethernet), la capa de aplicación no puede esperar que el mensaje viaje en un solo paquete físico.

### 3.1 Procedimiento Experimental
- Acceder a `http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file3.html` (contiene el texto extenso de la Declaración de Derechos de EE. UU. / *US Bill of Rights*).
- Filtrar en Wireshark por `http` y luego por `tcp.port == 80`.

### 3.2 Hallazgos de Red (Checkpoint 03)
- El navegador envía una **única solicitud HTTP GET**.
- La respuesta HTTP contiene una cabecera `Content-Length: 4500` (o superior).
- En el panel de paquetes, Wireshark muestra varios paquetes TCP consecutivos etiquetados como `[TCP segment of a reassembled PDU]`, seguidos por el paquete final que contiene la cabecera `HTTP/1.1 200 OK`.
- **Explicación**: El protocolo IP fragmentaría los paquetes si excedieran la MTU, pero TCP evita la fragmentación IP segmentando el flujo de bytes en trozos de tamaño menor o igual al MSS en el host emisor. Wireshark reensambla lógicamente estos múltiples segmentos TCP para presentar el mensaje HTTP consolidado en el panel de detalles.

---

## 4. Experimento: Documentos con Objetos Embebidos

Una página web realista se compone de un archivo base y múltiples recursos referenciados.

### 4.1 Procedimiento Experimental
- Acceder a `http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file4.html`.
- Este archivo HTML base contiene dos etiquetas `<img src="...">`:
  1. El logotipo de la editorial de Kurose alojado en `gaia.cs.umass.edu`.
  2. La portada del libro alojada en un servidor web externo en Francia (`kurose.eurecom.fr`).

### 4.2 Análisis de Trazas (Checkpoint 04)
1. **Total de Solicitudes GET**: Se generan **3 peticiones GET en total**:
   - Petición 1: Al host `gaia.cs.umass.edu` para obtener el archivo HTML base (`HTTP-wireshark-file4.html`).
   - Petición 2: Al host `gaia.cs.umass.edu` para obtener la primera imagen (`cover_8e.jpg`).
   - Petición 3: A la IP externa del servidor francés para obtener la segunda imagen.
2. **Descarga Serial vs. Paralela**:
   - Al examinar los timestamps en Wireshark, se comprueba que el navegador emite la solicitud de la segunda imagen **antes** de que haya terminado de llegar la respuesta completa de la primera imagen.
   - Los navegadores modernos abren múltiples conexiones TCP en paralelo (típicamente hasta 6 por host) para recuperar los recursos concurrentemente, reduciendo el tiempo total de renderizado de la página.

---

## 5. Experimento: Autenticación Básica HTTP (*HTTP Basic Authentication*)

HTTP incorpora un esquema estándar de control de acceso para proteger recursos privados mediante credenciales de usuario y contraseña (RFC 7617).

### 5.1 Procedimiento Experimental
1. Limpiar la caché y abrir `http://gaia.cs.umass.edu/wireshark-labs/protected_pages/HTTP-wireshark-file5.html`.
2. El navegador despliega una ventana modal solicitando nombre de usuario y contraseña.
3. Ingresar las credenciales suministradas:
   - Usuario: `wireshark-students`
   - Contraseña: `network`
4. Detener la captura y analizar las tramas con filtro `http`.

### 5.2 Secuencia de Intercambio de Mensajes
1. **Primer HTTP GET**: El navegador solicita el recurso sin credenciales previas:
   ```http
   GET /wireshark-labs/protected_pages/HTTP-wireshark-file5.html HTTP/1.1\r\n
   Host: gaia.cs.umass.edu\r\n
   ```
2. **Respuesta 401 Unauthorized**: El servidor rechaza la petición e incluye la cabecera de desafío:
   ```http
   HTTP/1.1 401 Unauthorized\r\n
   WWW-Authenticate: Basic realm="wireshark-students"\r\n
   ```
   - El parámetro `realm` define el ámbito o dominio de seguridad del recurso protegido.
3. **Segundo HTTP GET con Credenciales**: El navegador toma las credenciales ingresadas, las une con dos puntos (`wireshark-students:network`), las codifica en formato **Base64** y emite la segunda petición con la cabecera `Authorization`:
   ```http
   GET /wireshark-labs/protected_pages/HTTP-wireshark-file5.html HTTP/1.1\r\n
   Host: gaia.cs.umass.edu\r\n
   Authorization: Basic d2lyZXNoYXJrLXN0dWRlbnRzOm5ldHdvcms=\r\n
   ```
4. **Respuesta 200 OK**: El servidor valida la cadena en su base de datos y entrega el contenido protegido.

---

## 6. Análisis Crítico de Seguridad (Checkpoint 05)

### 6.1 Codificación vs. Cifrado
Una de las conclusiones más importantes del laboratorio es que **Base64 no es un algoritmo de cifrado, sino un esquema de codificación**:
- La función de codificación Base64 convierte cualquier secuencia de bytes binarios en un conjunto de 64 caracteres ASCII imprimibles (`A-Z`, `a-z`, `0-9`, `+`, `/`).
- **No utiliza ninguna clave secreta**. La función inversa `base64_decode()` es pública, universal y determinista.
- En Wireshark, al expandir la cabecera `Authorization: Basic`, el propio software diseccionador decodifica instantáneamente la cadena mostrando:
  `Credentials: wireshark-students:network`

### 6.2 Vulnerabilidad Crítica en Redes Públicas
El uso de HTTP Basic Authentication sobre HTTP en texto plano (puerto 80) representa un riesgo crítico de seguridad:
- Cualquier atacante conectado al mismo medio compartido (red Wi-Fi abierta en un aeropuerto o cafetería, puerto espejado en un switch o router comprometido) puede interceptar la trama con un sniffer pasivo y extraer las credenciales del usuario de manera inmediata y transparente.
- **Mitigación Mandatoria**: HTTP Basic Authentication solo es admisible si se encapsula dentro de un canal cifrado de capa de transporte mediante **HTTPS (HTTP sobre TLS/SSL)**, donde las cabeceras HTTP viajan totalmente cifradas contra la inspección de intermediarios.

### 6.3 Manejo de Estado en Recursos Protegidos
Dado que HTTP es stateless, el servidor olvida la autenticación inmediatamente después de responder `200 OK`. 
- Para evitar que el usuario deba reescribir su contraseña en cada nuevo enlace o imagen que descargue del mismo sitio protegido, **el navegador web almacena en caché las credenciales en su memoria volátil** durante la sesión activa.
- En cada nueva petición hacia el mismo servidor y ámbito (*realm*), el navegador adjunta automáticamente la cabecera `Authorization: Basic ...` sin molestar al usuario.
