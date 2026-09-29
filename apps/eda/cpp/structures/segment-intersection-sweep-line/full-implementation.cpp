// Intersección de segmentos con barrido (CS3014, semana 4, #24-51).
//
// Caso simple (#28-38): segmentos horizontales y verticales, sin
// intersecciones entre segmentos de la misma orientación (#29). El
// profesor atribuye el costo a la estructura elegida: "Usando un Segment
// tree o un Fenwick tree se puede resolver este caso especial en
// O(n log n)" (#38) — aquí se usa un Fenwick tree. segment-activation
// activa/desactiva posiciones y; intersection-count hace RSQ(y1, y2) (#37).
// Se verifica contra fuerza bruta (todos los pares H x V): el oráculo
// natural para este caso.
//
// Caso general (#40-47): segmentos oblicuos arbitrarios. crossing-order
// mantiene el orden de cruces con la recta de barrido en una BBST (aquí,
// std::set con comparador dependiente de x, #43).
//
// Consulta online (#49-51): persistent-online-query. El material da sólo
// la fórmula Query(t_{x_i}, Successor(y_i)) (#50) SIN DEFINIRLA — no se
// inventa su semántica. Lo que sí se construye y verifica es la propiedad
// que la persistencia promete: consultar un x_i pasado da lo mismo que
// recomputar el barrido detenido justo ahí (ver step-5, comentario
// `ponytail:` sobre la simplificación de snapshots vs. path-copying nodo
// a nodo).

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <vector>

// ---------- Caso simple: eventos + Fenwick tree ----------

struct HSeg { int x1, x2, y; };
struct VSeg { int x, y1, y2; };

enum class EventKind { Activate = 0, Query = 1, Deactivate = 2 };

struct Event {
  int x;
  EventKind kind;
  int idx;
};

std::vector<Event> build_events(const std::vector<HSeg>& hsegs,
                                 const std::vector<VSeg>& vsegs) {
  std::vector<Event> events;
  for (int i = 0; i < (int)hsegs.size(); ++i) {
    events.push_back({hsegs[i].x1, EventKind::Activate, i});
    events.push_back({hsegs[i].x2, EventKind::Deactivate, i});
  }
  for (int i = 0; i < (int)vsegs.size(); ++i) {
    events.push_back({vsegs[i].x, EventKind::Query, i});
  }
  std::stable_sort(events.begin(), events.end(), [](const Event& a, const Event& b) {
    if (a.x != b.x) return a.x < b.x;
    return static_cast<int>(a.kind) < static_cast<int>(b.kind);
  });
  return events;
}

class Fenwick {
 public:
  explicit Fenwick(int n) : tree_(n + 1, 0) {}

  void update(int pos, int delta) {
    for (++pos; pos < (int)tree_.size(); pos += pos & (-pos)) tree_[pos] += delta;
  }

  int prefix(int pos) const {
    int s = 0;
    for (++pos; pos > 0; pos -= pos & (-pos)) s += tree_[pos];
    return s;
  }

  int range(int l, int r) const {
    if (r < l) return 0;
    return prefix(r) - (l > 0 ? prefix(l - 1) : 0);
  }

 private:
  std::vector<int> tree_;
};

std::vector<int> sweep_simple_case(const std::vector<HSeg>& hsegs,
                                    const std::vector<VSeg>& vsegs, int max_y) {
  std::vector<Event> events = build_events(hsegs, vsegs);
  Fenwick active(max_y + 1);
  std::vector<int> result(vsegs.size(), 0);
  for (const Event& e : events) {
    switch (e.kind) {
      case EventKind::Activate:
        active.update(hsegs[e.idx].y, +1);
        break;
      case EventKind::Deactivate:
        active.update(hsegs[e.idx].y, -1);
        break;
      case EventKind::Query:
        result[e.idx] = active.range(vsegs[e.idx].y1, vsegs[e.idx].y2);
        break;
    }
  }
  return result;
}

std::vector<int> brute_force(const std::vector<HSeg>& hsegs,
                              const std::vector<VSeg>& vsegs) {
  std::vector<int> result(vsegs.size(), 0);
  for (int j = 0; j < (int)vsegs.size(); ++j) {
    int count = 0;
    for (const HSeg& h : hsegs) {
      bool crosses = vsegs[j].x >= h.x1 && vsegs[j].x <= h.x2 && h.y >= vsegs[j].y1 &&
                     h.y <= vsegs[j].y2;
      if (crosses) count++;
    }
    result[j] = count;
  }
  return result;
}

// ---------- Caso general: orden de cruces con BBST (std::set) ----------

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

