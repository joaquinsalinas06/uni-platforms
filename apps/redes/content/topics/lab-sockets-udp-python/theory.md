---
kind: theory
title: "Laboratorio: Programación de Sockets Datagrama UDP"
---

## 1. El Protocolo UDP en la Capa de Transporte

El **User Datagram Protocol (UDP)**, formalizado en el RFC 768, es un protocolo de transporte minimalista, ligero y sin conexión (*connectionless*). A diferencia de TCP, UDP no implementa mecanismos complejos de control de congestión, control de flujo, reordenamiento de paquetes ni confirmaciones de entrega (ACKs). Se limita a ofrecer dos servicios esenciales por encima de la capa de red (IP):
1. **Multiplexación y Demultiplexación por Puertos**: Permite que múltiples procesos y aplicaciones independientes compartan la misma dirección IP utilizando números de puerto de 16 bits.
2. **Detección Básica de Errores**: Provee un campo de comprobación (*Checksum*) opcional en IPv4 y obligatorio en IPv6 para verificar la integridad del datagrama.

### 1.1. Estructura Binaria de la Cabecera UDP
La cabecera de UDP es extremadamente compacta, ocupando exactamente **8 bytes** (64 bits), estructurados en cuatro campos de 16 bits (2 bytes cada uno):

| Offset (Bytes) | Campo | Tamaño | Descripción |
| :---: | :---: | :---: | :--- |
| 0 - 1 | **Source Port** | 16 bits | Puerto de origen del proceso emisor (rango: $0$ a $65535$). Si no se espera respuesta, puede ser cero. |
| 2 - 3 | **Destination Port** | 16 bits | Puerto de destino del servicio receptor (e.g., 53 para DNS, 67 para DHCP). |
| 4 - 5 | **Length** | 16 bits | Longitud total del datagrama en bytes, incluyendo la cabecera fija de 8 bytes y los datos: $L_{\text{UDP}} = 8 + L_{\text{payload}}$. |
| 6 - 7 | **Checksum** | 16 bits | Suma de comprobación calculada sobre una pseudo-cabecera IP, la cabecera UDP y el payload. |

En la cabecera del datagrama IPv4, el protocolo de transporte UDP se identifica mediante el valor numérico **17** en base decimal (`0x11` en notación hexadecimal) en el campo *Protocol*.

### 1.2. Límites de Carga Útil y Fragmentación IP
- **Capacidad Máxima Teórica en IPv4**:
  El campo *Total Length* de la cabecera IPv4 tiene 16 bits, lo que limita el tamaño máximo de un paquete IP a $2^{16} - 1 = 65,535\text{ bytes}$. Restando la cabecera IPv4 mínima obligatoria (20 bytes) y la cabecera UDP (8 bytes):
  $$L_{\text{payload, max}} = 65,535 - 20 - 8 = 65,507\text{ bytes}$$
- **Unidad Máxima de Transferencia (MTU) y Fragmentación**:
  En enlaces de red de área local Ethernet, la MTU estándar es de $1,500\text{ bytes}$. Si un proceso de aplicación genera un mensaje UDP con un payload mayor a:
  $$L_{\text{payload, no-frag}} = \text{MTU} - 20 - 8 = 1,472\text{ bytes}$$
  la capa de red se ve forzada a dividir el datagrama en múltiples **fragmentos IP**. Cada fragmento viaja de forma independiente compartiendo el mismo *Identification* de la cabecera IP, con valores de *Fragment Offset* crecientes y la bandera *More Fragments (MF)* activa hasta el último fragmento. La pérdida de un solo fragmento en tránsito provoca el descarte completo del datagrama UDP en el host receptor.

## 2. La API de Sockets UDP en Python

En Python, la biblioteca estándar `socket` provee acceso directo a las primitivas del sistema operativo mediante llamadas a la API de sockets POSIX.

### 2.1. Creación de un Socket Datagrama
Para instanciar un socket UDP:
```python
import socket

# AF_INET especifica la familia de direcciones IPv4
# SOCK_DGRAM especifica el tipo de socket para datagramas UDP sin conexión
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
```

### 2.2. Receptor UDP (`udp_receiver.py`)
El receptor actúa como un servidor pasivo que escucha en una dirección y puerto definidos:
```python
import socket

SERVER_IP = "127.0.0.1"  # Loopback local
SERVER_PORT = 12000
BUFFER_SIZE = 4096

# Crear socket datagrama
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Asociar (bind) el socket a la IP y puerto especificados
server_socket.bind((SERVER_IP, SERVER_PORT))
print(f"Servidor UDP escuchando en {SERVER_IP}:{SERVER_PORT}...")

try:
    while True:
        # recvfrom bloquea hasta recibir un datagrama entrante
        data, client_address = server_socket.recvfrom(BUFFER_SIZE)
        mensaje_decodificado = data.decode('utf-8')
        print(f"Recibido de {client_address}: {mensaje_decodificado}")
        
        # Opcional: respuesta al emisor utilizando la tupla client_address
        respuesta = f"ACK: {mensaje_decodificado.upper()}"
        server_socket.sendto(respuesta.encode('utf-8'), client_address)
except KeyboardInterrupt:
    print("\nCerrando servidor UDP.")
finally:
    server_socket.close()
```

