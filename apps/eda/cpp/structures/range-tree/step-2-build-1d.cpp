// Paso 2 — Construcción 1D: ordenar las llaves y armar el árbol de abajo
// hacia arriba, con las llaves como hojas (Sem4_Orthogonal_Range_Search.pdf#24-28).
//
// En vez de emparejar nivel por nivel (como describe operations/build-1d.md
// paso a paso), esta implementación construye por bisección recursiva sobre
// el arreglo ya ordenado: produce exactamente el mismo árbol binario casi
// completo, con el mismo invariante en cada interno (máximo del subárbol
// izquierdo), y es más simple de programar correctamente.

#include <vector>
#include <algorithm>
using namespace std;

using Point = vector<long>;

struct Node {
    bool leaf = false;
    Point pt;
    long maxLeft = 0;
    long loKey = 0, hiKey = 0;
    int count = 0;
    int leafIndex = -1;
    Node* left = nullptr;
    Node* right = nullptr;
    Node* nextDim = nullptr;
};

// sortedByKey[lo..hi) ya está ordenado por su única coordenada.
Node* build1D(const vector<Point>& sortedByKey, int lo, int hi) {
    Node* n = new Node();
    if (hi - lo == 1) {
        n->leaf = true;
        n->pt = sortedByKey[lo];
        n->loKey = n->hiKey = sortedByKey[lo][0];
        n->count = 1;
        return n;
    }
    int mid = lo + (hi - lo) / 2;
    n->left  = build1D(sortedByKey, lo, mid);
    n->right = build1D(sortedByKey, mid, hi);
    n->count = n->left->count + n->right->count;
    n->loKey = n->left->loKey;
    n->hiKey = n->right->hiKey;
    n->maxLeft = sortedByKey[mid - 1][0]; // máximo del subárbol izquierdo (#26)
    return n;
}

Node* buildRangeTree1D(vector<long> keys) {
    sort(keys.begin(), keys.end());
    vector<Point> pts;
    for (long k : keys) pts.push_back({k});
    return build1D(pts, 0, (int)pts.size());
}
