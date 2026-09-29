// Paso 4: caso general (#40-43) — segmentos oblicuos arbitrarios, sin la
// restricción H/V del caso simple. El estado deja de ser activo/inactivo:
// pasa a ser el ORDEN de cruces con la recta de barrido, mantenido en una
// BBST (balanced-bst, andamio del curso) cuyo comparador depende de la x
// actual (#43) — dos segmentos oblicuos pueden invertir su orden en y a
// medida que x avanza.
//
// std::set no reordena solo cuando el comparador externo cambia: los
// elementos ya insertados quedan ordenados según la x que tenían al
// insertarse. Por eso, para consultar el orden en una x nueva, se
// reconstruye el árbol (std::set(begin, end)) forzando el reordenamiento
// con la x actual — el costo extra es aceptable para esta demostración,
// aunque no es lo que haría una BBST balanceada de verdad in-place.

#include <algorithm>
#include <set>
#include <vector>

struct Seg {
  int id;
  double x0, y0, x1, y1;  // x0 <= x1

  double y_at(double x) const {
    if (x1 == x0) return y0;
    double t = (x - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  }
};

struct CrossingOrder {
  const std::vector<Seg>* segs;
  const double* sweep_x;
  bool operator()(int a, int b) const {
    double ya = (*segs)[a].y_at(*sweep_x);
    double yb = (*segs)[b].y_at(*sweep_x);
    if (ya != yb) return ya < yb;
    return a < b;
  }
};

// Devuelve, para cada x de consulta, el orden de cruces vigente en ese
// instante (ids de segmentos, de menor a mayor y).
std::vector<std::vector<int>> crossing_order_at(const std::vector<Seg>& segs,
                                                 const std::vector<double>& query_xs) {
  double sweep_x = 0;
  CrossingOrder cmp{&segs, &sweep_x};
  std::set<int, CrossingOrder> active(cmp);

  struct Ev {
    double x;
    int kind;  // 0 activar, 2 desactivar (mismo orden de prioridad que el caso simple)
    int id;
  };
  std::vector<Ev> events;
  for (const Seg& s : segs) {
    events.push_back({s.x0, 0, s.id});
    events.push_back({s.x1, 2, s.id});
  }
  std::sort(events.begin(), events.end(), [](const Ev& a, const Ev& b) {
    if (a.x != b.x) return a.x < b.x;
    return a.kind < b.kind;
  });

  std::vector<std::vector<int>> result;
  std::size_t ei = 0;
  for (double qx : query_xs) {
    while (ei < events.size() && events[ei].x <= qx) {
      sweep_x = events[ei].x;
      if (events[ei].kind == 0)
        active.insert(events[ei].id);
      else
        active.erase(events[ei].id);
      ++ei;
    }
    sweep_x = qx;
    std::set<int, CrossingOrder> reordered(active.begin(), active.end(), cmp);
    result.emplace_back(reordered.begin(), reordered.end());
  }
  return result;
}
