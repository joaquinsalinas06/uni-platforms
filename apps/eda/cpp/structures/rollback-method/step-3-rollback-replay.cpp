// Paso 3: el método del profesor de verdad — deshacer todas las
// operaciones posteriores a t, aplicar el cambio, rehacerlas en orden —
// en vez del recálculo ciego del paso 2. Instrumentado para CONTAR cuántas
// operaciones se rehicieron (r): es lo que hace observable el costo O(r).

#include <vector>

struct Op {
  double t;
  int delta;
};

class RollbackLog {
public:
  long long sum() const { return sum_; }
  std::size_t size() const { return log_.size(); }

  // r de la última llamada a insert_retroactive: cuántas operaciones se
  // deshicieron y volvieron a rehacer. Es la cifra que el análisis de
  // amortized-cost predice como O(r).
  std::size_t last_redo_count() const { return last_redo_count_; }

  // Insert(t, op) retroactivo, exactamente los 4 pasos del profesor:
  // 1. localizar el punto de inserción en el log (ya lo tenemos guardado).
  // 2. deshacer (rollback) las operaciones posteriores a t.
  // 3. aplicar el cambio.
  // 4. rehacerlas (replay) en orden.
  void insert_retroactive(double t, int delta) {
    std::size_t idx = 0;
    while (idx < log_.size() && log_[idx].t < t) idx++;
    const std::size_t r = log_.size() - idx; // operaciones posteriores a t

    // 2. Deshacer, en orden inverso: cada Op es su propia inversa con -delta.
    for (std::size_t i = log_.size(); i-- > idx;) sum_ -= log_[i].delta;

    // 3. Aplicar el cambio: insertar la operación nueva en su lugar.
    log_.insert(log_.begin() + idx, Op{t, delta});
    sum_ += delta;

    // 4. Rehacer, en orden, las r operaciones que se habían deshecho.
    for (std::size_t i = idx + 1; i < log_.size(); i++) sum_ += log_[i].delta;

    last_redo_count_ = r;
  }

private:
  std::vector<Op> log_;
  long long sum_ = 0;
  std::size_t last_redo_count_ = 0;
};
