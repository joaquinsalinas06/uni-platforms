// Paso 6 — linearizacion del arbol de versiones (recorrido de Euler).
//
// "Recorremos el arbol de versiones con un recorrido de Euler: al entrar
// a la version i marcamos el tiempo (_i ('se hace el cambio i'); al salir
// marcamos )_i ('se deshace el cambio i')" (paginas 38-39). Este es el
// UNICO diagrama que el mazo si dibuja: un arbol de version de 7 nodos,
// raiz 1, hijos 2 y 3, 2 tiene hijos 4 y 5, 3 tiene hijos 6 y 7.

#include <string>
#include <vector>
using namespace std;

struct VersionTree {
    vector<vector<int>> children; // children[v] = hijos de v (1-indexado)
};

void eulerTour(const VersionTree& tree, int v, vector<string>& out) {
    out.push_back("(" + to_string(v));
    for (int c : tree.children[v]) eulerTour(tree, c, out);
    out.push_back(")" + to_string(v));
}
