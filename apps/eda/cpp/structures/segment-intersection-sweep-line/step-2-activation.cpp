// Paso 2: la estructura que el profesor nombra en #38 para representar el
// estado de "posiciones activas" — un Fenwick tree (la otra opción es un
// Segment tree; ver fenwick-tree y segment-tree, andamio del curso). Activar
// es +1 en la posición y del segmento horizontal; desactivar es -1.

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

  // Activar/desactivar una posición y (segment-activation): +1 / -1 puntual.
  void update(int pos, int delta) {
    for (++pos; pos < (int)tree_.size(); pos += pos & (-pos)) tree_[pos] += delta;
  }

 private:
  std::vector<int> tree_;
};
