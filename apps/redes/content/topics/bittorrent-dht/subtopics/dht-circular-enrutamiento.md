---
kind: subtopic
title: "Tablas Hash Distribuidas (DHT) y Enrutamiento Circular"
order: 2
---

## 1. El Reto de la Búsqueda Descentralizada

En los sistemas P2P iniciales, la búsqueda y localización de recursos representaba un dilema crítico:
- El modelo centralizado de Napster dependía de un servidor que indexaba todos los archivos, constituyendo un punto único de falla y censura.
- El modelo no estructurado de Gnutella recurría a la inundación de mensajes (*Query Flooding*) con un contador TTL de saltos, lo cual generaba una sobrecarga exponencial de tráfico de red y no garantizaba encontrar el recurso si este se encontraba fuera del radio de saltos.

Las **Tablas Hash Distribuidas (Distributed Hash Tables - DHT)** resuelven este problema estructurando lógicamente el grafo de la red superpuesta mediante funciones de dispersión criptográfica, garantizando que cualquier clave sea localizada de forma determinista en un número acotado y predecible de saltos.

## 2. Hashing Consistente y Topología en Anillo (Chord)

En una DHT basada en el protocolo **Chord**:
- Se fija un espacio de identificadores de $m$ bits (por ejemplo, $m = 160$ bits empleando SHA-1). Los números enteros varían en el rango $[0, 2^m - 1]$ y se ordenan conceptualmente en un círculo unidireccional orientado en sentido de las agujas del reloj, donde el identificador $2^m - 1$ precede inmediatamente al $0$.
- **Asignación de Nodos**: Cada nodo físico que se une a la red obtiene un identificador $\text{NodeID} = \text{hash}(\text{IP}, \text{Puerto})$.
- **Asignación de Claves**: Cada recurso u objeto compartido obtiene una clave $\text{KeyID} = \text{hash}(\text{NombreDelRecurso})$.
- **Regla Fundamental de Posesión (Sucesor)**: Una clave $k$ es administrada y almacenada por el primer nodo cuyo identificador sea mayor o igual a $k$ en el recorrido horario del anillo:
  $$\text{Responsable}(k) = \text{successor}(k)$$

## 3. Algoritmos de Enrutamiento en el Anillo

### Enrutamiento Básico Secuencial $\mathcal{O}(N)$
En una implementación elemental, cada nodo $p$ únicamente necesita conocer la dirección IP de su sucesor directo en el anillo ($\text{successor}(p)$).
- Cuando un nodo busca la clave $k$, verifica si $k$ pertenece al intervalo $(p, \text{successor}(p)]$. Si es así, su sucesor es el responsable del dato.
- Si no, reenvía la consulta a su sucesor, repitiendo el proceso secuencialmente por el contorno del anillo.
- **Complejidad**: La consulta requiere en promedio $\frac{N}{2}$ saltos entre nodos overlay, resultando en un costo temporal lineal $\mathcal{O}(N)$.

### Enrutamiento Eficiente con Finger Tables $\mathcal{O}(\log N)$
Para acelerar radicalmente la localización de claves, cada nodo mantiene una tabla de enrutamiento acelerada denominada **Finger Table** que consta de $m$ entradas:
- La $i$-ésima entrada de la Finger Table del nodo $p$ apunta al primer nodo que sucede a $p$ a una distancia de $2^{i-1}$ posiciones:
  $$\text{finger}[i] = \text{successor}((p + 2^{i-1}) \pmod{2^m}) \quad (1 \le i \le m)$$
- Los punteros permiten dar saltos de tamaño exponencial ($1, 2, 4, 8, \dots, 2^{m-1}$) a través del círculo.
- Cuando el nodo $p$ busca una clave distante $k$, consulta su tabla y delega la petición al contacto más avanzado cuyo identificador todavía no sobrepase a $k$.
- Cada salto reduce a la mitad la distancia angular restante hacia la clave objetivo, logrando una complejidad de búsqueda óptima de:
  $$C_{\text{lookup}} = \mathcal{O}(\log N)$$

## 4. Gestión de Churn y Estabilización

Dado que los nodos ingresan y abandonan la red constantemente, el anillo debe reparar sus punteros de manera continua:
- **Lista de Sucesores**: Cada nodo almacena no solo a su sucesor inmediato, sino una lista de los $r$ sucesores siguientes más cercanos. Si su sucesor directo deja de responder de forma imprevista, el nodo conmuta inmediatamente al segundo sucesor de la lista, preservando la continuidad física del anillo lógico.
- **Protocolo de Estabilización**: De manera periódica en segundo plano, cada nodo interroga a su sucesor para verificar si un nuevo nodo ha ingresado entre ellos dos en el intervalo horario, actualizando sus punteros de Finger Table para mantener la consistencia matemática de la DHT.
