// Paso 4 — el contraste que es el punto del tema: una estructura cuya
// operacion NO conmuta (Assign(v), "ultimo valor visto") donde el mismo
// truco de los pasos 2 y 3 (aplicar la operacion "ahora" en vez de en su
// tiempo real) da una respuesta INCORRECTA. Aqui no hay atajo: para saber
// el valor correcto en el presente hay que rehacer la secuencia ordenada
// por tiempo (la solucion O(m) ingenua que retroactivity ya describe).

#include <algorithm>
#include <utility>
#include <vector>

class LastValueHistory {
public:
  // Registra la operacion real Assign(value) en el tiempo time.
  void assign(int time, int value) { history_.push_back({time, value}); }

  // Valor correcto en el presente: rehacer la secuencia ordenada por
  // tiempo y quedarse con el ultimo Assign aplicado. Esto es exactamente
  // el costo O(m) que la tecnica de esta semana busca evitar -- y que SI
  // hace falta pagar cuando la operacion no conmuta.
  int correct_present_value() const {
    std::vector<std::pair<int, int>> sorted = history_;
    std::sort(sorted.begin(), sorted.end());
    return sorted.empty() ? 0 : sorted.back().second;
  }

  // El truco de insert_retroactive/delete_retroactive (pasos 2 y 3)
  // aplicado tal cual a Assign: "no importa el tiempo, aplicar ahora".
  // Como Assign NO conmuta, esto ignora que una operacion mas reciente que
  // insert_time deberia ganar -- y por eso puede dar una respuesta
  // incorrecta.
  int wrongly_applied_now_value() const {
    if (history_.empty()) return 0;
    return history_.back().second; // "aplicar ahora" = tomar el ultimo insertado, sin mirar tiempos
  }

private:
  std::vector<std::pair<int, int>> history_; // (tiempo, valor asignado)
};
