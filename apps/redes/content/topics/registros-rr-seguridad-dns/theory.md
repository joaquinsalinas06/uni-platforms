---
kind: theory
title: "Registros de Recursos (RR), Mensaje DNS y Seguridad"
---

## 1. Registros de Recursos (Resource Records - RR)

La base de datos distribuida de DNS no almacena texto plano arbitrario; está estructurada mediante unidades atómicas de información denominadas **Registros de Recursos** (*Resource Records*, RR). Tanto los archivos de configuración de zona como los mensajes de respuesta del protocolo transportan RRs codificados bajo una tupla estándar de cuatro componentes fundamentales:

$$\text{RR} = (\text{Name}, \text{Value}, \text{Type}, \text{TTL})$$

Donde los campos representan:
- **Name**: Nombre de dominio o clave de búsqueda del registro.
- **Value**: Valor asociado a la clave, cuya semántica e interpretación dependen estrictamente del campo `Type`.
- **Type**: Tipo de registro que define la estructura y el propósito del mapeo (e.g., A, AAAA, CNAME, NS, MX, PTR, TXT).
- **TTL (Time to Live)**: Número entero positivo expresado en segundos que estipula la vida útil máxima durante la cual un resolver puede almacenar este registro en su memoria volátil antes de descartarlo y solicitarlo nuevamente.

## 2. Tipos Principales de Registros de Recursos

### 2.1. Registro Tipo A (IPv4 Address)
- **Name**: Nombre de host completamente calificado (FQDN), por ejemplo `www.example.com`.
- **Value**: Dirección IP binaria estándar IPv4 de 32 bits expresada en formato decimal con puntos (e.g., `93.184.216.34`).
- **Uso**: Es el registro más fundamental de Internet, responsable de vincular los nombres web y de servicios a sus nodos de red IPv4.

### 2.2. Registro Tipo AAAA (IPv6 Address)
- **Name**: Nombre de host (FQDN), por ejemplo `example.com`.
- **Value**: Dirección IP de 128 bits para el protocolo IPv6, representada en notación hexadecimal separada por dos puntos (e.g., `2606:2800:220:1:248:1893:25c8:1946`).

### 2.3. Registro Tipo NS (Name Server)
- **Name**: Nombre de un dominio o subdominio para el cual se define la autoridad (e.g., `example.com` o `utec.edu.pe`).
- **Value**: Nombre de host del servidor de nombres autoritativo responsable de albergar los registros de dicha zona (e.g., `ns1.example.com`).
- **Rol en la delegación**: Permite a los servidores de nivel superior (Raíz y TLD) delegar el control administrativo de los subárboles de nombres hacia los servidores de la organización correspondiente.

### 2.4. Registro Tipo CNAME (Canonical Name)
- **Name**: Nombre de alias o identificador alternativo (e.g., `www.ibm.com` o `ftp.empresa.com`).
- **Value**: Nombre canónico o real del host en la infraestructura del proveedor (e.g., `servereast.backup2.ibm.com`).
- **Uso**: Facilita la administración al permitir asociar múltiples servicios a un único servidor físico o redirigir el tráfico hacia plataformas de distribución de contenido (CDNs como Cloudflare o Fastly) sin modificar la infraestructura interna.

### 2.5. Registro Tipo MX (Mail Exchange)
- **Name**: Nombre del dominio destinatario del correo electrónico (e.g., `example.com` o `gmail.com`).
- **Value**: Nombre de host del agente de transferencia de correo (MTA / servidor SMTP) encargado de recibir los mensajes para ese dominio (e.g., `mail1.example.com`), acompañado de un valor numérico de **preferencia** o prioridad.
- **Regla de Prioridad**:
  $$\text{Target Server} = \arg\min_k \{ \text{Preference}_k \}$$
  Los servidores con el **menor valor numérico** de preferencia son contactados primero por los clientes SMTP emisores. Los servidores con valores de preferencia mayores funcionan como respaldos (*backup servers*) que reciben tráfico únicamente si los primarios se encuentran inaccesibles o saturados.

