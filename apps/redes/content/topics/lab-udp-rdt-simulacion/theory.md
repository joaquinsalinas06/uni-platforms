---
kind: theory
title: "Laboratorio: Emulación de Canal Lossy y RDT sobre UDP"
---

## 1. Contexto Experimental y Objetivos de Simulación

En los entornos teóricos, los protocolos de transporte se analizan mediante modelos matemáticos discretos y diagramas FSM. Sin embargo, para comprender el impacto real de las fallas de red sobre el rendimiento y la estabilidad de las aplicaciones, es indispensable experimentar en escenarios de laboratorio controlados donde se somete a UDP a **condiciones adversas de estrés, pérdidas masivas y explotación de vulnerabilidades**.

Las experiencias prácticas abordadas en esta unidad cubren cinco dominios esenciales:
1. **Difusión por Broadcast en UDP**: Empleo de direcciones de capa 2 (`FF:FF:FF:FF:FF:FF`) y capa 3 para entrega simultánea a toda la subred local, demostrando la imposibilidad estructural de implementar broadcast en TCP.
2. **Pruebas de Estrés y Descarte Silencioso**: Saturación deliberada de los búferes de recepción del sistema operativo inyectando ráfagas continuas de decenas de miles de datagramas, cuantificando la tasa de pérdida y el desorden secuencial.
3. **Manejo de Errores e Interacción con ICMP**: Comportamiento ante puertos cerrados mediante el diagnóstico de mensajes ICMP *Destination Unreachable* (Tipo 3, Código 3) y el análisis de la encapsulación de cabeceras.
4. **Vulnerabilidades y Ataques de Inundación (UDP Flood)**: Simulación de ataques de Denegación de Servicio Distribuido (DDoS), suplantación de identidad (*IP Spoofing*) y ataques de amplificación mediante reflectores DNS/NTP.
5. **Modelado Matemático de Distribución**: Evaluación analítica de tiempos de propagación de archivos masivos comparando arquitecturas centralizadas Cliente-Servidor frente a redes distribuidas Peer-to-Peer (P2P).

---

## 2. Difusión en Redes de Área Local (UDP Broadcasting)

A diferencia de TCP, cuya semántica exige un canal unicast exclusivo de punto a punto sincronizado por números de secuencia mutuos, UDP permite aprovechar las direcciones de difusión de la red para emitir un único datagrama físico que es procesado simultáneamente por todas las tarjetas de red de la subred local.

### Capa de Enlace (L2) vs. Capa de Red (L3) en Broadcast
- **En Capa 2 (Ethernet)**: El marco de broadcast utiliza la dirección MAC universal `FF:FF:FF:FF:FF:FF`. Al detectar esta dirección en la cabecera de la trama, un conmutador (*switch*) de red replica y reenvía el paquete por absolutamente todos sus puertos físicos activos excepto por el puerto de entrada (*flooding*).
- **En Capa 3 (IPv4)**: Se utiliza la dirección de broadcast dirigida (ej. `192.168.1.255` para una máscara `/24`) o la dirección de broadcast limitada local `255.255.255.255`. Los enrutadores de frontera descartan por defecto estas tramas para evitar que se propaguen hacia Internet.

### La Imposibilidad Estructural del Broadcast en TCP
Es matemáticamente imposible implementar un broadcast nativo sobre TCP debido a sus mecanismos inherentes:
1. **Fase de Negociación**: Un emisor TCP no puede negociar simultáneamente un *three-way handshake* con $N$ receptores desconocidos mediante un solo paquete `SYN`.
2. **Sincronización de Acuses**: Si 100 máquinas recibieran el mismo paquete y respondieran con un `ACK`, el emisor sufriría una tormenta catastrófica de acuses (*ACK implosion*), saturando su interfaz.
3. **Control de Flujo y Congestión**: Cada receptor posee capacidades de procesamiento y búferes dispares ($rwnd$). Un único canal TCP no puede mantener $N$ ventanas de congestión ni números de secuencia independientes dentro del mismo flujo de bytes.

---

## 3. Pruebas de Estrés y Desbordamiento de Búferes del Kernel

Cuando una aplicación emisora transmite datagramas a una tasa superior a la capacidad del receptor de leerlos de su socket, se manifiesta el fenómeno del **descarte silencioso** (*packet drop*):
- Los paquetes son recibidos físicamente por la tarjeta de red (NIC) y transferidos por DMA al espacio de memoria del kernel.
- El kernel encola los datagramas en el búfer asignado al socket (`SO_RCVBUF`).
- Si el hilo de la aplicación en Python tarda en invocar `recvfrom()`, la cola se llena por completo.
- Al no existir control de flujo en UDP, el sistema operativo **descarta silenciosamente todos los paquetes entrantes excedentes**, sin emitir ninguna señalización hacia los emisores para que reduzcan su tasa.

