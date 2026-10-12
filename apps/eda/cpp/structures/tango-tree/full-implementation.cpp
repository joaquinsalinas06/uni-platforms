// Hijos preferidos de un Tango Tree: contar cambios de hijo preferido y comparar con Wilber-1.
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

int acceder(vector<Nodo>& P, int raiz, int x) {
  int cambios = 0;
  for (int y = raiz; y != x; ) {
    int hijo = x < y ? P[y].izq : P[y].der;
    if (P[y].pref != 0 && P[y].pref != hijo) cambios++;
    P[y].pref = hijo;
    y = hijo;
  }
  return cambios;
}

// Wilber-1 sobre el mismo árbol de referencia (definición de la clase), para comparar.
int wilber1(int lo, int hi, const vector<int>& seq) {
  if (lo > hi) return 0;
  int mid = (lo + hi) / 2, alt = 0, lado_ant = 0;
  vector<int> sub;
  for (int x : seq) if (lo <= x && x <= hi) {
    sub.push_back(x);
    if (x == mid) continue;
    int lado = x < mid ? -1 : +1;
    if (lado_ant != 0 && lado != lado_ant) alt++;
    lado_ant = lado;
  }
  return alt + wilber1(lo, mid - 1, sub) + wilber1(mid + 1, hi, sub);
}

// Número de caminos de hijo preferido (= árboles auxiliares) con los punteros actuales.
int caminos(const vector<Nodo>& P, int raiz) {
  int c = 0;
  vector<int> pila = {raiz};
  while (!pila.empty()) {
    int y = pila.back(); pila.pop_back();
    if (!y) continue;
    for (int h : {P[y].izq, P[y].der}) {
      if (!h) continue;
      if (P[y].pref != h) c++;            // h empieza un camino nuevo (no es el preferido de su padre)
      pila.push_back(h);
    }
  }
  return c + 1;                           // + el camino de la raíz
}

int main() {
  vector<vector<int>> secuencias = {{3, 1, 4, 2}, {1, 5, 3, 7, 2, 6, 4}, {1, 1, 1, 1}, {1, 2, 3, 4, 5, 6, 7}};
  for (auto& s : secuencias) {
    int n = 7;
    vector<Nodo> P(n + 1);
    int raiz = construir(P, 1, n);
    int total = 0;
    for (int x : s) total += acceder(P, raiz, x);
    cout << "cambios de hijo preferido = " << total << "  Wilber-1 = " << wilber1(1, n, s)
         << "  caminos finales = " << caminos(P, raiz) << "\n";
  }
}
