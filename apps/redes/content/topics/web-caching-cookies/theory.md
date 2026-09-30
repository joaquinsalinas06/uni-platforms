---
kind: theory
title: "Web Caching, Conditional GET y Manejo de Cookies"
---

## 1. Web Caching y Servidores Proxy

Un servidor de **caché web** o **servidor proxy** es una entidad de red intermedia que satisface solicitudes HTTP en representación del servidor web de origen. Dispone de almacenamiento persistente en disco y memoria de acceso rápido donde guarda copias locales de los objetos recientemente solicitados por los clientes de una red.

### 1.1 El Doble Rol Arquitectónico del Proxy
Un proxy web opera simultáneamente en dos roles de la arquitectura de red:
- **Como Servidor**: Para el navegador cliente local que emite la solicitud HTTP inicial.
- **Como Cliente**: Para el servidor web de origen cuando no dispone de una copia válida del recurso y debe solicitarlo a través de la red global.

### 1.2 Flujo de Atención de una Solicitud Web
1. El usuario configura su navegador para dirigir todas las solicitudes HTTP a través del proxy web institucional (o la red intercepta el tráfico transparentemente).
2. El navegador establece una conexión TCP con el proxy y envía una solicitud `GET /archivo.html`.
3. El proxy verifica si posee una copia del objeto en su almacenamiento local:
   - **Acierto en Caché (*Cache Hit*)**: El objeto reside en el proxy y es válido. El proxy lo entrega directamente al cliente dentro de un mensaje `200 OK`. No se genera tráfico hacia la Internet pública; la latencia se reduce a la velocidad de la red de área local (LAN).
   - **Fallo en Caché (*Cache Miss*)**: El objeto no existe en el proxy. El proxy abre una conexión TCP independiente hacia el servidor de origen (`www.servidor.com`), descarga el objeto mediante un `GET`, guarda una copia en su memoria local y reenvía los datos al navegador cliente.

### 1.3 Beneficios Cuantitativos del Web Caching
1. **Reducción Drástica del Tiempo de Respuesta**: Las solicitudes resueltas en el proxy se transfieren a través de enlaces LAN de alta velocidad (1 Gbps a 10 Gbps) con RTTs inferiores a 2 milisegundos.
2. **Descongestión del Enlace de Acceso Institucional**: El enlace de acceso que conecta una institución o campus universitario con su proveedor de Internet (ISP) suele ser el cuello de botella más costoso y saturado. Al filtrar una proporción $h$ del tráfico en la LAN, la intensidad de tráfico en el enlace de acceso cae significativamente, evitando retardos de encolamiento infinitos.
3. **Despliegue de Redes de Distribución de Contenido (CDN)**: Empresas como Akamai, Cloudflare y Fastly instalan cientos de miles de servidores de caché geodistribuidos en todo el planeta para aproximar el contenido a los usuarios finales, reduciendo el tráfico transcontinental en el núcleo de Internet.

---

## 2. Modelado Analítico: Impacto de la Caché en el Retardo

Consideremos el análisis formal de una red institucional que evalúa la instalación de un servidor proxy web local:

### Parámetros de la Red:
- **Tasa de llegada de solicitudes**: $\beta$ solicitudes por segundo.
- **Tamaño promedio de los objetos solicitados**: $L_{\text{prom}}$ bits.
- **Capacidad de la red LAN institucional**: $R_{\text{LAN}}$ bps (muy alta, retardo de transmisión despreciable).
- **Capacidad del enlace de acceso hacia Internet**: $R_{\text{acceso}}$ bps.
- **Retardo de ida y vuelta en Internet hasta los servidores de origen**: $\text{RTT}_{\text{Internet}}$ segundos.
- **Tasa de acierto del proxy (*Cache Hit Rate*)**: $h$ (fracción de solicitudes resueltas localmente, $0 \le h \le 1$).

### 2.1 Sin Servidor de Caché ($h = 0$)
Todas las peticiones deben atravesar obligatoriamente el enlace de acceso.
- La intensidad de tráfico sobre el enlace de acceso es:
  $$I_{\text{acceso}} = \frac{\beta \cdot L_{\text{prom}}}{R_{\text{acceso}}}$$
- Si $I_{\text{acceso}} \to 1$, el retardo de encolamiento en el enrutador de acceso satura y el tiempo de respuesta total explota hacia el infinito.
- Si $I_{\text{acceso}} < 1$, el retardo de acceso promedio considerando colas $M/M/1$ es:
  $$D_{\text{acceso}} = \frac{L_{\text{prom}} / R_{\text{acceso}}}{1 - I_{\text{acceso}}}$$
