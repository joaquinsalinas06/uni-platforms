// Paso 4 — consulta de dos disparos, un solo nodo.
//
// "Todo derecha(v_split) ya cumple y >= a2 automáticamente: solo falta
// pedir y <= b2 => una consulta a su D2." (#41)
// "Todo izquierda(v_split) ya cumple y <= b2 automáticamente: solo falta
// pedir y >= a2 => una consulta a su D2' (invertida)." (#42)
// "Dos consultas, en un único nodo — no O(lg n) nodos canónicos." (#43)
//
// queryD2Normal / queryD2Inverted son stand-ins funcionalmente correctos
// de D2 / D2' (filtran por x con búsqueda binaria sobre la satélite ya
// ordenada, y por el único lado de y que falta) — no una reimplementación
// de D2 completo (BST sobre x + dominancia D1), que es alcance de otro
// agente.

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

static Node* locateSeparationNode(Node* root, int a2, int b2) {
    Node* v = root;
    while (!v->isLeaf()) {
        if (b2 <= v->key) v = v->left;
        else if (a2 > v->key) v = v->right;
        else return v;
    }
    return v;
}

// D2 normal sobre rightSat(v): ya garantiza y >= a2; sólo falta x en
// [x1,x2] y y <= b2.
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

// D2' invertida sobre leftSat(v): ya garantiza y <= b2; sólo falta x en
// [x1,x2] y y >= a2.
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

// La consulta completa: localizar v_split y disparar los dos tiros.
static std::vector<Point> queryD3(Node* root, int x1, int x2, int a2, int b2) {
    Node* v = locateSeparationNode(root, a2, b2);

    std::vector<Point> result;
    if (!v->isLeaf()) {
        auto fromRight = queryD2Normal(v->rightSat, x1, x2, b2);
        auto fromLeft = queryD2Inverted(v->leftSat, x1, x2, a2);
        result.insert(result.end(), fromRight.begin(), fromRight.end());
        result.insert(result.end(), fromLeft.begin(), fromLeft.end());
    } else {
        // Caso límite no discutido por el profesor: v_split es una hoja
        // (a2 y b2 nunca se separaron). Se resuelve directamente.
        const Point& p = v->point;
        if (p.x >= x1 && p.x <= x2 && p.y >= a2 && p.y <= b2) {
            result.push_back(p);
        }
    }
    return result;
}
