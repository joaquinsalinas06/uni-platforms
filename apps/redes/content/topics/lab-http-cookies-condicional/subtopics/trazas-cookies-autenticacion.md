---
kind: subtopic
title: "Trazas de Cookies y Autenticación en Wireshark"
order: 2
---

## Gestión de Estado en un Protocolo Stateless

HTTP es un protocolo inherentemente sin estado (*stateless*): el servidor procesa cada solicitud de forma totalmente independiente, olvidando de inmediato la transacción previa. Para soportar aplicaciones con estado (carritos de compra, sesiones bancarias, perfiles de usuario), la especificación RFC 6265 introdujo el subsistema de **cookies**.

El ciclo de vida de una cookie consta de cuatro componentes fundamentales:
1. **Encabezado en respuesta HTTP**: `Set-Cookie:` emitido por el servidor.
2. **Almacenamiento en el cliente**: Base de datos local gestionada por el navegador (indexada por dominio y ruta).
3. **Encabezado en peticiones posteriores**: `Cookie:` transmitido automáticamente por el cliente en cada request hacia el mismo dominio.
4. **Base de datos de sesión en el backend**: Asocia el identificador de sesión (*session ID*) con el contexto del usuario.

---

## Disección de Trazas de Cookies en Wireshark

Al realizar el inicio de sesión en un portal web mediante POST y analizar el tráfico con el filtro de visualización `http.cookie or http.set_cookie`:

### 1. Mensaje de Respuesta: Creación de la Sesión
El servidor valida las credenciales y devuelve una redirección (`302 Found`) o confirmación (`200 OK`) adjuntando:

```http
HTTP/1.1 200 OK
Date: Wed, 01 Oct 2026 15:00:00 GMT
Set-Cookie: session_id=abc987654xyz; Expires=Thu, 02 Oct 2026 15:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=Strict
Content-Type: text/html
```

#### Atributos de Seguridad Analizados en Wireshark:
- **`HttpOnly`**: Bloquea el acceso a la cookie mediante scripts de JavaScript en el DOM (`document.cookie`), mitigando ataques de Cross-Site Scripting (XSS).
- **`Secure`**: Ordena al navegador transmitir la cookie exclusivamente sobre conexiones cifradas TLS/HTTPS. Si la petición viaja sobre HTTP plano en el laboratorio, Wireshark alerta sobre la exposición del token de sesión.
- **`SameSite=Strict/Lax`**: Previene ataques de Cross-Site Request Forgery (CSRF) al restringir el envío de la cookie en peticiones entre orígenes cruzados.

### 2. Mensajes Posteriores: Transmisión del Token de Sesión
En peticiones sucesivas a cualquier endpoint dentro del `Path` autorizado:

```http
GET /dashboard HTTP/1.1
Host: campus.utec.edu.pe
Cookie: session_id=abc987654xyz; user_prefs=lang%3Des%26theme%3Ddark
```

Wireshark desglosa en su panel central:
```text
Hypertext Transfer Protocol
    Cookie: session_id=abc987654xyz; user_prefs=lang%3Des%26theme%3Ddark\r\n
        Cookie pair: session_id=abc987654xyz
        Cookie pair: user_prefs=lang=es&theme=dark
```

---

## Autenticación HTTP Básica (Basic Access Authentication)

El estándar RFC 7617 define el esquema de autenticación HTTP básica, frecuentemente evaluado en laboratorios y exámenes:

1. **Petición no autenticada del cliente**:
   ```http
   GET /admin/network-config.php HTTP/1.1
   Host: 192.168.1.1
   ```

2. **Respuesta de desafío del servidor (401 Unauthorized)**:
   ```http
   HTTP/1.1 401 Unauthorized
   WWW-Authenticate: Basic realm="Router Admin Interface"
   ```
   El navegador detecta el encabezado `WWW-Authenticate` y despliega un cuadro de diálogo solicitando credenciales.

3. **Reenvío con credenciales codificadas**:
   El cliente concatena el usuario y contraseña con dos puntos (`usuario:clave`) y aplica codificación Base64:
   $$\text{"admin:utec2026"} \xrightarrow{\text{Base64}} \text{"YWRtaW46dXRlYzIwMjY="}$$

   ```http
   GET /admin/network-config.php HTTP/1.1
   Host: 192.168.1.1
   Authorization: Basic YWRtaW46dXRlYzIwMjY=
   ```

### Alerta de Seguridad Crítica en Wireshark
En Wireshark, al inspeccionar el paquete HTTP bajo el árbol `Authorization: Basic ...`, la herramienta decodifica automáticamente la cadena Base64 y muestra las credenciales en texto claro:
`[Credentials: admin:utec2026]`

Esto demuestra empíricamente que **Base64 no es un algoritmo de cifrado, sino un método de codificación binario-a-texto**. Sin el uso complementario de TLS (HTTPS), cualquier atacante pasivo en la red local puede interceptar las credenciales completas mediante herramientas de sniffing como Wireshark o tcpdump.
