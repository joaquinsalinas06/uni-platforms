# Contrato de visualizaciones de Redes

Contrato compartido entre redactores (escriben bloques) y diseñador (implementa la librería).
Los redactores escriben bloques ASUMIENDO que esto ya existe. El diseñador lo implementa tal
cual; si un campo debe cambiar, lo anota en § Desviaciones al final y el verificador ajusta
los bloques.

## Reglas comunes

- Uso en `.mdx`:
  ```mdx
  import Visualization from '../../../src/components/Visualization.astro';   {/* theory.mdx */}
  import Visualization from '../../../../src/components/Visualization.astro'; {/* subtopics/*.mdx */}

  <Visualization viz={{ type: 'net-scene', title: 'Resolución DNS iterativa', steps: [{ note: '…', devices: [] }] }} />
  ```
  En `content/practica.mdx` es `'../src/components/Visualization.astro'`; en
  `content/evaluaciones/parciales/*.mdx` es `'../../../src/components/Visualization.astro'`.
- Bloque: `{ type, title?, static?: boolean, steps: [ {note, …campos de la familia} ] }`.
- `static: true` → un solo paso, sin controles: figura fija dentro de la prosa.
- Sin `static` → controles ◀ ▶ ⏯, puntos por paso y teclas ←/→. Cada paso es un fotograma completo: repite todo lo que debe seguir visible y cambia solo lo nuevo.
- `note` (obligatorio por paso) dice QUÉ mirar y POR QUÉ, en 1–2 líneas, y se muestra bajo la figura.
- `state` de cualquier elemento:
  - `idle` (por defecto): tinta normal.
  - `active`: rojo carmesí (acento), lo que ocurre en ESTE paso.
  - `marked`: halo suave, lo que se señala o recuerda.
  - `answer`: verde, el resultado final.
  - `muted`: gris tenue, lo que ya pasó o no importa.
- Una idea por paso. Una resolución DNS son ~8 pasos (un paquete por paso); un handshake son 3–4.
- Etiquetas cortas (`"SYN seq=x"`, `"A?"`, `"1 Gbps"`). Detalle largo → `note`.
- Solo datos del material del curso (o del enunciado del examen). Nada inventado.

---

## 1. `net-scene`: escena de red con dispositivos y paquetes que viajan

### Cómo se ve

```
 ┌─ LAN casa ────────────────┐                         ┌───────────┐
 │  💻 laptop                 │   ①  A? www.utec.edu.pe  │ 🗄 root    │
 │  192.168.1.10 ─────────────┼──────────●──────────▶   │  DNS raíz │
 │         │                  │      10 Mbps · 5 ms     └───────────┘
 │     ◇ router               │
 └───────────────────────────┘        🗄 DNS local (ISP)
```

- Lienzo con coordenadas `x, y` de 0 a 100 (izquierda→derecha, arriba→abajo), ancho completo y alto proporcional, responsive en móvil.
- Cada `device` es un ícono dibujado (no emoji) según `kind`, con `label` debajo en negrita y `sub` en gris más pequeño (IP:puerto, rol):
  - `laptop`: portátil.
  - `host`: PC/torre.
  - `phone`: celular.
  - `server`: rack.
  - `dns`: rack con chapa "DNS".
  - `router`: cilindro con flechas cruzadas (estilo Cisco).
  - `switch`: caja plana con flechas.
  - `cloud`: nube ("Internet").
  - `tracker`: servidor con diana (BitTorrent).
- `cables`: líneas sin dirección entre dispositivos. `rate`/`delay` aparecen como chapita sobre el centro del cable: `1 Gbps · 10 ms`.
- `packets`: un sobre/pastilla con `label` que VIAJA animado de `from` a `to` siguiendo el cable directo, aunque no haya cable dibujado. Se anima al entrar al paso.
  - `order` → círculo numerado ①②③ junto a la flecha que deja el rastro del recorrido.
  - Los paquetes `muted` de pasos anteriores quedan como flecha tenue numerada: así se lee la secuencia completa al final.
  - `lost: true` → el paquete se detiene a mitad del cable con una ✕ roja.
