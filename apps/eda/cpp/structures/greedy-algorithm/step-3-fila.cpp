// Paso 3 — procesar UNA fila: el acceso, más la escalera a cada lado.
#include <iostream>
#include <vector>
using namespace std;

struct Punto { int x, t; };

vector<int> escalera(const vector<int>& ultimo, int n, int x, int paso) {
  vector<int> vistas;
  int mejor = ultimo[x];
  for (int y = x + paso; y >= 1 && y <= n; y += paso)
    if (ultimo[y] > mejor) { vistas.push_back(y); mejor = ultimo[y]; }
  return vistas;
}

// Agrega a P los puntos de la fila t y actualiza ultimo[]. No modifica ninguna fila anterior.
void procesar_fila(int n, int x, int t, vector<int>& ultimo, vector<Punto>& P) {
  vector<int> fila = {x};
  for (int y : escalera(ultimo, n, x, +1)) fila.push_back(y);
  for (int y : escalera(ultimo, n, x, -1)) fila.push_back(y);
  for (int y : fila) { P.push_back({y, t}); ultimo[y] = t; }   // ultimo se actualiza DESPUÉS de leer toda la escalera
}

int main() {
  int n = 3;
  vector<int> ultimo(n + 2, 0);
  vector<Punto> P;
  procesar_fila(n, 2, 1, ultimo, P);   // acceso a 2 en t = 1
  procesar_fila(n, 1, 2, ultimo, P);   // acceso a 1 en t = 2: la escalera derecha ve la llave 2
  for (auto p : P) cout << "(" << p.x << "," << p.t << ") ";
  cout << "\n";
}
