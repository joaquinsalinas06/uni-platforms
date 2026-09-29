// Paso 5: Query(t) retroactiva en cualquier tiempo t -- retroactividad
// COMPLETA. Es el mismo Query de rango de segment tree, con el rango fijo
// en [1, t]: se descompone en O(lg m) nodos canonicos.
//
// Si la estructura original respondia en O(q), la version retroactiva
// responde en O(q * lg m) (textual del profesor, paginas 36-37). Aqui q=O(1)
// porque combinar (suma) es O(1) puro.

#include <cassert>
#include <iostream>
#include <vector>

using std::vector;

struct TimeSegmentTree {
  int m;
  vector<long long> val;
  vector<long long> activo;

  explicit TimeSegmentTree(int m_)
      : m(m_), val(4 * (m_ > 0 ? m_ : 1), 0), activo(m_ + 1, 0) {}

  void build(int nodo, int l, int r) {
    if (l == r) { val[nodo] = 0; return; }
    int mid = (l + r) / 2;
    build(2 * nodo, l, mid);
    build(2 * nodo + 1, mid + 1, r);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }
  void build() { build(1, 1, m); }

  void update(int nodo, int l, int r, int t, long long nuevo_valor) {
    if (l == r) { val[nodo] = nuevo_valor; return; }
    int mid = (l + r) / 2;
    if (t <= mid) update(2 * nodo, l, mid, t, nuevo_valor);
    else update(2 * nodo + 1, mid + 1, r, t, nuevo_valor);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }

  void insert_retroactive(int t, long long delta) {
    activo[t] = delta;
    update(1, 1, m, t, delta);
  }
  void delete_retroactive(int t) {
    activo[t] = 0;
    update(1, 1, m, t, 0);
  }

  // Query de rango de segment tree, sin modificacion: descompone [ql,qr]
  // en nodos canonicos.
  long long query(int nodo, int l, int r, int ql, int qr) {
    if (r < ql || qr < l) return 0; // neutro de suma
    if (ql <= l && r <= qr) return val[nodo];
    int mid = (l + r) / 2;
    return query(2 * nodo, l, mid, ql, qr) + query(2 * nodo + 1, mid + 1, r, ql, qr);
  }

  // Query(t) retroactiva: "que paso hasta el instante t" = rango [1, t].
  long long query_at_time(int t) { return query(1, 1, m, 1, t); }
};

int main() {
  TimeSegmentTree tree(4);
  tree.build();
  tree.insert_retroactive(2, 5); // Insert(t=2, op) con efecto +5

  assert(tree.query_at_time(1) == 0); // antes de t=2: la insercion no la afecta
  assert(tree.query_at_time(3) == 5); // en/despues de t=2: si la ve
  assert(tree.query_at_time(4) == 5);

  std::cout << "Paso 5 OK: Query(t=1)=0, Query(t=3)=5, Query(t=4)=5 -- la "
               "operacion de t=2 solo afecta consultas dentro de su "
               "intervalo de vida.\n";
  return 0;
}