- `zones`: rectángulo redondeado de fondo tenue con título arriba a la izquierda que envuelve a sus `devices` (LAN, ISP, "Vivienda 1", "Dominio .com").
- Respeta `prefers-reduced-motion`: sin animación, el paquete aparece ya en destino.

### Campos del paso

```ts
devices: { id; kind: 'host'|'laptop'|'phone'|'server'|'router'|'switch'|'dns'|'cloud'|'tracker';
           label; sub?; x; y; state? }[]
cables?:  { from; to; label?; rate?; delay?; state? }[]
packets?: { from; to; label; order?; lost?; state? }[]
zones?:   { label; devices: string[] }[]
```

### Ejemplo (resolución iterativa, 3 primeros pasos)

```mdx
<Visualization viz={{ type: 'net-scene', title: 'Resolución DNS iterativa', steps: [
  { note: 'El host pregunta a su servidor DNS local (consulta recursiva).',
    devices: [
      { id: 'h', kind: 'laptop', label: 'Host', sub: 'cis.poly.edu', x: 10, y: 75 },
      { id: 'l', kind: 'dns', label: 'DNS local', sub: 'dns.poly.edu', x: 35, y: 75 },
      { id: 'r', kind: 'dns', label: 'Raíz', x: 60, y: 15 },
      { id: 't', kind: 'dns', label: 'TLD .edu', x: 85, y: 40 },
      { id: 'a', kind: 'dns', label: 'Autoritativo', sub: 'dns.umass.edu', x: 85, y: 80 },
    ],
    packets: [{ from: 'h', to: 'l', label: 'A? gaia.cs.umass.edu', order: 1, state: 'active' }] },
  { note: 'El DNS local pregunta a la raíz.',
    devices: [ /* mismos */ ],
    packets: [
      { from: 'h', to: 'l', label: 'A? gaia.cs.umass.edu', order: 1, state: 'muted' },
      { from: 'l', to: 'r', label: 'A? gaia.cs.umass.edu', order: 2, state: 'active' } ] },
  { note: 'La raíz no sabe la IP: responde con el TLD .edu (iterativa).',
    devices: [ /* mismos */ ],
    packets: [ /* 1 y 2 muted */ { from: 'r', to: 'l', label: 'NS .edu', order: 3, state: 'active' } ] },
]}} />
```

---

## 2. `spacetime`: diagrama espacio-tiempo (tiempo hacia abajo, con escala real)

### Cómo se ve

```
        Emisor          Router          Receptor
  0 ms ──┬───────────────┬───────────────┬──
         │▓▓╲            │               │      ▓ = transmisión (L/R): banda gruesa
         │▓▓▓╲           │               │      ╲ = propagación: la pendiente
  1 ms ──┤ ╲▓▓╲          │               │
         │  ╲▓▓▓────────▶│▓▓╲            │      ┐
         │               │ ╲▓▓╲          │      │ RTT
  ...    │               │   ╲▓▓▓──────▶ │      ┘
         │ ◀─────────────────────── ACK  │
```

- Una línea vertical por `column` (emisor, routers, receptor), con su `label` arriba.
- Eje de tiempo vertical a la izquierda, hacia abajo, con `time.unit`, ticks numerados y rejilla tenue. La escala es REAL: `tStart`, `tTrans` y `tProp` se dibujan proporcionales.
- Cada `send` de `kind: 'data'` es un paralelogramo inclinado:
  - el borde superior sale de `from` en `tStart` y llega a `to` en `tStart + tProp`;
  - el borde inferior sale en `tStart + tTrans` y llega en `tStart + tTrans + tProp`.
  - Así el grosor vertical es el tiempo de transmisión y la pendiente es la propagación.
