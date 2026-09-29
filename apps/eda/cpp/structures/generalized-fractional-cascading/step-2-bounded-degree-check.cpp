// Paso 2 -- la verificacion del grado acotado (#52): "cada nodo del arbol en
// D4/D3 tiene grado acotado por 5: su padre, sus dos hijos, y dos enlaces
// auxiliares hacia la estructura invertida gemela del mismo nodo". Esto NO
// es un algoritmo de busqueda: es la condicion de aplicabilidad verificada
// sobre esta construccion concreta.

#include <iostream>
#include <vector>
#include <cassert>
using namespace std;

struct Vertex {
    int id;
    vector<int> values;
    vector<int> neighbors;
};

vector<Vertex> build_d4_like_graph() {
    vector<Vertex> g(5);
    g[0] = {0, {2, 8, 15, 23, 31, 40, 55, 61, 70, 88}, {1, 2, 3, 4}};
    g[1] = {1, {3, 5, 12, 26, 34, 45, 58, 66, 75, 91}, {0}};
    g[2] = {2, {4, 9, 13, 18, 22, 36, 49, 63, 77, 95}, {0}};
    g[3] = {3, {1, 6, 14, 21, 33, 47, 59, 68, 82, 90}, {0}};
    g[4] = {4, {7, 11, 17, 20, 29, 41, 52, 60, 80, 99}, {0}};
    return g;
}

bool bounded_degree_check(const vector<Vertex>& g, int max_degree) {
    bool ok = true;
    for (const auto& v : g) {
        cout << "  vertice " << v.id << ": grado " << v.neighbors.size()
             << (v.neighbors.size() <= (size_t)max_degree ? " <= " : " >  ")
             << max_degree << "\n";
        if (v.neighbors.size() > (size_t)max_degree) ok = false;
    }
    return ok;
}

int main() {
    auto g = build_d4_like_graph();
    bool ok = bounded_degree_check(g, 5);
    assert(ok);
    cout << "[ok] todos los vertices cumplen grado <= 5\n";
    return 0;
}
