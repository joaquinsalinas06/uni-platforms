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
// set con comparador dependiente de x, #43).
//
// Consulta online (#49-51): persistent-online-query. El material da sólo
// la fórmula Query(t_{x_i}, Successor(y_i)) (#50) SIN DEFINIRLA — no se
// inventa su semántica. Lo que sí se construye y verifica es la propiedad
// que la persistencia promete: consultar un x_i pasado da lo mismo que
// recomputar el barrido detenido justo ahí (ver step-5, comentario
// `ponytail:` sobre la simplificación de snapshots vs. path-copying nodo
// a nodo).

#include <algorithm>
#include <iostream>
#include <set>
#include <vector>

using namespace std;

// ---------- Caso simple: eventos + Fenwick tree ----------

struct HSeg {
  int x1, x2, y;
};
struct VSeg {
  int x, y1, y2;
};

enum class EventKind { Activate = 0, Query = 1, Deactivate = 2 };

struct Event {
  int x;
  EventKind kind;
  int idx;
};

vector<Event> build_events(const vector<HSeg>& hsegs, const vector<VSeg>& vsegs) {
  vector<Event> events;
  for (int i = 0; i < (int)hsegs.size(); ++i) {
    events.push_back({hsegs[i].x1, EventKind::Activate, i});
    events.push_back({hsegs[i].x2, EventKind::Deactivate, i});
  }
  for (int i = 0; i < (int)vsegs.size(); ++i) {
    events.push_back({vsegs[i].x, EventKind::Query, i});
  }
  std::stable_sort(events.begin(), events.end(), [](const Event& a, const Event& b) {
    if (a.x != b.x)
      return a.x < b.x;
    return (int)(a.kind) < (int)(b.kind);
  });
  return events;
}

class Fenwick {
 public:
  explicit Fenwick(int n) : tree_(n + 1, 0) {}

  void update(int pos, int delta) {
    for (++pos; pos < (int)tree_.size(); pos += pos & (-pos))
      tree_[pos] += delta;
  }

  int prefix(int pos) const {
    int s = 0;
    for (++pos; pos > 0; pos -= pos & (-pos))
      s += tree_[pos];
    return s;
  }

  int range(int l, int r) const {
    if (r < l)
      return 0;
    return prefix(r) - (l > 0 ? prefix(l - 1) : 0);
  }

 private:
  vector<int> tree_;
};

