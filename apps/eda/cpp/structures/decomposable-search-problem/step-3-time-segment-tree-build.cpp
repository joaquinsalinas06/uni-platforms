// Paso 3: construir el segment tree sobre el eje del tiempo (Build).
//
// "La conexion con la clase pasada: Segment Tree" -- el profesor la anuncia
// como heredada. Build aqui es exactamente Build de segment tree (ver
// /structures/segment-tree/operations/build), sobre m instantes de tiempo
// en vez de n posiciones de un arreglo. Arranca vacio: cada hoja en el
// neutro de f (0 para suma).

#include <cassert>
#include <iostream>
#include <vector>

using std::vector;

struct TimeSegmentTree {
  int m;
  vector<long long> val;

  explicit TimeSegmentTree(int m_) : m(m_), val(4 * (m_ > 0 ? m_ : 1), 0) {}

  // Build recursivo: identico al Build de segment tree. Arranca de un
  // arreglo de m ceros (ninguna operacion insertada todavia).
  void build(int nodo, int l, int r) {
    if (l == r) {
      val[nodo] = 0; // neutro de suma: la franja de tiempo empieza vacia
      return;
    }
    int mid = (l + r) / 2;
    build(2 * nodo, l, mid);
    build(2 * nodo + 1, mid + 1, r);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }

  void build() { build(1, 1, m); }
};

int main() {
  TimeSegmentTree tree(4);
  tree.build();

  assert(tree.val[1] == 0); // raiz [1,4]
  std::cout << "Paso 3 OK: segment tree de tiempo construido (m=4), "
               "raiz [1,4] en el neutro de suma (0) -- ninguna operacion "
               "insertada todavia.\n";
  return 0;
}
