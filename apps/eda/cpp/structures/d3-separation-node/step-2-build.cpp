// Paso 2 — construcción: árbol de rango sobre y + las dos satélites por nodo.
//
// Igual que range-tree: ordenar por la clave (aquí y), mediana como raíz,
// recursión en las dos mitades. Lo que agrega D3 es que, en cada nodo con
// hijos, se recolectan los puntos de cada subárbol para sus dos satélites
// (Sem5_Fractional_Cascading_II.pdf#37-39): la de derecha(v) "normal"
// (acotada arriba), la de izquierda(v) "invertida" (acotada abajo).

#include <algorithm>
#include <vector>

struct Point {
    int x;
    int y;
    int id;
};

struct Node {
    int key = 0;
    Point point{};
    Node* left = nullptr;
    Node* right = nullptr;
    std::vector<Point> rightSat;
    std::vector<Point> leftSat;
    bool isLeaf() const { return left == nullptr && right == nullptr; }
};

// Recolecta todos los puntos de un subárbol.
static void collectPoints(Node* v, std::vector<Point>& out) {
    if (!v) return;
    if (v->isLeaf()) {
        out.push_back(v->point);
        return;
    }
    collectPoints(v->left, out);
    collectPoints(v->right, out);
}

// Construye recursivamente el árbol de rango sobre y (mediana como raíz)
// y, en cada nodo interno, sus dos satélites.
static Node* build(std::vector<Point> pts) {
    std::sort(pts.begin(), pts.end(),
              [](const Point& a, const Point& b) { return a.y < b.y; });

    if (pts.size() == 1) {
        Node* leaf = new Node();
        leaf->key = pts[0].y;
        leaf->point = pts[0];
        return leaf;
    }

    size_t mid = pts.size() / 2;
    std::vector<Point> leftPts(pts.begin(), pts.begin() + mid);
    std::vector<Point> rightPts(pts.begin() + mid, pts.end());

    Node* v = new Node();
    v->key = leftPts.back().y; // mayor y del lado izquierdo: el divisor
    v->left = build(leftPts);
    v->right = build(rightPts);

    // Las dos satélites: izquierda(v) ya cumple y <= key(v), derecha(v)
    // ya cumple y > key(v). Se guardan ordenadas por x, como haría un D2.
    collectPoints(v->right, v->rightSat);
    collectPoints(v->left, v->leftSat);
    std::sort(v->rightSat.begin(), v->rightSat.end(),
              [](const Point& a, const Point& b) { return a.x < b.x; });
    std::sort(v->leftSat.begin(), v->leftSat.end(),
              [](const Point& a, const Point& b) { return a.x < b.x; });

    return v;
}