std::vector<std::vector<int>> crossing_order_at(const std::vector<Seg>& segs,
                                                 const std::vector<double>& query_xs) {
  double sweep_x = 0;
  CrossingOrder cmp{&segs, &sweep_x};
  std::set<int, CrossingOrder> active(cmp);

  struct Ev { double x; int kind; int id; };
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

// Oráculo del caso general: ordenar directamente por y_at(qx), sin BBST.
std::vector<int> direct_order_at(const std::vector<Seg>& segs, double qx) {
  std::vector<int> active_ids;
  for (const Seg& s : segs)
    if (s.x0 <= qx && qx <= s.x1) active_ids.push_back(s.id);
  std::sort(active_ids.begin(), active_ids.end(), [&](int a, int b) {
    return segs[a].y_at(qx) < segs[b].y_at(qx);
  });
  return active_ids;
}

// ---------- Consulta online vía persistencia (snapshot, ver step-5) ----------

struct Version {
  double x;
  std::vector<int> active_ids;
};

std::vector<Version> build_versions(const std::vector<Seg>& segs) {
  struct Ev { double x; int kind; int id; };
  std::vector<Ev> events;
  for (const Seg& s : segs) {
    events.push_back({s.x0, 0, s.id});
    events.push_back({s.x1, 2, s.id});
  }
  std::sort(events.begin(), events.end(), [](const Ev& a, const Ev& b) {
    if (a.x != b.x) return a.x < b.x;
    return a.kind < b.kind;
  });

  std::vector<Version> versions;
  std::vector<int> active;
  std::size_t i = 0;
  while (i < events.size()) {
    double x = events[i].x;
    while (i < events.size() && events[i].x == x) {
      if (events[i].kind == 0)
        active.push_back(events[i].id);
      else
        active.erase(std::remove(active.begin(), active.end(), events[i].id), active.end());
      ++i;
    }
    versions.push_back({x, active});
  }
  return versions;
}

int successor_in(const std::vector<Seg>& segs, const std::vector<int>& active_ids,
                  double at_x, double y_query) {
  std::vector<std::pair<double, int>> vals;
  for (int id : active_ids) vals.push_back({segs[id].y_at(at_x), id});
  std::sort(vals.begin(), vals.end());
  for (auto& [y, id] : vals)
    if (y > y_query) return id;
  return -1;
}

int persistent_query(const std::vector<Version>& versions, const std::vector<Seg>& segs,
                      double x_i, double y_i) {
  const Version* v = nullptr;
  for (const Version& ver : versions) {
    if (ver.x <= x_i)
      v = &ver;
    else
      break;
  }
  if (!v) return -1;
  return successor_in(segs, v->active_ids, x_i, y_i);
}

int recompute_at(const std::vector<Seg>& segs, double x_i, double y_i) {
  std::vector<int> active;
  for (const Seg& s : segs)
    if (s.x0 <= x_i && x_i <= s.x1) active.push_back(s.id);
  return successor_in(segs, active, x_i, y_i);
}

// ---------- main: verificaciones con asserts, cada una impresa ----------

int main() {
  // --- Caso simple: Mínimo (examples.md) ---
  {
    std::vector<HSeg> hsegs = {{1, 3, 2}};
    std::vector<VSeg> vsegs = {{2, 0, 4}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 10);
    auto brute = brute_force(hsegs, vsegs);
    assert(sweep == brute);
    assert(sweep[0] == 1);
    std::cout << "[caso simple, minimo] barrido == fuerza bruta == 1 interseccion\n";
  }

  // --- Caso simple: Normal (examples.md) ---
  {
    std::vector<HSeg> hsegs = {{1, 6, 3}, {4, 7, 5}};
    std::vector<VSeg> vsegs = {{4, 0, 5}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 10);
    auto brute = brute_force(hsegs, vsegs);
    assert(sweep == brute);
    assert(sweep[0] == 2);
    std::cout << "[caso simple, normal] barrido == fuerza bruta == 2 intersecciones\n";
  }

  // --- Caso simple: varios segmentos y varias consultas, contra fuerza bruta ---
  {
    std::vector<HSeg> hsegs = {{0, 10, 1}, {2, 8, 3}, {1, 9, 5}, {5, 20, 7}};
    std::vector<VSeg> vsegs = {{3, 0, 6}, {9, 0, 8}, {15, 0, 8}, {0, 0, 8}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 25);
    auto brute = brute_force(hsegs, vsegs);
    assert(sweep == brute);
    std::cout << "[caso simple, multiple] barrido == fuerza bruta en las " << vsegs.size()
              << " consultas verticales\n";
  }

  // --- Caso general: orden de cruces con dos segmentos oblicuos que se
  //     invierten (examples.md, caso Limite) ---
  {
    std::vector<Seg> segs = {{0, 0.0, 0.0, 4.0, 4.0}, {1, 0.0, 4.0, 4.0, 0.0}};
    std::vector<double> query_xs = {0.5, 2.0, 3.5};
    auto orders = crossing_order_at(segs, query_xs);
    for (std::size_t k = 0; k < query_xs.size(); ++k) {
      assert(orders[k] == direct_order_at(segs, query_xs[k]));
    }
    assert(orders[0] == (std::vector<int>{0, 1}));  // antes del cruce: S1 abajo
    assert(orders[2] == (std::vector<int>{1, 0}));  // después: se invirtieron
    std::cout << "[caso general] orden de cruces (BBST) == orden directo por y_at(x) "
                 "en 3 instantes; se invierte tras cruzarse en x=2\n";
  }

  // --- Consulta online: persistencia vs. recomputo directo del barrido ---
  {
    std::vector<Seg> segs = {{0, 0.0, 0.0, 4.0, 4.0}, {1, 0.0, 4.0, 4.0, 0.0},
                              {2, 1.0, 1.0, 3.0, 1.0}};
    auto versions = build_versions(segs);
    std::vector<std::pair<double, double>> queries = {{0.5, 0.2}, {2.0, 1.0}, {3.5, 3.0}};
    for (auto [x_i, y_i] : queries) {
      int persistent = persistent_query(versions, segs, x_i, y_i);
      int direct = recompute_at(segs, x_i, y_i);
      assert(persistent == direct);
    }
    std::cout << "[consulta online] consultar una version pasada == recomputar el "
                 "barrido detenido en ese instante, en "
              << queries.size() << " consultas\n";
  }

  std::cout << "Todas las verificaciones pasaron.\n";
  return 0;
}
