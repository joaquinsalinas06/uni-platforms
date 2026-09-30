---
kind: subtopic
title: "Mecanismo de Cookies y Gestión de Sesiones de Usuario"
order: 2
---

## 1. El Dilema del Estado en la Web

El protocolo HTTP fue concebido originalmente como un protocolo sin estado (*stateless*): cada intercambio de solicitud y respuesta es una transacción independiente y aislada. El servidor no mantiene registros de transacciones previas del mismo cliente.

Sin embargo, el comercio electrónico, los portales bancarios, las plataformas educativas y las redes sociales requieren que el servidor reconozca la identidad del usuario a lo largo de decenas o cientos de peticiones continuas (mantener iniciada una sesión, conservar artículos dentro de un carrito de compras virtual, recordar preferencias de visualización).

Para resolver esta contradicción sin rediseñar la arquitectura básica de HTTP, se introdujo el mecanismo de **Cookies** (RFC 6265).

---

## 2. Los Cuatro Componentes del Sistema de Cookies

La persistencia de estado mediante cookies involucra cuatro componentes coordinados entre el cliente, el protocolo y el servidor:

### 2.1 Cabecera de Respuesta HTTP: `Set-Cookie`
Cuando un cliente realiza una solicitud hacia un servidor web sin identificador previo, el servidor genera un identificador pseudoaleatorio criptográficamente seguro (Session ID) y lo incluye en la cabecera de la respuesta HTTP:
```http
HTTP/1.1 200 OK\r\n
Date: Thu, 07 May 2026 12:00:00 GMT\r\n
Server: Apache/2.4.6\r\n
Set-Cookie: session_id=e83a91b2c4f8; Expires=Fri, 07 May 2027 12:00:00 GMT; Path=/; Domain=.tienda.com; Secure; HttpOnly\r\n
Content-Type: text/html\r\n
\r\n
```

### 2.2 Almacén Local de Cookies en el Navegador Cliente
Al recibir la cabecera `Set-Cookie`, el navegador web extrae los datos y los almacena en su base de datos local interna en el disco o memoria del host cliente (e.g., base de datos SQLite en Firefox o Chromium). Cada entrada registra:
- Nombre y valor de la cookie (`session_id=e83a91b2c4f8`).
- Dominio de validez (`Domain=.tienda.com`).
- Ruta de validez (`Path=/`).
- Fecha y hora de expiración (`Expires`).
- Banderas de seguridad (`Secure`, `HttpOnly`, `SameSite`).

### 2.3 Cabecera de Solicitud HTTP: `Cookie`
En cada solicitud web subsecuente emitida por el navegador hacia cualquier URL:
1. El navegador consulta su almacén local.
2. Compara el dominio y ruta de la URL solicitada con las reglas de dominio y ruta de cada cookie almacenada.
3. Si el dominio coincide y la cookie no ha expirado, el navegador inyecta automáticamente la cabecera `Cookie:` en el mensaje de solicitud HTTP:
```http
GET /checkout.html HTTP/1.1\r\n
Host: www.tienda.com\r\n
User-Agent: Mozilla/5.0 ...\r\n
Cookie: session_id=e83a91b2c4f8; tema=oscuro\r\n
\r\n
```

### 2.4 Base de Datos o Almacén de Estado en el Servidor Web
En el backend del servidor, una base de datos distribuida (e.g., clúster Redis, Memcached o base relacional SQL) utiliza el valor recibido en `Cookie: session_id=...` como clave primaria para indexar el registro de sesión del usuario:
- Identificador de cuenta de usuario autenticado.
- Contenido del carrito de compras.
- Permisos y roles asignados.

---

## 3. Ejemplo Práctico: Ciclo de Vida de una Sesión de Comercio Electrónico

1. **Primera Visita**: Una usuaria (Susan) accede por primera vez al sitio de comercio electrónico `www.tienda.com` desde su computadora portátil:
   - Su navegador envía `GET /index.html` sin cabecera de cookies.
   - El servidor web asigna un nuevo ID en su base de datos: `1678` asociado a un nuevo carrito vacío.
   - El servidor responde incluyendo: `Set-Cookie: cart_id=1678`.
2. **Navegación y Adición de Artículos**:
   - Susan hace clic en "Añadir libro al carrito".
   - El navegador emite `POST /cart/add HTTP/1.1` incluyendo automáticamente: `Cookie: cart_id=1678`.
   - El servidor lee la cabecera, busca el registro `1678` en su base de datos y agrega el libro al carrito de Susan.
3. **Retorno una Semana Después**:
   - Si la cookie se configuró con una fecha de expiración futura (*Persistent Cookie*), el archivo de cookies del navegador conserva la entrada.
   - Cuando Susan vuelve a ingresar al sitio días después, el navegador adjunta de nuevo `Cookie: cart_id=1678`, permitiendo a la tienda mostrarle sus artículos pendientes en el carrito sin necesidad de que haya iniciado sesión con credenciales explícitas.

---

## 4. Clasificación y Directivas de Seguridad en Cookies

### 4.1 Tipos de Cookies por Duración
- **Cookies de Sesión (*Session Cookies*)**: No incluyen directiva `Expires` ni `Max-Age`. Se almacenan exclusivamente en la memoria RAM del navegador y se eliminan automáticamente cuando el usuario cierra la ventana o el proceso del navegador.
- **Cookies Persistentes (*Persistent Cookies*)**: Especifican una fecha límite de caducidad. Se guardan en el disco del host y sobreviven a los reinicios del navegador y de la computadora hasta alcanzar su tiempo de vida.

### 4.2 Atributos Críticos de Seguridad
- **`Secure`**: La cookie solo se transmitirá si el canal de transporte está protegido con cifrado TLS/HTTPS. Previene que un atacante pasivo en la misma red local capture la cookie mediante sniffers como Wireshark.
- **`HttpOnly`**: Bloquea el acceso a la cookie desde el entorno de ejecución de JavaScript del navegador (e.g., `document.cookie`). Constituye la principal defensa para neutralizar el robo de tokens de sesión mediante inyecciones de código malicioso (*Cross-Site Scripting* o XSS).
- **`SameSite`**:
  - `Strict`: La cookie nunca se envía en peticiones que se originen desde dominios externos (e.g., al hacer clic en un enlace de un correo o sitio de terceros).
  - `Lax`: La cookie se envía en navegaciones seguras de nivel superior (GET originados por enlaces externos), pero se bloquea en peticiones POST o recursos embebidos.
  - `None`: Permite el envío en contextos cruzados (requiere obligatoriamente el atributo `Secure`).

---

## 5. Controversia: Cookies de Terceros y Rastreo (*Tracking*)

Una distinción fundamental en la web contemporánea es:
- **Cookies de Primera Parte (*First-Party Cookies*)**: Emitidas por el dominio que el usuario está visitando explícitamente en la barra de direcciones (e.g., `tienda.com`).
- **Cookies de Terceros (*Third-Party Cookies*)**: Emitidas por un dominio externo que aloja un recurso incrustado en la página que visita el usuario (e.g., un banner publicitario de `anuncios.com` incrustado en `noticias.com`).
  - Al visitar múltiples sitios web distintos que contienen anuncios de la misma red publicitaria, el navegador envía la cookie de `anuncios.com` en cada uno de ellos.
  - Esto permite a la red publicitaria reconstruir el historial completo de navegación del usuario a través de Internet, generando perfiles de comportamiento para publicidad dirigida y planteando graves dilemas de privacidad.
