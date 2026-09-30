---
kind: subtopic
title: "Handshake de Tres Vías, Cierre de Conexión y Máquina de Estados Finitos"
order: 2
---

## 1. El Establecimiento de la Conexión: Sincronización de Tres Vías

En redes de conmutación de paquetes donde los mensajes pueden sufrir duplicaciones o retrasos arbitrarios en los enrutadores, un protocolo orientado a la conexión no puede basarse en un intercambio simple de dos pasos (solicitud y respuesta). TCP resuelve el problema clásico de la sincronización fiable de extremos mediante el **Three-Way Handshake** (RFC 793).

### 1.1 ¿Por qué no es suficiente un Handshake de Dos Vías?

Supóngase un protocolo hipotético de dos vías donde el cliente envía `SYN` y el servidor responde `ACK`, considerándose la conexión establecida:
- Si un segmento `SYN` enviado por el cliente queda atrapado temporalmente en una cola congestionada de la red, el cliente expira por timeout y retransmite un nuevo `SYN`.
- La segunda conexión se abre, transmite datos y se cierra exitosamente.
- Minutos después, el primer `SYN` demorado finalmente emerge de la red y llega al servidor.
- Bajo un modelo de dos pasos, el servidor interpretaría este `SYN` obsoleto como una nueva solicitud de conexión legítima, asignaría buffers y respondería `ACK`. El servidor quedaría esperando datos en una sesión "fantasma" que el cliente nunca solicitó, consumiendo recursos indefinidamente.

Con el **Three-Way Handshake**, el servidor responde con un `SYN-ACK` que contiene su propio número de secuencia $ISN_S$ y el acuse $ISN_C + 1$. Al recibir este segmento inesperado, el cliente rechaza la conexión fantasma emitiendo inmediatamente un segmento de reinicio `RST`, impidiendo que el servidor quede atrapado en un estado semiabierto (*half-open*).

### 1.2 Transición de Estados durante el Handshake

```
Cliente                                         Servidor
  |                                                |  LISTEN
  | ---------- Segmento 1: SYN (Seq=x) ----------> |
  |   (Estado: SYN_SENT)                           |  (Estado: SYN_RCVD)
  |                                                |
  | <------- Segmento 2: SYN+ACK (Seq=y, Ack=x+1) - |
  |                                                |
  | (Estado: ESTABLISHED)                          |
  | ---------- Segmento 3: ACK (Seq=x+1, Ack=y+1) ->|
  |                                                |  (Estado: ESTABLISHED)
```

1. **Estado inicial del Servidor (`LISTEN`)**: El servidor ejecuta `bind()` en una IP y puerto específicos, y llama a `listen()`, configurando una cola de conexiones pendientes.
2. **Segmento 1 (`SYN_SENT`)**: El cliente invoca `connect()`, genera un $ISN_C = x$ pseudoaleatorio y envía `SYN(Seq=x)`.
3. **Segmento 2 (`SYN_RCVD`)**: El servidor extrae $x$, reserva memoria preliminar, genera su propio $ISN_S = y$ y transmite `SYN-ACK(Seq=y, Ack=x+1)`.
4. **Segmento 3 (`ESTABLISHED`)**: El cliente recibe el `SYN-ACK`, verifica que $\text{Ack} == x+1$, transiciona a `ESTABLISHED` y envía `ACK(Seq=x+1, Ack=y+1)`. Al arribar este paquete al servidor, este transiciona a `ESTABLISHED`.

---

## 2. Ataques SYN Flood y el Algoritmo de SYN Cookies

### 2.1 Mecanismo del Ataque SYN Flood

En el paso 2 del handshake convencional, el sistema operativo del servidor aloja en el kernel una estructura de control denominada TCB (*Transmission Control Block*) y asigna memoria de búfer para cada `SYN` recibido, colocando la conexión en una cola de conexiones semiabiertas (*incomplete connection queue*).

Un adversario puede enviar decenas de miles de paquetes `SYN` por segundo, falsificando direcciones IP de origen aleatorias e inalcanzables (*IP spoofing*). El servidor responde con `SYN-ACK` hacia dichas IPs falsas (de las cuales nunca recibirá respuesta) y mantiene los TCB abiertos esperando un timeout prolongado (típicamente $75\text{ segundos}$). Esto satura la cola del kernel, provocando la denegación de servicio (*DoS*) total para clientes legítimos.

### 2.2 Solución Criptográfica: SYN Cookies

Cuando la cola de conexiones semiabiertas se aproxima a la saturación, el kernel activa el mecanismo de **SYN Cookies**:
1. El servidor **no almacena ningún TCB en memoria** ni reserva búferes.
2. Codifica los parámetros esenciales de la conexión dentro de su propio número de secuencia inicial ($ISN_S$), construyéndolo como una "cookie" criptográfica:
   - Bits 0 a 4: Un índice que codifica el MSS acordado en una tabla fija de 8 valores posibles.
   - Bits 5 a 7: Un contador de tiempo que avanza cada 64 segundos para invalidar cookies viejas.
   - Bits 8 a 31: Un código de autenticación de mensajes (MAC) calculado mediante una función hash criptográfica unidireccional (e.g., SIPHASH) aplicada sobre la 4-tupla (IP origen, IP destino, puerto origen, puerto destino), el contador temporal y una clave secreta interna del kernel.