- `kind: 'ack'` o `'ctrl'` es una línea fina inclinada con punta de flecha (ACK, SYN, FIN, GET…). Usa `tTrans: 0`.
- `label` va sobre la banda o la línea.
- `lost: true`: la banda se corta a mitad de camino con ✕.
- `spans`: corchetes verticales a la derecha (o izquierda) de su `column` con texto (`RTT`, `timeout`, `d_trans`, `cola`). `timeout` se dibuja como reloj + corchete punteado.
- Los pasos revelan los envíos uno a uno; `muted` deja visible lo anterior en gris.

### Campos del paso

```ts
columns: { id; label }[]
time:    { unit: 'ms'|'µs'|'s'; max: number; ticks?: number[] }
sends:   { from; to; tStart; tTrans; tProp; label?; kind: 'data'|'ack'|'ctrl'; lost?; state? }[]
spans?:  { column; tStart; tEnd; label; kind: 'rtt'|'timeout'|'trans'|'prop'|'queue'; state? }[]
```

### Ejemplo (stop-and-wait, 1 paquete)

```mdx
<Visualization viz={{ type: 'spacetime', static: true, title: 'Stop-and-wait', steps: [
  { note: 'L/R = 0,008 ms de transmisión; RTT = 30 ms. El emisor está ocupado solo 0,008 de cada 30,008 ms.',
    columns: [{ id: 'e', label: 'Emisor' }, { id: 'r', label: 'Receptor' }],
    time: { unit: 'ms', max: 32, ticks: [0, 15, 30] },
    sends: [
      { from: 'e', to: 'r', tStart: 0, tTrans: 0.008, tProp: 15, label: 'paquete', kind: 'data', state: 'active' },
      { from: 'r', to: 'e', tStart: 15.008, tTrans: 0, tProp: 15, label: 'ACK', kind: 'ack' } ],
    spans: [{ column: 'e', tStart: 0, tEnd: 30.008, label: 'RTT + L/R', kind: 'rtt' }] },
]}} />
```

---

## 3. `window`: ventana deslizante sobre números de secuencia

### Cómo se ve

```
 Emisor (GBN, N = 4)      base=2        nextseqnum=5
  ┌──┬──┬──╔══╤══╤══╤══╗──┬──┬──┐
  │0 │1 │✓ ║2 │3 │4 │5 ║6 │7 │8 │
  └──┴──┴──╚══╧══╧══╧══╝──┴──┴──┘
   ■ ACK recibido  ■ enviado sin ACK  □ usable  ▨ fuera de ventana

 Receptor                 esperado=2
  ┌──┬──┬──┬──┬──┐
  │0 │1 │2 │3 │4 │
```

- Una fila de celdas cuadradas numeradas por ventana (`windows`), apiladas verticalmente con su `label` a la izquierda.
- Un marco grueso carmesí rodea las celdas `[base, base+size)`. Entre pasos el marco se DESLIZA con animación.
- Colores por estado de celda:
  - `acked`: relleno verde tenue con ✓.
  - `sent`: amarillo, enviado sin ACK.
  - `usable`: blanco con borde.
  - `unusable`: rayado gris.
  - `buffered`: azul, recibido fuera de orden y guardado (SR).
  - `expected`: borde carmesí punteado.
  - `received`: verde, entregado.
- Si hay `seqSpace` (p. ej. 4), los números son módulo `seqSpace` (0 1 2 3 0 1 …).
- Leyenda de colores abajo, solo con los estados usados.

### Campos del paso

```ts
windows: { role: 'sender'|'receiver'; label; base; size; seqSpace?;
           cells: { n: number; state: 'acked'|'sent'|'usable'|'unusable'|'buffered'|'expected'|'received' }[] }[]
```

---

## 4. `packet`: cabeceras (bits) y encapsulamiento (capas)

### Cómo se ve

Con `fields` (rejilla de bits; cada fila mide `width` bits):

```
 0               16              31
 ┌───────────────┬───────────────┐
 │ puerto origen │ puerto destino│   ← 16 + 16 bits
 ├───────────────┼───────────────┤
 │   longitud    │   checksum    │
 ├───────────────┴───────────────┤
 │     datos de aplicación       │
 └───────────────────────────────┘
```

