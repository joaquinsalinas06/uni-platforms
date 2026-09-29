// Paso 2: una versión CORRECTA pero ciega al costo — inserta la operación
// en su lugar y recalcula el contador recorriendo el log completo desde
// cero. Sirve para fijar qué resultado es "correcto" antes de optimizar
// al mecanismo de deshacer/rehacer del profesor (paso 3), que es el que sí
// expone el costo O(r).

#include <vector>

struct Op {
  double t;
  int delta;
};

class RollbackLog {
public:
  long long sum() const { return sum_; }
  std::size_t size() const { return log_.size(); }

  // Inserta op en su posición temporal y recalcula todo el contador.
  // Correcto, pero no dice nada sobre r: recorre siempre las m operaciones.
  void insert_naive(double t, int delta) {
    std::size_t idx = 0;
    while (idx < log_.size() && log_[idx].t < t) idx++;
    log_.insert(log_.begin() + idx, Op{t, delta});

    sum_ = 0;
    for (const Op& o : log_) sum_ += o.delta;
  }

private:
  std::vector<Op> log_;
  long long sum_ = 0;
};