3. El servidor transmite el `SYN-ACK` con este $ISN_S$ especial y descarta inmediatamente todo rastro de la conexión en su RAM.
4. Si el cliente es legítimo, devolverá un segmento `ACK` con $\text{Ack} = ISN_S + 1$.
5. El servidor recibe el `ACK`, resta 1 al campo de acuse para recuperar la cookie original, verifica el hash con su clave secreta y extrae el MSS. Solo tras esta validación matemática exitosa se asigna la memoria TCB y la conexión pasa a `ESTABLISHED`. Si el cliente era un atacante con IP falsificada, nunca devolverá el ACK y el servidor no habrá gastado ni un solo byte de memoria.

---

## 3. Terminación de la Conexión y el Dilema de TIME_WAIT

TCP proporciona un cierre simétrico ordenado de 4 pasos (*Four-Way Teardown*). Dado que la conexión es bidireccional, cada dirección de flujo se cierra independientemente mediante el intercambio de una bandera `FIN`.

### 3.1 Diagrama de Estados del Cierre

```
Extremo A (Iniciador Activo)                  Extremo B (Receptor Pasivo)
  |                                                |
  | (Llamada close())                              |
  | ---------- Segmento 1: FIN (Seq=u) ----------> |  (Llamada read() devuelve EOF)
  |   (Estado: FIN_WAIT_1)                         |  (Estado: CLOSE_WAIT)
  |                                                |
  | <--------- Segmento 2: ACK (Ack=u+1) --------- |
  |   (Estado: FIN_WAIT_2)                         |
  |                                                |  (La aplicación concluye y llama close())
  | <--------- Segmento 3: FIN (Seq=v, Ack=u+1) -- |
  |                                                |  (Estado: LAST_ACK)
  | (Estado: TIME_WAIT)                            |
  | ---------- Segmento 4: ACK (Ack=v+1) --------> |
  |                                                |  (Estado: CLOSED)
  | [Espera 2*MSL]                                 |
  V                                                V
(Estado: CLOSED)
```

### 3.2 El Estado TIME_WAIT y el Parámetro 2MSL

El extremo que inicia activamente el cierre de la conexión ingresa forzosamente en el estado `TIME_WAIT` tras emitir el último `ACK`. Debe permanecer en dicho estado durante un intervalo estricto de:

$$T_{\text{espera}} = 2 \cdot \text{MSL}$$

Donde **MSL** (*Maximum Segment Lifetime*) es el tiempo máximo de vida de un segmento en la red. En la RFC 793 se establece $\text{MSL} = 120\text{ segundos}$ (por lo que $2\text{MSL} = 4\text{ minutos}$), aunque las pilas TCP modernas suelen configurarlo en $30$ o $60\text{ segundos}$ ($2\text{MSL} = 60\text{ a }120\text{ segundos}$).

#### Razones Técnicas Fundamentales:
1. **Entrega Confiable del Último ACK**: Supóngase que el Segmento 4 (`ACK`) se pierde en la red. El Extremo B, al no recibir confirmación de su `FIN`, sufrirá un timeout y retransmitirá el Segmento 3 (`FIN`). Si el Extremo A hubiera pasado de inmediato a `CLOSED`, no reconocería la conexión y respondería con un `RST`, generando una condición de error en el Extremo B. Al permanecer en `TIME_WAIT`, el Extremo A puede recibir el `FIN` retransmitido y reenviar el `ACK` correspondiente.
2. **Drenaje de Segmentos Errantes (*Quiet Time*)**: Impide que paquetes retardados en colas de la red pertenecientes a la conexión terminada interfieran con una nueva conexión encarnada posteriormente que use la misma 4-tupla (IP origen, IP destino, puerto origen, puerto destino). Al esperar $2\text{MSL}$ (el tiempo que tarda un segmento en ir en un sentido más el tiempo de su respuesta), se asegura que todo paquete residual habrá muerto en la red.

### 3.3 Problema de Agotamiento de Puertos Efímeros

En servidores con alto tráfico o proxies inversos que abren y cierran millones de conexiones TCP continuas (como balanceadores de carga hacia servidores web), miles de sockets pueden acumularse en estado `TIME_WAIT`. Dado que los puertos efímeros locales están acotados (típicamente del rango 32768 al 60999, unos 28000 puertos), el sistema operativo puede agotar los puertos disponibles (`EADDRINUSE`). Para mitigar este problema sin violar la especificación, los sistemas operativos ofrecen opciones como `SO_REUSEADDR` o extensiones basadas en TCP Timestamps (RFC 7323) que permiten reciclar de manera segura sockets en `TIME_WAIT` si los timestamps son monótonamente crecientes.