### Cálculo Experimental de Pérdida
Si un grupo de emisores genera $N_{\text{sent}}$ paquetes y la captura de Wireshark en el receptor registra $N_{\text{recv}}$, la tasa de pérdida de paquetes se expresa formalmente como:
$$P_{\text{loss}} = \frac{N_{\text{sent}} - N_{\text{recv}}}{N_{\text{sent}}} \times 100\%$$

En ráfagas de 30,000 paquetes sin pausas (`time.sleep(0)`), es común observar pérdidas superiores al $70\%$ y saltos masivos en los identificadores de secuencia embebidos en el payload.

---

## 4. Señalización de Error en la Capa de Red: El Mensajero ICMP

Cuando un host envía un datagrama UDP a un puerto en el cual ningún proceso local ha ejecutado `bind()` ni `listen()`:
1. El kernel receptor recibe el segmento UDP e inspecciona el puerto de destino.
2. Al no encontrar ningún descriptor de socket asociado, el subsistema de transporte notifica a la capa de red (IP).
3. La capa de red del receptor genera un datagrama **ICMP de error** (*Internet Control Message Protocol*) dirigido a la IP de origen del emisor:
   - **ICMP Type 3**: *Destination Unreachable*.
   - **ICMP Code 3**: *Port Unreachable*.

### Estructura de la Carga Útil ICMP
Para que el sistema operativo emisor pueda determinar qué proceso generó el datagrama fallido, el mensaje ICMP encapsula obligatoriamente:
- La cabecera completa del paquete IPv4 original que causó el error (20 bytes).
- Los **primeros 8 bytes del datagrama UDP fallido** (es decir, los campos exactos de puerto de origen, puerto de destino, longitud y checksum).

Gracias a estos 8 bytes, el kernel emisor puede identificar el puerto efímero local y despachar una excepción (como `ConnectionRefusedError` en sockets conectados) al proceso de usuario. Sin embargo, la recepción eventual de un ICMP no convierte a UDP en confiable: el mensaje ICMP viaja a su vez sobre IP sin garantías de entrega, y no subsana pérdidas de datos en tránsito ni desórdenes secuenciales.

---

## 5. Simulación de Ataques DoS: Inundación UDP y Amplificación

La ausencia de estado y la ligereza de UDP lo convierten en el vector más frecuente para ataques de Denegación de Servicio Distribuido (DDoS):

### 1. Inundación UDP (UDP Flood)
Un botnet transmite volúmenes masivos de datagramas UDP contra puertos aleatorios de una máquina víctima. El sistema operativo de la víctima se ve abrumado por:
- Consumo masivo de ancho de banda del enlace de acceso.
- Saturación de la CPU por interrupciones de hardware (NIC IRQs) y procesamiento de cabeceras.
- Agotamiento de recursos intentando generar ráfagas continuas de mensajes ICMP *Port Unreachable*.

### 2. Suplantación de IP (IP Spoofing)
En TCP, un atacante no puede completar una conexión con una IP falsa porque la respuesta `SYN-ACK` viajaría a la víctima inocente y el atacante no podría adivinar el número de secuencia inicial ($ISN$) para emitir el `ACK` final. En UDP no existe handshake: el atacante puede forjar arbitrariamente cualquier valor en el campo `Source IP Address` del encabezado IP y el paquete será entregado al destino sin objeción.

### 3. Ataques de Amplificación (DNS / NTP Amplification)
El atacante aprovecha servidores públicos mal configurados (*open resolvers*):
- Envía una consulta UDP de tamaño mínimo (ej. una consulta DNS `ANY` de apenas $60\text{ bytes}$) suplantando la IP de origen para que apunte a la IP de la víctima.
- El servidor DNS genera una respuesta gigantesca con todas las zonas y claves DNSSEC (superando los $3000\text{ bytes}$).
- La respuesta masiva es reenviada a la víctima. El factor de amplificación se define como:
  $$\text{Factor de Amplificación} = \frac{\text{Tamaño de Respuesta}}{\text{Tamaño de Petición}} \approx 50\times$$
Con un ancho de banda de ataque modesto, el adversario puede generar gigabits por segundo de tráfico de inundación contra el objetivo.