- Regla de bits arriba (0, 16, 31).
- El ancho de cada campo es proporcional a `bits`.
- `value` aparece en monoespaciado bajo el `label` (`53`, `0x1A2B`).
- `state: 'active'` resalta el campo en carmesí.

Con `layers` (encapsulamiento anidado o pila de capas):

```
 ┌──────┬──────┬──────┬────────────────┬─────┐
 │  Hl  │  Hn  │  Ht  │    mensaje M   │ Tl  │   trama (enlace)
 └──────┴──────┴──────┴────────────────┴─────┘
```

- Cada capa es una fila de arriba (aplicación) a abajo (física). La fila n muestra la carga de la fila anterior más su `header` pegado a la izquierda, coloreado.
- Entre pasos se agrega una cabecera por paso: el encapsulamiento se arma animado.
- Si solo hay `label` sin `header`, es una pila de capas simple (5 capas TCP/IP).

### Campos del paso

```ts
fields?: { width: number; rows: { label; bits: number; value?; state? }[][] }
layers?: { label; header?: string; trailer?: string; state? }[]
```

### Ejemplo (segmento UDP)

```mdx
<Visualization viz={{ type: 'packet', static: true, title: 'Segmento UDP', steps: [
  { note: '8 bytes de cabecera: cuatro campos de 16 bits.',
    fields: { width: 32, rows: [
      [{ label: 'puerto origen', bits: 16 }, { label: 'puerto destino', bits: 16 }],
      [{ label: 'longitud', bits: 16 }, { label: 'checksum', bits: 16 }],
      [{ label: 'datos (mensaje de aplicación)', bits: 32 }] ] } },
]}} />
```

---

## 5. `fsm`: máquinas de estados (rdt1.0–3.0, estilo de las slides)

### Cómo se ve

```
              ┌──────────────────────────┐
              │ rdt_rcv(rcvpkt) &&       │   ← EVENTO (negrita, mono)
              │ corrupt(rcvpkt)          │
              ├──────────────────────────┤
              │ udt_send(NAK)            │   ← ACCIÓN (mono, gris); Λ si no hay
              └──────────────────────────┘
                     ╭──╮
  ●┄┄▶ ( Esperar 0 de abajo ) ───────────▶ ( Esperar 1 de abajo )
                     ◀─────────── arco de vuelta ───────────╯
```

- Cada estado es una elipse a la medida de su rótulo (sans, partido en líneas). `initial` → punto negro con flecha punteada; `final` → doble borde.
- Cada transición lleva una tarjeta con fondo: EVENTO arriba, una raya, ACCIÓN abajo. Las condiciones largas se parten tras `&&`, `||`, `;`. Sin `action` → `Λ`.
- Ida y vuelta entre el mismo par = dos arcos (uno arriba, otro abajo), con la punta sobre el borde del estado destino.
- Varios bucles en un estado se reparten alrededor (arriba, abajo, costados, diagonales), con su tarjeta afuera.
- Colocación automática: 1–3 estados en fila, 4 en cuadrado siguiendo el ciclo desde el inicial (como en las slides); en móvil, en columna. Se espacia sola hasta que nada choca. `x`/`y` (0–100) la fuerzan.
- Paso a paso: la transición `state: 'active'` hace viajar una ficha de origen a destino y el destino se enciende al llegar. Ideal para una traza: un paso por evento.

### Campos del paso

```ts
states:      { id; label; initial?; final?; x?; y?; state? }[]
transitions: { from; to; event; action?; state?; bend? }[]   // bend: curvatura (± fracción de la distancia)
```

### Ejemplo (receptor rdt2.1, con un paso de traza)

