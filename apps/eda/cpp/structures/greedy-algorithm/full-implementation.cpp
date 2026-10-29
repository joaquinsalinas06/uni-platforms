// Greedy sobre una secuencia de accesos, fila por fila, más un comprobador de satisfacción arboral.
#include <algorithm>
#include <cassert>
#include <iostream>
#include <vector>
using namespace std;

struct Punto {
  int x, t;
  bool operator==(const Punto& o) const { return x == o.x && t == o.t; }
};

vector<int> escalera(const vector<int>& ultimo, int n, int x, int paso) {
  vector<int> vistas;
  int mejor = ultimo[x];
  for (int y = x + paso; y >= 1 && y <= n; y += paso)
    if (ultimo[y] > mejor) { vistas.push_back(y); mejor = ultimo[y]; }
  return vistas;
}

vector<Punto> greedy(int n, const vector<int>& acc) {
  vector<int> ultimo(n + 2, 0);
  vector<Punto> P;
  for (int t = 1; t <= (int)acc.size(); t++) {
    int x = acc[t - 1];
    vector<int> fila = {x};
    for (int y : escalera(ultimo, n, x, +1)) fila.push_back(y);
    for (int y : escalera(ultimo, n, x, -1)) fila.push_back(y);
    for (int y : fila) { P.push_back({y, t}); ultimo[y] = t; }
  }
  return P;
}

// Definición de la clase: todo par de puntos sin línea común tiene un tercer punto en su rectángulo (borde incluido).
bool arboralmente_satisfecho(const vector<Punto>& P) {
  for (auto a : P) for (auto b : P) {
    if (a.x >= b.x || a.t == b.t) continue;
    int t1 = min(a.t, b.t), t2 = max(a.t, b.t);
    bool tercero = false;
    for (auto c : P)
      if (!(c == a) && !(c == b) && a.x <= c.x && c.x <= b.x && t1 <= c.t && c.t <= t2) tercero = true;
    if (!tercero) return false;
  }
  return true;
}

int main() {
  // Un acceso repetido no vuelve a tocar una llave cuyo rectángulo ya estaba bloqueado.
  const vector<Punto> repetidos = {{2, 1}, {1, 2}, {2, 2}, {1, 3}};
  assert(greedy(2, {2, 1, 1}) == repetidos);
  assert(arboralmente_satisfecho(repetidos));
  struct Caso { int n; vector<int> acc; };
  vector<Caso> casos = {{4, {3, 1, 4, 2}}, {3, {2, 1, 3}}, {4, {1, 2, 3, 4}}, {8, {1, 5, 3, 7, 2, 6, 4, 8}}};
  for (auto& c : casos) {
    auto P = greedy(c.n, c.acc);
    cout << "accesos:";
    for (int x : c.acc) cout << " " << x;
    cout << "  ->  |P| = " << P.size() << " (" << P.size() - c.acc.size() << " extra), satisfecho: "
         << (arboralmente_satisfecho(P) ? "sí" : "NO") << "\n";
  }
  return 0;
}
