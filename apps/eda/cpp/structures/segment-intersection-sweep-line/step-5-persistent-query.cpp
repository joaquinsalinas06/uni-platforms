// Paso 5: consulta online vía persistencia (#49-51). El material da sólo
// la fórmula Query(t_{x_i}, Successor(y_i)) (#50) sin definirla — no se
// inventa su semántica exacta aquí (ver el hueco declarado en
// persistent-online-query.md). Lo que sí se puede construir y verificar es
// la PROPIEDAD que la persistencia promete: consultar un instante x_i ya
// pasado debe dar lo mismo que habría dado el barrido si se hubiera
// detenido justo en x_i.
//
// ponytail: cada "versión" aquí es una foto completa de los ids activos en
// vez de compartir nodos vía path-copying nodo a nodo (eso exigiría una
// BBST propia con punteros inmutables). Es un stand-in funcional para
// demostrar la propiedad de consulta; si se necesita el espacio O(log n)
// por versión que promete path-copying de verdad, implementar la BBST
// persistente sobre nodos en vez de snapshots de ids.

#include <algorithm>
#include <vector>

struct Seg {
  int id;
  double x0, y0, x1, y1;

  double y_at(double x) const {
    if (x1 == x0) return y0;
    double t = (x - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  }
};

struct Version {
  double x;                    // instante del barrido tras este evento
  std::vector<int> active_ids;  // ids activos justo después de x
};

// Construye una versión por cada x de evento (activación o desactivación),
// en orden creciente de x.
std::vector<Version> build_versions(const std::vector<Seg>& segs) {
  struct Ev {
    double x;
    int kind;  // 0 activar, 2 desactivar
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

// Successor(y_i) sobre el conjunto activo, evaluado en la x de esa versión.
int successor_in(const std::vector<Seg>& segs, const std::vector<int>& active_ids,
                  double at_x, double y_query) {
  std::vector<std::pair<double, int>> vals;
  for (int id : active_ids) vals.push_back({segs[id].y_at(at_x), id});
  std::sort(vals.begin(), vals.end());
  for (auto& [y, id] : vals)
    if (y > y_query) return id;
  return -1;
}

// Consulta persistente: usa la versión vigente en x_i (la última con x <= x_i).
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

// Recomputo directo: qué segmentos estarían activos si el barrido se
// detuviera exactamente en x_i, sin usar ninguna versión guardada. Es el
// oráculo de esta operación.
int recompute_at(const std::vector<Seg>& segs, double x_i, double y_i) {
  std::vector<int> active;
  for (const Seg& s : segs)
    if (s.x0 <= x_i && x_i <= s.x1) active.push_back(s.id);
  return successor_in(segs, active, x_i, y_i);
}
