// D3 — nodo de separación. Implementación completa.
//
// Junta los 4 pasos: nodo + satélites (1), construcción (2), localización
// del nodo de separación (3), consulta de dos disparos (4). Verificado
// contra fuerza bruta y contra la propiedad estructural que hace correcto
// a D3: v_split debe ser el nodo MÁS PROFUNDO donde los caminos raíz->a2 y
// raíz->b2 todavía coinciden (Sem5_Fractional_Cascading_II.pdf#40,45).
//
// Compilar: g++ -std=c++20 -Wall full-implementation.cpp -o d3 && ./d3

#include <algorithm>
#include <cassert>
#include <iostream>
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
    // rightSat = D2 normal sobre derecha(v) (ya y >= a2, falta y <= b2).
    // leftSat  = D2' invertida sobre izquierda(v) (ya y <= b2, falta y >= a2).
    std::vector<Point> rightSat;
    std::vector<Point> leftSat;
    bool isLeaf() const { return left == nullptr && right == nullptr; }
};

static void collectPoints(Node* v, std::vector<Point>& out) {
    if (!v) return;
    if (v->isLeaf()) { out.push_back(v->point); return; }
    collectPoints(v->left, out);
    collectPoints(v->right, out);
}

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
    v->key = leftPts.back().y;
    v->left = build(leftPts);
    v->right = build(rightPts);

    collectPoints(v->right, v->rightSat);
    collectPoints(v->left, v->leftSat);
    std::sort(v->rightSat.begin(), v->rightSat.end(),
              [](const Point& a, const Point& b) { return a.x < b.x; });
    std::sort(v->leftSat.begin(), v->leftSat.end(),
              [](const Point& a, const Point& b) { return a.x < b.x; });

    return v;
}

static Node* locateSeparationNode(Node* root, int a2, int b2) {
    Node* v = root;
    while (!v->isLeaf()) {
        if (b2 <= v->key) v = v->left;
        else if (a2 > v->key) v = v->right;
        else return v;
    }
    return v;
}

static std::vector<Point> queryD2Normal(const std::vector<Point>& sat,
                                         int x1, int x2, int b2) {
    std::vector<Point> out;
    auto lo = std::lower_bound(sat.begin(), sat.end(), x1,
        [](const Point& p, int x) { return p.x < x; });
    for (auto it = lo; it != sat.end() && it->x <= x2; ++it) {
        if (it->y <= b2) out.push_back(*it);
    }
    return out;
}

static std::vector<Point> queryD2Inverted(const std::vector<Point>& sat,
                                           int x1, int x2, int a2) {
    std::vector<Point> out;
    auto lo = std::lower_bound(sat.begin(), sat.end(), x1,
        [](const Point& p, int x) { return p.x < x; });
    for (auto it = lo; it != sat.end() && it->x <= x2; ++it) {
        if (it->y >= a2) out.push_back(*it);
    }
    return out;
}

static std::vector<Point> queryD3(Node* root, int x1, int x2, int a2, int b2) {
    Node* v = locateSeparationNode(root, a2, b2);
    std::vector<Point> result;
    if (!v->isLeaf()) {
        auto fromRight = queryD2Normal(v->rightSat, x1, x2, b2);
        auto fromLeft = queryD2Inverted(v->leftSat, x1, x2, a2);
        result.insert(result.end(), fromRight.begin(), fromRight.end());
        result.insert(result.end(), fromLeft.begin(), fromLeft.end());
    } else {
        const Point& p = v->point;
        if (p.x >= x1 && p.x <= x2 && p.y >= a2 && p.y <= b2) {
            result.push_back(p);
        }
    }
    return result;
}

// --- Verificación 1: fuerza bruta -------------------------------------
static std::vector<Point> bruteForce(const std::vector<Point>& pts,
                                      int x1, int x2, int a2, int b2) {
    std::vector<Point> out;
    for (const auto& p : pts) {
        if (p.x >= x1 && p.x <= x2 && p.y >= a2 && p.y <= b2) out.push_back(p);
    }
    return out;
}

static std::vector<int> sortedIds(std::vector<Point> pts) {
    std::vector<int> ids;
    for (const auto& p : pts) ids.push_back(p.id);
    std::sort(ids.begin(), ids.end());
    return ids;
}

