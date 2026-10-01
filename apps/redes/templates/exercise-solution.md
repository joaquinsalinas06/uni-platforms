# Cómo se escribe una solución de ejercicio

Referencia viva: `content/practica.mdx` § "Ejercicio 1.1".

## Forma
- La solución NO va en `exercise.solution` (string plano, una línea, ilegible). Va como
  HIJOS del componente, en MDX completo. Se oculta hasta que se piden todas las pistas:

```mdx
<ExerciseBlock client:visible exercise={{
  level: 2,
  statement: "Un host transmite un paquete de $L = 1500\\text{ bytes}$ por un enlace de $R = 100\\text{ Mbps}$ … Calcule $d_{\\text{trans}}$ y $d_{\\text{prop}}$.",
  hints: ["Convierta bytes a bits.", "$d_{\\text{trans}} = L/R$ y $d_{\\text{prop}} = d/s$."],
}}>

**1. Nombre del paso.** Una línea que diga QUÉ se hace y POR QUÉ.

$$d_{\text{trans}} = \frac{L}{R} = \frac{12{,}000\text{ bits}}{100 \times 10^6\text{ bps}} = 120\,\mu\text{s}$$

**2. …**

$$…= \boxed{13.825\text{ ms}}$$

**Comprobación:** tabla o una línea (orden de magnitud, qué retardo domina, etc.)

</ExerciseBlock>
```

## Reglas
- Un paso = una idea. Negrita numerada + 1 línea de explicación + ecuación en bloque `$$…$$`.
- Respuestas finales en `\boxed{…}` con unidades (ms, bps, bytes).
- Toda magnitud en KaTeX: `$d_{\text{prop}}$`, `$\text{EstimatedRTT}$`, `$cwnd$`. Nunca en texto plano.
- **Cálculos** (retardos, throughput, checksum, EstimatedRTT/TimeoutInterval, cwnd/ssthresh,
  utilización de stop-and-wait vs. pipelining): convertir unidades primero, luego fórmula,
  luego sustitución.
- **Checksum UDP:** sumar palabras de 16 bits en binario, mostrar el *wrap-around* y el
  complemento a 1 en pasos separados.
- **Conceptuales** (HTTP persistente vs. no persistente, DNS iterativo vs. recursivo, GBN vs.
  SR, P2P vs. cliente-servidor…): respuesta modelo en viñetas o tabla.
- **Traza de protocolo** (handshake TCP, intercambio DNS, GET condicional): tabla con
  columnas tiempo / emisor → receptor / mensaje / campos clave.
- El enunciado tampoco va en texto plano: KaTeX para símbolos y valores.
