---
title: "Ejercicios Extra: DHCP, Sockets UDP y Capa de Aplicación"
category: "laboratorio"
categoryLabel: "Laboratorios y Ejercicios Extra"
order: 3
---

# Ejercicios Extra: DHCP, Sockets UDP y Capa de Aplicación (CS4054)

Material complementario de preparación para laboratorio y exámenes parciales de Redes y Comunicaciones (UTEC). Contiene la resolución rigurosa, teórica y de código para los problemas avanzados de inspección de paquetes, sockets y transferencia confiable.

---

## Pregunta 1. Inspección del Proceso DHCP DORA con Wireshark

### Enunciado y Contexto
Al forzar al sistema operativo a liberar y renovar su concesión IPv4 (`ipconfig /release` y `/renew` en Windows, o `sudo dhclient -r` y `dhclient` en Linux), se captura el intercambio completo de 4 pasos (DORA: Discover, Offer, Request, ACK) mediante el filtro `bootp or dhcp` en Wireshark.

### 1) Transporte y Direccionamiento
- **Puertos UDP**:
  - Puerto origen del cliente: `UDP 68` (DHCP Client / bootpc).
  - Puerto destino del servidor: `UDP 67` (DHCP Server / bootps).
- **Direcciones IP en DHCP Discover**:
  - **IP Origen**: `0.0.0.0` ("This host on this network"). El cliente no posee aún una dirección IP asignada ni configurada en la interfaz de red.
  - **IP Destino**: `255.255.255.255` (Limited Broadcast). El cliente desconoce la dirección IP del servidor DHCP local; por lo tanto, el datagrama debe ser recibido y procesado por todos los nodos en el dominio de broadcast de la subred local (sin ser enrutado más allá de la puerta de enlace).

### 2) Transaction ID (XID)
- **Comportamiento en la traza**: El identificador de transacción de 32 bits (`Transaction ID`, campo `xid` en la cabecera BOOTP) se genera aleatoriamente por el cliente en el paquete *Discover* y **se mantiene estrictamente idéntico** en los 4 paquetes de la secuencia (Discover, Offer, Request, ACK).
- **Propósito Crítico sobre UDP**: Dado que UDP es un protocolo no orientado a conexión y sin estado, múltiples clientes en la misma LAN pueden solicitar concesiones concurrentemente mediante mensajes de broadcast. El `xid` permite al cliente correlacionar unívocamente las ofertas (*Offers*) y confirmaciones (*ACKs*) que le corresponden a su propia solicitud, descartando respuestas destinadas a otros terminales.

### 3) Parámetros Ofrecidos y Concesión (Lease)
En los paquetes *DHCP Offer* y *DHCP ACK*, bajo la sección de opciones DHCP (*Bootstrap Protocol Options*):
- **IP asignada (Your Client IP Address, `yiaddr`)**: e.g., `192.168.1.105`.
- **IP Lease Time (Opción 51)**: Duración temporal de la concesión en segundos (e.g., `86400` segundos = 24 horas).
- **Parámetros de configuración adicionales**:
  - **Subnet Mask (Opción 1)**: `255.255.255.0` (/24).
  - **Router / Default Gateway (Opción 3)**: Dirección IP de la interfaz LAN del router (e.g., `192.168.1.1`).
  - **Domain Name Server (Opción 6)**: Direcciones de resolutores DNS (e.g., `1.1.1.1`, `8.8.8.8`).

### 4) Entrega de Capa 2 vs. Capa 3
**¿Cómo llega el *DHCP Offer* al host si este aún carece de IP válida?**
- En la Capa 3 (Red), el servidor puede enviar el paquete a la IP de broadcast `255.255.255.255` o directamente a la IP propuesta (`yiaddr`).
- En la Capa 2 (Enlace), el servidor DHCP inspecciona el campo `chaddr` (*Client Hardware Address*) del mensaje Discover del cliente. El servidor coloca la dirección MAC física del cliente (e.g., `00:1A:2B:3C:4D:5E`) en el encabezado Ethernet de destino (*Destination MAC Address*). La tarjeta de red del cliente (NIC) reconoce su propia dirección MAC a nivel de hardware y entrega la trama a la pila de red del sistema operativo, permitiéndole leer la oferta antes de tener asignada una IP lógica.

---

## Pregunta 2. DNS Truncation Fallback Manual (Programación de Sockets en Python)

### Enunciado y Problema
Cuando una respuesta DNS sobre UDP excede los 512 bytes tradicionales (RFC 1035), el servidor establece el bit `TC` (*Truncated*) en 1 dentro de las banderas de cabecera. El cliente debe detectar este bit, descartar el datagrama UDP incompleto, abrir una conexión TCP al puerto 53 de 8.8.8.8, prefijar un campo de longitud de 2 bytes (RFC 7766), enviar la consulta y recibir la respuesta íntegra.

