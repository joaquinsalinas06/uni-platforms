---
kind: theory
title: "Arquitectura Jerárquica y Resolución DNS"
---

## 1. Motivación y el Rol del DNS en la Red

En Internet coexisten dos esquemas fundamentales de identificación de hosts:
1. **Identificadores orientados a máquinas**: Direcciones IP binarias de longitud fija (IPv4 de 32 bits, por ejemplo `93.184.216.34`, o IPv6 de 128 bits). Son procesadas eficientemente por los routers y conmutadores para encaminar datagramas a través de tablas de enrutamiento jerárquicas basadas en prefijos.
2. **Identificadores orientados a humanos**: Nombres de dominio alfanuméricos y nemotécnicos de longitud variable (por ejemplo, `www.utec.edu.pe` o `amazon.com`), diseñados para facilitar la memorización y la abstracción de la infraestructura subyacente.

El **Domain Name System (DNS)** es una base de datos distribuida y jerárquica, además de un protocolo de la capa de aplicación, cuyo propósito primordial es traducir de manera transparente los nombres de dominio legibles por personas en direcciones IP ruteables. Adicionalmente, DNS provee servicios auxiliares indispensables para la operación de Internet:
- **Alias de host (Host Aliasing)**: Permite que un servidor con un nombre canónico complicado (e.g., `servereast.backup2.ibm.com`) posea uno o más nombres alternativos sencillos (e.g., `www.ibm.com`).
- **Alias de servidores de correo (Mail Server Aliasing)**: Permite que las direcciones de correo electrónico utilicen dominios simplificados mientas que el tráfico SMTP es dirigido a servidores específicos de correo.
- **Distribución de carga (Load Distribution)**: Para servicios web masivos replicados en múltiples direcciones IP, el servidor DNS almacena un conjunto de registros A para un único nombre canónico y rota el orden de las direcciones en cada respuesta (*DNS Round-Robin*), distribuyendo el tráfico entrante de los clientes entre los diferentes servidores del cluster.

## 2. Imposibilidad de un Diseño Centralizado

Un enfoque ingenuo consistiría en implementar DNS como una única base de datos centralizada alojada en un único servidor global. Dicho esquema es inviable por las siguientes razones de escalabilidad y fiabilidad:
- **Punto único de falla (Single Point of Failure)**: Si el servidor central colapsa o sufre un corte de conectividad, la totalidad de Internet queda inoperativa a nivel global.
- **Volumen inmanejable de tráfico**: Un solo centro de cómputo tendría que procesar miles de millones de consultas DNS por segundo generadas por todos los dispositivos conectados.
- **Distancia geográfica y latencia extrema**: Los clientes ubicados geográficamente lejos del servidor central experimentarían retardos de propagación intolerables en cada resolución.
- **Mantenimiento y consistencia**: Gestionar una base de datos central con actualizaciones continuas para todos los dominios de Internet requeriría un ancho de banda masivo y mecanismos de sincronización impracticables.

Por estas razones, DNS se diseñó desde su concepción como una **base de datos distribuida y jerárquica**.

## 3. Jerarquía de Servidores DNS

Para resolver un nombre como `gaia.cs.umass.edu`, ningún servidor individual posee el mapeo completo de Internet. La estructura organizativa se divide en tres niveles jerárquicos principales, complementados por un componente fundamental a nivel de acceso local:

### 3.1. Servidores Raíz (Root DNS Servers)
Son el punto de partida y último recurso de la resolución jerárquica. Cuando un servidor local no posee en caché la dirección de un servidor de nivel superior, contacta a un servidor raíz.
- Existen **13 identidades lógicas** de servidores raíz a nivel global (nombradas desde `a.root-servers.net` hasta `m.root-servers.net`).
- La administración general está coordinada por **ICANN** (*Internet Corporation for Assigned Names and Numbers*).
- Cada una de estas 13 identidades lógicas no es una única máquina, sino un clúster masivo compuesto por cientos de servidores distribuidos por todo el planeta utilizando enrutamiento **IP Anycast**, lo cual provee alta redundancia, tolerancia a fallos y baja latencia local.

