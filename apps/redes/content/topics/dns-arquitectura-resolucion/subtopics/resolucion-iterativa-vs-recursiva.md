---
kind: subtopic
title: "Resolución Iterativa vs Recursiva y Dinámica de Caché"
order: 2
---

## 1. El Proceso de Consulta DNS

Cuando una aplicación de red necesita conectarse a un servicio remoto (por ejemplo, al ejecutar un comando `curl http://gaia.cs.umass.edu` o al ingresar la URL en un navegador), el sistema operativo invoca una rutina de resolución de nombres de la biblioteca estándar (típicamente `getaddrinfo` o `gethostbyname`). Esta llamada genera un mensaje de solicitud DNS que viaja hacia el servidor DNS local asignado.

El proceso completo de obtención de la dirección IP final involucra dos modalidades esenciales de consulta: iterativa y recursiva.

## 2. Consulta Iterativa (Iterative Query)

En el modelo de consulta iterativa:
- El cliente (generalmente el resolver local) envía una consulta DNS a un servidor de nombres.
- Si el servidor consultado posee la respuesta definitiva en su zona autoritativa o en su memoria caché, devuelve inmediatamente el registro solicitado (e.g., registro A con la IP).
- Si el servidor desconoce la respuesta exacta, **no contacta a otros servidores en nombre del cliente**. En su lugar, responde con un mensaje de referencia (*Referral*) que contiene los registros de servidores autoritativos (`NS`) del siguiente nivel de la jerarquía que están más cerca de la respuesta, junto con sus direcciones IP correspondientes en la sección adicional (*Glue Records*).
- El cliente asume la carga de procesar esa referencia y emitir una nueva consulta hacia el servidor indicado.

Este esquema protege a los servidores superiores de la jerarquía (servidores Raíz y TLD) de mantener estados de conexión abiertos y de sobrecargar su memoria con hilos de ejecución en espera.

## 3. Consulta Recursiva (Recursive Query)

En el modelo de consulta recursiva:
- El cliente transfiere por completo la responsabilidad de la resolución al servidor de destino fijando el bit de bandera **RD (Recursion Desired = 1)** en la cabecera del mensaje de consulta.
- Si el servidor consultado no conoce la respuesta, él mismo actúa como cliente y envía una nueva consulta al siguiente servidor en la cadena, esperando su respuesta para reenviarla hacia el solicitante original.
- Si toda la cadena de resolución de Internet fuera puramente recursiva, un servidor raíz tendría que mantener conexiones abiertas y esperar las respuestas sucesivas de los TLDs y de los servidores autoritativos para millones de usuarios simultáneos, lo cual provocaría una degradación severa del servicio y vulnerabilidad inmediata a saturación de recursos.

## 4. Arquitectura Híbrida Estándar

Para conciliar la simplicidad del cliente terminal con la estabilidad de los servidores centrales de Internet, la arquitectura adopta un esquema híbrido:
1. **Cliente a Resolver Local (Recursivo)**: El host del usuario no posee la lógica para navegar la jerarquía ni el estado de las zonas. Por ello, envía una consulta con `RD=1` a su resolver local. El resolver acepta la recursión (respondiendo con `RA=1`, *Recursion Available*).
2. **Resolver Local a la Jerarquía (Iterativo)**: El resolver local asume el trabajo pesado y realiza una secuencia de consultas iterativas:
   - Paso 1: Consulta al servidor Raíz por `gaia.cs.umass.edu`. El servidor Raíz devuelve la lista de servidores TLD autorizados para `.edu`.
   - Paso 2: Consulta a uno de los servidores TLD de `.edu`. El servidor TLD devuelve los servidores de nombres autoritativos para el dominio `umass.edu` (`dns.cs.umass.edu`).
   - Paso 3: Consulta al servidor autoritativo `dns.cs.umass.edu` por el registro `gaia.cs.umass.edu`.
   - Paso 4: El servidor autoritativo responde con el registro de tipo A que contiene la dirección IP final.
3. **Respuesta Final**: El resolver local entrega la respuesta al host original y guarda la información en su memoria caché.

## 5. Dinámica de Almacenamiento en Caché y TTL

El almacenamiento en caché (*DNS Caching*) reduce drásticamente la latencia y el volumen de tráfico:
- Cuando el resolver local obtiene una respuesta en cualquiera de los pasos iterativos, almacena tanto la IP del host final como las direcciones de los servidores TLD y autoritativos de la zona.
- **TTL (Time to Live)**: Cada registro retornado tiene asignado un valor de TTL (expresado en segundos). Durante ese lapso, cualquier consulta subsecuente por el mismo recurso se responde localmente en un tiempo $\mathcal{O}(1)$ de consulta en memoria.
- **Inconsistencias temporales**: Si el administrador de un dominio migra un servidor a una nueva dirección IP antes de que el TTL expire, los clientes continuarán conectándose a la IP obsoleta hasta que sus registros en caché expiren o sean purgados manualmente.
