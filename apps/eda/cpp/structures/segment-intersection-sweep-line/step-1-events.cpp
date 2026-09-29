// Paso 1: el modelo de eventos del barrido (caso simple, #34).
// Un segmento horizontal se activa antes de procesar su x1 y se desactiva
// después de procesar su x2. Un segmento vertical dispara una consulta en
// su propia x. El orden entre eventos con la misma x es lo que hace que el
// borde funcione: activar (0) < consultar (1) < desactivar (2).

#include <algorithm>
#include <vector>

struct HSeg { int x1, x2, y; };  // horizontal, x1 <= x2
struct VSeg { int x, y1, y2; };  // vertical, y1 <= y2

enum class EventKind { Activate = 0, Query = 1, Deactivate = 2 };

struct Event {
  int x;
  EventKind kind;
  int idx;  // índice en hsegs o vsegs, según kind
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