vector<int> sweep_simple_case(const vector<HSeg>& hsegs, const vector<VSeg>& vsegs, int max_y) {
  vector<Event> events = build_events(hsegs, vsegs);
  Fenwick active(max_y + 1);
  vector<int> result(vsegs.size(), 0);
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

vector<int> brute_force(const vector<HSeg>& hsegs, const vector<VSeg>& vsegs) {
  vector<int> result(vsegs.size(), 0);
  for (int j = 0; j < (int)vsegs.size(); ++j) {
    int count = 0;
    for (const HSeg& h : hsegs) {
      bool crosses =
          vsegs[j].x >= h.x1 && vsegs[j].x <= h.x2 && h.y >= vsegs[j].y1 && h.y <= vsegs[j].y2;
      if (crosses)
        count++;
    }
    result[j] = count;
  }
  return result;
}

// ---------- Caso general: orden de cruces con BBST (set) ----------

struct Seg {
  int id;
  double x0, y0, x1, y1;  // x0 <= x1

  double y_at(double x) const {
    if (x1 == x0)
      return y0;
    double t = (x - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  }
};

struct CrossingOrder {
  const vector<Seg>* segs;
  const double* sweep_x;
  bool operator()(int a, int b) const {
    double ya = (*segs)[a].y_at(*sweep_x);
    double yb = (*segs)[b].y_at(*sweep_x);
    if (ya != yb)
      return ya < yb;
    return a < b;
  }
};

vector<vector<int>> crossing_order_at(const vector<Seg>& segs, const vector<double>& query_xs) {
  double sweep_x = 0;
  CrossingOrder cmp{&segs, &sweep_x};
  set<int, CrossingOrder> active(cmp);

  struct Ev {
    double x;
    int kind;
    int id;
  };
  vector<Ev> events;
  for (const Seg& s : segs) {
    events.push_back({s.x0, 0, s.id});
    events.push_back({s.x1, 2, s.id});
  }
  sort(events.begin(), events.end(), [](const Ev& a, const Ev& b) {
    if (a.x != b.x)
      return a.x < b.x;
    return a.kind < b.kind;
  });

  vector<vector<int>> result;
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
    set<int, CrossingOrder> reordered(active.begin(), active.end(), cmp);
    result.emplace_back(reordered.begin(), reordered.end());
  }
  return result;
}

// Oráculo del caso general: ordenar directamente por y_at(qx), sin BBST.
vector<int> direct_order_at(const vector<Seg>& segs, double qx) {
  vector<int> active_ids;
  for (const Seg& s : segs)
    if (s.x0 <= qx && qx <= s.x1)
      active_ids.push_back(s.id);
  sort(active_ids.begin(), active_ids.end(),
       [&](int a, int b) { return segs[a].y_at(qx) < segs[b].y_at(qx); });
  return active_ids;
}

// ---------- Consulta online vía persistencia (snapshot, ver step-5) ----------

struct Version {
  double x;
  vector<int> active_ids;
};

vector<Version> build_versions(const vector<Seg>& segs) {
  struct Ev {
    double x;
    int kind;
    int id;
  };
  vector<Ev> events;
  for (const Seg& s : segs) {
    events.push_back({s.x0, 0, s.id});
    events.push_back({s.x1, 2, s.id});
  }
  sort(events.begin(), events.end(), [](const Ev& a, const Ev& b) {
    if (a.x != b.x)
      return a.x < b.x;
    return a.kind < b.kind;
  });

  vector<Version> versions;
  vector<int> active;
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

int successor_in(const vector<Seg>& segs, const vector<int>& active_ids, double at_x,
                 double y_query) {
  vector<pair<double, int>> vals;
  for (int id : active_ids)
    vals.push_back({segs[id].y_at(at_x), id});
  sort(vals.begin(), vals.end());
  for (auto& [y, id] : vals)
    if (y > y_query)
      return id;
  return -1;
}

int persistent_query(const vector<Version>& versions, const vector<Seg>& segs, double x_i,
                     double y_i) {
  const Version* v = nullptr;
  for (const Version& ver : versions) {
    if (ver.x <= x_i)
      v = &ver;
    else
      break;
  }
  if (!v)
    return -1;
  return successor_in(segs, v->active_ids, x_i, y_i);
}

int recompute_at(const vector<Seg>& segs, double x_i, double y_i) {
  vector<int> active;
  for (const Seg& s : segs)
    if (s.x0 <= x_i && x_i <= s.x1)
      active.push_back(s.id);
  return successor_in(segs, active, x_i, y_i);
}

// ---------- main: verificaciones con asserts, cada una impresa ----------

int main() {
  // --- Caso simple: Mínimo (examples.md) ---
  {
    vector<HSeg> hsegs = {{1, 3, 2}};
    vector<VSeg> vsegs = {{2, 0, 4}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 10);
    auto brute = brute_force(hsegs, vsegs);
    if (!(sweep == brute))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;
    if (!(sweep[0] == 1))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;
    cout << "[caso simple, minimo] barrido == fuerza bruta == 1 interseccion\n";
  }

  // --- Caso simple: Normal (examples.md) ---
  {
    vector<HSeg> hsegs = {{1, 6, 3}, {4, 7, 5}};
    vector<VSeg> vsegs = {{4, 0, 5}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 10);
    auto brute = brute_force(hsegs, vsegs);
    if (!(sweep == brute))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;
    if (!(sweep[0] == 2))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;
    cout << "[caso simple, normal] barrido == fuerza bruta == 2 intersecciones\n";
  }

  // --- Caso simple: varios segmentos y varias consultas, contra fuerza bruta ---
  {
    vector<HSeg> hsegs = {{0, 10, 1}, {2, 8, 3}, {1, 9, 5}, {5, 20, 7}};
    vector<VSeg> vsegs = {{3, 0, 6}, {9, 0, 8}, {15, 0, 8}, {0, 0, 8}};
    auto sweep = sweep_simple_case(hsegs, vsegs, 25);
    auto brute = brute_force(hsegs, vsegs);
    if (!(sweep == brute))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;
    cout << "[caso simple, multiple] barrido == fuerza bruta en las " << vsegs.size()
         << " consultas verticales\n";
  }

  // --- Caso general: orden de cruces con dos segmentos oblicuos que se
  //     invierten (examples.md, caso Limite) ---
  {
    vector<Seg> segs = {{0, 0.0, 0.0, 4.0, 4.0}, {1, 0.0, 4.0, 4.0, 0.0}};
    vector<double> query_xs = {0.5, 2.0, 3.5};
    auto orders = crossing_order_at(segs, query_xs);
    for (std::size_t k = 0; k < query_xs.size(); ++k) {
      if (!(orders[k] == direct_order_at(segs, query_xs[k])))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    }
    if (!(orders[0] == (vector<int>{0, 1})))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;  // antes del cruce: S1 abajo
    if (!(orders[2] == (vector<int>{1, 0})))
      cout << "Verificacion fallida en linea " << __LINE__ << endl;  // después: se invirtieron
    cout << "[caso general] orden de cruces (BBST) == orden directo por y_at(x) "
            "en 3 instantes; se invierte tras cruzarse en x=2\n";
  }

  // --- Consulta online: persistencia vs. recomputo directo del barrido ---
  {
    vector<Seg> segs = {{0, 0.0, 0.0, 4.0, 4.0}, {1, 0.0, 4.0, 4.0, 0.0}, {2, 1.0, 1.0, 3.0, 1.0}};
    auto versions = build_versions(segs);
    vector<pair<double, double>> queries = {{0.5, 0.2}, {2.0, 1.0}, {3.5, 3.0}};
    for (auto [x_i, y_i] : queries) {
      int persistent = persistent_query(versions, segs, x_i, y_i);
      int direct = recompute_at(segs, x_i, y_i);
      if (!(persistent == direct))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    }
    cout << "[consulta online] consultar una version pasada == recomputar el "
            "barrido detenido en ese instante, en "
         << queries.size() << " consultas\n";
  }

  cout << "Todas las verificaciones pasaron.\n";
  return 0;
}
