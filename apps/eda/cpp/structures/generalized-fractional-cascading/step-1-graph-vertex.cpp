// Paso 1 -- el grafo de cascading: un vertice ya no es una lista suelta de
// una cadena, es un nodo con vecinos (grado acotado, ver #52). Aqui solo se
// define el grafo D4-like (padre, dos hijos, dos enlaces auxiliares a la
// estructura invertida gemela) y se imprime su forma. Nada de busqueda
// todavia -- eso llega en el paso 3.

#include <iostream>
#include <vector>
using namespace std;

struct Vertex {
    int id;
    vector<int> values; // lista propia del vertice, ordenada
    vector<int> neighbors; // ids de vecinos (padre, hijos, gemela invertida...)
};

vector<Vertex> build_d4_like_graph() {
    vector<Vertex> g(5);
    g[0] = {0, {2, 8, 15, 23, 31, 40, 55, 61, 70, 88}, {1, 2, 3, 4}};
    g[1] = {1, {3, 5, 12, 26, 34, 45, 58, 66, 75, 91}, {0}};
    g[2] = {2, {4, 9, 13, 18, 22, 36, 49, 63, 77, 95}, {0}};
    g[3] = {3, {1, 6, 14, 21, 33, 47, 59, 68, 82, 90}, {0}}; // gemela invertida, mitad A
    g[4] = {4, {7, 11, 17, 20, 29, 41, 52, 60, 80, 99}, {0}}; // gemela invertida, mitad B
    return g;
}

int main() {
    auto g = build_d4_like_graph();
    for (const auto& v : g) {
        cout << "vertice " << v.id << ": " << v.values.size()
             << " elementos, " << v.neighbors.size() << " vecinos\n";
    }
    return 0;
}
