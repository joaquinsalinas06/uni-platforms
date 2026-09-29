// Paso 1 — el arreglo y las fórmulas de índice, nada más.
//
// El montículo binario NO usa punteros: es un arreglo 1-indexado que
// representa un árbol binario casi completo. La posición numérica de cada
// elemento determina quién es su padre y quiénes sus hijos.
//
// A[0] se deja como centinela sin usar (vals[0] = 0) para que las fórmulas
// de índice sean exactamente las del profesor: padre = i/2, hijos = 2i, 2i+1.

#include <vector>
using namespace std;

int parent(int i) { return i / 2; }
int left(int i)   { return 2 * i; }
int right(int i)  { return 2 * i + 1; }

// vals[0] es el centinela; los elementos reales viven en vals[1..n].
vector<int> vals = {0};
