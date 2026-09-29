// Paso 2: el nodo del segment tree sobre el EJE DEL TIEMPO.
//
// Es el mismo nodo de un segment tree cualquiera (ver /structures/segment-tree):
// guarda el resultado combinado (f) de su rango. El giro es que el rango ya
// no es de posiciones de un arreglo -- es de INSTANTES de la linea de tiempo
// de operaciones retroactivas (hay m de ellas).
//
// f = suma para este tema (derivado; el profesor no da un ejemplo numerico,
// solo la lista de f candidatas: min, max, suma, OR).

#include <cassert>
#include <iostream>
#include <vector>

using std::vector;

// Arbol implicito en un vector 1-indexado de tamano 4*m (cota estandar
// suficiente para cualquier m), igual que un segment tree de arreglo.
struct TimeSegmentTree {
  int m;                 // numero de franjas de tiempo (instantes)
  vector<long long> val; // val[nodo] = suma de las operaciones activas en su rango de tiempo

  explicit TimeSegmentTree(int m_) : m(m_), val(4 * (m_ > 0 ? m_ : 1), 0) {}
};

int main() {
  TimeSegmentTree tree(4); // m=4 franjas de tiempo, vacias
  assert(static_cast<int>(tree.val.size()) == 16);
  for (long long v : tree.val) assert(v == 0); // neutro de suma = 0

  std::cout << "Paso 2 OK: nodo/almacen del segment tree de tiempo "
               "inicializado en el neutro (suma=0) para m=4 franjas.\n";
  return 0;
}
