// Implementación completa del range tree: construcción 1D y 2D con llaves
// en las hojas, Predecessor/Successor, descomposición canónica, existencia,
// conteo, enumeración, y el anidamiento a 2D y d dimensiones. Junta los
// pasos 1-9.
//
// main() verifica los resultados contra una búsqueda por fuerza bruta sobre
// los mismos puntos (el mejor oráculo posible para una estructura estática)
// y, además, reproduce a mano los dos diagramas del profesor: la
// construcción 1D (#29), la consulta [5,16] (#35) y el árbol secundario
// del nodo 15 en 2D (#47). Imprime qué verificó.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <vector>

using namespace std;

using Point = vector<long>; // {coord0, coord1, ...}; 1 coord en 1D, 2 en 2D, etc.

struct Node {
    bool leaf = false;
    Point pt;                    // válido solo si leaf: el punto completo (#26: los internos no guardan puntos).
    long maxLeft = 0;            // válido solo si interno: máximo del subárbol izquierdo (#26).
    long loKey = 0, hiKey = 0;   // extremos, en la coordenada de este árbol, del subárbol (para la descomposición canónica).
    int count = 0;               // hojas en el subárbol (existence-count, #37).
    int leafIndex = -1;          // posición in-order; solo se llena en el árbol primario (predecessor-successor, #31).
    Node* left = nullptr;
    Node* right = nullptr;
    Node* nextDim = nullptr;     // range tree de la dimensión siguiente colgado de este nodo (build-2d/d-dimensions, #52).
};

// ---------------------------------------------------------------------
// build-1d / build-2d / d-dimensions: la misma construcción, generalizada
// por `dim` (coordenada actual) y `totalDims` (dimensiones totales).
// ---------------------------------------------------------------------

Node* buildRangeTree(vector<Point> pts, int dim, int totalDims); // fwd

Node* buildRec(const vector<Point>& sortedByDim, int lo, int hi, int dim, int totalDims,
                vector<Node*>* leavesOut) {
    Node* n = new Node();
    if (hi - lo == 1) {
        n->leaf = true;
        n->pt = sortedByDim[lo];
        n->loKey = n->hiKey = sortedByDim[lo][dim];
        n->count = 1;
        if (leavesOut) {
            n->leafIndex = (int)leavesOut->size();
            leavesOut->push_back(n);
        }
    } else {
        int mid = lo + (hi - lo) / 2;
        n->left  = buildRec(sortedByDim, lo, mid, dim, totalDims, leavesOut);
        n->right = buildRec(sortedByDim, mid, hi, dim, totalDims, leavesOut);
        n->count = n->left->count + n->right->count;
        n->loKey = n->left->loKey;
        n->hiKey = n->right->hiKey;
        n->maxLeft = sortedByDim[mid - 1][dim]; // máximo del subárbol izquierdo (#26)
    }
    if (dim + 1 < totalDims) {
        // Construcción del secundario (#46-47,52). Simplificación respecto
        // al texto: el profesor arma cada secundario en O(n) mezclando los
        // de sus hijos (#54); aquí se reordena el subárbol por la siguiente
        // dimensión en cada nodo (O(m log m) por nodo). Mismo árbol
        // resultante, construcción O(n log^2 n) en vez de O(n log n).
        vector<Point> subset(sortedByDim.begin() + lo, sortedByDim.begin() + hi);
        n->nextDim = buildRangeTree(subset, dim + 1, totalDims);
    }
    return n;
}

Node* buildRangeTree(vector<Point> pts, int dim, int totalDims) {
    sort(pts.begin(), pts.end(), [dim](const Point& a, const Point& b) { return a[dim] < b[dim]; });
    return buildRec(pts, 0, (int)pts.size(), dim, totalDims, nullptr);
}

// build-1d concreto: guarda además las hojas in-order, para predecessor-successor.
Node* buildRangeTree1D(vector<long> keys, vector<Node*>& leavesOut) {
    vector<Point> pts;
    for (long k : keys) pts.push_back({k});
    sort(pts.begin(), pts.end(), [](const Point& a, const Point& b) { return a[0] < b[0]; });
    return buildRec(pts, 0, (int)pts.size(), 0, 1, &leavesOut);
}

Node* buildRangeTree2D(vector<Point> pts) { return buildRangeTree(pts, 0, 2); }
Node* buildRangeTree3D(vector<Point> pts) { return buildRangeTree(pts, 0, 3); }

// ---------------------------------------------------------------------
// predecessor-successor
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// range-query-1d / range-query-2d / d-dimensions: descomposición canónica.
// ---------------------------------------------------------------------

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

