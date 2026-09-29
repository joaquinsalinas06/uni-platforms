// D2 -- acotar x (Sem5_Fractional_Cascading_II.pdf#32-34).
//
// "Un BST estandar sobre x. Cada nodo guarda, para los puntos de su
// subarbol, una copia de la estructura de dominancia (D1) que acabamos de
// construir." (#33) -- "La consulta usa la descomposicion canonica de
// siempre: los O(lg n) nodos canonicos de [x1, x2], disparando una
// consulta de dominancia en cada uno." (#34)
//
// La D1 satelite de cada nodo se implementa aqui de forma simplificada
// (filtro lineal sobre los puntos del subarbol): D1 (dominance-2d) es
// alcance de otro agente y este archivo no la reimplementa, solo demuestra
// la composicion "BST sobre x x consulta de dominancia por nodo canonico"
// que el profesor describe en #32-34.
//
// Verificacion: fuerza bruta (filtrar los puntos que cumplen las tres
// condiciones directamente) sobre el mismo conjunto de puntos, para varias
// cajas [x1,x2] x (-inf,b2] x (-inf,b3), incluyendo casos limite.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <vector>
using namespace std;

struct Point {
    long x, y, z;
    bool operator<(const Point& o) const {
        return tie(x, y, z) < tie(o.x, o.y, o.z);
    }
    bool operator==(const Point& o) const {
        return tie(x, y, z) == tie(o.x, o.y, o.z);
    }
};

struct Node {
    Point p;
    vector<Point> subtreeD1; // "copia de D1" satelite (#33), simplificada.
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

// D2::build (#33) -- BST estandar sobre x, D1 satelite por nodo.
Node* build(vector<Point> pts) {
    sort(pts.begin(), pts.end(), [](const Point& a, const Point& b) { return a.x < b.x; });
    Node* root = buildBST(pts, 0, (int)pts.size() - 1);
    fillD1(root);
    return root;
}

// Consulta de dominancia (-inf, b2] x (-inf, b3) sobre una D1 satelite.
void dominanceQuery(const vector<Point>& d1, long b2, long b3, vector<Point>& out) {
    for (const auto& p : d1)
        if (p.y <= b2 && p.z <= b3) out.push_back(p);
}

// D2::query (#34) -- descomposicion canonica de [x1,x2] sobre el BST de x,
// una consulta de dominancia por nodo canonico.
void query(Node* n, long x1, long x2, long b2, long b3, vector<Point>& out) {
    if (!n) return;
    if (n->minX >= x1 && n->maxX <= x2) {
        dominanceQuery(n->subtreeD1, b2, b3, out);
        return;
    }
    if (n->p.x >= x1 && n->p.x <= x2) {
        vector<Point> self = {n->p};
        dominanceQuery(self, b2, b3, out);
    }
    if (x1 <= n->p.x) query(n->left, x1, x2, b2, b3, out);
    if (x2 >= n->p.x) query(n->right, x1, x2, b2, b3, out);
}

// Fuerza bruta: filtra directamente sobre el conjunto de puntos original.
vector<Point> bruteForce(const vector<Point>& pts, long x1, long x2, long b2, long b3) {
    vector<Point> out;
    for (const auto& p : pts)
        if (p.x >= x1 && p.x <= x2 && p.y <= b2 && p.z <= b3) out.push_back(p);
    return out;
}

set<Point> asSet(vector<Point> v) { return set<Point>(v.begin(), v.end()); }

void checkQuery(Node* root, const vector<Point>& pts, long x1, long x2, long b2, long b3, const string& label) {
    vector<Point> got;
    query(root, x1, x2, b2, b3, got);
    auto expected = asSet(bruteForce(pts, x1, x2, b2, b3));
    assert(asSet(got) == expected);
    cout << "OK  " << label << " -> " << expected.size() << " punto(s), coincide con fuerza bruta\n";
}

int main() {
    // Conjunto normal (el mismo derivado en examples.md / operations/*.md).
    vector<Point> pts = {{1, 5, 4}, {3, 2, 6}, {4, 8, 1}, {6, 1, 9}};
    Node* root = build(pts);

    // 1) build: cada nodo guarda D1 sobre exactamente los puntos de su subarbol.
    assert(root->subtreeD1.size() == pts.size());
    cout << "OK  build: la D1 satelite de la raiz cubre los " << pts.size() << " puntos\n";

    // 2) query, caso normal: rango de x que parte el conjunto a la mitad.
    checkQuery(root, pts, 2, 6, 6, 10, "query normal [2,6] x (-inf,6] x (-inf,10]");

    // 3) query, caso limite: rango de x vacio (ningun punto).
    checkQuery(root, pts, 100, 200, 100, 100, "query limite: rango de x sin puntos");

    // 4) query, caso limite: x1 = x2 (un solo valor de x).
    checkQuery(root, pts, 4, 4, 100, 100, "query limite: x1 = x2 = 4");

    // 5) query, caso limite: dominancia vacia (b2, b3 excluyen todo).
    checkQuery(root, pts, 1, 6, 0, 0, "query limite: dominancia (b2,b3) que excluye todo");

    // 6) query, caso limite: caja que cubre todo el conjunto.
    checkQuery(root, pts, 1, 6, 100, 100, "query limite: caja que cubre todos los puntos");

    // 7) un solo punto (mastery-check: caso minimo de examples.md).
    vector<Point> one = {{4, 8, 1}};
    Node* rootOne = build(one);
    checkQuery(rootOne, one, 4, 4, 8, 1, "query minimo: un solo punto, exacto");

    cout << "Todas las verificaciones de D2 (build + query) contra fuerza bruta pasaron.\n";
    return 0;
}
