---
kind: subtopic
title: "Jerarquía de Servidores DNS y Gestión de Zonas"
order: 1
---

## 1. Estructura Jerárquica del Espacio de Nombres

El espacio de nombres de dominio de Internet está organizado como un árbol invertido cuyo vértice superior es la raíz no nombrada (denotada por un punto final `.`). Cada nodo del árbol posee una etiqueta alfanumérica de hasta 63 caracteres. El nombre de dominio completo o FQDN (*Fully Qualified Domain Name*) se construye concatenando las etiquetas de los nodos desde la hoja hasta la raíz, separadas por puntos (por ejemplo, `gaia.cs.umass.edu.`).

La administración de este inmenso árbol está dividida en **zonas de autoridad**. Una zona representa un subárbol continuo del espacio de nombres cuya gestión administrativa es delegada a una entidad específica mediante registros de servidor de nombres (`NS`).

## 2. Servidores Raíz (Root DNS Servers)

Los servidores raíz son los guardianes de la cima del árbol de nombres:
- Contienen los registros de delegación de todos los dominios de nivel superior (TLD).
- Operan bajo **13 direcciones IP lógicas** de referencia global, etiquetadas de la letra `a` a la `m` bajo el dominio `root-servers.net` (e.g., `a.root-servers.net` administrado por Verisign, `b.root-servers.net` por USC-ISI, `k.root-servers.net` por RIPE NCC).
- Para evitar que un ataque de denegación de servicio (DDoS) derribe el sistema, estas 13 identidades lógicas se despliegan en cientos de servidores físicos mediante la técnica de enrutamiento **IP Anycast**. En Anycast, múltiples máquinas físicas en diferentes ubicaciones geográficas anuncian el mismo prefijo de dirección IP BGP, permitiendo que los routers de Internet dirijan automáticamente la consulta del cliente al nodo Anycast topológicamente más cercano.

## 3. Servidores de Dominio de Nivel Superior (TLD)

Inmediatamente debajo de la raíz se encuentran los dominios de nivel superior:
1. **Dominios genéricos (gTLD)**: Incluyen los dominios históricos como `.com`, `.net`, `.org`, `.edu`, `.gov`, y extensiones más recientes como `.io`, `.app`, `.cloud`, gestionadas por empresas u organizaciones privadas autorizadas por ICANN. Por ejemplo, Verisign opera el registro de `.com` y `.net`, manteniendo bases de datos distribuidas con millones de registros.
2. **Dominios de código de país (ccTLD)**: Identifican países o territorios específicos bajo la norma ISO 3166-1 alpha-2, tales como `.pe` (Perú), `.br` (Brasil), `.cl` (Chile), `.uk` (Reino Unido), `.de` (Alemania). Cada país designa una entidad rectora; en el caso de Perú, el registro es administrado por la Red Científica Peruana (Punto.pe).

Un servidor TLD mantiene registros `NS` que apuntan a los servidores autoritativos de los dominios de segundo nivel registrados bajo su zona (por ejemplo, para `utec.edu.pe`, el servidor TLD `.pe` almacena las referencias a los servidores DNS autoritativos de UTEC).

## 4. Servidores DNS Autoritativos

Un servidor autoritativo tiene la potestad administrativa oficial sobre una zona DNS particular:
- Es el repositorio definitivo de los registros de recursos (RR) que asocian los nombres de host con sus direcciones IP y demás servicios de la organización.
- Las mejores prácticas de ingeniería de redes dictan que cada zona debe contar con al menos dos servidores autoritativos independientes: un servidor primario (*Master*), donde los administradores modifican los archivos de zona, y uno o más servidores secundarios (*Slave*), que sincronizan los cambios mediante transferencias de zona DNS (protocolo AXFR/IXFR sobre TCP).
- Si una organización no desea operar sus propios servidores físicos DNS, puede delegar su zona a proveedores de infraestructura DNS gestionada (*Managed DNS Providers*), configurando los servidores NS correspondientes en el registrador de dominios.

## 5. El Resolver Local (Local DNS Name Server)

A nivel de la red del usuario final, los equipos terminales no conocen la dirección de los servidores raíz ni exploran la jerarquía de forma autónoma:
- Los hosts configuran la dirección IP de uno o más **servidores DNS locales** (resolvers), asignados dinámicamente mediante el protocolo DHCP o manualmente por el administrador de red.
- En redes domésticas, el router/gateway residencial suele actuar como resolver intermedio o reenviador hacia los servidores DNS del ISP.
- En redes corporativas o académicas, el resolver local reside en servidores dedicados (ejecutando software como BIND, Unbound o PowerDNS) o redirige consultas a resolvers públicos globales de alto rendimiento como Google Public DNS (`8.8.8.8`, `8.8.4.4`), Cloudflare (`1.1.1.1`) o Quad9 (`9.9.9.9`).
- La función capital del resolver local es aislar a los clientes finales de la complejidad de la jerarquía global y reducir drásticamente el tráfico hacia Internet gracias a su motor de almacenamiento en caché.