vector<Point> rangeQuery1D(Node* root, long l, long r) { return rangeQuery(root, {{l, r}}); }
vector<Point> rangeQuery2D(Node* root, long x1, long x2, long y1, long y2) {
    return rangeQuery(root, {{x1, x2}, {y1, y2}});
}

// existence-count (1D)
bool existsQuery(Node* root, long l, long r) { return !canonical(root, l, r).empty(); }
long countQuery(Node* root, long l, long r) {
    long total = 0;
    for (Node* n : canonical(root, l, r)) total += n->count;
    return total;
}

// enumeration: como rangeQuery1D, pero se puede detener a los k resultados.
vector<Point> enumerateUpTo(Node* root, long l, long r, size_t k) {
    vector<Point> result;
    for (Node* n : canonical(root, l, r)) {
        collectLeaves(n, result);
        if (result.size() >= k) { result.resize(k); return result; }
    }
    return result;
}

// ---------------------------------------------------------------------
// Oráculo: búsqueda por fuerza bruta sobre los mismos puntos.
// ---------------------------------------------------------------------

vector<Point> bruteForce(const vector<Point>& pts, const vector<pair<long, long>>& ranges) {
    vector<Point> result;
    for (const Point& p : pts) {
        bool inside = true;
        for (size_t i = 0; i < ranges.size(); i++) {
            if (p[i] < ranges[i].first || p[i] > ranges[i].second) { inside = false; break; }
        }
        if (inside) result.push_back(p);
    }
    return result;
}

bool samePointSet(vector<Point> a, vector<Point> b) {
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    return a == b;
}

