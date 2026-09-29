// Paso 3: intersection-count (#37) — RSQ(y1, y2) sobre el Fenwick tree de
// activos, disparada por cada evento Query. Con esto el caso simple queda
// completo: sweep_simple_case(). Se agrega también el oráculo de fuerza
// bruta (probar todos los pares H x V) para verificar el resultado en el
// paso final.

#include <algorithm>
#include <vector>

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

  // Prefijo [0, pos]. RSQ(l, r) = prefix(r) - prefix(l-1).
  int prefix(int pos) const {
    int s = 0;
    for (++pos; pos > 0; pos -= pos & (-pos)) s += tree_[pos];
    return s;
  }

  int range(int l, int r) const {  // inclusive [l, r]
    if (r < l) return 0;
    return prefix(r) - (l > 0 ? prefix(l - 1) : 0);
  }

 private:
  std::vector<int> tree_;
};

// Caso simple completo: activación/desactivación + intersection-count.
// Devuelve, por cada segmento vertical, cuántas intersecciones aporta.
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

// Oráculo natural: probar todos los pares H x V directamente.
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
