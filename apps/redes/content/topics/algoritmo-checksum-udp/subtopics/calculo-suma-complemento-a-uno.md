---
kind: subtopic
title: "Aritmética de Complemento a Uno y Ejercicio Práctico Resuelto"
order: 1
---

## 1. Fundamentos Aritméticos del Complemento a Uno

En la representación numérica en complemento a uno para palabras de $b$ bits, el valor negativo de un número binario se obtiene invirtiendo todos sus bits ($0 \to 1$ y $1 \to 0$). Una propiedad crucial de este sistema algebraico es que el valor cero posee dos representaciones equivalentes:
- Cero positivo: $+0 = 0000\dots0000_2$
- Cero negativo: $-0 = 1111\dots1111_2$ (equivalente a $2^b - 1$)

Al realizar adiciones sucesivas, cualquier acarreo que sobrepase la capacidad de $b$ bits representa un desbordamiento modular que debe reintroducirse en la posición de menor peso mediante el mecanismo de **acarreo circular** (*end-around carry*):
$$\text{Resultado} = (A + B + \text{carry}_{\text{out}}) \pmod{2^b - 1}$$

---

## 2. Ejercicio Práctico Resuelto (Sem06_Excercises2-2: Pregunta 4)

### Enunciado
Considérense tres bytes de 8 bits:
$$B_1 = 0101\;0011_2 \quad (\text{0x53} = 83_{10})$$
$$B_2 = 0110\;0110_2 \quad (\text{0x66} = 102_{10})$$
$$B_3 = 0111\;0100_2 \quad (\text{0x74} = 116_{10})$$

Se solicita:
1. Calcular la suma en complemento a uno y determinar el checksum de 8 bits resultante.
2. Justificar por qué los protocolos de Internet calculan el complemento a uno de la suma en vez de transmitir la suma directa.
3. Explicar cómo detecta los errores el receptor bajo este esquema.
4. Evaluar si es posible que un error de 1 bit pase inadvertido.
5. Evaluar si es posible que un error de 2 bits pase inadvertido.

---

### Solución Paso a Paso

#### Paso 1: Suma de $B_1$ y $B_2$
$$\begin{array}{r@{\quad}l}
  & 0101\;0011_2 \\
+ & 0110\;0110_2 \\
\hline
  & 1011\;1001_2 \quad (\text{0xB9} = 185_{10})
\end{array}$$
No se genera acarreo saliente por el bit 8 ($\text{carry} = 0$). La suma parcial es $1011\;1001_2$.

#### Paso 2: Suma del resultado parcial con $B_3$
$$\begin{array}{r@{\quad}l}
  & 1011\;1001_2 \\
+ & 0111\;0100_2 \\
\hline
\mathbf{1} & 0010\;1101_2 \quad (\text{Suma binaria con desbordamiento})
\end{array}$$
Se genera un acarreo saliente de $1$ en la posición del bit 8.

#### Paso 3: Aplicación del acarreo circular (End-Around Carry)
Sumamos el bit de acarreo saliente al bit de menor significancia:
$$\begin{array}{r@{\quad}l}
  & 0010\;1101_2 \\
+ & 0000\;0001_2 \\
\hline
  & \mathbf{0010\;1110_2} \quad (\text{0x2E} = 46_{10})
\end{array}$$
La suma acumulada en complemento a uno es $0010\;1110_2$.

#### Paso 4: Obtención del Checksum (Inversión bit a bit)
Aplicando la operación de complemento a uno ($\sim$) sobre la suma:
$$\text{Checksum} = \sim(0010\;1110_2) = \mathbf{1101\;0001_2} \quad (\text{0xD1} = 209_{10})$$

---

### Análisis Teórico de las Preguntas Conceptuales

#### 1. ¿Por qué se toma el complemento a uno de la suma en lugar de usar la suma directa?
El emisor invierte la suma para **simplificar radicalmente la lógica de verificación en el receptor**. Si el emisor transmitiera la suma directa, el receptor tendría que sumar todos los datos recibidos, almacenar el resultado temporalmente en un registro y luego ejecutar una comparación explícita de igualdad contra el campo de checksum. Al transmitir el complemento a uno, el receptor simplemente suma todas las palabras recibidas **junto con el propio checksum**. Si la transmisión fue intacta, la adición directa de una cantidad con su inverso bit a bit produce una palabra donde todos los bits son 1 (`11111111` o `0xFFFF`), lo que permite validar la integridad mediante una única operación de prueba lógica a nivel de hardware o ensamblador.

#### 2. ¿Cómo detecta los errores el receptor?
El receptor suma todas las palabras entrantes (incluyendo el checksum). Si el resultado de la suma en complemento a uno es exactamente todos los bits en 1 (`0xFF` para 8 bits, o `0xFFFF` para 16 bits), la verificación es positiva y se concluye que no se detectaron errores. Si cualquier bit de la suma final es 0, se detecta corrupción y el paquete es descartado.

#### 3. ¿Puede un error de 1 bit pasar inadvertido?
**No, es matemáticamente imposible**. Si un único bit en cualquiera de los bytes o en el checksum se invierte (de $0 \to 1$ o de $1 \to 0$), la suma resultante variará inevitablemente en $\pm 2^j$ (o $\mp (2^b - 1 - 2^j)$ tras el acarreo). Dicha discrepancia alterará obligatoriamente el patrón de unos en la suma final, por lo que el receptor detectará el error con un $100\%$ de certeza.

#### 4. ¿Puede un error de 2 bits pasar inadvertido?
**Sí, es enteramente posible**. Si ocurren dos inversiones de bit simultáneas que se cancelen mutuamente en la aritmética modular, el error pasará completamente inadvertido. Por ejemplo:
- Si en una palabra el bit en la posición $j$ cambia de $0 \to 1$, sumando $+2^j$.
- Y en otra palabra diferente el bit en la misma posición de columna $j$ cambia de $1 \to 0$, restando $-2^j$.
- La suma modular final permanecerá **absolutamente idéntica**, y el receptor computará exitosamente `0xFFFF`, aceptando un paquete severamente corrupto como si fuera legítimo.
