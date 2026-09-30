---
kind: subtopic
title: "Análisis Comparativo de Escalabilidad Asintótica"
order: 2
---

## 1. El Concepto de Autoescalabilidad (Self-Scalability)

La propiedad matemática más trascendental de las redes P2P es la **autoescalabilidad**. En los sistemas informáticos distribuidos ordinarios, la demanda y la capacidad de cómputo están disociadas: añadir más usuarios incrementa la demanda sin añadir capacidad de servicio al servidor. En P2P, cada usuario que genera demanda aporta simultáneamente capacidad de cómputo, almacenamiento y ancho de banda al enjambre.

## 2. Demostración del Límite Asintótico para Pares Homogéneos

Consideremos un escenario donde todos los peers participantes disponen de una tasa de subida media idéntica $u_i = u$, y donde la capacidad de descarga de los clientes es suficientemente amplia ($d_{\min} \ge u_s$):

### Comportamiento del Modelo Cliente-Servidor:
$$D_{\text{cs}} = \frac{N \cdot F}{u_s}$$
Calculando la derivada respecto a $N$:
$$\frac{d D_{\text{cs}}}{d N} = \frac{F}{u_s} > 0$$
El tiempo de distribución aumenta de manera estrictamente monótona y lineal con respecto al tamaño de la población. En notación de complejidad asintótica:
$$D_{\text{cs}} \in \Theta(N)$$

### Comportamiento del Modelo Peer-to-Peer:
Examinemos el término dominante de la cota $D_{\text{P2P}}$ con $u_i = u$:
$$g(N) = \frac{N \cdot F}{u_s + N \cdot u}$$
Dividiendo numerador y denominador entre $N$:
$$g(N) = \frac{F}{\frac{u_s}{N} + u}$$
Evaluando el límite cuando $N \to \infty$:
$$\lim_{N \to \infty} g(N) = \lim_{N \to \infty} \frac{F}{\frac{u_s}{N} + u} = \frac{F}{u}$$
Dado que los términos restantes en el operador máximo ($\frac{F}{u_s}$ y $\frac{F}{d_{\min}}$) son constantes independientes de $N$:
$$\lim_{N \to \infty} D_{\text{P2P}} = \max \left\{ \frac{F}{u_s}, \frac{F}{d_{\min}}, \frac{F}{u} \right\} \in \mathcal{O}(1)$$

Este resultado prueba que, incluso si $N$ crece hacia decenas de miles o millones de nodos, el tiempo de finalización no diverge hacia el infinito, sino que converge a una asíntota horizontal dictada por la tasa de subida individual $u$.

## 3. Análisis de Sensibilidad y Heterogeneidad

En redes del mundo real, los clientes no son perfectamente homogéneos:
- **Pares Asimétricos**: Conexiones residenciales típicas (como cable módem o ADSL/VDSL) presentan asimetría pronunciada, donde $d_i \gg u_i$. No obstante, la agregación masiva de capacidades de subida modestas ($u_i$) sigue superando con creces la capacidad finita de cualquier enlace centralizado de servidor.
- **Pares Ociosos vs Activos (Free-Riders)**: En ausencia de incentivos algorítmicos, algunos usuarios podrían apagar la subida para ahorrar ancho de banda. Si una fracción $\alpha$ de los pares no sube datos ($u = 0$), el límite converge a $\frac{F}{(1-\alpha)u}$, incrementando el retardo pero preservando la cota $\mathcal{O}(1)$.
- **Conclusión de Ingeniería**: La arquitectura P2P es la opción óptima para la distribución masiva de contenidos inmutables de gran tamaño (imágenes ISO de sistemas operativos, parches masivos de videojuegos, transmisiones multimedia en vivo), reduciendo la inversión requerida en centros de datos a una fracción insignificante.
