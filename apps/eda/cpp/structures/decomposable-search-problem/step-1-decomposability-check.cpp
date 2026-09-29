// Paso 1: la CONDICION de descomponibilidad, no un algoritmo.
//
// Un problema de busqueda sobre S es descomponible si, para cualquier
// particion S = A U B, existe f calculable en O(1) tal que:
//
//     Query(x, A U B) = f( Query(x, A), Query(x, B) )
//
// Este paso verifica los cuatro ejemplos que da el profesor (minimo,
// maximo, suma, existencia) sobre una particion concreta, y muestra un
// contraejemplo derivado (cardinalidad de un conjunto) que NO cumple la
// condicion -- tan importante como los ejemplos que si la cumplen.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <vector>

using std::vector;

int mini(const vector<int>& v) { return *std::min_element(v.begin(), v.end()); }
int maxi(const vector<int>& v) { return *std::max_element(v.begin(), v.end()); }
int suma(const vector<int>& v) {
  int s = 0;
  for (int x : v) s += x;
  return s;
}
bool existe_par(const vector<int>& v) {
  for (int x : v) if (x % 2 == 0) return true;
  return false;
}

void verificar_decomponibles() {
  vector<int> A = {5, 1, 8};
  vector<int> B = {3, 9, 2};
  vector<int> AuB = {5, 1, 8, 3, 9, 2}; // A union B, disjuntos

  // f = min
  assert(mini(AuB) == std::min(mini(A), mini(B)));
  // f = max
  assert(maxi(AuB) == std::max(maxi(A), maxi(B)));
  // f = +
  assert(suma(AuB) == suma(A) + suma(B));
  // f = OR logico
  assert(existe_par(AuB) == (existe_par(A) || existe_par(B)));

  std::cout << "[decomposability] min, max, suma, existe-par: los cuatro "
               "cumplen Query(AuB) = f(Query(A), Query(B))\n";
}

// Contraejemplo derivado (no aparece en el mazo): cardinalidad de un
// conjunto NO es descomponible con f en O(1), porque |A U B| depende de
// |A interseccion B|, que no se puede obtener solo de |A| y |B|.
void verificar_contraejemplo_cardinalidad() {
  std::set<int> A = {1, 2};
  std::set<int> B = {2, 3};
  std::set<int> AuB = {1, 2, 3};

  // Si f existiera como "f(|A|,|B|) = |A|+|B|" (la unica f de O(1) natural
  // candidata), fallaria aqui: |A|=2, |B|=2, pero |AuB|=3, no 4.
  bool f_candidata_falla = (A.size() + B.size() != AuB.size());
  assert(f_candidata_falla);

  std::cout << "[decomposability] contraejemplo: cardinalidad no es "
               "descomponible (|A|+|B| = "
            << (A.size() + B.size()) << " != |AuB| = " << AuB.size() << ")\n";
}

int main() {
  verificar_decomponibles();
  verificar_contraejemplo_cardinalidad();
  std::cout << "Paso 1 OK: condicion de descomponibilidad verificada con "
               "ejemplos y contraejemplo.\n";
  return 0;
}