### 3.2. Servidores de Dominio de Nivel Superior (Top-Level Domain - TLD)
Son responsables de los dominios genéricos de nivel superior (*gTLD*) como `.com`, `.org`, `.net`, `.edu`, `.gov`, y de los dominios de código de país (*ccTLD*) como `.pe` (Perú), `.uk` (Reino Unido), `.cn` (China) o `.ca` (Canadá).
- Entidades registradoras administran estos servidores: por ejemplo, *Network Solutions* / *Verisign* gestiona la zona `.com` y `.net`, mientras que *Educause* administra la zona `.edu`. En el caso de dominios ccTLD como `.pe`, la administración técnica corresponde a la Red Científica Peruana (*Punto.pe / NIC .pe*).
- Los servidores TLD no conocen la IP final de un host, sino la dirección IP y el nombre de los servidores autoritativos para el dominio de segundo nivel solicitado.

### 3.3. Servidores DNS Autoritativos (Authoritative DNS Servers)
Son los servidores que almacenan formalmente los registros de recursos DNS definitivos para los hosts de una organización. Cada institución pública, empresa o proveedor que mantiene servidores accesibles por Internet (web, correo, etc.) debe disponer de un servidor autoritativo primario y secundario (o delegar su administración a un proveedor de servicios en la nube como AWS Route 53 o Cloudflare).

### 3.4. Servidor DNS Local (Local DNS Resolver)
El servidor DNS local no pertenece formalmente a la jerarquía piramidal de zonas, pero es la pieza central de la arquitectura operativa:
- Cada Proveedor de Servicios de Internet (ISP), red corporativa o universitaria asigna uno o varios resolvers locales a los hosts finales (típicamente mediante DHCP).
- Cuando un navegador o aplicación ejecuta una llamada a nivel de sistema operativo (como `getaddrinfo` en C/Python), la consulta se envía directamente al servidor DNS local configurado.
- El resolver local actúa como un proxy inteligente: revisa su memoria caché y, si no tiene la respuesta, se encarga de recorrer la jerarquía DNS en nombre del cliente.

## 4. Métodos de Resolución: Iterativa vs Recursiva

Cuando una consulta requiere navegar la jerarquía para resolver un FQDN (*Fully Qualified Domain Name*) como `gaia.cs.umass.edu` desde un host ubicado en `engineering.nyu.edu`, existen dos paradigmas de comunicación:

### 4.1. Consulta Iterativa
En una consulta iterativa, el servidor consultado responde directamente con la mejor información que posee en ese momento. Si desconoce la dirección IP final del host, no transfiere la petición a otro servidor; en su lugar, devuelve la dirección IP del siguiente servidor de la jerarquía que el consultante debe interrogar:
1. El resolver local contacta al servidor Raíz: "¿Cuál es la IP de `gaia.cs.umass.edu`?".
2. El servidor Raíz responde: "No lo sé, pero este es el listado de servidores TLD para el dominio `.edu`".
3. El resolver local contacta al servidor TLD `.edu`: "¿Cuál es la IP de `gaia.cs.umass.edu`?".
4. El servidor TLD responde: "No lo sé, pero este es el servidor autoritativo para `umass.edu` (`dns.cs.umass.edu`)".
5. El resolver local contacta al servidor autoritativo `dns.cs.umass.edu`.
6. El servidor autoritativo devuelve el registro A definitivo con la IP solicitada.

### 4.2. Consulta Recursiva
En una consulta recursiva, el nodo que recibe la petición asume la responsabilidad total de resolver el nombre. Si no conoce la respuesta, él mismo emite una nueva consulta recursiva al siguiente nivel, formando una cadena de llamadas sincrónicas:
1. El cliente envía la petición recursiva al resolver local.
2. El resolver local consulta recursivamente al servidor Raíz.
3. El servidor Raíz consulta recursivamente al TLD.
4. El servidor TLD consulta recursivamente al servidor autoritativo.
5. La respuesta se propaga en sentido inverso hasta llegar al cliente.

### 4.3. Implementación Práctica en Internet
El modelo puramente recursivo impone una sobrecarga crítica de memoria, estado de conexiones abiertas y procesamiento sobre los servidores Raíz y TLD. Por esta razón, el estándar universal de Internet utiliza un modelo **híbrido**:
- La consulta entre el **host cliente y su resolver local es recursiva** (el resolver asume el trabajo en favor del cliente ligero).
- Todas las consultas ejecutadas por el **resolver local hacia los servidores Raíz, TLD y autoritativos son iterativas**.

