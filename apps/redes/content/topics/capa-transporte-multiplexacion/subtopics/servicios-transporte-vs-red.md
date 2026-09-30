---
kind: subtopic
title: "Servicios de Transporte vs. Red y Abstracción de Sockets"
order: 1
---

## 1. El Paradigma de Comunicación Extremo a Extremo

En el modelo de referencia en capas de Internet, la capa de red proporciona el servicio de interconexión entre sistemas finales a través de múltiples saltos intermediarios gestionados por enrutadores. Sin embargo, los sistemas informáticos modernos son plataformas multitarea donde decenas de programas ejecutan operaciones de red de manera concurrente. La capa de red no tiene visibilidad ni competencia sobre la estructura interna de los procesos en ejecución; su responsabilidad concluye cuando un datagrama IP es entregado con éxito a la interfaz de red del host destinatario.

La capa de transporte resuelve este desacoplamiento introduciendo la abstracción de **canal lógico proceso a proceso**. Para los procesos emisores y receptores, la red aparece como un enlace directo que conecta sus espacios de memoria virtual, ocultando los detalles de la topología física, la conmutación de paquetes por enlaces heterogéneos y la pérdida potencial de tramas en los enrutadores del núcleo.

---

## 2. Comparativa Rigurosa de Capacidades

| Característica | Capa de Red (IP) | Capa de Transporte (TCP / UDP) |
| :--- | :--- | :--- |
| **Entidades de comunicación** | Host a Host (interfaces de red) | Proceso a Proceso (sockets de software) |
| **PDU característica** | Datagrama IP | Segmento (TCP) o Datagrama de Usuario (UDP) |
| **Identificador de direccionamiento** | Dirección IP (32 bits en IPv4, 128 bits en IPv6) | Números de Puerto (16 bits) combinados con IPs |
| **Dispositivos que la procesan** | Hosts terminales y Enrutadores intermedios | Exclusivamente Hosts terminales (End Systems) |
| **Garantías de entrega** | *Best-effort* (puede perder, duplicar o alterar paquetes) | Dependiente del protocolo: No garantizada (UDP) o Confiable e in-order (TCP) |
| **Control de flujo y congestión** | Inexistente o mínimo (señalización ECN opcional) | TCP implementa algoritmos dinámicos (AIMD, Slow Start, cwnd, rwnd) |
| **Garantías de retardo y ancho de banda** | No disponibles en la arquitectura estándar de Internet | No disponibles |

---

## 3. La Interfaz de Sockets y el Sistema Operativo

Un **socket** es un objeto del kernel del sistema operativo que representa el extremo de un canal de comunicación bidireccional. Actúa como el punto de anclaje (*attachment point*) a través del cual el proceso transfiere datos a la red y recibe datos desde ella.

El ciclo de vida estándar de un socket comprende cinco operaciones fundamentales:

1. **Creación (`socket`)**: El proceso solicita al kernel la asignación de una estructura de descriptor de archivo (*file descriptor*), especificando la familia de direcciones (ej. `AF_INET` para IPv4) y el tipo de servicio de transporte (`SOCK_STREAM` para TCP o `SOCK_DGRAM` para UDP).
2. **Vinculación Local (`bind`)**: Asocia el descriptor del socket a una dirección IP de la interfaz local y a un número de puerto de transporte de 16 bits. Si un cliente no invoca `bind()`, el kernel asigna automáticamente un puerto efímero disponible al momento de la primera transmisión.
3. **Escucha y Aceptación (`listen` / `accept`)**: En protocolos orientados a la conexión (TCP), `listen()` sitúa al socket en modo pasivo para encolar solicitudes de conexión entrantes, mientras que `accept()` bloquea la ejecución hasta completar el *three-way handshake*, extrayendo un nuevo descriptor de socket dedicado para el cliente conectado.
4. **Transferencia de Datos (`send` / `recv`, `sendto` / `recvfrom`)**: En modo orientado a la conexión, los datos se transfieren como un flujo de bytes continuo (*byte stream*) sin fronteras de mensaje mediante `send()` y `recv()`. En modo sin conexión, cada invocación a `sendto()` genera un datagrama discreto e independiente, exigiendo la especificación explícita de la tupla de destino en cada llamada.
5. **Cierre (`close`)**: Libera los recursos de memoria asignados por el sistema operativo, cancela los temporizadores pendientes y, en el caso de TCP, dispara la secuencia de terminación formal de cuatro vías mediante el intercambio de segmentos FIN y ACK.
