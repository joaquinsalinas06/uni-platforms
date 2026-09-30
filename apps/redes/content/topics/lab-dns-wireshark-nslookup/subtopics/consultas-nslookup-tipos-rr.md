---
kind: subtopic
title: "Consultas Avanzadas con nslookup y Diagnóstico de Registros RR"
order: 1
---

## 1. Modos de Operación de nslookup

La utilidad `nslookup` permite realizar diagnósticos directos sobre la infraestructura DNS enviando consultas crudas a servidores de nombres sin la intervención de la capa de renderizado del navegador:

### Modo No Interactivo
Se utiliza comúnmente en scripts de automatización o para comprobaciones rápidas desde la terminal:
```bash
# Consulta de registro tipo A (por defecto)
nslookup www.cisco.com

# Consulta explícita a un servidor DNS alternativo (e.g., Cloudflare 1.1.1.1)
nslookup www.cisco.com 1.1.1.1

# Consulta de registros específicos
nslookup -type=MX utec.edu.pe
nslookup -type=NS mit.edu
nslookup -type=AAAA google.com
```

### Modo Interactivo
Se inicia ejecutando `nslookup` sin argumentos:
```text
> server 8.8.8.8
Default server: 8.8.8.8
Address: 8.8.8.8#53

> set type=mx
> cisco.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
cisco.com	mail exchanger = 10 aer-mx-01.cisco.com.
cisco.com	mail exchanger = 20 rtp-mx-01.cisco.com.
```

## 2. Análisis de Registros MX y Preferencias

Al solicitar registros de intercambio de correo electrónico mediante `set type=mx`:
- Cada registro devuelto consta de un nombre de host de servidor SMTP y un valor numérico de preferencia.
- El servidor emisor contactará primero a aquel con el menor número de preferencia. Si dicho servidor se encuentra inalcanzable, saturado o responde con códigos temporales de error (e.g., SMTP 421), el emisor conmuta de forma automática al servidor de respaldo con la siguiente prioridad más baja.
- Esta redundancia asegura que los correos entrantes no se pierdan ante caídas de hardware o labores de mantenimiento en centros de datos primarios.

## 3. Resolución Inversa (Reverse DNS / PTR)

`nslookup` permite realizar la operación inversa: mapear una dirección IP hacia el nombre de dominio canónico correspondiente:
```text
> 93.184.216.34
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
34.216.184.93.in-addr.arpa	name = example.com.
```
- El sistema invierte los octetos de la dirección IPv4 y añade el sufijo especial `.in-addr.arpa` para recorrer el árbol DNS de forma descendente.
- Al ejecutar consultas inversas sobre servicios alojados en redes de entrega de contenido (CDNs como Cloudflare o Fastly), con frecuencia la respuesta no refleja el dominio del sitio web, sino el nombre de la infraestructura de borde del proveedor (e.g., `151.101.x.x` resuelve a dominios de Fastly), evidenciando que una misma dirección IP aloja cientos de sitios web mediante cabeceras HTTP `Host` y SNI en TLS.

## 4. Consultas Directas a Servidores Autoritativos y Restricciones de Red

Cuando un administrador desea verificar si un cambio reciente de registros ya se propagó en los servidores autoritativos de la organización:
```bash
nslookup -type=SOA example.com ns1.example.com
```
Al interrogar directamente a un servidor autoritativo foráneo por un dominio externo (por ejemplo, solicitando a `bitsy.mit.edu` que resuelva `www.aiit.or.kr`):
- El servidor usualmente descarta o rechaza la solicitud (`Query refused`).
- Esto se debe a que la configuración estándar de BIND y otros demonios de DNS deshabilita la directiva `allow-recursion` para direcciones IP fuera de su subred institucional. Permitir la recursión abierta a cualquier host de Internet expone al servidor a ser explotado en ataques de amplificación DDoS y agota sus recursos de memoria y CPU.
