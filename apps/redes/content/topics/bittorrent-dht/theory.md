---
kind: theory
title: "BitTorrent, Churn y Tablas Hash Distribuidas (DHT)"
---

## 1. El Protocolo BitTorrent

Diseñado por Bram Cohen a principios de la década de 2000, **BitTorrent** es el protocolo de distribución de archivos Peer-to-Peer más exitoso y ampliamente desplegado en Internet. A diferencia de los sistemas pioneros orientados a la búsqueda global de archivos por palabras clave (como Napster o Gnutella), BitTorrent se diseñó con un enfoque exclusivo y optimizado hacia la **distribución masiva de un archivo específico** mediante técnicas de enjambre (*swarming*).

### 1.1. Componentes y Terminología Fundamental
- **Archivo de Metadatos (.torrent)**: Archivo ligero codificado en formato *Bencode* que contiene la metadata esencial de la distribución:
  - La URL o dirección del servidor de coordinación (*Tracker*).
  - El tamaño de cada fragmento (*Chunk size*).
  - Una lista concatenada de resúmenes criptográficos **SHA-1** de 20 bytes (160 bits) calculados individualmente para cada fragmento, lo que permite verificar la integridad matemática de cada bloque descargado.
- **Fragmentos (Chunks)**: El archivo completo de tamaño $F$ se divide en bloques uniformes denominados *chunks*, con un tamaño típico de $S_{\text{chunk}} = 256\text{ KiB}$ (aunque puede variar entre 128 KiB y 2 MiB en archivos de gran tamaño). La cantidad total de fragmentos es:
  $$K = \left\lceil \frac{F}{S_{\text{chunk}}} \right\rceil$$
  Internamente, para optimizar la canalización sobre TCP (*pipelining*), cada chunk se subdivide en sub-bloques de 16 KiB durante la transmisión en la red.
- **Enjambre (Swarm)**: El conjunto dinámico de todos los nodos participantes que están descargando o subiendo fragmentos pertenecientes a un mismo archivo torrent.
- **Tracker**: Servidor centralizado ligero que mantiene una lista en memoria de las direcciones IP y puertos de los nodos que se encuentran actualmente activos en el enjambre. Cuando un nuevo par desea unirse a la descarga, contacta al tracker vía HTTP/HTTPS o UDP, y este le responde con una lista aleatoria de pares (típicamente 50 a 100 IPs) con los cuales establecer conexiones TCP directas.
- **Seeder (Semilla)**: Un par que ya posee el 100% de los fragmentos del archivo y permanece conectado exclusivamente para subir datos a los demás.
- **Leecher**: Un par que todavía no posee el archivo completo; descarga los fragmentos faltantes mientras sube simultáneamente a otros pares los fragmentos que ya ha verificado.

## 2. Mecanismos Algorítmicos en BitTorrent

El éxito de BitTorrent reside en dos algoritmos clave implementados localmente por cada nodo: la selección de fragmentos a descargar (*piece selection*) y la selección de pares a los cuales enviar datos (*peer unchoking*).

### 2.1. Algoritmo Rarest-First (El Más Raro Primero)
Al integrarse al enjambre, cada par intercambia con sus vecinos un vector de bits (*bitfield*) que indica qué fragmentos posee. Para decidir qué fragmento solicitar a continuación, BitTorrent aplica la política **Rarest-First**:
1. El nodo determina, entre todos los fragmentos que aún no posee, cuáles tienen la menor cantidad de réplicas (*menor frecuencia de aparición*) entre sus pares vecinos conectados.
2. Comienza a solicitar prioritariamente estos fragmentos más raros.

**Beneficios de Ingeniería**:
- **Prevención de extinción de fragmentos**: Asegura que los fragmentos menos comunes se repliquen rápidamente en múltiples nodos antes de que el único par que los poseía abandone la red.
- **Equiparación de la oferta**: Diversifica rápidamente el contenido que posee cada peer, asegurando que todos los participantes tengan fragmentos útiles que intercambiar con sus vecinos.
- **Aceleración del enjambre**: La única excepción a esta regla ocurre al inicio de la conexión de un nuevo par (*Strict Priority / Random First Piece*): para permitir que un nodo nuevo empiece a subir lo antes posible, descarga su primer fragmento al azar con el fin de obtenerlo con la mínima latencia.

### 2.2. Control de Subida y Políticas de Incentivos: Tit-for-Tat (TFT)
Uno de los mayores desafíos en las redes descentralizadas es el problema del **Free-Riding** (usuarios parásitos que descargan el archivo a máxima velocidad pero bloquean su capacidad de subida para no gastar ancho de banda). BitTorrent resuelve esto mediante una estrategia de teoría de juegos inspirada en **Tit-for-Tat** (*donante por donante*):

