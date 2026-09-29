// Paso 2 — construir el BST sobre x y llenar la D1 satélite de cada nodo.
//
// "Un BST estándar sobre x. Cada nodo guarda, para los puntos de su
// subárbol, una copia de la estructura de dominancia (D1) que acabamos de
// construir." (#33)

#include <algorithm>
#include <vector>
using namespace std;

struct Point {
    long x, y, z;
};

struct Node {
    Point p;
    vector<Point> subtreeD1;
    long minX = 0, maxX = 0; // rango de x cubierto por el subárbol (para la
                              // descomposición canónica del paso 3).
    Node* left = nullptr;
    Node* right = nullptr;
};

// BST balanceado por mediana (estándar sobre x); pts ya viene ordenado por x.
Node* buildBST(const vector<Point>& pts, int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    Node* n = new Node();
    n->p = pts[mid];
    n->left = buildBST(pts, lo, mid - 1);
    n->right = buildBST(pts, mid + 1, hi);
    return n;
}

// Llena subtreeD1 de cada nodo con los puntos de su subárbol (post-orden) y
// el rango [minX, maxX] que cubre ese subárbol.
void fillD1(Node* n) {
    if (!n) return;
    fillD1(n->left);
    fillD1(n->right);
    n->subtreeD1.push_back(n->p);
    n->minX = n->maxX = n->p.x;
    if (n->left) {
        n->subtreeD1.insert(n->subtreeD1.end(), n->left->subtreeD1.begin(), n->left->subtreeD1.end());
        n->minX = n->left->minX;
    }
    if (n->right) {
        n->subtreeD1.insert(n->subtreeD1.end(), n->right->subtreeD1.begin(), n->right->subtreeD1.end());
        n->maxX = n->right->maxX;
    }
}

Node* build(vector<Point> pts) {
    sort(pts.begin(), pts.end(), [](const Point& a, const Point& b) { return a.x < b.x; });
    Node* root = buildBST(pts, 0, (int)pts.size() - 1);
    fillD1(root);
    return root;
}