int main() {
    // --- 1D: el árbol de la diapositiva #29 ---
    vector<Node*> leaves1D;
    Node* root1D = buildRangeTree1D({3, 4, 7, 9, 13, 15, 18, 27}, leaves1D);

    assert(root1D->maxLeft == 9);           // raíz #29
    assert(root1D->left->maxLeft == 4);     // hijo izquierdo #29
    assert(root1D->right->maxLeft == 15);   // hijo derecho #29
    assert(root1D->left->left->maxLeft == 3);
    assert(root1D->left->right->maxLeft == 7);
    assert(root1D->right->left->maxLeft == 13);
    assert(root1D->right->right->maxLeft == 18);
    cout << "build-1d: árbol reconstruido = diapositiva #29 (raíz 9; hijos 4,15;"
            " siguiente nivel 3,7,13,18)\n";

    // --- predecessor-successor: frontera de la consulta [5,16] ---
    auto [predL, succL] = predecessorSuccessor(root1D, leaves1D, 5);
    auto [predR, succR] = predecessorSuccessor(root1D, leaves1D, 16);
    assert(predL->pt[0] == 4 && succL->pt[0] == 7);
    assert(predR->pt[0] == 15 && succR->pt[0] == 18);
    cout << "predecessor-successor: Predecessor(5)=4, Successor(16)=18"
            " (los delimitadores de la diapositiva #35)\n";

    // --- range-query-1d / existence-count / enumeration: consulta [5,16] (#35) ---
    vector<Node*> canon = canonical(root1D, 5, 16);
    assert(canon.size() == 2);
    assert(canon[0]->maxLeft == 7 && canon[0]->count == 2);   // subárbol canónico "7"
    assert(canon[1]->maxLeft == 13 && canon[1]->count == 2);  // subárbol canónico "13"

    vector<Point> answer = rangeQuery1D(root1D, 5, 16);
    assert(samePointSet(answer, {{7}, {9}, {13}, {15}}));
    assert(existsQuery(root1D, 5, 16));
    assert(countQuery(root1D, 5, 16) == 4);
    assert(!existsQuery(root1D, 28, 100));
    assert(countQuery(root1D, 28, 100) == 0);
    auto firstTwo = enumerateUpTo(root1D, 5, 16, 2);
    assert(firstTwo.size() == 2);
    cout << "range-query-1d/existence-count/enumeration: [5,16] -> subárboles"
            " canónicos {7,13} = hojas {7,9,13,15}, exactamente la diapositiva"
            " #35 (delimitadores 4 y 18 excluidos)\n";

    // Fuzz 1D contra fuerza bruta.
    {
        vector<long> keys = {3, 4, 7, 9, 13, 15, 18, 27};
        vector<Point> pts1D;
        for (long k : keys) pts1D.push_back({k});
        mt19937 rng(42);
        uniform_int_distribution<long> dist(0, 30);
        for (int t = 0; t < 200; t++) {
            long a = dist(rng), b = dist(rng);
            if (a > b) swap(a, b);
            auto got = rangeQuery1D(root1D, a, b);
            auto expected = bruteForce(pts1D, {{a, b}});
            assert(samePointSet(got, expected));
            assert(countQuery(root1D, a, b) == (long)expected.size());
            assert(existsQuery(root1D, a, b) == !expected.empty());
        }
    }
    cout << "range-query-1d/existence-count: 200 consultas [a,b] aleatorias"
            " verificadas contra fuerza bruta sobre {3,4,7,9,13,15,18,27}\n";

    // --- 2D: los puntos de la diapositiva #47 ---
    vector<Point> pts2D = {{3, 10}, {4, 7}, {7, 11}, {9, 6}, {13, 0}, {15, -2}, {18, 3}, {27, 1}};
    Node* root2D = buildRangeTree2D(pts2D);

    assert(root2D->maxLeft == 9); // mismo árbol en X que build-1d (#47 reutiliza las llaves de #29)

    // El nodo que cubre {13,15,18,27} en X cuelga el secundario en Y de la diapositiva #47.
    Node* n15 = root2D->right; // subárbol con loKey=13, hiKey=27
    assert(n15->loKey == 13 && n15->hiKey == 27 && n15->count == 4);
    assert(n15->nextDim->maxLeft == 0);              // raíz del secundario: 0 (#47)
    assert(n15->nextDim->left->maxLeft == -2);        // hijo izquierdo: -2 (#47)
    assert(n15->nextDim->right->maxLeft == 1);        // hijo derecho: 1 (#47)
    cout << "build-2d: árbol secundario del nodo 15 = raíz 0, hijos -2 y 1,"
            " exactamente la diapositiva #47\n";

    vector<Point> box2D = rangeQuery2D(root2D, 13, 20, -3, 2);
    assert(samePointSet(box2D, {{13, 0}, {15, -2}}));
    cout << "range-query-2d: caja [13,20]x[-3,2] -> {(13,0),(15,-2)}, verificado"
            " a mano sobre los puntos de la diapositiva #47\n";

    // Fuzz 2D contra fuerza bruta.
    {
        mt19937 rng(7);
        uniform_int_distribution<long> distX(0, 30), distY(-5, 15);
        for (int t = 0; t < 200; t++) {
            long x1 = distX(rng), x2 = distX(rng);
            long y1 = distY(rng), y2 = distY(rng);
            if (x1 > x2) swap(x1, x2);
            if (y1 > y2) swap(y1, y2);
            auto got = rangeQuery2D(root2D, x1, x2, y1, y2);
            auto expected = bruteForce(pts2D, {{x1, x2}, {y1, y2}});
            assert(samePointSet(got, expected));
        }
    }
    cout << "range-query-2d: 200 cajas [x1,x2]x[y1,y2] aleatorias verificadas"
            " contra fuerza bruta sobre los 8 puntos de la diapositiva #47\n";

    // --- d-dimensions: mismo código, d=3, contra fuerza bruta ---
    {
        mt19937 rng(99);
        uniform_int_distribution<long> coord(0, 20);
        vector<Point> pts3D;
        for (int i = 0; i < 24; i++) pts3D.push_back({coord(rng), coord(rng), coord(rng)});
        Node* root3D = buildRangeTree3D(pts3D);

        uniform_int_distribution<long> box(0, 20);
        for (int t = 0; t < 200; t++) {
            long x1 = box(rng), x2 = box(rng), y1 = box(rng), y2 = box(rng), z1 = box(rng), z2 = box(rng);
            if (x1 > x2) swap(x1, x2);
            if (y1 > y2) swap(y1, y2);
            if (z1 > z2) swap(z1, z2);
            auto got = rangeQuery(root3D, {{x1, x2}, {y1, y2}, {z1, z2}});
            auto expected = bruteForce(pts3D, {{x1, x2}, {y1, y2}, {z1, z2}});
            assert(samePointSet(got, expected));
        }
        cout << "d-dimensions: build-2d/range-query-2d reutilizados con"
                " totalDims=3 sobre 24 puntos; 200 cajas [x1,x2]x[y1,y2]x[z1,z2]"
                " aleatorias verificadas contra fuerza bruta\n";
    }

    cout << "\nOK: build-1d, predecessor-successor, range-query-1d,"
            " existence-count, enumeration, build-2d, range-query-2d y"
            " d-dimensions verificados contra los diagramas del profesor"
            " (#29, #35, #47) y contra fuerza bruta.\n";
    return 0;
}
