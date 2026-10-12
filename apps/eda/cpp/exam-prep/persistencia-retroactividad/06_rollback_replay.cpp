// Metodo de Rollback y Replay (Retroactividad Generica)
// Complejidad: O(r) * (costo_op), donde r es el numero de operaciones posteriores al tiempo t.
// Barato si t esta cerca del presente (r ~ 0). Caro si t esta al inicio del log (r ~ m).

#include <iostream>
#include <vector>

using namespace std;

struct Op {
  double t;   // Marca de tiempo de la operacion
  int delta;  // Cambio aplicado al valor (ej. +x o -x)
};

class RollbackLog {
 public:
  long long currentSum() const { return sum_; }
  size_t size() const { return log_.size(); }
  size_t lastRedoCount() const { return last_redo_; }

  // INSERCION RETROACTIVA EN TIEMPO t:
  // Aplica los 3 pasos fundamentales de Rollback & Replay:
  void insertRetroactive(double t, int delta) {
    // 1. Encontrar la posicion cronologica en el log
    size_t idx = 0;
    while (idx < log_.size() && log_[idx].t < t) {
      idx++;
    }
    size_t r = log_.size() - idx;  // r = operaciones que quedaron despues de t

    // 2. PASO ROLLBACK (Deshacer):
    // Deshacemos de adelante hacia atras las r operaciones posteriores a t
    for (size_t i = log_.size(); i-- > idx;) {
      sum_ -= log_[i].delta;
    }

    // 3. APLICAR: Insertamos la nueva operacion en el tiempo t
    log_.insert(log_.begin() + idx, {t, delta});
    sum_ += delta;

    // 4. PASO REPLAY (Re-reproducir / Rehacer):
    // Re-ejecutamos en orden cronologico hacia adelante las r operaciones
    for (size_t i = idx + 1; i < log_.size(); i++) {
      sum_ += log_[i].delta;
    }

    last_redo_ = r;  // Registramos cuantas operaciones hubo que rehacer
  }

 private:
  vector<Op> log_;
  long long sum_ = 0;
  size_t last_redo_ = 0;
};

int main() {
  RollbackLog timeline;

  // Llenamos la historia con 5 operaciones en t = 1..5 (+10 cada una)
  for (int t = 1; t <= 5; ++t) {
    timeline.insertRetroactive(t, 10);
  }
  cout << "Suma presente inicial: " << timeline.currentSum() << " (esperado: 50)\n";

  // CASO BARATO: Insertamos en t = 4.5 (cerca del presente)
  // Solo la operacion en t=5 es posterior -> r = 1
  timeline.insertRetroactive(4.5, 100);
  cout << "Insert retroactivo t=4.5 (+100): Nueva suma = " << timeline.currentSum()
       << " | Operaciones rehechas r = " << timeline.lastRedoCount() << "\n";

  // CASO CARO: Insertamos en t = 0.5 (al puro inicio de los tiempos)
  // Todas las 6 operaciones existentes quedan despues -> r = 6
  timeline.insertRetroactive(0.5, 1000);
  cout << "Insert retroactivo t=0.5 (+1000): Nueva suma = " << timeline.currentSum()
       << " | Operaciones rehechas r = " << timeline.lastRedoCount() << " (todo el log)\n";

  return 0;
}