### 2.6. Registros Tipo TXT y PTR
- **Tipo TXT (Text)**: Almacena cadenas de texto arbitrarias legibles. Hoy en día es indispensable para la seguridad del correo electrónico mediante registros de autenticación de remitentes como **SPF** (*Sender Policy Framework*), **DKIM** y **DMARC**, así como para la verificación de propiedad de dominios en servicios en la nube.
- **Tipo PTR (Pointer)**: Utilizado para la resolución inversa (*Reverse DNS Lookup*). Mapea una dirección IP convertida a formato de dominio especial (e.g., `34.216.184.93.in-addr.arpa`) a su nombre de host canónico correspondiente.

## 3. Formato del Mensaje del Protocolo DNS

Tanto las consultas (*Queries*) como las respuestas (*Replies*) de DNS comparten exactamente el mismo formato binario general, especificado formalmente en el RFC 1035. La cabecera fija tiene una longitud de **12 bytes** (96 bits) y se divide en campos de 16 bits:

### 3.1. Cabecera del Mensaje (12 Bytes)
- **Identification (16 bits)**: Número pseudoaleatorio generado por el cliente al enviar una consulta. El servidor copia este mismo identificador en el mensaje de respuesta correspondiente, permitiendo al cliente asociar unívocamente respuestas asíncronas con sus respectivas solicitudes pendientes.
- **Flags (16 bits)**: Conjunto de banderas de control:
  - **QR (1 bit)**: `0` indica que el mensaje es una Consulta (*Query*); `1` indica que es una Respuesta (*Reply*).
  - **Opcode (4 bits)**: Tipo de operación (generalmente `0` para consulta estándar).
  - **AA (Authoritative Answer, 1 bit)**: Activado en `1` si el servidor que emite la respuesta es autoritativo para el dominio consultado; `0` si la respuesta proviene de la memoria caché de un resolver no autoritativo.
  - **TC (Truncation, 1 bit)**: Se activa en `1` si la respuesta supera el tamaño máximo permitido sobre UDP (512 bytes en DNS clásico), alertando al cliente de que el mensaje fue recortado y debe reintentar la consulta utilizando TCP.
  - **RD (Recursion Desired, 1 bit)**: Fijado en `1` por el cliente si desea que el servidor resuelva la consulta de forma recursiva.
  - **RA (Recursion Available, 1 bit)**: Fijado en `1` por el servidor si tiene habilitada la capacidad de resolución recursiva.
  - **Z (3 bits)**: Bits reservados para uso futuro (deben ser cero).
  - **RCODE (Response Code, 4 bits)**: Código de estado de la respuesta:
    - `0`: No error (*NoError*).
    - `1`: Error de formato en la consulta (*FormatError*).
    - `2`: Falla del servidor al procesar la petición (*ServFail*).
    - `3`: Error en el nombre; el dominio solicitado no existe (*NXDomain*).
    - `5`: Consulta rechazada por políticas administrativas (*Refused*).
- **Contadores de Secciones (4 campos de 16 bits)**:
  - **# Questions**: Número de entradas en la sección de preguntas.
  - **# Answer RRs**: Número de registros de recursos devueltos como respuesta directa.
  - **# Authority RRs**: Número de registros de servidores de nombres autoritativos devueltos.
  - **# Additional RRs**: Número de registros adicionales incluidos para asistir en la resolución (por ejemplo, los *Glue records* con las IPs de los servidores de nombres).

### 3.2. Secciones del Cuerpo del Mensaje
1. **Questions**: Contiene el nombre consultado, el tipo de registro solicitado (A, MX, etc.) y la clase de protocolo (típicamente `IN` para Internet).
2. **Answers**: Contiene los RRs que satisfacen directamente la pregunta planteada.
3. **Authority**: Contiene los registros NS de los servidores autoritativos para la zona.
4. **Additional**: Contiene información complementaria útil; por ejemplo, si en la sección de autoridad se listan nombres como `ns1.example.com`, la sección adicional aporta sus registros de tipo A correspondientes para evitar que el cliente tenga que iniciar una nueva resolución completa para hallar dichas IPs.

