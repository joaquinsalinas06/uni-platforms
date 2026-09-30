---
kind: subtopic
title: "Cálculo EWMA: EstimatedRTT, DevRTT y TimeoutInterval"
order: 1
---

## 1. Formulación Matemática de los Filtros EWMA

El filtro de Media Móvil Ponderada Exponencial (*Exponentially Weighted Moving Average*, EWMA) es un algoritmo de estimación en tiempo discreto que combina de manera adaptativa la estimación previa de una variable con la medición empírica más reciente.

### 1.1 Ecuación de EstimatedRTT

La estimación del retardo promedio de ida y vuelta se computa mediante la relación de recurrencia:

$$\text{EstimatedRTT}_k = (1 - \alpha) \cdot \text{EstimatedRTT}_{k-1} + \alpha \cdot \text{SampleRTT}_k$$

Expandiendo analíticamente la recurrencia para $k$ muestras sucesivas:

$$\text{EstimatedRTT}_k = \alpha \cdot \text{SampleRTT}_k + (1 - \alpha)\alpha \cdot \text{SampleRTT}_{k-1} + (1 - \alpha)^2\alpha \cdot \text{SampleRTT}_{k-2} + \dots + (1 - \alpha)^k \cdot \text{EstimatedRTT}_0$$

Dado que $(1 - \alpha) < 1$, los coeficientes asociados a muestras más antiguas decaen exponencialmente hacia cero. En la práctica estandarizada (RFC 6298):
- $\alpha = 0.125 = \frac{1}{8}$.
- Las operaciones se pueden implementar mediante desplazamientos de bits eficientes en hardware o en el kernel sin recurrir a divisiones en coma flotante:
  $$\text{EstimatedRTT} \leftarrow \text{EstimatedRTT} - (\text{EstimatedRTT} \gg 3) + (\text{SampleRTT} \gg 3)$$

### 1.2 Ecuación de DevRTT

Para calcular el margen de seguridad dinámico, se estima la dispersión media absoluta de los retardos muestrales:

$$\text{DevRTT}_k = (1 - \beta) \cdot \text{DevRTT}_{k-1} + \beta \cdot |\text{SampleRTT}_k - \text{EstimatedRTT}_k|$$

- El estándar adopta $\beta = 0.25 = \frac{1}{4}$.
- Al igual que con $\alpha$, la actualización se computa eficientemente con desplazamientos de 2 bits:
  $$\text{DevRTT} \leftarrow \text{DevRTT} - (\text{DevRTT} \gg 2) + (|\text{SampleRTT} - \text{EstimatedRTT}| \gg 2)$$

### 1.3 Intervalo de Timeout y la Regla del Multiplicador Cuádruple

El intervalo de temporización final asignado al reloj de retransmisión es:

$$\text{TimeoutInterval} = \text{EstimatedRTT} + 4 \cdot \text{DevRTT}$$

El multiplicador $4$ deriva de la desigualdad de Chebyshev y de aproximaciones empíricas para distribuciones de retardo con colas pesadas (*heavy-tailed distributions*), asegurando que las expiraciones prematuras ocurran en menos del $1\%$ de los casos normales.

---

## 2. Ejercicio Numérico Paso a Paso

Supóngase una conexión TCP en la que se han fijado los siguientes valores base tras la primera medición de arranque:
- $\text{EstimatedRTT}_0 = 100\text{ ms}$
- $\text{DevRTT}_0 = 5\text{ ms}$
- Parámetros estándar: $\alpha = 0.125$, $\beta = 0.25$.

A continuación, la conexión experimenta sucesivamente tres mediciones de `SampleRTT`:
1. Muestra 1: $\text{SampleRTT}_1 = 106\text{ ms}$
2. Muestra 2: $\text{SampleRTT}_2 = 120\text{ ms}$
3. Muestra 3: $\text{SampleRTT}_3 = 140\text{ ms}$

### Paso 1: Procesamiento de la Muestra 1 ($\text{SampleRTT}_1 = 106\text{ ms}$)

1. **Actualización de EstimatedRTT**:
   $$\text{EstimatedRTT}_1 = (1 - 0.125) \cdot 100 + 0.125 \cdot 106 = 0.875 \cdot 100 + 13.25 = 87.5 + 13.25 = 100.75\text{ ms}$$

