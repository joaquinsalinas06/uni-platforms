---
kind: subtopic
title: "Patrones de Comunicación Cliente-Servidor y Análisis con Wireshark"
order: 2
---

## 1. Arquitectura de Comunicación en Red Local

La implementación práctica de una sesión cliente-servidor UDP involucra coordinar dos procesos que pueden ejecutarse en el mismo dispositivo (usando la interfaz virtual loopback `127.0.0.1`) o en hosts distintos conectados a una red de área local (LAN):

1. **Receptor / Servidor**: Debe iniciarse antes que el emisor para que el socket esté enlazado (`bind`) al puerto objetivo cuando lleguen los paquetes.
2. **Emisor / Cliente**: Obtiene la dirección IP del servidor en la LAN mediante el comando `ipconfig` (Windows) o `ip addr` / `ifconfig` (Linux/macOS) y proyecta datagramas hacia el puerto del receptor.

## 2. Flujo de Datos y Simetría Bidireccional

A diferencia de TCP, donde existe una conexión persistente orientada a la conexión, en UDP cada datagrama recibido incluye la dirección de retorno en la tupla `client_address`:
- El servidor extrae la dirección IP y el puerto efímero del remitente directamente de la llamada `data, addr = sock.recvfrom(bufsize)`.
- El servidor puede responder al cliente inmediatamente invocando:
  ```python
  sock.sendto(b"Respuesta procesada", addr)
  ```
- No se requiere crear un socket secundario de bienvenida ni realizar llamadas a `accept()`.

## 3. Observación de Tráfico con Wireshark

Al configurar Wireshark con el filtro `udp.port == 12000`:
- **Datagrama Saliente (Cliente $\to$ Servidor)**:
  - Capa IP: Dirección IP de origen (e.g., `192.168.1.15`), Dirección IP de destino (e.g., `192.168.1.20`).
  - Capa UDP: Puerto de origen efímero asignado por el SO (e.g., `51342`), Puerto de destino `12000`.
  - Campo *Length*: Muestra exactamente $8 + \text{longitud en bytes del mensaje}$.
- **Datagrama de Retorno (Servidor $\to$ Cliente)**:
  - Los puertos y direcciones se invierten de forma estrictamente simétrica:
    - IP Origen: `192.168.1.20` $\to$ IP Destino: `192.168.1.15`.
    - Puerto Origen: `12000` $\to$ Puerto Destino: `51342`.

## 4. Escenarios de Diagnóstico Avanzado

### Comportamiento ante Puertos Cerrados
Si el emisor envía un datagrama UDP a un puerto en el que ninguna aplicación está escuchando:
- El emisor no recibe ningún aviso dentro de su llamada `sendto()`.
- El sistema operativo de la máquina de destino detecta que el puerto de transporte carece de un socket asociado y devuelve un mensaje de control de la capa de red: **ICMP Port Unreachable (Type 3, Code 3)**.
- Wireshark permite capturar este mensaje ICMP y evidenciar cómo la capa de red asiste a la capa de transporte en la notificación de anomalías.

### Pruebas de Estrés con Payloads Gigantes y Fragmentación IP
Al alterar el script emisor para transmitir una carga masiva (e.g., 12,000 bytes):
- Como 12,000 bytes excede el límite MTU de 1500 bytes de la trama Ethernet, el módulo IP del kernel fragmenta el paquete en 9 fragmentos sucesivos.
- En la captura se comprueba que:
  - Todos los fragmentos llevan el mismo campo *Identification* de 16 bits en la cabecera IP.
  - Los fragmentos 1 a 8 tienen activo el bit *More Fragments = 1*. El noveno fragmento tiene *More Fragments = 0*.
  - El campo *Fragment Offset* incrementa en múltiplos de 8 bytes (offset 0, 185, 370, etc.).
  - Solo el primer fragmento contiene la cabecera UDP. Si cualquiera de estos 9 fragmentos sufre un error de bit o se pierde en la red, todo el mensaje de 12,000 bytes se pierde íntegramente sin que la aplicación emisora sea advertida, ilustrando las limitaciones inherentes del transporte no confiable sin control de congestión.
