// Paso 1 — el árbol de referencia P: perfectamente balanceado sobre las llaves lo..hi.
// Cada nodo guarda sus hijos; pref[y] es su hijo preferido (0 = ninguno todavía).
#include <iostream>
#include <vector>
using namespace std;

struct Nodo { int izq = 0, der = 0, pref = 0; };   // 0 = no existe

// Construye P sobre lo..hi con raíz en el punto medio. Devuelve la llave de la raíz (0 si el rango está vacío).
int construir(vector<Nodo>& P, int lo, int hi) {
  if (lo > hi) return 0;
  int mid = (lo + hi) / 2;
  P[mid].izq = construir(P, lo, mid - 1);
  P[mid].der = construir(P, mid + 1, hi);
  return mid;
}

int main() {
  int n = 7;
  vector<Nodo> P(n + 1);
  int raiz = construir(P, 1, n);
  cout << "raíz: " << raiz << "\n";
  for (int y = 1; y <= n; y++) cout << y << ": izq=" << P[y].izq << " der=" << P[y].der << "\n";
}
