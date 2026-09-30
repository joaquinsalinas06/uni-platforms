---
kind: subtopic
title: "Inspección de Paquetes DNS y Análisis de Tráfico en Wireshark"
order: 2
---

## 1. Configuración de Captura y Filtros en Wireshark

Para aislar el tráfico DNS generado durante una sesión de navegación o diagnósticos con `nslookup`:
1. Iniciar Wireshark y seleccionar la interfaz de red activa (Wi-Fi, Ethernet o interfaz de loopback).
2. Introducir el filtro de visualización:
   ```text
   dns
   ```
   O para observar la correlación completa entre resolución de nombres, transporte y datos web:
   ```text
   dns || tcp.port == 80 || http
   ```
3. Ejecutar una consulta limpia tras haber vaciado el caché del sistema operativo (`ipconfig /flushdns` o `sudo killall -HUP mDNSResponder`).

## 2. Anatomía de la Trama DNS en la Captura

Al seleccionar un paquete de consulta DNS en la ventana de paquetes y expandir el árbol del protocolo:
- **Capa de Transporte (User Datagram Protocol)**:
  - `Source Port`: Puerto efímero (e.g., 58492).
  - `Destination Port`: 53 (puerto reservado estándar para DNS).
  - `Length`: Longitud total del datagrama UDP en bytes (cabecera UDP de 8 bytes + carga DNS).
  - `Checksum`: Código de comprobación de integridad. En sistemas operativos modernos, el cálculo puede delegarse al hardware de la tarjeta de red (*Checksum Offloading*).
- **Capa de Aplicación (Domain Name System)**:
  - `Transaction ID`: e.g., `0x3a4b`. Permite parear la solicitud con la respuesta entrante.
  - `Flags`:
    - `0x0100`: Consulta estándar con `Recursion Desired = 1`.
  - `Questions`: 1 (Nombre consultado, Type A, Class IN).
  - `Answer RRs`, `Authority RRs`, `Additional RRs`: 0 en la solicitud.

En la trama de respuesta recibida:
- El puerto de origen es 53 y el de destino es el puerto efímero del cliente (58492).
- El `Transaction ID` coincide exactamente (`0x3a4b`).
- En `Flags`: `0x8180` (`Response: 1`, `Recursion available: 1`, `Reply code: No error (0)`).
- La sección `Answers` contiene los registros A devueltos con sus valores de TTL decrecientes.

## 3. Comportamiento ante Respuestas Grandes y Flag TC

En consultas complejas como `nslookup -type=ANY google.com`:
- Si la respuesta total excede los 512 bytes y el cliente no ha negociado extensiones EDNS0 con un tamaño de buffer superior, el servidor activa el bit de truncamiento:
  ```text
  .... ..1. .... .... = Truncated: Message is truncated
  ```
- Al recibir esta bandera, la pila del sistema operativo descarta los datos parciales e inicia de inmediato un establecimiento de conexión TCP hacia el puerto 53 del servidor emitiendo un paquete con la bandera `[SYN]`.
- Una vez completado el handshake TCP de 3 vías, la consulta se reenvía dentro de un flujo TCP libre de la restricción de 512 bytes, permitiendo recibir la lista completa de registros.

## 4. Medición Precisa de Tiempos y Rendimiento

Wireshark registra marcas de tiempo (*timestamps*) relativas al inicio de la captura con precisión de microsegundos:
- **Latencia de Resolución DNS**:
  $$\Delta t_{\text{DNS}} = t_{\text{respuesta}} - t_{\text{consulta}}$$
  Al contrastar un resolver local provisto por el ISP frente a resolvers públicos globales (`8.8.8.8` o `1.1.1.1`):
  - En consultas sucesivas, el resolver local puede responder en menos de 5 ms si el registro está en su caché de proximidad.
  - Los resolvers públicos de Google o Cloudflare utilizan redes Anycast mundiales con cachés altamente poblados por millones de usuarios, ofreciendo una latencia consistente y soporte robusto para DNSSEC.
- **Validación del Enlace Web**:
  Wireshark confirma empíricamente que la dirección IP de destino a la que se conecta el primer paquete `TCP SYN` del navegador corresponde exactamente a una de las direcciones IP entregadas en la sección `Answers` de la respuesta DNS previa.
