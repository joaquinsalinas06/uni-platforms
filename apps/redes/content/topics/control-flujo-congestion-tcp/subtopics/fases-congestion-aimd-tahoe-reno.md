---
kind: subtopic
title: "Fases del Control de Congestión, Algoritmo AIMD y Comparativa Tahoe vs. Reno"
order: 2
---

## 1. Las Fases Algorítmicas del Control de Congestión en TCP

El control de congestión moderno en TCP coordina la evolución dinámica de la ventana de congestión ($\text{cwnd}$) a través de un autómata de estados compuesto por tres fases fundamentales: **Arranque Lento** (*Slow Start*), **Prevención de Congestión** (*Congestion Avoidance*) y **Recuperación Rápida** (*Fast Recovery*).

### 1.1 Arranque Lento (Slow Start)
- **Objetivo**: Descubrir rápidamente la capacidad de la red mediante una ráfaga exponencial de paquetes.
- **Regla de Actualización por ACK**:
  $$\text{cwnd} \leftarrow \text{cwnd} + 1\text{ MSS}$$
- **Dinámica por RTT**: Si la ventana actual es de $W$ segmentos, se reciben $W$ acuses de recibo en un RTT, duplicando la ventana:
  $$\text{cwnd}_{t + \text{RTT}} = 2 \cdot \text{cwnd}_t$$
- **Condición de Salida**: Continúa duplicándose hasta que ocurre un evento de pérdida o hasta que $\text{cwnd} \ge \text{ssthresh}$. En ese instante, la máquina de estados conmuta inmediatamente a *Congestion Avoidance*.

### 1.2 Prevención de Congestión (Congestion Avoidance)
- **Objetivo**: Explorar el margen de capacidad disponible de forma prudente y lineal, evitando inducir congestión abrupta en los enrutadores.
- **Regla de Actualización por ACK**:
  $$\text{cwnd} \leftarrow \text{cwnd} + \text{MSS} \cdot \left(\frac{\text{MSS}}{\text{cwnd}}\right)$$
- **Dinámica por RTT**: La suma de los incrementos fraccionarios a lo largo de un RTT completo produce un crecimiento neto unitario:
  $$\text{cwnd}_{t + \text{RTT}} = \text{cwnd}_t + 1\text{ MSS}$$
- Esta progresión lineal se mantiene indefinidamente hasta que se detecte una pérdida de paquetes.

---

## 2. El Principio AIMD y la Convergencia hacia la Equidad (Fairness)

¿Por qué TCP adopta Incremento Aditivo y Decremento Multiplicativo (AIMD) en lugar de otras combinaciones como AIAD (Incremento Aditivo, Decremento Aditivo) o MIMD (Incremento Multiplicativo, Decremento Multiplicativo)?

Considérense dos conexiones TCP independientes (Flujo 1 y Flujo 2) que comparten un enlace de transmisión de capacidad total $C$:
- Si se grafica el espacio de estados bidimensional $(x_1, x_2)$, la línea de máxima utilización del enlace es la recta $x_1 + x_2 = C$. La línea de justicia distributiva perfecta (*fairness line*) es la bisectriz $x_1 = x_2$. El punto óptimo del sistema es la intersección de ambas rectas: $(\frac{C}{2}, \frac{C}{2})$.
- **Efecto del Incremento Aditivo**: Ambos flujos añaden $1\text{ MSS}$ por RTT. En el plano cartesiano, el vector de incremento tiene pendiente $+1$ (ángulo de $45^\circ$), avanzando paralelamente a la línea de equidad.
- **Efecto del Decremento Multiplicativo**: Cuando la suma excede la capacidad ($x_1 + x_2 > C$), ambos flujos reducen su tasa dividiéndola entre un factor multiplicativo (e.g., $1/2$). El vector de reducción apunta directamente hacia el origen de coordenadas $(0, 0)$.
- **Convergencia**: En cada ciclo de adición y multiplicación sucesiva, la trayectoria del sistema traza una trayectoria oscilatoria en zigzag que se aproxima inexorablemente hacia la línea de equidad $x_1 = x_2$.
- Si se usara AIAD, las trayectorias oscilarían en una línea fija de $45^\circ$ sin converger jamás a la justicia si las condiciones iniciales eran asimétricas. Si se usara MIMD, el sistema sería inestable y favorecería desproporcionadamente al flujo que ya tenía la ventana mayor. Por lo tanto, **AIMD es una condición necesaria y suficiente para garantizar convergencia estable hacia la equidad y eficiencia**.

---

## 3. Comparativa Exhaustiva: TCP Tahoe frente a TCP Reno

### 3.1 Reglas de Transición de Estados

