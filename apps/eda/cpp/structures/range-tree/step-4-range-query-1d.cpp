// Paso 4 — Consulta de rango 1D: la descomposición canónica.
//
// `canonical` es una formulación equivalente a la de operations/range-query-1d.md
// (que camina desde P = LCA(Predecessor(l1), Successor(r1))): en vez de
// calcular P explícitamente, cada nodo ya sabe los extremos (loKey/hiKey)
// de su propio subárbol, así que basta comparar esos extremos contra
// [l1,r1] para decidir "entero adentro" (se agrega, es canónico), "entero
// afuera" (se descarta) o "a caballo" (se sigue bajando). Produce
// exactamente los mismos O(log n) subárboles canónicos disjuntos.

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

// Devuelve los O(log n) subárboles canónicos cuya unión son los puntos en [l, r].
vector<Node*> canonical(Node* v, long l, long r) {
    if (!v || v->hiKey < l || v->loKey > r) return {};        // enteramente afuera
    if (l <= v->loKey && v->hiKey <= r) return {v};            // enteramente adentro: canónico
    vector<Node*> res = canonical(v->left, l, r);               // a caballo: seguir bajando
    vector<Node*> right = canonical(v->right, l, r);
    res.insert(res.end(), right.begin(), right.end());
    return res;
}

void collectLeaves(Node* v, vector<Point>& out) {
    if (!v) return;
    if (v->leaf) { out.push_back(v->pt); return; }
    collectLeaves(v->left, out);
    collectLeaves(v->right, out);
}

vector<Point> rangeQuery1D(Node* root, long l, long r) {
    vector<Point> result;
    for (Node* n : canonical(root, l, r)) collectLeaves(n, result);
    return result;
}