### Implementación Completa en Python (Librería `socket` Estándar)

```python
import socket
import struct

def build_dns_query(domain: str, qtype: int = 16) -> bytes:
    """
    Construye una consulta DNS cruda.
    Header: ID=0x1234, Flags=0x0100 (Standard query, RD=1), QDCOUNT=1, AN=0, NS=0, AR=0.
    """
    query_id = 0x1234
    flags = 0x0100  # Recursion Desired (RD = 1)
    qdcount = 1
    ancount = 0
    nscount = 0
    arcount = 0
    header = struct.pack('!HHHHHH', query_id, flags, qdcount, ancount, nscount, arcount)

    # QNAME: google.com -> \x06google\x03com\x00
    qname = b''
    for part in domain.split('.'):
        qname += struct.pack('!B', len(part)) + part.encode('ascii')
    qname += b'\x00'

    # QTYPE=16 (TXT), QCLASS=1 (IN)
    question = qname + struct.pack('!HH', qtype, 1)
    return header + question

def dns_query_with_tcp_fallback(domain: str, dns_server: str = '8.8.8.8'):
    raw_query = build_dns_query(domain, qtype=16)  # TXT record

    # 1. Intento por UDP
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.settimeout(3.0)
    print(f"[UDP] Enviando consulta TXT para '{domain}' a {dns_server}:53...")
    udp_sock.sendto(raw_query, (dns_server, 53))

    try:
        data, _ = udp_sock.recvfrom(4096)
        udp_sock.close()
    except socket.timeout:
        print("[UDP] Timeout sin respuesta.")
        return

    # 2. Parsear el campo Flags (segundo entero de 16 bits)
    header = struct.unpack('!HHHHHH', data[:12])
    flags = header[1]
    # Bit TC está en el bit 9 (máscara 0x0200)
    is_truncated = bool(flags & 0x0200)
    print(f"[UDP] Respuesta recibida ({len(data)} bytes). Flags: 0x{flags:04X}. Bit TC = {is_truncated}")

    if not is_truncated:
        print("[OK] Respuesta DNS completa recibida sobre UDP.")
        return data

    # 3. Fallback a TCP
    print("[FALLBACK] Bit TC=1 detectado. Conmutando a TCP puerto 53...")
    tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_sock.settimeout(5.0)
    tcp_sock.connect((dns_server, 53))

    # RFC 7766: Prefijo de 2 bytes con la longitud exacta del payload
    tcp_payload = struct.pack('!H', len(raw_query)) + raw_query
    tcp_sock.sendall(tcp_payload)

    # Leer longitud de respuesta (primeros 2 bytes)
    raw_len = tcp_sock.recv(2)
    response_len = struct.unpack('!H', raw_len)[0]

    # Leer el payload completo según response_len
    tcp_response = b''
    while len(tcp_response) < response_len:
        chunk = tcp_sock.recv(response_len - len(tcp_response))
        if not chunk:
            break
        tcp_response += chunk

    tcp_sock.close()
    print(f"[TCP] Respuesta completa recibida con éxito: {len(tcp_response)} bytes.")
    return tcp_response

if __name__ == '__main__':
    dns_query_with_tcp_fallback('google.com')
```

---

## Pregunta 3. Transferencia Confiable sobre UDP con Pérdida Artificial (RDT 3.0)

### Enunciado y Especificación
Transferencia de archivo binario entre dos laptops sobre una red con un 15% de pérdida aleatoria de paquetes, implementando Stop-and-Wait (RDT 3.0):
- **Segmentación**: Fragmentos de 1024 bytes de datos.
- **Cabecera RDT**: 1 byte con el número de secuencia (alternante 0 o 1).
- **Manejo de Pérdidas**: Timeout de 0.5 segundos en el emisor.
- **Lado Receptor**: Envío de ACK confirmando el paquete recibido; si llega un duplicado, se descarta el dato y se reenvía el ACK.

### Código del Emisor (`sender_rdt3.py`)

```python
import socket
import time
import os
import random

SERVER_IP = "192.168.1.50"
SERVER_PORT = 12000
CHUNK_SIZE = 1024
TIMEOUT = 0.5
LOSS_RATE = 0.15

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(TIMEOUT)

def send_file(filename: str):
    seq_num = 0
    with open(filename, "rb") as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                # Enviar paquete de fin (EOF)
                for _ in range(5):
                    sock.sendto(bytes([2]), (SERVER_IP, SERVER_PORT))
                print("Fin de transmisión del archivo.")
                break

            packet = bytes([seq_num]) + chunk
            acked = False

            while not acked:
                # Inyección artificial de pérdidas en envío
                if random.random() >= LOSS_RATE:
                    sock.sendto(packet, (SERVER_IP, SERVER_PORT))
                else:
                    print(f"[DROP SIMULADO] Paquete Seq={seq_num} descartado.")

                try:
                    ack_data, _ = sock.recvfrom(16)
                    ack_seq = ack_data[0]
                    if ack_seq == seq_num:
                        acked = True
                        seq_num = 1 - seq_num  # Alternar 0 <-> 1
                    else:
                        print(f"[ACK DUPLICADO] Esperado={seq_num}, Recibido={ack_seq}")
                except socket.timeout:
                    print(f"[TIMEOUT] Reenviando paquete Seq={seq_num}...")

send_file("imagen_prueba.png")
```