1. **Choking (Bloqueo)**: Un nodo restringe o suspende temporalmente la transmisión de datos hacia un vecino que no le está proporcionando una tasa de subida recíproca adecuada.
2. **Evaluación Continua (Cada 10 segundos)**: Cada peer mide constantemente la velocidad de descarga que recibe de cada uno de sus vecinos conectados. Ordena a los pares de mayor a menor tasa y selecciona a los **4 mejores pares** (*Top 4*); a estos cuatro les abre el grifo de subida (**Unchoke**). A todos los demás los mantiene en estado de bloqueo (*Choked*).
3. **Optimistic Unchoking (Desbloqueo Optimista, Cada 30 segundos)**: Para evitar caer en un estancamiento (*deadlock*) y descubrir si existen pares nuevos con mejores enlaces:
   - Cada 30 segundos, el par selecciona de forma completamente aleatoria a **un par bloqueado adicional** y comienza a subirle datos.
   - Si este nodo optimista responde devolviendo datos a una tasa elevada, entrará en el grupo de los Top 4 en la siguiente evaluación de 10 segundos, desplazando al par más lento.
   - Adicionalmente, el desbloqueo optimista es el mecanismo que permite a los nodos recién llegados (que aún no tienen ningún fragmento para ofrecer) obtener sus primeros bloques.

## 3. Dinámica de Churn (Volatilidad de la Red)

En los sistemas P2P, los nodos no son servidores dedicados de centros de datos, sino equipos de usuarios residenciales sujetos a **Churn**:
- **Definición**: El proceso estocástico por el cual los nodos ingresan, se desconectan abruptamente o apagan sus terminales a intervalos arbitrarios y sin previo aviso.
- Un protocolo P2P robusto debe garantizar que la pérdida repentina de un nodo no interrumpa las transferencias del resto ni cause corrupción en el archivo:
  - Los fragmentos son verificados de forma independiente mediante su hash SHA-1; si un bloque recibido de un par defectuoso o malicioso no coincide con el digest, se descarta y se solicita a otro nodo.
  - Cada par mantiene entre 30 y 80 conexiones TCP simultáneas para disponer de múltiples rutas alternativas inmediatas ante la caída de cualquier vecino.

## 4. Tablas Hash Distribuidas (Distributed Hash Tables - DHT)

Aunque BitTorrent tradicional opera con trackers centralizados, si los servidores de tracker caen o son bloqueados, los clientes quedan incomunicados. Para lograr una descentralización absoluta (*Trackerless Torrents*), los sistemas modernos emplean **Tablas Hash Distribuidas (DHT)**.

### 4.1. Concepto y Funcionamiento de una DHT
Una DHT es una estructura de datos distribuida a nivel de red que implementa una interfaz clave-valor:
- Operaciones: $\text{put}(key, value)$ y $\text{get}(key) \to value$.
- En el contexto de BitTorrent (Kademlia / Mainline DHT), la **clave** ($key$) es el hash SHA-1 de 160 bits del archivo torrent (*InfoHash*), y el **valor** ($value$) es una lista de direcciones IP y puertos de los peers que comparten dicho torrent.

### 4.2. Topología Circular y Enrutamiento (Modelo Chord)
Uno de los diseños fundamentales de DHT es la topología circular tipo **Chord**:
1. **Espacio de Identificadores Cíclico**: Se define un espacio de enteros de $m$ bits módulo $2^m$ ($[0, 2^m - 1]$), visualizado como un anillo unidireccional orientado en sentido horario.
2. **Asignación de Claves a Nodos**:
   - Tanto los nodos (mediante el hash SHA-1 de su dirección IP y puerto) como las claves reciben identificadores de $m$ bits en el mismo espacio.
   - **Regla del Sucesor**: Una clave $k$ se almacena en el nodo cuyo identificador es el más pequeño que sea mayor o igual a $k$ en el anillo:
     $$\text{Nodo Responsable} = \text{successor}(k)$$
3. **Métrica de Distancia Circular**:
   $$d(x, y) = (y - x) \pmod{2^m}$$

### 4.3. Complejidad de Búsqueda: De $\mathcal{O}(N)$ a $\mathcal{O}(\log N)$
- **Enrutamiento Lineal Básico**: Si cada nodo solo mantiene en memoria la dirección IP de su sucesor inmediato en el anillo, una consulta para localizar una clave debe circular nodo a nodo por el perímetro del círculo. El número promedio de mensajes de red requeridos es:
  $$C_{\text{lineal}} = \frac{N}{2} = \mathcal{O}(N)$$
  Este esquema es ineficiente e inaceptable para redes con millones de nodos.
- **Finger Tables (Tablas de Dedos / Atajos Exponenciales)**:
  Para acelerar la búsqueda, cada nodo $p$ mantiene una tabla de enrutamiento interna con $m$ entradas (*fingers*). El $i$-ésimo puntero de la tabla apunta al sucesor del valor $p + 2^{i-1}$:
  $$\text{finger}[i] = \text{successor}((p + 2^{i-1}) \pmod{2^m}) \quad \text{para } i = 1, 2, \dots, m$$
- **Algoritmo de Encaminamiento Logarítmico**:
  Cuando el nodo $p$ busca la clave $k$:
  1. Si $k$ cae entre $p$ y su sucesor inmediato, la consulta se envía directamente al sucesor.
  2. En caso contrario, el nodo $p$ busca en su *Finger Table* el nodo más lejano cuyo identificador sea estrictamente menor que $k$.
  3. Reenvía la consulta a ese nodo intermedio, reduciendo a la mitad la distancia restante en el anillo en cada paso (análogo a una búsqueda binaria en una red distribuida).

Gracias a las Finger Tables, el número de mensajes de encaminamiento en la capa de aplicación se reduce drásticamente a:
$$C_{\text{lookup}} = \mathcal{O}(\log N)$$
En una red con $N = 1,000,000$ de computadores, localizar cualquier recurso solo requiere en promedio $\log_2(1,000,000) \approx 20$ saltos lógicos de red.