| Evento | TCP Tahoe (1988) | TCP Reno (1990) |
| :--- | :--- | :--- |
| **Pérdida por Timeout** | $\text{ssthresh} = \max(\frac{\text{cwnd}}{2}, 2)$<br>$\text{cwnd} = 1\text{ MSS}$<br>Entra a **Slow Start** | $\text{ssthresh} = \max(\frac{\text{cwnd}}{2}, 2)$<br>$\text{cwnd} = 1\text{ MSS}$<br>Entra a **Slow Start** |
| **Pérdida por 3 DupACKs** | $\text{ssthresh} = \max(\frac{\text{cwnd}}{2}, 2)$<br>$\text{cwnd} = 1\text{ MSS}$<br>Entra a **Slow Start** | $\text{ssthresh} = \max(\frac{\text{cwnd}}{2}, 2)$<br>$\text{cwnd} = \text{ssthresh} + 3\text{ MSS}$<br>Entra a **Fast Recovery** |
| **DupACK adicional en Fast Recovery** | N/A (Tahoe no tiene Fast Recovery) | $\text{cwnd} = \text{cwnd} + 1\text{ MSS}$<br>Transmite nuevo segmento si es posible |
| **Llegada de ACK Nuevo** | Crecimiento exponencial o lineal según $\text{cwnd} \ge \text{ssthresh}$ | Fija $\text{cwnd} = \text{ssthresh}$<br>Entra directo a **Congestion Avoidance** |

---

## 4. Traza Numérica Comparativa: Evolución RTT por RTT

Considérese una conexión TCP donde inicialmente $\text{cwnd} = 1\text{ MSS}$ y el umbral se encuentra fijado en $\text{ssthresh} = 8\text{ MSS}$. Se asume que:
1. En el **RTT 8**, se produce la pérdida de un paquete detectada mediante **3 ACKs duplicados**.
2. En el **RTT 12**, se produce una congestión severa que provoca una pérdida detectada mediante **Timeout**.

A continuación se presenta la evolución exacta de la ventana de congestión ($\text{cwnd}$) para TCP Tahoe y TCP Reno:

| RTT | Tahoe cwnd | Tahoe Estado | Reno cwnd | Reno Estado | ssthresh (Reno) | Notas y Transiciones |
| :---: | :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | 1 | Slow Start | 1 | Slow Start | 8 | Inicio de conexión |
| 2 | 2 | Slow Start | 2 | Slow Start | 8 | Se duplica cwnd |
| 3 | 4 | Slow Start | 4 | Slow Start | 8 | Se duplica cwnd |
| 4 | 8 | Congestion Avoid. | 8 | Congestion Avoid. | 8 | $\text{cwnd} = \text{ssthresh} \to$ conmuta a CA |
| 5 | 9 | Congestion Avoid. | 9 | Congestion Avoid. | 8 | Incremento lineal (+1 MSS) |
| 6 | 10 | Congestion Avoid. | 10 | Congestion Avoid. | 8 | Incremento lineal (+1 MSS) |
| 7 | 11 | Congestion Avoid. | 11 | Congestion Avoid. | 8 | Incremento lineal (+1 MSS) |
| 8 | 12 | **Pérdida (3 DupACKs)** | 12 | **Pérdida (3 DupACKs)** | 8 | Ventana alcanza 12 MSS |
| 9 | 1 | Slow Start ($\text{ssthresh}=6$) | 6 | Congestion Avoid. | 6 | **Divergencia**: Tahoe reinicia a 1; Reno entra a CA con 6 |
| 10 | 2 | Slow Start | 7 | Congestion Avoid. | 6 | Reno incrementa linealmente; Tahoe duplica |
| 11 | 4 | Slow Start | 8 | Congestion Avoid. | 6 | Tahoe duplica |
| 12 | 6 | Congestion Avoid. | 9 | **Pérdida (Timeout)** | 6 | Tahoe entra a CA; Reno sufre Timeout |
| 13 | 1 | Slow Start ($\text{ssthresh}=3$) | 1 | Slow Start | 4 | Ambos colapsan a 1 MSS ante Timeout |
| 14 | 2 | Slow Start | 2 | Slow Start | 4 | Ambos en Slow Start duplicando |
| 15 | 3 | Congestion Avoid. | 4 | Congestion Avoid. | 4 | Cruce de ssthresh respectivos |

### Análisis de la Traza:
- En el **RTT 9**, tras la pérdida por triple ACK duplicado:
  - **Tahoe** castiga la conexión fijando $\text{ssthresh} = 12/2 = 6\text{ MSS}$ y regresando a $\text{cwnd} = 1\text{ MSS}$. Pierde 3 RTTs completos para volver a alcanzar una ventana moderada.
  - **Reno** reconoce que 3 paquetes salieron con éxito de la red (generando los 3 DupACKs), ajusta $\text{ssthresh} = 6\text{ MSS}$ y reanuda inmediatamente la transmisión lineal desde $\text{cwnd} = 6\text{ MSS}$, logrando un volumen acumulado de datos transferidos drásticamente mayor.
- En el **RTT 12**, cuando ocurre el **Timeout**, ambos protocolos actúan con idéntica prudencia: colapsan la ventana a $\text{cwnd} = 1\text{ MSS}$, demostrando que el timeout se considera una señal de congestión crítica que obliga a vaciar y reiniciar la tubería.