### Código del Receptor (`receiver_rdt3.py`)

```python
import socket
import random

LISTEN_IP = "0.0.0.0"
LISTEN_PORT = 12000
LOSS_RATE = 0.15

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((LISTEN_IP, LISTEN_PORT))

def receive_file(output_filename: str):
    expected_seq = 0
    print(f"Receptor escuchando en puerto {LISTEN_PORT}...")

    with open(output_filename, "wb") as f:
        while True:
            packet, client_addr = sock.recvfrom(2048)
            seq_num = packet[0]

            if seq_num == 2:  # Señal EOF
                print("Archivo recibido completamente.")
                break

            payload = packet[1:]

            if seq_num == expected_seq:
                f.write(payload)
                expected_seq = 1 - expected_seq

            # Simular pérdida de ACK
            if random.random() >= LOSS_RATE:
                sock.sendto(bytes([seq_num]), client_addr)
            else:
                print(f"[DROP SIMULADO] ACK={seq_num} descartado.")

receive_file("imagen_recibida.png")
```

### Verificación de Integridad
Ambos equipos ejecutan `md5sum imagen_prueba.png` y `md5sum imagen_recibida.png`. Los hashes criptográficos coinciden exactamente bit a bit, demostrando que el protocolo Stop-and-Wait garantiza la entrega confiable y secuencial a pesar de un canal físico con pérdida del 15%.

---

## Pregunta 4. Alternating-Bit Protocol (ABP) sobre RTP

### Estructura de la Cabecera RTP (RFC 3550)
La cabecera básica de RTP consta de 12 bytes:
1. `Byte 0`: Version (2 bits = 2), Padding (1 bit = 0), Extension (1 bit = 0), CSRC Count (4 bits = 0) $\to$ `0x80`.
2. `Byte 1`: Marker (1 bit = 0), Payload Type (7 bits = 96 para dinámico) $\to$ `96` (`0x60`).
3. `Bytes 2-3`: Sequence Number (16 bits) $\to$ se alterna `0` y `1`.
4. `Bytes 4-7`: Timestamp (32 bits) $\to$ `int(time.time())`.
5. `Bytes 8-11`: SSRC Identifier (32 bits) $\to$ `1234`.

Formato en Python con `struct.pack('!BBHII', ...)`:
- `!` = Network Byte Order (Big-Endian).
- `B` = unsigned char (1 byte).
- `H` = unsigned short (2 bytes).
- `I` = unsigned int (4 bytes).

### Código Integrado de Emisor y Receptor RTP-ABP

```python
import socket
import struct
import time

def create_rtp_packet(seq_num: int, payload: str, ssrc: int = 1234) -> bytes:
    version = 2
    padding = 0
    extension = 0
    csrc_count = 0
    marker = 0
    payload_type = 96

    byte0 = (version << 6) | (padding << 5) | (extension << 4) | csrc_count
    byte1 = (marker << 7) | (payload_type & 0x7F)
    timestamp = int(time.time()) & 0xFFFFFFFF

    header = struct.pack('!BBHII', byte0, byte1, seq_num, timestamp, ssrc)
    return header + payload.encode('utf-8')

# Receiver Logic
def rtp_receiver_loop():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('127.0.0.1', 5005))
    expected_seq = 0
    print("[RTP Receiver] Listo en 127.0.0.1:5005")

    while True:
        data, addr = sock.recvfrom(2048)
        if len(data) < 12:
            continue
        byte0, byte1, seq_num, timestamp, ssrc = struct.unpack('!BBHII', data[:12])
        payload = data[12:].decode('utf-8', errors='ignore')

        if seq_num == expected_seq:
            print(f"[RX OK] Seq: {seq_num} | Timestamp: {timestamp} | Datos: '{payload}'")
            # Enviar ACK con el número de secuencia
            ack = struct.pack('!H', seq_num)
            sock.sendto(ack, addr)
            expected_seq = (expected_seq + 1) % 2
        else:
            print(f"[RX DUP/OUT] Recibido Seq: {seq_num}, Esperado: {expected_seq}. Reenviando ACK previo.")
            ack = struct.pack('!H', seq_num)
            sock.sendto(ack, addr)
```
