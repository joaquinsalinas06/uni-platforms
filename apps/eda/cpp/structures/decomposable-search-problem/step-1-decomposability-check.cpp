// Paso 1: Condicion de descomponibilidad, no un algoritmo.
//
// Un problema de busqueda sobre S es descomponible si, para cualquier
// particion S = A U B, existe f en O(1) tal que:
//
//     Query(x, A U B) = f( Query(x, A), Query(x, B) )
//
// Este paso verifica cuatro ejemplos (minimo, maximo, suma, existencia)
// y un contraejemplo (cardinalidad con interseccion no vacia).

#include <algorithm>
#include <iostream>
#include <set>
#include <vector>

using namespace std;

int mini(const vector<int>& v) {
  int m = v[0];
  for (int x : v) {
    if (x < m)
      m = x;
  }
  return m;
}

int maxi(const vector<int>& v) {
  int m = v[0];
  for (int x : v) {
    if (x > m)
      m = x;
  }
  return m;
}

int suma(const vector<int>& v) {
  int s = 0;
  for (int x : v)
    s += x;
  return s;
}

bool existe_par(const vector<int>& v) {
  for (int x : v) {
    if (x % 2 == 0)
      return true;
  }
  return false;
}

void verificar_descomponibles() {
  vector<int> A = {5, 1, 8};
  vector<int> B = {3, 9, 2};
  vector<int> AuB = {5, 1, 8, 3, 9, 2};  // A union B, disjuntos

  // f = min
  if (mini(AuB) == min(mini(A), mini(B))) {
    cout << "Minimo es descomponible: f = min" << endl;
  }

  // f = max
  if (maxi(AuB) == max(maxi(A), maxi(B))) {
    cout << "Maximo es descomponible: f = max" << endl;
  }

  // f = +
  if (suma(AuB) == suma(A) + suma(B)) {
    cout << "Suma es descomponible: f = +" << endl;
  }

  // f = OR logico
  if (existe_par(AuB) == (existe_par(A) || existe_par(B))) {
    cout << "Existencia de par es descomponible: f = OR" << endl;
  }
}

// Contraejemplo: la cardinalidad de un conjunto NO es descomponible
// con f en O(1), porque |A U B| depende de la interseccion.
void verificar_contraejemplo_cardinalidad() {
  set<int> A = {1, 2};
  set<int> B = {2, 3};
  set<int> AuB = {1, 2, 3};

  // Si probaramos f(|A|, |B|) = |A| + |B|:
  // |A| = 2, |B| = 2, suma = 4 != |AuB| = 3
  if (A.size() + B.size() != AuB.size()) {
    cout << "Contraejemplo: Cardinalidad no es descomponible (|A|+|B|=" << (A.size() + B.size())
         << " != |AuB|=" << AuB.size() << ")" << endl;
  }
}

int main() {
  verificar_descomponibles();
  verificar_contraejemplo_cardinalidad();
  cout << "Paso 1 OK: condicion de descomponibilidad verificada." << endl;
  return 0;
}
