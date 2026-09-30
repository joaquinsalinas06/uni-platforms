---
kind: subtopic
title: "Proxies Web, Caching y el Mecanismo Conditional GET"
order: 1
---

## 1. Topología y Funcionamiento de los Proxies Web

Un servidor de caché web o proxy se intercala físicamente o lógicamente entre los sistemas terminales de una organización y la Internet pública. Se distinguen dos topologías principales:
1. **Forward Proxy (Proxy Hacia Adelante)**:
   - Se ubica en la red de los clientes (e.g., dentro de una universidad o empresa).
   - Todos los usuarios de la red interna canalizan sus salidas hacia la web a través de este nodo.
   - Protege el anonimato de los clientes y optimiza el consumo de ancho de banda del enlace de salida de la organización.
2. **Reverse Proxy (Proxy Inverso)**:
   - Se ubica frente a uno o varios servidores web de origen (en el centro de datos o la nube del proveedor).
   - Intercepta el tráfico entrante de los clientes de Internet, actuando como balanceador de carga (*load balancer*), terminador de conexiones TLS/SSL y caché de borde para recursos estáticos.

---

## 2. Modelado Numérico: Impacto del Proxy en el Cuello de Botella

Analicemos cuantitativamente un caso típico de dimensionamiento de red en un campus:

### Datos del Problema:
- Tamaño medio de los objetos web solicitados: $L_{\text{prom}} = 100\,\text{kB} = 800\,\text{kb} = 0.8\,\text{Mb}$.
- Tasa media de llegada de peticiones desde los navegadores del campus: $\beta = 15\,\text{solicitudes/s}$.
- Ancho de banda del enlace de acceso del campus a su ISP: $R_{\text{acceso}} = 15\,\text{Mbps}$.
- Tiempo medio de ida y vuelta en Internet (desde el enrutador de acceso institucional hasta el servidor de origen remoto y de regreso): $\text{RTT}_{\text{Internet}} = 2\,\text{segundos}$.
- Retardo de propagación y transmisión en la red LAN del campus: $D_{\text{LAN}} \approx 2\,\text{ms} = 0.002\,\text{s}$.

### 2.1 Caso A: Sin Servidor Proxy
1. **Tasa media de bits en el enlace de acceso**:
   $$\text{Tasa} = \beta \cdot L_{\text{prom}} = 15\,\text{sol/s} \times 0.8\,\text{Mb} = 12\,\text{Mbps}$$
2. **Intensidad de tráfico en el enlace de acceso**:
   $$I_{\text{acceso}} = \frac{12\,\text{Mbps}}{15\,\text{Mbps}} = 0.80$$
3. **Retardo medio en el enlace de acceso (modelo de colas $M/M/1$)**:
   $$D_{\text{acceso}} = \frac{L_{\text{prom}} / R_{\text{acceso}}}{1 - I_{\text{acceso}}} = \frac{0.8\,\text{Mb} / 15\,\text{Mbps}}{1 - 0.80} = \frac{0.0533\,\text{s}}{0.20} \approx 0.267\,\text{segundos}$$
4. **Retardo Total Medio Percibido**:
   $$T_{\text{total, sin-cache}} = D_{\text{LAN}} + D_{\text{acceso}} + \text{RTT}_{\text{Internet}} = 0.002 + 0.267 + 2.0 \approx 2.27\,\text{segundos}$$

> **Observación**: Si la tasa de solicitudes sube ligeramente a $\beta = 18\,\text{sol/s}$, la tasa de bits sería $14.4\,\text{Mbps}$ ($I = 0.96$), disparando el retardo de acceso a más de $1.33\,\text{segundos}$. Si llega a $19\,\text{sol/s}$, el enlace colapsa por completo ($I > 1$).

### 2.2 Caso B: Con Servidor Proxy Local (Tasa de Acierto $h = 40\% = 0.4$)
Supongamos que se instala un proxy web en la LAN institucional que logra resolver el $40\%$ de las solicitudes con su caché:
1. **Fracción de tráfico enviada hacia el enlace de acceso**:
   $$\text{Tasa}_{\text{nueva}} = \beta \cdot (1 - h) \cdot L_{\text{prom}} = 15 \times (1 - 0.40) \times 0.8\,\text{Mb} = 7.2\,\text{Mbps}$$
