---
kind: subtopic
title: "Formato y Semántica de Mensajes HTTP"
order: 2
---

## 1. Gramática y Estructura Formal de HTTP

El protocolo HTTP opera mediante un intercambio estrictamente estructurado de mensajes textuales en formato ASCII. Todo mensaje HTTP, sea de solicitud o de respuesta, se rige por una gramática compuesta por cuatro bloques secuenciales:
1. **Línea Inicial**: Línea de Solicitud (*Request Line*) en peticiones, o Línea de Estado (*Status Line*) en respuestas.
2. **Bloque de Cabeceras (*Header Fields*)**: Cero o más líneas clave-valor con metadatos.
3. **Línea Vacía Delimitadora**: Una secuencia obligatoria de Retorno de Carro y Salto de Línea (`CRLF` o `\r\n`, bytes hexadecimales `0x0D 0x0A`) que señaliza el término de las cabeceras.
4. **Cuerpo del Mensaje (*Message Body* o *Payload*)**: Bloque opcional con datos binarios o textuales.

---

## 2. Mensajes de Solicitud HTTP (*Request*)

### 2.1 Anatomía de la Línea de Solicitud
La primera línea tiene la sintaxis invariable:
```http
<Método> <Espacio> <URI-del-Recurso> <Espacio> <Versión-HTTP> \r\n
```
*Ejemplo*:
```http
GET /noticias/portada.html HTTP/1.1\r\n
```

### 2.2 Semántica de los Métodos y Propiedades Arquitectónicas
La especificación clasifica los métodos según dos propiedades fundamentales:
- **Seguridad (*Safe Methods*)**: Un método es seguro si su invocación no produce efectos colaterales de modificación de estado en el servidor (operaciones de solo lectura).
- **Idempotencia (*Idempotent Methods*)**: Un método es idempotente si el efecto colateral sobre el servidor al ejecutar la operación $N$ veces consecutivas ($N > 1$) es exactamente el mismo que si se ejecutara una sola vez.

| Método | Propósito Principal | ¿Es Seguro? | ¿Es Idempotente? | Lleva Cuerpo (*Body*) |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | Recuperar la representación del recurso indicado. | **Sí** | **Sí** | No permitido habitualmente |
| **`HEAD`** | Idéntico a `GET` pero devuelve solo cabeceras (sin cuerpo). | **Sí** | **Sí** | No permitido |
| **`POST`** | Enviar datos al servidor para crear un recurso subordinado o procesar formularios. | No | No | Sí (datos del formulario / JSON) |
| **`PUT`** | Reemplazar o crear íntegramente el recurso ubicado en el URI exacto. | No | **Sí** | Sí (archivo completo) |
| **`DELETE`** | Solicitar la eliminación del recurso identificado en el URI. | No | **Sí** | Generalmente no |
| **`OPTIONS`**| Consultar las opciones de comunicación y métodos soportados por el servidor. | **Sí** | **Sí** | Opcional |

### 2.3 Cabeceras de Solicitud Fundamentales
- **`Host` (Obligatoria en HTTP/1.1)**: Especifica el nombre de dominio y puerto de destino (e.g., `Host: www.utec.edu.pe`). Permite el **alojamiento virtual (*Virtual Hosting*)**, donde cientos de sitios web distintos comparten una única dirección IP física.
- **`User-Agent`**: Identifica el software cliente (navegador, sistema operativo, motor de renderizado).
- **`Accept` / `Accept-Language` / `Accept-Encoding`**: Negociación de contenido iniciada por el cliente (formatos MIME aceptados, preferencias idiomáticas ponderadas por factor $q$, y algoritmos de descompresión compatibles como gzip o br).
- **`Authorization`**: Credenciales de autenticación para recursos protegidos (e.g., esquemas `Basic` o `Bearer`).
- **`If-Modified-Since`**: Mecanismo de petición condicional para optimización de caché local.

---

## 3. Mensajes de Respuesta HTTP (*Response*)

### 3.1 Anatomía de la Línea de Estado
La primera línea de una respuesta sigue la estructura:
```http
<Versión-HTTP> <Espacio> <Código-de-Estado> <Espacio> <Frase-Textual> \r\n
```
*Ejemplo*:
```http
HTTP/1.1 200 OK\r\n
```

