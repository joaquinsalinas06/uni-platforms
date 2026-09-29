// Paso 4: Insert(t, op) / Delete(t) retroactivos, via el mismo Update de
// segment tree que ya se conoce ("no hay nada nuevo que analizar aqui").
//
// InsertRetroactive(t, delta): la operacion insertada en el tiempo t suma
// `delta` a partir de ese instante. DeleteRetroactive(t): quita esa
// operacion (la deja en el neutro).
//
// Se guarda aparte, en `activo`, el valor actualmente ocupando cada franja
// de tiempo -- necesario para poder invertir Delete sin recordar el valor
// viejo por fuera (hueco del material: el profesor no explica como se
// representan/ocupan los tiempos; esta es la convencion mas simple).

#include <cassert>
#include <iostream>
#include <vector>

using std::vector;

struct TimeSegmentTree {
  int m;
  vector<long long> val;
  vector<long long> activo; // activo[t] = valor actualmente insertado en el tiempo t (0 si vacio)

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

  // Update de segment tree, sin ninguna modificacion: escribe `nuevo_valor`
  // en la hoja `t` y recalcula el camino raiz-hoja. O(lg m) nodos tocados.
  void update(int nodo, int l, int r, int t, long long nuevo_valor) {
    if (l == r) { val[nodo] = nuevo_valor; return; }
    int mid = (l + r) / 2;
    if (t <= mid) update(2 * nodo, l, mid, t, nuevo_valor);
    else update(2 * nodo + 1, mid + 1, r, t, nuevo_valor);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }

  // Insert(t, op) retroactivo: la franja t pasa a valer `delta`.
  void insert_retroactive(int t, long long delta) {
    activo[t] = delta;
    update(1, 1, m, t, delta);
  }

  // Delete(t) retroactivo: vacia la franja t (vuelve al neutro de suma, 0).
  void delete_retroactive(int t) {
    activo[t] = 0;
    update(1, 1, m, t, 0);
  }
};

int main() {
  TimeSegmentTree tree(4);
  tree.build();

  tree.insert_retroactive(2, 5); // Insert(t=2, op) con efecto +5
  assert(tree.activo[2] == 5);
  assert(tree.val[1] == 5); // raiz [1,4] ya refleja la insercion

  tree.delete_retroactive(2); // Delete(t=2)
  assert(tree.activo[2] == 0);
  assert(tree.val[1] == 0); // raiz vuelve al neutro

  std::cout << "Paso 4 OK: Insert(t=2,+5) y Delete(t=2) retroactivos, cada "
               "uno un Update de O(lg m) nodos sobre el eje del tiempo.\n";
  return 0;
}
