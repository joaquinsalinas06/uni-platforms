// Búsqueda ortogonal por rangos — línea de base por FUERZA BRUTA.
//
// Este archivo no es la estructura que resuelve el problema de la semana:
// es deliberadamente el algoritmo mas simple posible (revisar los n puntos
// uno por uno, sin preprocesamiento ni orden). Sirve para dos cosas:
//
//   1. Establecer el costo O(n) por consulta contra el que compite el
//      resto de la semana (range-tree baja esto a O(log n) / O(log n + k),
//      ver /structures/range-tree).
//   2. Servir de ORACULO: cuando range-tree este implementado, sus
//      resultados sobre el mismo conjunto de puntos deben coincidir
//      exactamente con los de este archivo, sobre cualquier caja.
//
// g++ -std=c++20 -Wall full-implementation.cpp -o orthogonal-range-search
// ./orthogonal-range-search

#include <algorithm>
#include <cassert>
#include <iostream>
#include <vector>

struct Point {
    double x;
    double y;

    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};

struct Box {
    double xl, xr;
    double yl, yr;
};

bool in_box(const Point& p, const Box& b) {
    return p.x >= b.xl && p.x <= b.xr &&
           p.y >= b.yl && p.y <= b.yr;
}

// O(n): revisa cada punto; en el peor caso (caja vacia) recorre los n.
bool existence(const std::vector<Point>& pts, const Box& b) {
    for (const auto& p : pts) {
        if (in_box(p, b)) return true;
    }
    return false;
}

// O(n): siempre revisa los n puntos, sin importar cuantos esten dentro.
int count(const std::vector<Point>& pts, const Box& b) {
    int c = 0;
    for (const auto& p : pts) {
        if (in_box(p, b)) ++c;
    }
    return c;
}

// O(n), no O(k): a diferencia del arreglo ordenado de theory.md, la fuerza
// bruta no puede saltar directo a los puntos de la respuesta.
std::vector<Point> enumeration(const std::vector<Point>& pts, const Box& b) {
    std::vector<Point> result;
    for (const auto& p : pts) {
        if (in_box(p, b)) result.push_back(p);
    }
    return result;
}

bool contains_point(const std::vector<Point>& pts, Point target) {
    return std::find(pts.begin(), pts.end(), target) != pts.end();
}

int main() {
    // Puntos 2D del deck (#47).
    std::vector<Point> pts = {
        {3, 10}, {4, 7}, {7, 11}, {9, 6}, {13, 0}, {15, -2}, {18, 3}, {27, 1},
    };

    // --- Caso normal: caja x en [5,16], y en [-3,8] ---
    // Dentro: (9,6), (13,0), (15,-2). Fuera: el resto (por x o por y).
    Box normal{5, 16, -3, 8};
    assert(existence(pts, normal) == true);
    assert(count(pts, normal) == 3);
    auto enum_normal = enumeration(pts, normal);
    assert(enum_normal.size() == 3);
    assert(contains_point(enum_normal, {9, 6}));
    assert(contains_point(enum_normal, {13, 0}));
    assert(contains_point(enum_normal, {15, -2}));
    std::cout << "OK: caso normal [5,16]x[-3,8] -> existe=si, conteo=3, "
                 "enumeracion={(9,6),(13,0),(15,-2)}\n";

    // --- Caso limite: caja vacia (ningun punto dentro) ---
    Box vacia{100, 200, 100, 200};
    assert(existence(pts, vacia) == false);
    assert(count(pts, vacia) == 0);
    assert(enumeration(pts, vacia).empty());
    std::cout << "OK: caja vacia -> existe=no, conteo=0, enumeracion={} "
                 "(las tres consultas siguen costando O(n): fuerza bruta no "
                 "tiene forma de saber que esta vacia sin revisar todo)\n";

    // --- Caso limite: caja que cubre todos los puntos (k = n) ---
    Box todo{0, 30, -10, 15};
    assert(existence(pts, todo) == true);
    assert(count(pts, todo) == static_cast<int>(pts.size()));
    assert(enumeration(pts, todo).size() == pts.size());
    std::cout << "OK: caja que cubre todo -> conteo=" << pts.size()
              << ", enumeracion devuelve los " << pts.size()
              << " puntos (k=n): el termino '+k' de enumeracion domina, "
                 "igual que en la fuerza bruta\n";

    // --- Caso limite: un solo punto exacto en el borde de la caja ---
    Box borde{13, 13, 0, 0};
    assert(existence(pts, borde) == true);
    assert(count(pts, borde) == 1);
    auto enum_borde = enumeration(pts, borde);
    Point expected_borde{13, 0};
    assert(enum_borde.size() == 1 && enum_borde[0] == expected_borde);
    std::cout << "OK: caja degenerada a un punto (13,0) -> existe=si, "
                 "conteo=1, enumeracion={(13,0)} (bordes inclusivos, [l,r])\n";

    std::cout << "Todas las verificaciones pasaron: existencia, conteo y "
                 "enumeracion coinciden en el mismo conjunto de puntos, "
                 "sirviendo de oraculo O(n) para range-tree.\n";
    return 0;
}
