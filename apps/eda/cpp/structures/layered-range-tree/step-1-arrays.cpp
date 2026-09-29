// Paso 1 — reemplazo del BST secundario por un arreglo ordenado.
// Layout de segment tree (nodo v, hijos 2v/2v+1) sobre los puntos
// ordenados por X, igual que range-tree/build-2d — pero cada nodo guarda
// un arreglo con las Y de su subarbol (no un BST), construido mezclando
// los arreglos de sus dos hijos, como en Merge Sort.
//
// Todavia sin puentes: eso es el paso 2 (bridge-build).

#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct LayeredRangeTree {
    int n;
    vector<vector<int>> ys; // ys[nodo] = Y ordenadas del subarbol de ese nodo

    void build(int node, int lo, int hi, const vector<pair<int,int>>& points) {
        if (hi - lo == 1) {
            ys[node] = {points[lo].second};
            return;
        }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, points);
        build(2 * node + 1, mid, hi, points);

        const auto& left = ys[2 * node];
        const auto& right = ys[2 * node + 1];
        ys[node].resize(left.size() + right.size());
        // El merge de Merge Sort: es todo lo que hace falta para construir
        // el arreglo del nodo a partir de los de sus dos hijos.
        merge(left.begin(), left.end(), right.begin(), right.end(), ys[node].begin());
    }

    explicit LayeredRangeTree(vector<pair<int,int>> points) : n((int)points.size()) {
        sort(points.begin(), points.end());
        ys.assign(4 * max(n, 1), {});
        if (n > 0) build(1, 0, n, points);
    }
};

int main() {
    LayeredRangeTree t({{1,4}, {2,9}, {3,1}, {4,7}});
    // Raiz: union ordenada de todas las Y.
    cout << "arreglo de la raiz: ";
    for (int y : t.ys[1]) cout << y << ' ';
    cout << '\n';
}