### 2.3. Emisor UDP (`udp_sender.py`)
El emisor no requiere ejecutar un handshake previo (`connect`); simplemente empaqueta los bytes y los proyecta a la red hacia la tupla destino:
```python
import socket

TARGET_IP = "127.0.0.1"
TARGET_PORT = 12000

client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Opcional: configurar un timeout para evitar bloqueos indefinidos si se espera respuesta
client_socket.settimeout(2.0)

mensaje = "Hola desde el cliente UDP de Redes y Comunicaciones"
datos_a_enviar = mensaje.encode('utf-8')

# sendto transmite el datagrama directamente al destino
client_socket.sendto(datos_a_enviar, (TARGET_IP, TARGET_PORT))
print(f"Enviados {len(datos_a_enviar)} bytes a {TARGET_IP}:{TARGET_PORT}")

try:
    respuesta, server_addr = client_socket.recvfrom(4096)
    print(f"Respuesta del servidor ({server_addr}): {respuesta.decode('utf-8')}")
except socket.timeout:
    print("Tiempo de espera agotado: no se recibió respuesta (característica no confiable de UDP).")
finally:
    client_socket.close()
```

## 3. Análisis Experimental en Entornos Loopback y Red Local (P2P)

### 3.1. Captura en Interfaz Loopback (`127.0.0.1` / `lo0`)
- Al ejecutar el emisor y receptor en la misma máquina, el tráfico no sale a la tarjeta de red física; circula por el controlador lógico de loopback (*lo* o *loopback0*).
- En Wireshark, al capturar sobre la interfaz loopback aplicando el filtro `udp.port == 12000`:
  - Se observa un datagrama directo con IP origen `127.0.0.1` e IP destino `127.0.0.1`.
  - El TTL (*Time to Live*) en la cabecera IP suele mostrar el valor máximo asignado por el kernel (e.g., 64 en Linux/macOS o 128 en Windows) y no disminuye, ya que no atraviesa ningún router intermedio.
  - El campo *Length* del paquete UDP coincide exactamente con $8\text{ bytes (cabecera)} + \text{longitud de la cadena UTF-8}$.

### 3.2. Comunicación entre Dos Equipos en LAN
Al trasladar el experimento a dos computadores físicos en la misma red local (e.g., Laptop A con IP `192.168.1.15` y Laptop B con IP `192.168.1.20`):
1. **Configuración de Firewall**: Es imprescindible habilitar una regla en el cortafuegos del receptor para permitir datagramas UDP entrantes en el puerto elegido.
2. **Direccionamiento**: El script emisor en Laptop A debe configurar `TARGET_IP = "192.168.1.20"`. El receptor en Laptop B puede hacer `bind(("", 12000))` (cadena vacía o `INADDR_ANY`) para escuchar en todas las interfaces de red disponibles.
3. **Simetría de Puertos**: El datagrama enviado desde A hacia B tiene origen `192.168.1.15:puerto_efimero` y destino `192.168.1.20:12000`. La respuesta de B hacia A invierte simétricamente los puertos: origen `12000` y destino `puerto_efimero`.

## 4. Diagnóstico de Anomalías y Comportamientos de Red

### 4.1. Envío a Direcciones IP No Enrutables (e.g., `192.0.2.1`)
Si se modifica `TARGET_IP` en el script emisor hacia una dirección reservada o inalcanzable (e.g., el bloque de prueba TEST-NET-1 `192.0.2.1` según RFC 5737):
- La llamada `client_socket.sendto()` en Python **no lanza ningún error inmediato**. Dado que UDP no realiza negociación de conexión ni espera confirmación, la función retorna exitosamente tras depositar los datos en el buffer de salida del sistema operativo.
- En Wireshark, se aprecia que el host local emite solicitudes ARP en la red local preguntando quién tiene dicha IP; al no recibir respuesta ARP, o si un router intermedio rechaza el paquete, se genera un mensaje de control **ICMP Destination Unreachable (Host Unreachable o Network Unreachable)**.

### 4.2. Validación de Checksum y Checksum Offloading
En muchas capturas de Wireshark, el campo *Checksum* de los paquetes UDP salientes aparece marcado en rojo con la advertencia *[UDP Checksum Incorrect]* o con valor `0x0000`:
- Esto no indica que el paquete esté dañado. En sistemas operativos modernos, el cálculo intensivo de la suma de comprobación se delega al hardware de la tarjeta de interfaz de red (**NIC Checksum Offloading**).
- La tarjeta de captura (o el driver de captura WinPcap/Npcap) intercepta los paquetes en la pila del kernel antes de que el microprocesador de la NIC calcule e inserte el checksum definitivo en el cable.

### 4.3. Prueba con Payloads Masivos (e.g., 12,000 Bytes)
Al transmitir un mensaje de 12,000 bytes en una sola llamada `sendto()` sobre Ethernet:
- El datagrama excede holgadamente la MTU de 1500 bytes.
- En Wireshark, el tráfico se visualiza como una secuencia de **9 fragmentos IP** (8 fragmentos de 1480 bytes de carga útil IP más 1 fragmento final de 168 bytes).
- Solo el primer fragmento contiene la cabecera UDP de 8 bytes; los fragmentos subsiguientes transportan únicamente porciones del payload original. El receptor ensambla todos los fragmentos en su buffer de reensamblado IP antes de entregar el mensaje de 12,000 bytes unificado a la llamada `recvfrom()` del script de Python.