2. **Diferencia Absoluta**:
   $$|\text{SampleRTT}_1 - \text{EstimatedRTT}_1| = |106 - 100.75| = 5.25\text{ ms}$$

3. **Actualización de DevRTT**:
   $$\text{DevRTT}_1 = (1 - 0.25) \cdot 5 + 0.25 \cdot 5.25 = 3.75 + 1.3125 = 5.0625\text{ ms}$$

4. **Cálculo de TimeoutInterval**:
   $$\text{TimeoutInterval}_1 = 100.75 + 4 \cdot (5.0625) = 100.75 + 20.25 = 121.0\text{ ms}$$

### Paso 2: Procesamiento de la Muestra 2 ($\text{SampleRTT}_2 = 120\text{ ms}$)

1. **Actualización de EstimatedRTT**:
   $$\text{EstimatedRTT}_2 = (0.875) \cdot 100.75 + (0.125) \cdot 120 = 88.15625 + 15 = 103.15625\text{ ms}$$

2. **Diferencia Absoluta**:
   $$|\text{SampleRTT}_2 - \text{EstimatedRTT}_2| = |120 - 103.15625| = 16.84375\text{ ms}$$

3. **Actualización de DevRTT**:
   $$\text{DevRTT}_2 = (0.75) \cdot 5.0625 + (0.25) \cdot 16.84375 = 3.796875 + 4.2109375 = 8.0078125\text{ ms}$$

4. **Cálculo de TimeoutInterval**:
   $$\text{TimeoutInterval}_2 = 103.15625 + 4 \cdot (8.0078125) = 103.15625 + 32.03125 = 135.1875\text{ ms}$$

### Paso 3: Procesamiento de la Muestra 3 ($\text{SampleRTT}_3 = 140\text{ ms}$)

1. **Actualización de EstimatedRTT**:
   $$\text{EstimatedRTT}_3 = (0.875) \cdot 103.15625 + (0.125) \cdot 140 = 90.2617 + 17.5 = 107.7617\text{ ms}$$

2. **Diferencia Absoluta**:
   $$|\text{SampleRTT}_3 - \text{EstimatedRTT}_3| = |140 - 107.7617| = 32.2383\text{ ms}$$

3. **Actualización de DevRTT**:
   $$\text{DevRTT}_3 = (0.75) \cdot 8.0078 + (0.25) \cdot 32.2383 = 6.0059 + 8.0596 = 14.0655\text{ ms}$$

4. **Cálculo de TimeoutInterval**:
   $$\text{TimeoutInterval}_3 = 107.7617 + 4 \cdot (14.0655) = 107.7617 + 56.262 = 164.0237\text{ ms}$$

Nótese cómo el aumento de variabilidad en las muestras eleva significativamente `DevRTT`, expandiendo el margen de protección de `TimeoutInterval` para anticiparse a retrasos mayores en la red.

---

## 3. Respaldo Exponencial del Temporizador (Exponential Timer Backoff)

¿Qué sucede cuando un temporizador expira y el segmento retransmitido vuelve a perderse?

Si un temporizador expira, el evento suele ser síntoma inequívoco de congestión severa en la red. Si el emisor continuara retransmitiendo utilizando el mismo valor de timeout, saturaría aún más los buffers de los enrutadores colapsados.

Para prevenir este fenómeno, TCP aplica **Exponential Timer Backoff**:
- Cada vez que expira el temporizador de retransmisión para un segmento dado, TCP **duplica el valor de TimeoutInterval**:
  $$\text{TimeoutInterval}_{\text{nuevo}} = 2 \cdot \text{TimeoutInterval}_{\text{anterior}}$$
- Esta duplicación progresiva ($2\times, 4\times, 8\times, \dots, 64\times$) continúa hasta que un segmento transmitido se confirme exitosamente.
- Tan pronto como arriba un ACK correspondiente a un segmento no retransmitido (conforme a la Regla de Karn), TCP recalcula de inmediato `EstimatedRTT` y restaura el `TimeoutInterval` a su valor derivado mediante la fórmula EWMA estándar.
