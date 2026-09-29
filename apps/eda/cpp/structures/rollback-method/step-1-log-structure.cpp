// Paso 1: el log de operaciones sobre el que trabaja el método de rollback.
// Cada operación es invertible (sumar delta / restar delta), que es el
// único requisito que el método exige — sin conmutatividad.
//
// Estructura mínima elegida a propósito: un contador con historial de
// sumas con signo. Sirve para demostrar el MECANISMO (deshacer/rehacer),
// no una estructura de producción.

#include <vector>

struct Op {
  double t;   // tiempo en la línea de retroactividad (puede ser fraccionario)
  int delta;  // operación: sumar delta al contador. Inversa: sumar -delta.
};

class RollbackLog {
public:
  // Estado actual del contador tras aplicar todo el log en orden.
  long long sum() const { return sum_; }
  std::size_t size() const { return log_.size(); }

private:
  std::vector<Op> log_;
  long long sum_ = 0;
};