- El tiempo total medio por solicitud es:
  $$T_{\text{sin-cache}} = D_{\text{LAN}} + D_{\text{acceso}} + \text{RTT}_{\text{Internet}}$$

### 2.2 Con Servidor de Caché Local ($h > 0$)
Una fracción $h$ de las solicitudes se responde en la LAN en un tiempo $T_{\text{LAN}} \approx \text{pocos ms}$.
- Solo una fracción $(1 - h)$ de las solicitudes se envía hacia el enlace de acceso hacia Internet:
  $$I_{\text{acceso, nuevo}} = \frac{\beta \cdot (1 - h) \cdot L_{\text{prom}}}{R_{\text{acceso}}} = (1 - h) \cdot I_{\text{acceso}}$$
- Al reducir la intensidad de tráfico, el retardo de encolamiento se reduce drásticamente de forma no lineal.
- El retardo total medio de respuesta percibido por el cliente se convierte en la combinación ponderada:

$$T_{\text{promedio}} = h \cdot T_{\text{LAN}} + (1 - h) \cdot (T_{\text{LAN}} + D_{\text{acceso, nuevo}} + \text{RTT}_{\text{Internet}})$$

---

## 3. El Mecanismo de Petición Condicional: Conditional GET

El almacenamiento en caché introduce un problema de consistencia fundamental: **¿Cómo puede el proxy web (o el navegador) saber si la copia de un recurso almacenada localmente ha sido modificada en el servidor de origen?**

Si el proxy entrega una copia obsoleta, la aplicación falla; si el proxy solicita el recurso completo al servidor cada vez para comprobarlo, se anulan todos los beneficios de ancho de banda del caching.

La solución de HTTP/1.1 es el método **Conditional GET**:

### 3.1 Las Cabeceras de Validación Temporal y de Entidad
1. Cuando el cliente descarga un recurso por primera vez, el servidor incluye la cabecera `Last-Modified` con la marca de tiempo de su última modificación en disco:
   ```http
   HTTP/1.1 200 OK\r\n
   Date: Thu, 07 May 2026 10:00:00 GMT\r\n
   Last-Modified: Mon, 04 May 2026 08:30:00 GMT\r\n
   ETag: "v3a1-7c9-4b1029a1"\r\n
   Content-Length: 450000\r\n
   \r\n
   [Cuerpo con 450,000 bytes de datos]
   ```
2. El proxy almacena el archivo junto con la fecha `Mon, 04 May 2026 08:30:00 GMT` y el identificador `ETag`.
3. Tiempo después, cuando otro cliente solicita el mismo objeto, el proxy emite una petición condicional al servidor de origen añadiendo la cabecera **`If-Modified-Since`** (o `If-None-Match`):
   ```http
   GET /archivo.html HTTP/1.1\r\n
   Host: www.servidor.com\r\n
   If-Modified-Since: Mon, 04 May 2026 08:30:00 GMT\r\n
   \r\n
   ```

### 3.2 Evaluación del Servidor y Código 304 Not Modified
El servidor web examina la fecha del archivo en su disco local:
- **Escenario 1 (El archivo no ha cambiado)**:
  El servidor responde con el código de estado **`304 Not Modified`** y **omite por completo el cuerpo de la entidad**:
  ```http
  HTTP/1.1 304 Not Modified\r\n
  Date: Thu, 07 May 2026 11:15:00 GMT\r\n
  Server: Apache/2.4.6\r\n
  \r\n
  ```
  *Impacto*: El mensaje mide apenas unos 150 bytes de cabeceras en lugar de transferir los 450,000 bytes originales. El proxy o el navegador reutilizan de inmediato su copia local cached con total garantía de frescura.
- **Escenario 2 (El archivo sí cambió)**:
  El servidor descarta la condición, responde con `HTTP/1.1 200 OK`, actualiza la fecha en `Last-Modified` y envía el nuevo cuerpo de entidad completo.

---

## 4. Persistencia de Estado en la Web: Mecanismo de Cookies

Dado que HTTP es un protocolo sin estado (*stateless*), las aplicaciones web complejas (comercio electrónico con carritos de compra, banca en línea, portales académicos de notas y perfiles personalizados) no podrían funcionar sin un mecanismo que permita identificar y recordar al usuario a través de peticiones HTTP sucesivas.

Para resolver esto sin alterar la naturaleza stateless del núcleo de HTTP, la especificación (RFC 6265) define la tecnología de **Cookies**.