## 4. Transporte: UDP frente a TCP

DNS opera de forma dual sobre los protocolos de la capa de transporte, utilizando el puerto estándar **53**:
- **UDP (Puerto 53)**: Utilizado para la inmensa mayoría de consultas interactivas ordinarias. Al ser un protocolo sin conexión, no requiere handshake inicial (0 RTT de sobrecarga de transporte), lo que minimiza el retardo percibido y ahorra recursos en los servidores de nombres. El tamaño máximo tradicional de carga útil es de **512 bytes** (ampliable hasta 4096 bytes mediante la extensión EDNS0, RFC 6891).
- **TCP (Puerto 53)**: Empleado obligatoriamente cuando:
  1. Una respuesta UDP activa la bandera de truncamiento (`TC = 1`).
  2. Se realizan transferencias de zona completas (**AXFR** / **IXFR**) entre servidores primarios y secundarios, las cuales transportan archivos extensos y exigen la entrega fiable y ordenada garantizada por TCP.
  3. Respuestas complejas que contienen firmas criptográficas de **DNSSEC**.

## 5. Vulnerabilidades y Vectores de Ataque en DNS

Debido a que el protocolo DNS fue diseñado en los albores de Internet sin mecanismos intrínsecos de cifrado ni autenticación, es susceptible a diversos ataques:

### 5.1. Envenenamiento de Caché (DNS Cache Poisoning / Spoofing)
Un atacante situado en la red o forjando paquetes UDP envía respuestas DNS falsificadas a un resolver local antes de que llegue la respuesta legítima del servidor autoritativo:
- El atacante debe adivinar o predecir el campo **Identification de 16 bits** ($2^{16} = 65,536$ posibilidades) y el **puerto UDP de origen** utilizado por el resolver.
- Si la respuesta fraudulenta es aceptada, el resolver almacena la dirección IP del atacante en su caché. A partir de ese instante, todos los usuarios de la red local que soliciten ese dominio serán redirigidos de forma inadvertida a un servidor malicioso (phishing, robo de credenciales).
- **Mitigaciones actuales**: Aleatorización estricta del puerto de origen UDP (*Source Port Randomization*, multiplicando el espacio de entropía a más de $2^{30}$ combinaciones) y despliegue de **DNSSEC**.

### 5.2. Ataques de Amplificación y Reflexión DNS (DDoS)
Los atacantes aprovechan que UDP no valida la dirección IP de origen para saturar a una víctima:
1. El atacante forja paquetes de consulta DNS colocando como dirección IP de origen la IP de la víctima (reflexión).
2. Se dirigen estas consultas a resolvers DNS públicos abiertos (*Open Resolvers*).
3. Se solicitan registros muy voluminosos, como `ANY` o registros firmados por DNSSEC, logrando factores de amplificación de **20x a 70x**: una consulta de 50 bytes puede generar una respuesta de más de 3000 bytes.
4. El servidor resolver envía la avalancha de respuestas gigantescas hacia la dirección IP de la víctima, agotando completamente el ancho de banda de su enlace.

### 5.3. DNSSEC (DNS Security Extensions)
DNSSEC mitiga la falsificación y el envenenamiento incorporando criptografía de clave pública:
- Cada zona firma digitalmente sus conjuntos de registros (RRset) mediante claves privadas.
- Se introducen nuevos registros criptográficos: **RRSIG** (firma digital), **DNSKEY** (clave pública de la zona), **DS** (*Delegation Signer*, hash de la clave pública ubicado en la zona padre para construir una cadena de confianza criptográfica desde la raíz), y **NSEC/NSEC3** para autenticar la inexistencia de dominios.
- DNSSEC garantiza **autenticidad de origen** e **integridad de los datos**, asegurando que la respuesta recibida proviene indudablemente de la entidad legítima y no fue alterada en tránsito.
