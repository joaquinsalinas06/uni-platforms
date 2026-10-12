// Paso 2 — acceder a una llave y actualizar los hijos preferidos.
// Bajamos de la raíz a x. En cada nodo y del camino (salvo x), si el hijo por el que bajamos NO es el
// preferido de y, ese hijo pasa a ser el preferido: es un CAMBIO DE HIJO PREFERIDO (una alternancia de Wilber-1).
#include <iostream>
#include <vector>
using namespace std;

struct Nodo { int izq = 0, der = 0, pref = 0; };

int construir(vector<Nodo>& P, int lo, int hi) {
  if (lo > hi) return 0;
  int mid = (lo + hi) / 2;
  P[mid].izq = construir(P, lo, mid - 1);
  P[mid].der = construir(P, mid + 1, hi);
  return mid;
}

// Devuelve cuántos nodos del camino cambiaron de hijo preferido (el primer descenso por un nodo no cuenta).
int acceder(vector<Nodo>& P, int raiz, int x) {
  int cambios = 0;
  for (int y = raiz; y != x; ) {
    int hijo = x < y ? P[y].izq : P[y].der;
    if (P[y].pref != 0 && P[y].pref != hijo) cambios++;   // cambió el hijo preferido
    P[y].pref = hijo;
    y = hijo;
  }
  return cambios;
}

int main() {
  int n = 7;
  vector<Nodo> P(n + 1);
  int raiz = construir(P, 1, n);
  for (int x : {1, 5, 3, 7}) cout << "acceso " << x << ": " << acceder(P, raiz, x) << " cambios\n";
}
