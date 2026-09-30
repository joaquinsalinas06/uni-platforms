---
kind: subtopic
title: "Emulación Práctica: Inyección de Pérdidas, Timeouts y Diagnóstico ICMP"
order: 1
---

## 1. Comportamiento de Sockets Datagrama Bajo Saturación de Búfer

En la programación de redes con sockets POSIX (disponible en Python mediante el módulo `socket`), un socket de datagramas UDP opera en modo de entrega no garantizada. Cuando una aplicación invoca `sock.sendto(data, (host, port))`:
1. El sistema operativo local traslada los bytes al búfer de salida del socket (`SO_SNDBUF`).
2. El controlador de la tarjeta de red ensambla las tramas Ethernet y las inyecta en el canal físico a la velocidad máxima que permita la interfaz (típicamente 1 Gbps o 100 Mbps).
3. Si la aplicación receptora en el host remoto no lee del socket con la misma velocidad a la que llegan las tramas, el búfer de entrada del kernel (`SO_RCVBUF`) alcanza su capacidad máxima (cuyo tamaño predeterminado oscila entre 64 KB y 256 KB según la distribución de Linux/macOS).
4. Cuando el búfer se llena, el kernel descarta inmediatamente los datagramas subsiguientes. En UDP no existe señalización de retorno ni mecanismo de retroceso (*backoff*); el emisor continúa transmitiendo ignorando el colapso del receptor.

---

## 2. Implementación de Timeouts y Detección de Pérdidas en Python

Dado que `recvfrom()` es una llamada bloqueante por defecto, si un paquete UDP se pierde en la red el receptor permanecería suspendido indefinidamente. Para emular un mecanismo de parada y espera (RDT 3.0) sobre UDP, la aplicación debe configurar un **temporizador de socket**:

```python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(2.0)  # Configuración de timeout en segundos

try:
    data, addr = sock.recvfrom(1024)
    print(f"Datagrama recibido desde {addr}: {data.decode()}")
except socket.timeout:
    print("Alerta: Timeout expirado. Se asume paquete o ACK perdido.")
    # Disparar retransmisión según la máquina de estados FSM
```

### Cuantificación de Pérdidas en Pruebas de Estrés
En la experiencia práctica de laboratorio (Sem05_LAB2_UDP_3), tres emisores inyectan de forma concurrente 10,000 datagramas numerados en su carga útil (`f"PKT_{i}"`) hacia el receptor sin introducir pausas:
$$\text{Total enviados} = 3 \times 10000 = 30000\text{ paquetes}$$

Al analizar la traza capturada en Wireshark (`Statistics > Capture File Properties`):
- Si el receptor capturó únicamente $N_{\text{recv}} = 8240$ paquetes:
  $$P_{\text{loss}} = \frac{30000 - 8240}{30000} \times 100\% = \frac{21760}{30000} \times 100\% = 72.53\%$$
- Al filtrar por emisor específico (`ip.src == 192.168.1.15`), se observan brechas masivas en los identificadores de secuencia (por ejemplo, del paquete `PKT_145` se salta directamente a `PKT_230`), demostrando empíricamente la ausencia total de control de flujo.

---

## 3. Inspección Forense de Errores con Netcat e ICMP

Cuando se interactúa con un puerto UDP donde no hay ningún servicio activo (experiencia Sem05_LAB2_UDP_4 con `nc -u -v [Target_IP] 1234`), la utilidad Netcat no muestra errores inmediatos al ejecutarse, sino que ofrece un cursor parpadeante esperando texto:
- Esto ocurre porque **UDP no establece ninguna conexión física previa**; no se emite ni un solo paquete sobre el medio físico al ejecutar el comando.
- Únicamente al pulsar la tecla `Enter`, Netcat transmite un datagrama UDP conteniendo el texto introducido.

### Análisis de la Trama ICMP en Wireshark
Al arribar el datagrama al destino cerrado, el stack IP del receptor devuelve un paquete con los siguientes parámetros:
- **Display filter**: `udp || icmp`
- **Protocolo de capa 3**: ICMP (*Internet Control Message Protocol*)
- **Type**: `3` (*Destination Unreachable*)
- **Code**: `3` (*Port Unreachable*)

### Contenido Encapsulado de Diagnóstico
El estándar RFC 792 exige que todo mensaje ICMP de error incluya una copia del encabezado IP original y **los primeros 8 bytes de la carga útil del paquete causante**:
1. Los primeros 20 bytes corresponden a la cabecera IPv4 original (permitiendo al emisor validar las direcciones IP de origen y destino).
2. Los siguientes 8 bytes corresponden exactamente a la **cabecera completa de UDP** (puerto origen, puerto destino, longitud y checksum).
3. Con estos 8 bytes, el sistema operativo emisor puede mapear el error contra su tabla interna de sockets buscando el puerto efímero de origen exacto que disparó la transmisión fallida, pasando una señal de interrupción al proceso responsable.
