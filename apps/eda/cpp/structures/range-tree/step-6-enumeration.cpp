// Paso 6 — Enumeración: recorrer las hojas de cada subárbol canónico
// (Sem4_Orthogonal_Range_Search.pdf#38). `enumerateUpTo` se detiene en
// cuanto junta k resultados, sin tener que recorrer un subárbol completo.

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
    Node* left = nullptr;
    Node* right = nullptr;
};

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
    n->maxLeft = sortedByKey[mid - 1][0];
    return n;
}

Node* buildRangeTree1D(vector<long> keys) {
    sort(keys.begin(), keys.end());
    vector<Point> pts;
    for (long k : keys) pts.push_back({k});
    return build1D(pts, 0, (int)pts.size());
}

vector<Node*> canonical(Node* v, long l, long r) {
    if (!v || v->hiKey < l || v->loKey > r) return {};
    if (l <= v->loKey && v->hiKey <= r) return {v};
    vector<Node*> res = canonical(v->left, l, r);
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

vector<Point> enumerateUpTo(Node* root, long l, long r, size_t k) {
    vector<Point> result;
    for (Node* n : canonical(root, l, r)) {
        collectLeaves(n, result);
        if (result.size() >= k) { result.resize(k); return result; }
    }
    return result;
}
