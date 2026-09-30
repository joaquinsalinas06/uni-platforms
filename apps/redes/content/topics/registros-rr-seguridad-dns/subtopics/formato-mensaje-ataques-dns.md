---
kind: subtopic
title: "Formato del Mensaje DNS, Flags de Control y Vectores de Ataque"
order: 2
---

## 1. Estructura Binaria de la Cabecera DNS

El protocolo DNS opera tanto para peticiones como para respuestas mediante una cabecera binaria unificada de exactamente **12 bytes** (96 bits), dividida en seis palabras de 16 bits:

| Offset (Bytes) | Campo (16 bits) | Descripción |
| :--- | :--- | :--- |
| 0 - 1 | **Identification (ID)** | Identificador único de 16 bits asignado por el cliente a la consulta; el servidor lo replica idénticamente en la respuesta. |
| 2 - 3 | **Flags** | Banderas de control de 1 bit y códigos de operación/retorno de 4 bits. |
| 4 - 5 | **QDCOUNT (# Questions)** | Número de entradas en la sección de preguntas (típicamente 1). |
| 6 - 7 | **ANCOUNT (# Answers)** | Número de registros RR devueltos en la sección de respuestas. |
| 8 - 9 | **NSCOUNT (# Authority)** | Número de registros RR que identifican servidores de nombres autoritativos. |
| 10 - 11 | **ARCOUNT (# Additional)** | Número de registros RR complementarios (e.g., registros de pegamento o registros EDNS0). |

## 2. Desglose Detallado de los Flags de Control

Los 16 bits del campo de banderas (*Flags*) codifican el comportamiento semántico de la transacción:
1. **QR (Query/Response Flag, 1 bit)**: Bit 0. `0` para una consulta generada por un cliente; `1` para un mensaje de respuesta emitido por un servidor.
2. **Opcode (4 bits)**: Bits 1-4. Especifica el tipo de consulta. `0` corresponde a una consulta estándar (*QUERY*); otros valores corresponden a consultas inversas (*IQUERY*) o notificaciones de zona (*NOTIFY*).
3. **AA (Authoritative Answer, 1 bit)**: Bit 5. Activado en `1` únicamente en los mensajes de respuesta si el servidor emisor es autoritativo para el dominio solicitado. Si un resolver local responde utilizando su memoria caché, este bit se mantiene en `0` (*Non-authoritative answer*).
4. **TC (Truncation Flag, 1 bit)**: Bit 6. Si la respuesta completa excede los 512 bytes de carga útil máxima de un datagrama UDP clásico, el servidor recorta la respuesta y coloca `TC = 1`. Al detectar este bit activo, la pila de red del cliente descarta el datagrama parcial y reenvía inmediatamente la consulta utilizando el protocolo **TCP** sobre el puerto 53.
5. **RD (Recursion Desired, 1 bit)**: Bit 7. Fijado en `1` por el cliente en su consulta inicial para instruir al servidor a resolver el nombre recursivamente recorriendo la jerarquía en caso de desconocer la respuesta.
6. **RA (Recursion Available, 1 bit)**: Bit 8. Activado en `1` por el servidor en su respuesta para confirmar que admite y ofrece el servicio de resolución recursiva.
7. **Z (Reserved, 3 bits)**: Bits 9-11. Reservados para uso futuro en los estándares del IETF; deben ser siempre cero.
8. **RCODE (Response Code, 4 bits)**: Bits 12-15. Código de retorno del estado de la operación:
   - `0 (NoError)`: Consulta resuelta con éxito.
   - `1 (FormErr)`: El servidor no pudo interpretar el formato de la consulta.
   - `2 (ServFail)`: El servidor experimentó un problema interno (e.g., pérdida de conectividad con servidores delegados).
   - `3 (NXDomain)`: Error de nombre; el dominio solicitado no existe en el espacio de nombres.
   - `5 (Refused)`: El servidor rechazó deliberadamente responder por motivos de política de acceso o seguridad.

## 3. Vectores de Ataque contra la Infraestructura DNS

### 3.1. Envenenamiento de Caché (DNS Cache Poisoning / Kaminsky Attack)
El envenenamiento de caché consiste en inyectar registros falsificados en la memoria de un resolver local:
- Cuando el resolver local envía una consulta iterativa a un servidor autoritativo, queda a la espera de un paquete UDP en un puerto efímero con un ID de transacción de 16 bits.
- Un atacante inunda al resolver con cientos de miles de respuestas falsificadas, intentando acertar el ID de transacción antes de que llegue la respuesta legítima.
- Si tiene éxito, el resolver almacena la IP del atacante para el dominio atacado (por ejemplo, `banco.com`). Todos los clientes que consulten al resolver serán derivados al sitio fraudulento.
- **Defensas**:
  - *Aleatorización del puerto de origen UDP*: El resolver asigna un puerto de origen completamente impredecible de 16 bits para cada consulta saliente, elevando el espacio de entropía a $2^{16} \times 2^{16} \approx 4.29 \times 10^9$ combinaciones, haciendo inviable el ataque por fuerza bruta probabilística.
  - *DNSSEC*: Validación de firmas criptográficas digitales.

### 3.2. Ataques de Amplificación y Reflexión Basados en DNS
Los atacantes aprovechan que UDP es un protocolo sin conexión donde la dirección IP de origen de la cabecera IP no es verificada:
1. El atacante envía consultas DNS a servidores resolvers abiertos distribuidos en Internet (*Open Resolvers*).
2. En cada datagrama, el atacante falsifica la dirección IP de origen (*IP Spoofing*), colocando la IP de la víctima objetivo.
3. El atacante solicita registros que generan respuestas sumamente extensas (por ejemplo, consultas de tipo `ANY` o dominios firmados con firmas DNSSEC masivas).
4. El servidor resolver envía la respuesta (de hasta varios kilobytes) a la víctima. Con un factor de amplificación $\beta = \frac{L_{\text{respuesta}}}{L_{\text{consulta}}} \approx 20\text{ a }70$, un atacante con un enlace de tan solo 100 Mbps puede desatar un bombardeo de 2 Gbps a 7 Gbps sobre el enlace de la víctima, causando una denegación de servicio absoluta.

### 3.3. Despliegue de DNSSEC
La extensión DNSSEC soluciona la falta de autenticación intrínseca en DNS mediante criptografía asimétrica:
- Se agregan registros `RRSIG` que contienen una firma digital calculada sobre cada conjunto de registros RR del mismo tipo y nombre (*RRset*).
- Los resolvers validadores verifican la firma utilizando la clave pública contenida en el registro `DNSKEY` de la zona.
- Se establece una **cadena de confianza** que va desde la clave de la zona raíz (cuyo anclaje de confianza es de conocimiento público global), pasando por los registros `DS` en los servidores TLD, hasta llegar a la clave de la zona autoritativa individual.
- DNSSEC impide de forma absoluta el envenenamiento de caché y la suplantación de identidad (spoofing), aunque no cifra el contenido de la consulta (lo cual se aborda mediante tecnologías como DNS over HTTPS - DoH o DNS over TLS - DoT).