2. **Nueva intensidad de tráfico en el enlace de acceso**:
   $$I_{\text{acceso, nuevo}} = \frac{7.2\,\text{Mbps}}{15\,\text{Mbps}} = 0.48$$
3. **Nuevo retardo medio en el enlace de acceso**:
   $$D_{\text{acceso, nuevo}} = \frac{0.0533\,\text{s}}{1 - 0.48} = \frac{0.0533}{0.52} \approx 0.102\,\text{segundos}$$
4. **Retardo Total Ponderado**:
   - Para el $40\%$ de aciertos en caché: $T_{\text{hit}} = D_{\text{LAN}} \approx 0.002\,\text{segundos}$.
   - Para el $60\%$ de fallos en caché: $T_{\text{miss}} = D_{\text{LAN}} + D_{\text{acceso, nuevo}} + \text{RTT}_{\text{Internet}} = 0.002 + 0.102 + 2.0 = 2.104\,\text{segundos}$.
   - **Retardo Medio Global**:
     $$T_{\text{promedio}} = (0.40) \cdot (0.002) + (0.60) \cdot (2.104) = 0.0008 + 1.2624 \approx 1.263\,\text{segundos}$$

El tiempo total medio disminuye casi a la mitad (de $2.27\,\text{s}$ a $1.26\,\text{s}$), pero lo más importante: la intensidad de tráfico cayó del $80\%$ al $48\%$, dejando un holgado margen de seguridad contra ráfagas de congestión sin tener que pagar por un enlace de fibra más costoso.

---

## 3. Directivas de Control de Caché en Cabeceras HTTP

HTTP provee cabeceras expresas para que los desarrolladores y servidores web instruyan a los navegadores y proxies intermedios sobre cómo almacenar recursos:

- **`Cache-Control: no-store`**: Prohíbe terminantemente almacenar cualquier copia del recurso en ningún disco o memoria (indispensable para información bancaria o credenciales confidenciales).
- **`Cache-Control: no-cache`**: Permite guardar una copia en caché, pero exige validar obligatoriamente la frescura con el servidor de origen mediante Conditional GET antes de servirla al usuario.
- **`Cache-Control: public`**: Permite que cualquier entidad (navegadores y proxies intermediarios compartidos) almacene el recurso.
- **`Cache-Control: private`**: El recurso es exclusivo para el usuario final individual; solo su navegador puede almacenarlo (los proxies corporativos no deben guardarlo).
- **`Cache-Control: max-age=3600`**: Define el tiempo máximo de frescura en segundos (en este ejemplo, 1 hora) durante el cual la copia cached se considera válida sin necesidad de revalidar.

---

## 4. Validadores Fuertes vs. Débiles: `ETag` frente a `Last-Modified`

HTTP implementa dos mecanismos para validar la consistencia en el Conditional GET:

### 4.1 Validador Temporal: `Last-Modified` / `If-Modified-Since`
- Trabaja con marcas de tiempo con resolución de un segundo en formato GMT.
- **Limitación**: Si un archivo se regenera periódicamente pero sus datos no cambian, o si se modifica varias veces en menos de un segundo, el validador temporal puede generar inconsistencias o retransmisiones innecesarias.

### 4.2 Validador Fuerte de Entidad: `ETag` / `If-None-Match`
- El servidor calcula un identificador unívoco o hash criptográfico (MD5, SHA-256 o timestamp compuesto) del contenido del recurso y lo envía en la cabecera `ETag: "686897696a7c76"` en la respuesta inicial.
- En la siguiente solicitud condicional, el cliente envía:
  ```http
  GET /logo.png HTTP/1.1
  Host: www.sitio.com
  If-None-Match: "686897696a7c76"
  ```
- Si el hash coincide byte a byte con el archivo actual en el servidor, devuelve `304 Not Modified`. Es inmune a problemas de sincronización de relojes entre servidores distribuidos.
