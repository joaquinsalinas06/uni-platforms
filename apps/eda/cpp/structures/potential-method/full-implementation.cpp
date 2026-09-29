// El método del potencial — instrumentado sobre un contador binario.
//
// Por qué un contador binario y no el montículo de Fibonacci:
//   - El montículo de Fibonacci (Insert/Union/Decrease-Key/Extract-Min) es la
//     aplicación que trae el mazo (páginas 34-42), pero su implementación en
//     C++ es responsabilidad de otro agente (cpp/structures/fibonacci-heap/).
//     Duplicarla aquí sería invadir ese alcance.
//   - El contador binario SÍ aparece en el curso (semana 1, Insert del
//     montículo binomial), pero ahí el profesor usa análisis AGREGADO, no
//     potencial (documentado en el análisis de la semana: "el análisis
//     agregado del contador binario ... no usa potencial"). Aplicarle el
//     método del potencial aquí es una ilustración INDEPENDIENTE de la
//     técnica -- no una afirmación de que el profesor lo hizo así -- elegida
//     porque es el ejemplo clásico más simple donde Φ, ΔΦ y ĉ se pueden
//     calcular y verificar exactamente en código.
//
// Definición que se instrumenta (idéntica en forma a la del mazo,
// Φ(H) = t(H) + 2·m(H), pero aplicada aquí a un contador):
//
//   Φ(estado) = número de bits en 1                      (el "potencial")
//   ĉᵢ        = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)                      (costo amortizado)
//
// Condición de validez del mazo (página 32): "si Φ nunca cae por debajo de
// su valor inicial, la suma de costos amortizados acota por arriba la suma
// de costos reales". Aquí Φ(D₀) = 0 (contador en cero) y Φ ≥ 0 siempre (es
// un conteo), así que la condición se cumple trivialmente y por lo tanto el
// invariante Σĉᵢ ≥ Σcᵢ debe sostenerse en todo momento — eso es justo lo que
// los asserts de main() verifican en cada paso, no sólo al final.

#include <cassert>
#include <cstdint>
#include <iostream>
#include <vector>

class BinaryCounter {
public:
  explicit BinaryCounter(int num_bits) : bits_(num_bits, false) {}

  // Costo real de un Increment: 1 por cada bit que se voltea (los k bits en
  // 1 que se vuelven 0, más el bit en 0 que se vuelve 1 — o, en el caso
  // límite de overflow, sólo los k bits que se apagan).
  int increment_real_cost() {
    int flips = 0;
    std::size_t i = 0;
    // Apaga todos los 1s consecutivos desde el bit menos significativo.
    while (i < bits_.size() && bits_[i]) {
      bits_[i] = false;
      ++flips;
      ++i;
    }
    if (i < bits_.size()) {
      bits_[i] = true; // enciende el primer 0 que encuentra
      ++flips;
    }
    // Si i == bits_.size(), es overflow: todos los bits estaban en 1 y
    // todos se apagaron (caso límite, el contador "vuelve a cero").
    return flips;
  }

  int potential() const {
    int ones = 0;
    for (bool b : bits_) ones += b ? 1 : 0;
    return ones;
  }

  std::size_t capacity() const { return bits_.size(); }

private:
  std::vector<bool> bits_;
};

int main() {
  const int kBits = 8; // contador de 8 bits: cuenta 0..255 antes de overflow
  BinaryCounter counter(kBits);

  long long total_real = 0;
  long long total_amortized = 0;
  const int phi_initial = counter.potential(); // Φ(D₀) = 0

  // Caso normal: 300 increments consecutivos (incluye al menos un overflow
  // de 8 bits, 255 -> 0, que es el caso donde el costo real es máximo: los
  // 8 bits se apagan de golpe).
  for (int op = 1; op <= 300; ++op) {
    int phi_before = counter.potential();
    int c = counter.increment_real_cost();
    int phi_after = counter.potential();
    int delta_phi = phi_after - phi_before;
    int c_hat = c + delta_phi;

    // La condición de validez (Φ nunca cae bajo su valor inicial) implica
    // que Φ nunca es negativo aquí (Φ(D₀) = 0 y Φ es un conteo, así que ya
    // es ≥ 0 siempre) -- se verifica de todas formas, en cada paso.
    assert(phi_after >= phi_initial);

    // El resultado central del método: el costo amortizado de Increment es
    // O(1) -- acotado por 2, sin importar cuántos bits se apaguen en
    // cascada. Es el mismo fenómeno que Decrease-Key en Fibonacci: un costo
    // real que puede crecer (aquí hasta kBits) queda acotado por una
    // constante una vez que se descuenta ΔΦ. Vale exactamente 2 cuando el
    // contador no desborda (el caso de un contador sin límite de bits); en
    // el caso límite de overflow de este contador acotado, todos los bits
    // se apagan y ninguno se enciende, así que ΔΦ es más negativo todavía y
    // ĉ queda por DEBAJO de 2 (nunca por encima: la cota sigue siendo O(1)).
    assert(c_hat <= 2);

    total_real += c;
    total_amortized += c_hat;

    // Invariante que debe sostenerse en TODO momento, no sólo al final: la
    // suma amortizada nunca puede subestimar la suma real acumulada. Si esto
    // fallara, el Φ elegido no cumpliría la condición de validez.
    assert(total_amortized >= total_real);
  }

  std::cout << "300 increments: costo real acumulado = " << total_real
            << ", costo amortizado acumulado = " << total_amortized << "\n";
  assert(total_amortized >= total_real);

  // Caso límite explícito: un contador ya lleno de 1s (el peor caso real de
  // una sola operación: cuesta kBits, no O(1)). Aquí el contador desborda
  // (los 4 bits se apagan y ninguno se enciende porque no hay un quinto
  // bit), así que ΔΦ = 0 − 4 = −4 y ĉ = 4 − 4 = 0: el costo amortizado
  // queda incluso POR DEBAJO de la cota de 2 que rige el caso sin overflow
  // -- la cota O(1) se sigue cumpliendo, sólo que no es ajustada en el
  // borde exacto del contador acotado.
  {
    BinaryCounter full(4);
    for (int i = 0; i < 15; ++i) full.increment_real_cost(); // 0b1111
    assert(full.potential() == 4);
    int phi_before = full.potential();
    int c = full.increment_real_cost(); // overflow: apaga 4 bits, cuesta 4
    int phi_after = full.potential();
    int c_hat = c + (phi_after - phi_before);
    assert(c == 4);      // costo real del peor caso individual
    assert(c_hat == 0);  // el amortizado absorbe todo el pico y sobra
    assert(c_hat <= 2);  // en particular, nunca por encima de la cota O(1)
    std::cout << "overflow de 4 bits: costo real = " << c
              << ", costo amortizado = " << c_hat << "\n";
  }

  std::cout << "OK: el costo amortizado nunca subestimo el costo real.\n";
  return 0;
}