```mdx
<Visualization viz={{ type: 'fsm', title: 'Receptor rdt2.1', steps: [
  { note: 'Receptor: dos estados según el número de secuencia esperado.',
    states: [{ id: 'r0', label: 'Esperar 0 de abajo', initial: true }, { id: 'r1', label: 'Esperar 1 de abajo' }],
    transitions: [
      { from: 'r0', to: 'r1', event: 'rdt_rcv(rcvpkt) && notcorrupt(rcvpkt) && has_seq0(rcvpkt)', action: 'extract(rcvpkt,data); deliver_data(data); udt_send(ACK)' },
      { from: 'r0', to: 'r0', event: 'rdt_rcv(rcvpkt) && corrupt(rcvpkt)', action: 'udt_send(NAK)' } ] },
  { note: 'Llega un paquete corrupto: NAK y sigue en "Esperar 0".',
    states: [{ id: 'r0', label: 'Esperar 0 de abajo', initial: true }, { id: 'r1', label: 'Esperar 1 de abajo' }],
    transitions: [
      { from: 'r0', to: 'r1', event: 'rdt_rcv(rcvpkt) && notcorrupt(rcvpkt) && has_seq0(rcvpkt)', action: 'extract(rcvpkt,data); deliver_data(data); udt_send(ACK)' },
      { from: 'r0', to: 'r0', event: 'rdt_rcv(rcvpkt) && corrupt(rcvpkt)', action: 'udt_send(NAK)', state: 'active' } ] },
]}} />
```

---

## 6. Familias existentes que también se usan

- `xy-chart`: curvas.
  - Usos: tiempo de distribución C/S vs P2P en función de N (con `fn`), EstimatedRTT vs SampleRTT (con `points` reales), utilización.
  - Paso: `series[{id,label,points|fn,domain,kind:'line'|'step'|'bars'}]`, `x{label,min,max}`, `y{…}`, `hlines/vlines[{at,label}]`.
- `flow` (diagramas de flujo y bloques). Para máquinas de estado usar `fsm` (§5); `flow` con `mode: 'fsm'` sigue funcionando pero ya no se usa en el contenido.
- `sequence`: intercambio de mensajes sin escala de tiempo (cookies, GET condicional, DORA).
  - `actors[{id,label}]`, `msgs[{from,to,label,flags?,lost?}]`.

---

## Desviaciones
(El diseñador anota aquí cualquier cambio respecto a lo anterior.)

Implementado en `src/visualizations/{net-scene,spacetime,window,packet}/`. Galería de prueba: `/lab/redes-viz`.
Ningún campo del contrato cambió de nombre ni de forma. Sólo hay añadidos opcionales y defaults tolerantes:

- `packet.layers[].payload?: string` (añadido): texto del bloque de datos más interno en el encapsulamiento. Se lee de la primera capa; default `"M"`.
- `time.unit` acepta además `'μs'` (mu griega), `'us'` y `'ns'`; se muestra como `µs`/`ns`.
- Defaults: `packets[].label` → `''`; `sends[].kind` → `'data'`; `sends[].tTrans` → `0`; `spans[].kind` → `'rtt'`; `fields.width` → `32`.
- `spacetime`: un `tTrans` diminuto se dibuja con un grosor mínimo de 3 px (sigue siendo proporcional cuando es visible).
- `spacetime`: los corchetes de la PRIMERA columna van a su izquierda; los de las demás, a su derecha. Un corchete corto lleva el rótulo horizontal.
- `net-scene`: los paquetes `active`/`answer` animan (sobre que viaja); `muted` quedan como flecha punteada numerada con su rótulo tenue. Ida y vuelta entre el mismo par van por lados opuestos del cable.
- `window`: el rótulo `base=` (emisor) o `esperado=` (receptor, si hay celda `expected`) va bajo el marco. `nextseqnum` no se dibuja (no está en el contrato).
- `packet` con `fields` y `layers` en el mismo paso: las capas van debajo de la rejilla.

- `fsm` (nuevo, §5): reemplaza a `flow` + `mode: 'fsm'`. El rótulo `"evento\n/ acción"` pasa a `event` + `action`. Todos los bloques de `content/` se migraron.
