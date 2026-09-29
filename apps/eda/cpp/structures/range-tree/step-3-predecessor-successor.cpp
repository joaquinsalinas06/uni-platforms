// Paso 3 — Predecessor / Successor sobre el árbol de llaves-en-las-hojas.
//
// Se descubre en O(log n) descendiendo con la misma regla de build-1d
// (comparar contra el máximo del subárbol izquierdo), y luego se usa el
// índice in-order de la hoja alcanzada para leer su vecina inmediata
// (Sem4_Orthogonal_Range_Search.pdf#31) — O(1) extra, no otro descenso.

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

// Ahora build1D también llena `leaves` en orden in-order (posición = leafIndex).
Node* build1D(const vector<Point>& sortedByKey, int lo, int hi, vector<Node*>& leaves) {
    Node* n = new Node();
    if (hi - lo == 1) {
        n->leaf = true;
        n->pt = sortedByKey[lo];
        n->loKey = n->hiKey = sortedByKey[lo][0];
        n->count = 1;
        n->leafIndex = (int)leaves.size();
        leaves.push_back(n);
        return n;
    }
    int mid = lo + (hi - lo) / 2;
    n->left  = build1D(sortedByKey, lo, mid, leaves);
    n->right = build1D(sortedByKey, mid, hi, leaves);
    n->count = n->left->count + n->right->count;
    n->loKey = n->left->loKey;
    n->hiKey = n->right->hiKey;
    n->maxLeft = sortedByKey[mid - 1][0];
    return n;
}

Node* buildRangeTree1D(vector<long> keys, vector<Node*>& leavesOut) {
    sort(keys.begin(), keys.end());
    vector<Point> pts;
    for (long k : keys) pts.push_back({k});
    return build1D(pts, 0, (int)pts.size(), leavesOut);
}

// Devuelve (Predecessor(x), Successor(x)); nullptr si no existe ese lado.
pair<Node*, Node*> predecessorSuccessor(Node* root, const vector<Node*>& leaves, long x) {
    Node* v = root;
    while (!v->leaf) v = (x <= v->maxLeft) ? v->left : v->right;
    if (v->pt[0] <= x) {
        Node* succ = (v->leafIndex + 1 < (int)leaves.size()) ? leaves[v->leafIndex + 1] : nullptr;
        return {v, succ};
    }
    Node* pred = (v->leafIndex - 1 >= 0) ? leaves[v->leafIndex - 1] : nullptr;
    return {pred, v};
}