// --- Verificación 2: v_split es el nodo MÁS PROFUNDO donde los dos
// caminos raíz->a2 y raíz->b2 todavía coinciden. Esta es la propiedad
// estructural central de D3 (#40): no basta con que el descenso conjunto
// "diga" que encontró el nodo, hay que confirmar la propiedad de manera
// independiente.
static std::vector<Node*> pathTo(Node* root, int key) {
    std::vector<Node*> path;
    Node* v = root;
    path.push_back(v);
    while (!v->isLeaf()) {
        v = (key <= v->key) ? v->left : v->right;
        path.push_back(v);
    }
    return path;
}

static Node* deepestCommonNode(Node* root, int a2, int b2) {
    auto pathA = pathTo(root, a2);
    auto pathB = pathTo(root, b2);
    Node* deepest = root;
    size_t n = std::min(pathA.size(), pathB.size());
    for (size_t i = 0; i < n; ++i) {
        if (pathA[i] != pathB[i]) break;
        deepest = pathA[i];
    }
    return deepest;
}

int main() {
    // Caso normal: 7 puntos, mismos y del ejemplo de examples.md, con x
    // e id agregados para poder verificar la caja completa.
    std::vector<Point> pts = {
        {10, 1, 0}, {70, 3, 1}, {30, 4, 2}, {50, 6, 3},
        {20, 8, 4}, {60, 9, 5}, {40, 11, 6},
    };
    Node* root = build(pts);

    // Verificación A: query(x1,x2,a2,b2) coincide con fuerza bruta, para
    // varias cajas (caso normal y casos límite: caja vacía, caja que
    // cubre todo, separación en la raíz, separación en una hoja).
    struct Case { int x1, x2, a2, b2; };
    std::vector<Case> cases = {
        {0, 100, 4, 8},   // normal: separación en la raíz (ver examples.md)
        {0, 100, -100, 100}, // caja que cubre todo
        {0, 100, 100, 200},  // caja vacía en y
        {0, 100, 11, 11},    // a2 == b2, cae exactamente en una hoja
        {35, 55, 0, 20},     // acota x además de y
    };

    bool allMatch = true;
    for (const auto& c : cases) {
        auto got = sortedIds(queryD3(root, c.x1, c.x2, c.a2, c.b2));
        auto want = sortedIds(bruteForce(pts, c.x1, c.x2, c.a2, c.b2));
        assert(got == want);
        if (got != want) allMatch = false;
    }
    std::cout << "[ok] query(x1,x2,a2,b2) coincide con fuerza bruta en "
              << cases.size() << " casos (normal, caja vacia, caja total, "
                 "a2==b2, acotando x)\n";

    // Verificación B: la propiedad central — v_split es el nodo MÁS
    // PROFUNDO donde los caminos raíz->a2 y raíz->b2 coinciden, para cada
    // caso de arriba (con a2 != b2; el caso a2==b2 no separa caminos).
    int checked = 0;
    for (const auto& c : cases) {
        if (c.a2 == c.b2) continue;
        Node* found = locateSeparationNode(root, c.a2, c.b2);
        Node* expected = deepestCommonNode(root, c.a2, c.b2);
        assert(found == expected);
        ++checked;
    }
    std::cout << "[ok] locateSeparationNode devuelve, en " << checked
              << " casos, exactamente el nodo mas profundo donde los "
                 "caminos raiz->a2 y raiz->b2 coinciden (propiedad #40)\n";

    // Verificación C: en el nodo de separación de la consulta normal,
    // derecha(v_split) ya cumple y >= a2 y izquierda(v_split) ya cumple
    // y <= b2, sin necesidad de filtrar — la razón de por qué basta con
    // una D2 normal y una D2' invertida (#41-42).
    {
        int a2 = 4, b2 = 8;
        Node* v = locateSeparationNode(root, a2, b2);
        bool rightAlreadyGeqA2 = true, leftAlreadyLeqB2 = true;
        for (const auto& p : v->rightSat) if (p.y < a2) rightAlreadyGeqA2 = false;
        for (const auto& p : v->leftSat) if (p.y > b2) leftAlreadyLeqB2 = false;
        assert(rightAlreadyGeqA2 && leftAlreadyLeqB2);
        std::cout << "[ok] derecha(v_split) ya cumple y>=a2 y izquierda(v_split) "
                     "ya cumple y<=b2 sin filtrar (#41-42): solo hace falta un "
                     "filtro por lado, no dos\n";
    }

    (void)allMatch;
    std::cout << "Todo verificado.\n";
    return 0;
}
