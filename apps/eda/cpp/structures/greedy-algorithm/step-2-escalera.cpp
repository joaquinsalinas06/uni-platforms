// Paso 2 — qué llaves "ve" el acceso x_t hacia un lado: la ESCALERA.
// Recorriendo desde x hacia la derecha (o izquierda), una llave y entra en la fila si su
// último toque es MÁS RECIENTE que el de todas las llaves ya vistas entre x e y: es decir,
// si el rectángulo entre (x, t) y (y, ultimo[y]) no contiene ningún otro punto.
#include <iostream>
#include <vector>
using namespace std;

vector<int> escalera(const vector<int>& ultimo, int n, int x, int paso) {
  vector<int> vistas;
  int mejor = ultimo[x];                                       // el último toque de x también bloquea rectángulos
  for (int y = x + paso; y >= 1 && y <= n; y += paso)
    if (ultimo[y] > mejor) {                           // más reciente que todo lo que está entre x e y
      vistas.push_back(y);
      mejor = ultimo[y];
    }
  return vistas;
}

int main() {
  int n = 4;
  vector<int> ultimo = {0, 2, 0, 1, 0, 0};  // ultimo[1] = 2, ultimo[3] = 1 (tras los accesos 3 y 1)
  // Acceso a la llave 4 en el tiempo 3: hacia la izquierda ve primero la 3 (tocada en 1)... y luego la 1 (tocada en 2).
  for (int y : escalera(ultimo, n, 4, -1)) cout << y << " ";
  cout << "\n";
}
