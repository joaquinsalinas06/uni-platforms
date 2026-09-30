---
kind: subtopic
title: "Programación de Sockets Datagrama UDP en Python"
order: 1
---

## 1. La Interfaz de Sockets BSD y el Modelo Datagrama

La abstracción de socket es el punto de acceso estándar del sistema operativo para que los procesos de usuario interactúen con la pila de protocolos de red TCP/IP. En la programación orientada a datagramas:
- No existe el concepto de flujo continuo de bytes (*byte stream*), a diferencia de TCP.
- Cada operación de lectura o escritura maneja **mensajes discretos e independientes** (*datagramas*).
- Los límites entre mensajes se preservan rígidamente: una llamada a `sendto()` de $N$ bytes corresponde exactamente a una entrega de $N$ bytes en una única llamada `recvfrom()` del receptor (siempre que el buffer sea suficientemente grande).

## 2. Primitivas de la API de Sockets en Python

El módulo estándar `socket` de Python expone las llamadas al sistema nativas:

### Instanciación del Socket
```python
import socket

# socket(family, type, proto)
# AF_INET: Dominio de direcciones IPv4 (32 bits)
# SOCK_DGRAM: Socket de datagramas no confiable orientado a UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
```

### Operación `bind(address)`
Asocia el socket a una interfaz de red y un puerto local específico:
```python
# address es una tupla (host, port)
# Si host es "" o "0.0.0.0", el socket escucha en todas las interfaces disponibles
sock.bind(("0.0.0.0", 12000))
```
- En un servidor o receptor pasivo, `bind()` es obligatorio para fijar el puerto en el que los clientes enviarán datos.
- En un cliente emisor ordinario, `bind()` suele omitirse; el sistema operativo asigna dinámicamente un puerto efímero libre la primera vez que se ejecuta `sendto()`.

### Operación `sendto(bytes, address)`
Transmite un bloque de bytes hacia la dirección de red especificada:
```python
destino = ("192.168.1.50", 12000)
mensaje_bytes = "Mensaje de telemetría".encode('utf-8')
bytes_enviados = sock.sendto(mensaje_bytes, destino)
```
- No requiere establecimiento previo de conexión ni intercambio de control.
- La función entrega los datos al buffer de transmisión del kernel y retorna de inmediato la cantidad de bytes encolados.

### Operación `recvfrom(bufsize)`
Bloquea la ejecución del proceso hasta que arribe un datagrama UDP al puerto asociado:
```python
datos, direccion_origen = sock.recvfrom(2048)
# direccion_origen es una tupla ('IP_remota', puerto_remoto)
```
- Si el datagrama recibido es mayor que `bufsize`, el exceso de datos se descarta de forma silenciosa (o genera error en Windows), por lo que se recomienda un tamaño de buffer adecuado (e.g., 2048 o 4096 bytes).

## 3. Manejo de Errores y Timeouts

Dado que UDP no garantiza la entrega de paquetes ni notifica caídas del receptor, una llamada a `recvfrom()` podría bloquear el programa indefinidamente si la respuesta se pierde en tránsito. Para gestionar esta condición:
```python
sock.settimeout(2.5)  # Tiempo de espera en segundos

try:
    data, server = sock.recvfrom(1024)
except socket.timeout:
    print("Alerta: Timeout alcanzado, reintentando transmisión...")
```
Esta estructura permite implementar algoritmos de retransmisión por temporización (*Automatic Repeat reQuest*, ARQ) en la capa de aplicación sobre la base no confiable de UDP.