### 4.1 Los Cuatro Componentes de la Arquitectura de Cookies
1. **Línea de cabecera en el mensaje de respuesta HTTP (`Set-Cookie:`)**:
   - Cuando un usuario accede a un sitio web por primera vez sin credenciales, el servidor web genera un identificador único en su backend (e.g., `id=093849182374`) y lo adjunta en la respuesta:
     ```http
     HTTP/1.1 200 OK\r\n
     Set-Cookie: user_session_id=A98B2C4D7E; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/; HttpOnly; Secure\r\n
     ```
2. **Línea de cabecera en el mensaje de solicitud HTTP subsecuente (`Cookie:`)**:
   - Cada vez que el navegador del usuario emite una nueva solicitud hacia el mismo dominio o ruta, el navegador busca en su almacén local y añade automáticamente la cabecera:
     ```http
     GET /catalogo.html HTTP/1.1\r\n
     Host: www.tienda.com\r\n
     Cookie: user_session_id=A98B2C4D7E\r\n
     ```
3. **Archivo de Cookies en el Sistema del Cliente**:
   - El navegador web administra una base de datos local protegida (generalmente SQLite o almacén seguro) en el disco del cliente, indexada estrictamente por el nombre de dominio (*Same-Origin Policy*).
4. **Base de Datos de Sesión en el Servidor Web**:
   - En el backend del servidor, una tabla de base de datos o almacén clave-valor en memoria (e.g., Redis) mapea el identificador `A98B2C4D7E` con los datos de perfil del usuario, compras pendientes en el carrito o credenciales verificadas.

### 4.2 Atributos de Seguridad en Cookies
- **`Secure`**: Ordena al navegador transmitir la cookie exclusivamente sobre conexiones cifradas mediante HTTPS (TLS), bloqueando su transmisión en texto claro sobre HTTP plano.
- **`HttpOnly`**: Bloquea el acceso a la cookie desde scripts de JavaScript en el navegador (e.g., vía `document.cookie`), mitigando ataques de robo de sesión mediante Cross-Site Scripting (XSS).
- **`SameSite=Strict | Lax | None`**: Restringe el envío de la cookie en peticiones originadas por sitios externos, protegiendo contra ataques de falsificación de petición en sitios cruzados (CSRF).

---

## 5. Ejercicio de Examen Resuelto: Conditional GET

### Enunciado (Basado en Examen Parcial UTEC)
Un navegador web realiza la siguiente petición HTTP a través de la red:
```http
GET /index.html HTTP/1.1
Host: www.somosciclo262.com
If-Modified-Since: Thu, 07 May 2026 10:15:00 GMT-5
```
Responda formalmente:
1. ¿Cuál es la finalidad específica del encabezado `If-Modified-Since` en esta petición?
2. ¿Qué responderá el servidor web si el recurso no ha sido modificado desde la fecha indicada? Especifique la línea de estado devuelta y el contenido del cuerpo del mensaje.
3. ¿Qué ventajas en términos de ancho de banda y rendimiento ofrece este comportamiento condicional?

### Solución Paso a Paso:
1. **Finalidad del Encabezado**:
   - Implementar el mecanismo de **Conditional GET**. Informa al servidor web de origen que el cliente ya posee una copia del recurso `/index.html` en su caché local (descargada en o antes de la fecha especificada) y solicita que únicamente se envíe el objeto completo si el archivo fue modificado con posterioridad a `Thu, 07 May 2026 10:15:00 GMT-5`.
2. **Respuesta del Servidor si no ha habido cambios**:
   - El servidor responderá con una línea de estado:
     `HTTP/1.1 304 Not Modified\r\n`
   - El cuerpo de la respuesta (*entity body*) viajará **completamente vacío (0 bytes de payload)**. Solo se transmiten las cabeceras HTTP de metadatos (e.g., `Date`, `ETag`, `Server`).
3. **Ventajas en Rendimiento y Ancho de Banda**:
   - **Ahorro masivo de ancho de banda**: Se evita la retransmisión redundante de cientos de kilobytes o megabytes de datos que el cliente ya posee en disco, transfiriendo únicamente una trama diminuta de aproximadamente 150 bytes de cabecera.
   - **Reducción del retardo de transmisión ($d_{\text{trans}} \approx 0$)**: La respuesta se transmite casi instantáneamente.
   - **Descongestión del enlace de acceso**: Reduce la carga en los conmutadores y enrutadores intermedios de la organización.
