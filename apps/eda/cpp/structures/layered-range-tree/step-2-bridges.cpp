// Paso 2 — construccion de los puentes durante el merge.
// Agrega, sobre el paso 1, dos arreglos por nodo: bridgeL/bridgeR. La
// posicion i del arreglo del nodo apunta, en O(1), a su posicion
// equivalente en el arreglo de cada hijo.
//
// Se calculan con DOS PUNTEROS (no con lower_bound por elemento): como el
// arreglo del nodo esta ordenado, los punteros pl/pr solo avanzan hacia
// adelante al recorrerlo de izquierda a derecha -- el mismo costo O(tamano
// del nodo) que el propio merge, no un factor de busqueda binaria extra.
//
// Cada arreglo de puentes tiene un CENTINELA en la ultima posicion
// (tamano del nodo, no tamano del nodo - 1): bridgeL[tamano] =
// tamano(hijo izquierdo). Sin el, una busqueda que cae despues del ultimo
// elemento de un hijo no tendria a donde apuntar.

#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct LayeredRangeTree {
    int n;
    vector<vector<int>> ys;
    vector<vector<int>> bridgeL, bridgeR;

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
        int size = (int)left.size() + (int)right.size();
        ys[node].resize(size);
        merge(left.begin(), left.end(), right.begin(), right.end(), ys[node].begin());

        // Dos punteros que nunca retroceden -- exactamente los indices
        // pL y pR que ya usaria el propio proceso de merge.
        bridgeL[node].resize(size + 1);
        bridgeR[node].resize(size + 1);
        int pl = 0, pr = 0;
        for (int i = 0; i < size; i++) {
            while (pl < (int)left.size() && left[pl] < ys[node][i]) pl++;
            while (pr < (int)right.size() && right[pr] < ys[node][i]) pr++;
            bridgeL[node][i] = pl;
            bridgeR[node][i] = pr;
        }
        bridgeL[node][size] = (int)left.size();  // centinela
        bridgeR[node][size] = (int)right.size();  // centinela
    }

    explicit LayeredRangeTree(vector<pair<int,int>> points) : n((int)points.size()) {
        sort(points.begin(), points.end());
        int cap = 4 * max(n, 1);
        ys.assign(cap, {});
        bridgeL.assign(cap, {});
        bridgeR.assign(cap, {});
        if (n > 0) build(1, 0, n, points);
    }
};

int main() {
    // El ejemplo del material: padre [3,5,8,9], hijo izq [3,8], hijo der [5,9].
    LayeredRangeTree t({{1,3}, {2,8}, {3,5}, {4,9}});
    cout << "raiz: ";
    for (int y : t.ys[1]) cout << y << ' ';
    cout << "\nbridgeL(raiz): ";
    for (int b : t.bridgeL[1]) cout << b << ' ';
    cout << "\nbridgeR(raiz): ";
    for (int b : t.bridgeR[1]) cout << b << ' ';
    cout << '\n';
}
