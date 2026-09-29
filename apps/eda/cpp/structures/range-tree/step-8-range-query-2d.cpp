// Paso 8 — Consulta de rango 2D: una consulta 1D en X que, por cada
// subárbol canónico, dispara otra consulta 1D en su secundario de Y
// (Sem4_Orthogonal_Range_Search.pdf#50: "una consulta de O(log n) en
// O(log n) árboles"). `canonical`/`collectLeaves` son los del paso 4,
// reutilizados tal cual sobre CUALQUIER árbol (primario o secundario):
// ambos sólo miran loKey/hiKey/maxLeft, sin importar qué coordenada
// representen.

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
    Node* nextDim = nullptr;
};

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

// ranges[dim] = [l, r] de la dimensión `dim`. dim empieza en 0 (X).
vector<Point> rangeQuery(Node* root, const vector<pair<long, long>>& ranges, int dim = 0) {
    vector<Node*> canon = canonical(root, ranges[dim].first, ranges[dim].second);
    vector<Point> result;
    if (dim + 1 == (int)ranges.size()) {
        for (Node* n : canon) collectLeaves(n, result);
    } else {
        for (Node* n : canon) {
            vector<Point> sub = rangeQuery(n->nextDim, ranges, dim + 1);
            result.insert(result.end(), sub.begin(), sub.end());
        }
    }
    return result;
}

// Consulta 2D concreta: caja [x1,x2] x [y1,y2].
vector<Point> rangeQuery2D(Node* rootX, long x1, long x2, long y1, long y2) {
    return rangeQuery(rootX, {{x1, x2}, {y1, y2}});
}
