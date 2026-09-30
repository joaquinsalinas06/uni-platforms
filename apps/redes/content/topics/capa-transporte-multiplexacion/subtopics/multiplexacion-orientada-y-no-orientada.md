---
kind: subtopic
title: "Multiplexación y Demultiplexación Orientada y No Orientada a la Conexión"
order: 2
---

## 1. Mecánica de la Multiplexación en el Emisor

El proceso de multiplexación en la capa de transporte permite que múltiples flujos concurrentes compartan la misma interfaz de red física y la misma dirección IP. En el sistema emisor:
1. Cada socket activo posee un búfer de emisión en el espacio de memoria del kernel.
2. Cuando la aplicación escribe datos mediante la API del socket, el protocolo de transporte extrae los bloques y genera una PDU (segmento TCP o datagrama UDP).
3. El emisor incrusta en los primeros 32 bits de la cabecera el número de puerto de origen asignado al socket emisor y el número de puerto de destino proporcionado por la aplicación.
4. El segmento completo se transfiere a la capa de red, que añade la cabecera IP con las direcciones IP de origen y destino correspondientes.

---

## 2. Demultiplexación No Orientada a la Conexión (UDP)

En el protocolo UDP, el socket no mantiene ningún estado respecto a sesiones remotas. La demultiplexación se realiza con una correspondencia directa de **2-tupla**:
$$\text{Filtro}_{\text{Demux}} = (\text{IP}_{\text{dest}}, \text{Port}_{\text{dest}})$$

### Comportamiento Operativo
Cuando un segmento UDP arriba al host receptor:
- El subsistema de red del kernel inspecciona el puerto de destino del encabezado UDP (por ejemplo, puerto `6428`).
- El kernel busca en su tabla de descriptores de transporte si existe algún socket enlazado a dicho puerto.
- Si el socket existe, el payload completo del segmento se encola en la cola de mensajes (*UDP message queue*) de dicho socket.
- Si no existe ningún proceso escuchando en dicho puerto, el host genera un mensaje de error ICMP (*Port Unreachable*, Tipo 3, Código 3) dirigido al emisor.

### Independencia del Origen
Considérese el siguiente escenario con tres hosts:
- **Servidor B**: ejecuta un servicio UDP escuchando en el puerto `6428`.
- **Cliente A**: envía un datagrama desde $(\text{IP}_A, 9157)$ hacia $(\text{IP}_B, 6428)$.
- **Cliente C**: envía un datagrama desde $(\text{IP}_C, 5775)$ hacia $(\text{IP}_B, 6428)$.

A pesar de provenir de hosts distintos y puertos de origen totalmente dispares, **ambos datagramas convergen en el mismo socket del Servidor B**. El servidor puede discernir el remitente únicamente examinando la estructura de dirección devuelta por la función `recvfrom(fd, buf, len, flags, (struct sockaddr*)&src_addr, &addrlen)`.

---

## 3. Demultiplexación Orientada a la Conexión (TCP)

A diferencia de UDP, TCP requiere el establecimiento explícito de un estado de conexión bidireccional punto a punto. La demultiplexación en TCP depende estrictamente de la **4-tupla completa**:
$$\text{4-tupla}_{\text{TCP}} = (\text{IP}_{\text{src}}, \text{Port}_{\text{src}}, \text{IP}_{\text{dest}}, \text{Port}_{\text{dest}})$$

### El Ciclo de Vida del Socket Concurrente
1. **Socket de Escucha (Listening Socket)**: El servidor ejecuta `bind(80)` y `listen()`. Este socket no transfiere datos de aplicación; su única función es escuchar solicitudes de conexión entrantes (segmentos SYN).
2. **Llegada del Handshake**: Un cliente $A$ con IP `192.168.1.10` y puerto efímero `50001` envía un segmento SYN a la IP del servidor `203.0.113.5`, puerto `80`.
3. **Creación del Socket Conectado**: Al completarse la negociación de tres vías, la llamada `accept()` retorna un nuevo descriptor de socket dedicado exclusivamente a la 4-tupla:
   $$(\text{IP}_{\text{src}}=192.168.1.10, \text{Port}_{\text{src}}=50001, \text{IP}_{\text{dest}}=203.0.113.5, \text{Port}_{\text{dest}}=80)$$
4. **Conexiones Múltiples Concurrentes**:
   - Si un segundo cliente $B$ (`198.51.100.22`, puerto `50001`) se conecta al mismo servidor y puerto, el kernel genera otro socket conectado asociado a:
     $$(\text{IP}_{\text{src}}=198.51.100.22, \text{Port}_{\text{src}}=50001, \text{IP}_{\text{dest}}=203.0.113.5, \text{Port}_{\text{dest}}=80)$$
   - Aunque ambos clientes usan el mismo puerto efímero `50001` y el mismo puerto de destino `80`, las 4-tuplas difieren en la dirección IP de origen.
   - Si el cliente $A$ abre una segunda pestaña de navegador hacia el servidor, el kernel del cliente asignará un puerto efímero distinto (por ejemplo, `50002`). La nueva 4-tupla será $(192.168.1.10, 50002, 203.0.113.5, 80)$, garantizando un tercer socket perfectamente aislado.

Este aislamiento por 4-tupla asegura que los buffers de recepción, las ventanas de congestión ($cwnd$), los números de secuencia y los estados de retransmisión de cada cliente operen de forma totalmente independiente sin interferencias cruzadas.
