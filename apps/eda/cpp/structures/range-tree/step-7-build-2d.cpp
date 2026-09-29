// Paso 7 — Construcción 2D: cada nodo del árbol primario (en X) cuelga un
// range tree secundario (en Y) sobre los puntos de su propio subárbol
// (Sem4_Orthogonal_Range_Search.pdf#46-47,54).
//
// Simplificación respecto al texto: el profesor arma cada secundario en
// O(n) mezclando los de sus dos hijos (#54); aquí se reordena el subárbol
// por Y en cada nodo (O(m log m) por nodo, O(n log^2 n) construcción
// total en vez de O(n log n)). El árbol resultante es idéntico — sólo
// cambia el costo de construirlo, no la estructura ni las consultas.

#include <vector>
#include <algorithm>
using namespace std;

using Point = vector<long>; // {x, y}

struct Node {
    bool leaf = false;
    Point pt;
    long maxLeft = 0;
    long loKey = 0, hiKey = 0;
    int count = 0;
    Node* left = nullptr;
    Node* right = nullptr;
    Node* nextDim = nullptr; // range tree en Y, solo en el árbol primario
};

// dim: coordenada por la que este nivel está ordenado (0=X, 1=Y, ...).
// totalDims: dimensiones totales del problema (1 en 1D, 2 en 2D).
Node* buildRec(const vector<Point>& sortedByDim, int lo, int hi, int dim, int totalDims);

Node* buildRangeTree(vector<Point> pts, int dim, int totalDims) {
    sort(pts.begin(), pts.end(), [dim](const Point& a, const Point& b) {
        return a[dim] < b[dim];
    });
    return buildRec(pts, 0, (int)pts.size(), dim, totalDims);
}

Node* buildRec(const vector<Point>& sortedByDim, int lo, int hi, int dim, int totalDims) {
    Node* n = new Node();
    if (hi - lo == 1) {
        n->leaf = true;
        n->pt = sortedByDim[lo];
        n->loKey = n->hiKey = sortedByDim[lo][dim];
        n->count = 1;
    } else {
        int mid = lo + (hi - lo) / 2;
        n->left  = buildRec(sortedByDim, lo, mid, dim, totalDims);
        n->right = buildRec(sortedByDim, mid, hi, dim, totalDims);
        n->count = n->left->count + n->right->count;
        n->loKey = n->left->loKey;
        n->hiKey = n->right->hiKey;
        n->maxLeft = sortedByDim[mid - 1][dim];
    }
    if (dim + 1 < totalDims) {
        vector<Point> subset(sortedByDim.begin() + lo, sortedByDim.begin() + hi);
        n->nextDim = buildRangeTree(subset, dim + 1, totalDims);
    }
    return n;
}

// Construcción 2D concreta: árbol primario en X (dim=0), cada nodo con un
// secundario en Y (dim=1) colgado en ->nextDim.
Node* buildRangeTree2D(vector<Point> pts) { return buildRangeTree(pts, 0, 2); }