## 5. Almacenamiento en Caché (DNS Caching)

El mecanismo que permite que la infraestructura jerárquica de DNS sea altamente eficiente y rápida es el almacenamiento en caché (*DNS Caching*):
- Cada vez que un servidor DNS (especialmente el resolver local) recibe una respuesta de la jerarquía, almacena la tupla `(Nombre, IP, Tipo)` en su memoria volátil local.
- Si otro cliente de la red local solicita resolver el mismo dominio, el resolver local responde de forma instantánea sin necesidad de generar tráfico hacia los servidores externos.
- Adicionalmente, los resolvers locales almacenan en caché las direcciones IP de los servidores TLD, de modo que en la gran mayoría de consultas cotidianas no se interroga a los servidores raíz.

### Tiempo de Vida (TTL - Time to Live)
Para evitar que los cambios en las direcciones IP provoquen inconsistencias permanentes, cada registro devuelto incluye un campo **TTL (Time to Live)** medido en segundos. Una vez transcurrido el TTL, el registro caduca y es desalojado de la memoria caché, obligando al resolver a consultar nuevamente a la fuente autoritativa.

### Purga Manual de Caché
En escenarios de mantenimiento de redes o pruebas de conectividad, es habitual forzar el vaciado del caché del sistema operativo para descartar registros antiguos:
- **macOS**: `sudo killall -HUP mDNSResponder`
- **Windows**: `ipconfig /flushdns`
- **Linux (systemd)**: `sudo systemd-resolve --flush-caches` o `resolvectl flush-caches`

## 6. Modelado Matemático de Retardos

Consideremos un escenario analítico en el que un cliente web solicita un recurso alojado en un servidor remoto.

### 6.1. Retardo de Resolución DNS sin Caché
Si el resolver local no tiene ninguna información almacenada, debe realizar $n$ consultas secuenciales hacia la jerarquía (típicamente $n=3$: Raíz, TLD y Autoritativo). Siendo $\text{RTT}_{\text{local}}$ el tiempo de ida y vuelta entre el host y el resolver local, y $\text{RTT}_i$ el retardo hacia el $i$-ésimo servidor de la jerarquía:

$$T_{\text{DNS}} = \text{RTT}_{\text{local}} + \sum_{i=1}^{n} \text{RTT}_i$$

Si cada consulta a la jerarquía tiene retardos individuales $\text{RTT}_1 = 40\text{ ms}$, $\text{RTT}_2 = 30\text{ ms}$, $\text{RTT}_3 = 50\text{ ms}$, y $\text{RTT}_{\text{local}} = 20\text{ ms}$:
$$T_{\text{DNS}} = 20 + (40 + 30 + 50) = 140\text{ ms}$$

### 6.2. Ahorro por Caching
Si el resolver local ya posee almacenadas las referencias de los servidores autoritativos para el dominio, se omiten las consultas hacia Raíz y TLD ($k=2$ saltos evitados):
$$T_{\text{DNS, cache}} = \text{RTT}_{\text{local}} + \text{RTT}_3 = 20 + 50 = 70\text{ ms}$$
El ahorro total de latencia corresponde a:
$$\Delta T_{\text{cache}} = \sum_{i=1}^{k} \text{RTT}_i = 40 + 30 = 70\text{ ms}$$

### 6.3. Interacción Integral con TCP y HTTP
Una vez que el navegador obtiene la dirección IP de destino, no puede enviar la solicitud HTTP de inmediato; debe completar la negociación de la capa de transporte:
1. **Three-Way Handshake TCP**: Requiere un viaje de ida y vuelta ($1 \cdot \text{RTT}_0$) para los segmentos SYN y SYN-ACK.
2. **Intercambio HTTP**: Envío de la petición HTTP GET y recepción del primer bloque de datos ($1 \cdot \text{RTT}_0$), sumado al tiempo de transmisión $d_{\text{trans}} = \frac{L}{R}$.

El tiempo total transcurrido desde el clic del usuario hasta la visualización del contenido web base es:
$$T_{\text{total}} = T_{\text{DNS}} + 2 \cdot \text{RTT}_0 + \frac{L}{R}$$

Este análisis demuestra que optimizar la resolución DNS (mediante resolvers rápidos y caching efectivo) reduce de manera directa la latencia percibida por el usuario en aplicaciones web interactivas.
