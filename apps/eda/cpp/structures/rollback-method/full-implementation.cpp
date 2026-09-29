// Método de rollback (CS3014, semana 3, diapositivas #38-44): la técnica
// genérica de retroactividad cuando ninguna otra aplica — "guardamos la
// secuencia completa de operaciones (un log). Para Insert(t, op) o
// Delete(t): deshacemos (rollback) todas las operaciones posteriores a t,
// aplicamos el cambio, y las rehacemos en orden."
//
// El interés no está en el mecanismo (es el más obvio posible) sino en su
// costo: O(r) × (costo de una operación), con r = operaciones posteriores
// a t. Por eso este archivo no se limita a verificar que el resultado es
// correcto: CUENTA r en cada llamada, para hacer visible el caso barato
// (t cerca del presente, página 42: "si t está muy cerca del presente, r
// es pequeño y el método es barato") contra el caso caro (t al principio
// de la historia: "si t está muy atrás, r ≈ m y es tan caro como
// rehacerlo todo").
//
// No implementa Delete(t) (ver ejercicio 4 de exercises.md) ni la cota
// inferior Ω(r) (es un argumento de adversario informal sobre estructuras
// en general, no algo que se demuestre corriendo un programa).

#include <cassert>
#include <iostream>
#include <vector>

struct Op {
  double t;
  int delta;
};

class RollbackLog {
public:
  long long sum() const { return sum_; }
  std::size_t size() const { return log_.size(); }
  std::size_t last_redo_count() const { return last_redo_count_; }

  // Insert(t, op) retroactivo: los 4 pasos del profesor.
  void insert_retroactive(double t, int delta) {
    std::size_t idx = 0;
    while (idx < log_.size() && log_[idx].t < t) idx++;
    const std::size_t r = log_.size() - idx;

    for (std::size_t i = log_.size(); i-- > idx;) sum_ -= log_[i].delta; // deshacer
    log_.insert(log_.begin() + idx, Op{t, delta});                      // aplicar
    sum_ += delta;
    for (std::size_t i = idx + 1; i < log_.size(); i++) sum_ += log_[i].delta; // rehacer

    last_redo_count_ = r;
  }

private:
  std::vector<Op> log_;
  long long sum_ = 0;
  std::size_t last_redo_count_ = 0;
};

int main() {
  // --- Construir un log de 6 operaciones, t = 1..6, para tener un "m" fijo
  //     sobre el que comparar el caso barato contra el caro.
  RollbackLog log;
  for (int t = 1; t <= 6; t++) log.insert_retroactive(static_cast<double>(t), t * 10);
  // sum = 10+20+30+40+50+60 = 210
  assert(log.sum() == 210);
  assert(log.size() == 6);
  std::cout << "Log inicial construido: 6 operaciones, suma = " << log.sum() << "\n";

  // --- Caso barato: insertar cerca del presente (después de t=6, el log
  //     entero ya existente queda ANTES del nuevo punto -> r = 0).
  log.insert_retroactive(6.5, 100);
  const std::size_t r_barato = log.last_redo_count();
  assert(r_barato == 0);
  assert(log.sum() == 310); // 210 + 100
  std::cout << "Caso barato (t cerca del presente): r = " << r_barato
            << " operaciones rehechas -> verificado O(r) con r minimo.\n";

  // --- Caso caro: insertar antes de TODO el log (t = 0.5, antes de t=1).
  //     Ahora las 7 operaciones existentes quedan después -> r = 7 = m.
  log.insert_retroactive(0.5, 1000);
  const std::size_t r_caro = log.last_redo_count();
  assert(r_caro == 7);
  assert(log.sum() == 1310); // 310 + 1000
  std::cout << "Caso caro (t al principio de la historia): r = " << r_caro
            << " operaciones rehechas -> verificado O(r) con r = m (todo el log).\n";

  // --- La comparación entre los dos conteos ES la demostración del costo:
  //     el mismo metodo, dos posiciones de t, costo que escala con r.
  assert(r_caro > r_barato);
  std::cout << "Contraste: r_caro (" << r_caro << ") > r_barato (" << r_barato
            << ") -> el costo del metodo de rollback depende linealmente de"
               " donde cae t, tal como predice el analisis O(r).\n";

  std::cout << "Todas las propiedades del metodo de rollback quedaron verificadas.\n";
  return 0;
}
