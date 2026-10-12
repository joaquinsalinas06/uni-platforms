// Paso 1 — los datos: un punto (llave, tiempo) y la última fila en que se tocó cada llave.
#include <iostream>
#include <vector>
using namespace std;

struct Punto {
  int x;  // llave tocada
  int t;  // fila (tiempo) en que se tocó
};

int main() {
  int n = 4;                          // llaves 1..n
  vector<int> acc = {3, 1, 4, 2};     // secuencia de accesos x_1..x_m
  vector<int> ultimo(n + 2, 0);       // ultimo[y] = última fila en que y fue tocada (0 = nunca)
  vector<Punto> P;                    // conjunto de puntos que Greedy va construyendo

  // Con sólo los accesos pedidos (sin ningún punto extra), la fila t tiene un único punto.
  for (int t = 1; t <= (int)acc.size(); t++) {
    P.push_back({acc[t - 1], t});
    ultimo[acc[t - 1]] = t;
  }
  for (auto p : P) cout << "(" << p.x << "," << p.t << ") ";
  cout << "\n";
}
