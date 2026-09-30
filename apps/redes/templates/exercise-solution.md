# Cómo se escribe una solución de ejercicio

Referencia viva: `content/topics/basic-circuits/subtopics/ley-ohm-potencia.mdx` § "Pregunta tipo examen".

## Forma
- La solución NO va en `exercise.solution` (string plano, una línea, ilegible). Va como
  HIJOS del componente, en MDX completo. Se oculta hasta que se piden todas las pistas:

```mdx
<Visualization viz={{ type: 'circuit', static: true, steps: [ /* circuito del enunciado, sin respuestas */ ] }} />

<ExerciseBlock client:visible exercise={{
  level: 2,
  statement: "En el circuito de la figura ($E = 12$ V, …) calcula …",
  hints: ["…con $KaTeX$…", "…"],
}}>

**1. Nombre del paso.** Una línea que diga QUÉ se hace y POR QUÉ.

$$R_{B\parallel C} = \frac{R_B R_C}{R_B + R_C} = \frac{6 \cdot 3}{6+3} = 2\,\Omega$$

**2. …**

$$…= \boxed{6\,\text{W}}$$

<Visualization viz={{ … el circuito RESUELTO: currents/voltages con showValue, expect … }} />

**Comprobación:** tabla o una línea (balance de potencia, validar hipótesis del diodo, etc.)

</ExerciseBlock>
```

## Reglas
- Un paso = una idea. Negrita numerada + 1 línea de explicación + ecuación en bloque `$$…$$`.
- Respuestas finales en `\boxed{…}` con unidades.
- Toda magnitud en KaTeX: `$I_A$`, `$R_{eq}$`, `$V_{AK}$`. Nunca `R_eq` suelto ni `x`/`·` en texto plano.
- **Circuitos:** figura del enunciado ANTES del bloque (estática, sin valores) y figura resuelta
  dentro de la solución (corrientes/tensiones con `showValue`, `expect` con todos los valores
  pedidos). Si ya hay una animación del mismo circuito en la página, reusar sus nodos/piezas.
- **Diodos:** mostrar hipótesis → resolver → validar (con las desigualdades) → conclusión, y en la
  figura resuelta `diodes: [{part, assume}]` con la hipótesis correcta.
- **Conceptuales** (MQTT, edge, tecnologías…): respuesta modelo en viñetas o tabla, y un
  diagrama (sequence/flow/dag/xy-chart) cuando aclare (p. ej. el handshake de QoS 2).
- El enunciado tampoco va en texto plano: KaTeX para símbolos y valores.
- Validar: `node scripts/validate-viz.mjs <archivo>` y `pnpm verify` (0 discrepancias).