### 3.2 Taxonomía de los Códigos de Estado
Los códigos son enteros de 3 dígitos agrupados por el dígito inicial:

#### Clase 1xx: Informativos
Indican que la petición fue recibida y el proceso continúa.
- `100 Continue`: El servidor invita al cliente a continuar enviando el cuerpo de la solicitud.
- `101 Switching Protocols`: Aceptación de cambio de protocolo (e.g., actualización a WebSockets).

#### Clase 2xx: Éxito
Confirman que la acción solicitada por el cliente fue recibida, entendida y aceptada.
- `200 OK`: Éxito estándar. El recurso solicitado se incluye en el cuerpo de la respuesta.
- `201 Created`: Solicitud completada exitosamente resultando en la creación de un nuevo recurso.
- `204 No Content`: Petición procesada satisfactoriamente, pero la respuesta deliberadamente no incluye cuerpo.

#### Clase 3xx: Redirección
El cliente debe realizar acciones adicionales para completar la petición.
- `301 Moved Permanently`: El recurso fue reubicado de forma definitiva a un nuevo URI indicado en la cabecera `Location:`.
- `302 Found` / `307 Temporary Redirect`: El recurso reside temporalmente en una dirección alternativa.
- `304 Not Modified`: El recurso en caché del cliente sigue vigente y no ha sufrido modificaciones. El cuerpo viaja deliberadamente vacío, ahorrando ancho de banda.

#### Clase 4xx: Errores del Cliente
Indican una anomalía atribuible a la solicitud emitida por el cliente.
- `400 Bad Request`: Error de sintaxis o formato en la solicitud.
- `401 Unauthorized`: Se requiere autenticación del usuario mediante cabecera `WWW-Authenticate:`.
- `403 Forbidden`: El servidor comprende quién es el cliente pero deniega el acceso al recurso por falta de permisos.
- `404 Not Found`: El servidor no localizó ningún recurso que coincida con el URI solicitado.
- `408 Request Timeout`: El cliente tardó demasiado en enviar la petición completa.

#### Clase 5xx: Errores del Servidor
Indican que el servidor falló al intentar atender una solicitud aparentemente válida.
- `500 Internal Server Error`: Condición inesperada en la ejecución del backend o scripts del servidor.
- `502 Bad Gateway`: Un servidor intermediario (proxy o balanceador) recibió una respuesta inválida del servidor upstream.
- `503 Service Unavailable`: El servidor no puede atender la petición debido a sobrecarga temporal o mantenimiento.
- `504 Gateway Timeout`: El proxy no recibió respuesta oportuna del servidor de origen.
- `505 HTTP Version Not Supported`: El servidor rehúsa procesar la versión de HTTP enviada por el cliente.

---

## 4. Comparación Arquitectónica: HTTP vs. SMTP

El correo electrónico tradicional se transfiere entre servidores mediante el protocolo **SMTP** (*Simple Mail Transfer Protocol*, RFC 2821). La comparación entre HTTP y SMTP resalta decisiones de diseño contrapuestas:

| Parámetro | HTTP (World Wide Web) | SMTP (Correo Electrónico) |
| :--- | :--- | :--- |
| **Direccionalidad del flujo** | **Pull Protocol**: El receptor (cliente) extrae activamente información del servidor. | **Push Protocol**: El emisor (servidor remitente) empuja activamente los datos hacia el receptor. |
| **Formato de datos** | Binario o texto arbitrario encapsulado mediante tipos MIME. | Estrictamente texto ASCII de 7 bits (archivos adjuntos requieren codificación Base64). |
| **Empaquetado de objetos** | Cada objeto web se transfiere en su **propio mensaje de respuesta independiente**. | Múltiples objetos y adjuntos se empaquetan dentro de un **único mensaje multipart**. |
| **Delimitación de fin de mensaje** | Mediante cabecera `Content-Length` o cierre de conexión. | Mediante una secuencia especial de fin de datos: `\r\n.\r\n` (un punto solitario en una línea). |
| **Puerto de transporte TCP** | Puerto 80 (HTTP) / 443 (HTTPS). | Puerto 25 (transferencia entre servidores) / 587 (envío de cliente). |
