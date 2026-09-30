---
kind: subtopic
title: "Taxonomía y Semántica de Registros de Recursos (RR)"
order: 1
---

## 1. La Tupla Canónica de un Resource Record

Los registros de recursos (*Resource Records*, RR) son los bloques constructivos elementales con los que se definen todas las zonas y respuestas en DNS. De acuerdo con el estándar RFC 1035, cada registro está estructurado mediante una tupla formal de cuatro parámetros:

$$\text{RR} = (\text{Name}, \text{Value}, \text{Type}, \text{TTL})$$

- **Name**: Cadena de texto correspondiente al nombre de dominio completamente calificado o subdominio que actúa como clave primaria en la base de datos distribuida.
- **Value**: Información de resolución asignada al nombre. Su formato y significado dependen de manera unívoca del campo `Type`.
- **Type**: Identificador entero y nemotécnico que especifica la clase de recurso.
- **TTL**: Tiempo de vida en segundos que indica a los resolvers intermedios cuánto tiempo pueden almacenar el registro en su memoria volátil antes de consultar nuevamente a la fuente autoritativa.

## 2. Registros de Direccionamiento de Hosts: A y AAAA

### Registro Tipo A (IPv4)
El registro de tipo A asocia un nombre de dominio alfanumérico a una dirección de red IPv4 de 32 bits:
```text
www.example.com.    3600    IN    A    93.184.216.34
```
- **Name**: `www.example.com.`
- **TTL**: `3600` segundos (1 hora).
- **Class**: `IN` (Internet).
- **Type**: `A`
- **Value**: `93.184.216.34`

Cuando un cliente en una red IPv4 pura navega a una URL, su pila de red requiere imperativamente este registro para construir las cabeceras del protocolo IP.

### Registro Tipo AAAA (IPv6)
Para soportar la transición hacia el espacio de direccionamiento de 128 bits, el estándar RFC 3596 introdujo el registro AAAA (llamado *Quad-A* debido a que 128 bits es cuatro veces el tamaño de una dirección IPv4 de 32 bits):
```text
example.com.    7200    IN    AAAA    2606:2800:220:1:248:1893:25c8:1946
```
Los clientes modernos con soporte dual-stack (IPv4/IPv6) consultan concurrentemente registros A y AAAA utilizando algoritmos como *Happy Eyeballs* (RFC 8305) para establecer la conexión más rápida disponible.

## 3. Delegación y Autoridad: Registro NS

El registro NS (*Name Server*) es el mecanismo mediante el cual se implementa la descentralización administrativa de Internet:
```text
example.com.    86400    IN    NS    ns1.example.com.
example.com.    86400    IN    NS    ns2.example.com.
```
- Indica de forma inequívoca qué servidores de nombres son autoritativos para responder por el dominio `example.com`.
- Si un servidor TLD (como el de `.com`) recibe una consulta para `example.com`, examina sus registros NS correspondientes y devuelve dichos nombres en la sección de Autoridad del mensaje DNS, acompañados habitualmente de sus respectivas direcciones IP en la sección Adicional (*Glue Records*) para evitar la recursión circular.

## 4. Alias y Redirección Lógica: Registro CNAME

El registro CNAME (*Canonical Name*) mapea un nombre ficticio o alias hacia el nombre canónico (el nombre verdadero y único registrado en la infraestructura):
```text
www.ibm.com.    1800    IN    CNAME    servereast.backup2.ibm.com.
```
- Si un resolver solicita la dirección IP de `www.ibm.com`, el servidor autoritativo devuelve el registro CNAME.
- A continuación, el resolver reinicia la búsqueda para encontrar el registro de tipo A correspondiente al nombre canónico `servereast.backup2.ibm.com`.
- **Restricción técnica**: Según el RFC 1912, un nombre de dominio que contiene un registro CNAME no puede albergar ningún otro tipo de registro (salvo registros de seguridad DNSSEC). Por esta razón, el vértice de una zona (*Apex domain* o *Zone Apex*, como `example.com` sin `www`) no puede configurarse como un CNAME si también requiere registros NS, SOA o MX.

## 5. Agentes de Transferencia de Correo: Registro MX

El registro MX (*Mail Exchange*) especifica los servidores SMTP designados para aceptar mensajes de correo electrónico entrantes dirigidos a los usuarios de un dominio:
```text
example.com.    3600    IN    MX    10    mail1.example.com.
example.com.    3600    IN    MX    20    mail2.example.com.
```
- El campo de valor contiene dos elementos: una **preferencia numérica** (un entero de 16 bits sin signo, típicamente 10, 20, etc.) y el nombre de host del servidor de correo.
- **Mecanismo de fallback**: El cliente emisor SMTP ordena los registros MX de menor a mayor preferencia. Intentará conectarse primero a `mail1.example.com` (prioridad 10). Si dicho servidor está apagado o no responde, el cliente pasa automáticamente al siguiente servidor de reserva (`mail2.example.com`, prioridad 20).
- **Subdominios web vs dominios raíz**: Las organizaciones configuran registros MX para el dominio base (`cisco.com` para recibir correos a `usuario@cisco.com`). Raramente configuran registros MX para subdominios como `www.cisco.com`, ya que los usuarios no envían correos a direcciones con formato `usuario@www.cisco.com`.
