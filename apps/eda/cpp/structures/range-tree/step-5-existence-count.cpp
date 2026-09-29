// Paso 5 — Existencia / Conteo: sumar los contadores de los subárboles
// canónicos, sin bajar a ninguna hoja (Sem4_Orthogonal_Range_Search.pdf#37).

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

bool existsQuery(Node* root, long l, long r) {
    return !canonical(root, l, r).empty();
}

long countQuery(Node* root, long l, long r) {
    long total = 0;
    for (Node* n : canonical(root, l, r)) total += n->count;
    return total;
}
