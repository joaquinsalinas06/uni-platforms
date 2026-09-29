// Paso 3 — la consulta: descomposición canónica en x, una consulta de
// dominancia por nodo canónico.
//
// "La consulta usa la descomposición canónica de siempre: los O(lg n)
// nodos canónicos de [x1, x2], disparando una consulta de dominancia en
// cada uno." (#34)

#include <algorithm>
#include <vector>
using namespace std;

struct Point {
    long x, y, z;
};

struct Node {
    Point p;
    vector<Point> subtreeD1;
    long minX = 0, maxX = 0;
    Node* left = nullptr;
    Node* right = nullptr;
};

Node* buildBST(const vector<Point>& pts, int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    Node* n = new Node();
    n->p = pts[mid];
    n->left = buildBST(pts, lo, mid - 1);
    n->right = buildBST(pts, mid + 1, hi);
    return n;
}

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

// "Copia de D1" satélite: consulta de dominancia (−∞, b2] × (−∞, b3),
// simplificada como filtro lineal sobre subtreeD1 (D1 real = otro agente,
// dominance-2d; esto sólo demuestra la composición, no la reimplementa).
void dominanceQuery(const vector<Point>& d1, long b2, long b3, vector<Point>& out) {
    for (const auto& p : d1)
        if (p.y <= b2 && p.z <= b3) out.push_back(p);
}

// Descomposición canónica de [x1, x2] sobre el BST de x: un subárbol
// completo se toma como nodo canónico -y dispara UNA consulta de
// dominancia- en cuanto [minX, maxX] cae entero dentro de [x1, x2]. Si
// sólo el punto propio de un nodo cae en rango pero el subárbol no cabe
// entero, se consulta ese punto solo y se sigue bajando por ambos lados.
void query(Node* n, long x1, long x2, long b2, long b3, vector<Point>& out) {
    if (!n) return;
    if (n->minX >= x1 && n->maxX <= x2) {
        dominanceQuery(n->subtreeD1, b2, b3, out); // nodo canónico completo.
        return;
    }
    if (n->p.x >= x1 && n->p.x <= x2) {
        vector<Point> self = {n->p};
        dominanceQuery(self, b2, b3, out);
    }
    if (x1 <= n->p.x) query(n->left, x1, x2, b2, b3, out);
    if (x2 >= n->p.x) query(n->right, x1, x2, b2, b3, out);
}
