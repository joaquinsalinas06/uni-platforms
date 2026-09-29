// Paso 3 — las tres variantes de consulta, por FUERZA BRUTA.
//
// Esto es a propósito la línea de base ingenua: revisar los n puntos uno
// por uno, sin ningún preprocesamiento ni orden. Es contra este O(n) que
// compite toda la semana 4 (range-tree, y luego layered-range-tree bajan
// el termino log n, pero ninguno mejora el "+k" de enumeracion, que es
// inherente al tamaño de la respuesta).
//
// Nótese que, a diferencia del arreglo ordenado de theory.md, la fuerza
// bruta NO es output-sensitive en enumeracion: revisa los n puntos sin
// importar cuantos esten dentro de la caja.

#include <iostream>
#include <vector>

struct Point {
    double x;
    double y;
};

struct Box {
    double xl, xr;
    double yl, yr;
};

bool in_box(const Point& p, const Box& b) {
    return p.x >= b.xl && p.x <= b.xr &&
           p.y >= b.yl && p.y <= b.yr;
}

// Existencia: O(n) peor caso (podria cortar en el primer hallazgo, pero
// sigue siendo O(n) en el peor caso, cuando la caja esta vacia).
bool existence(const std::vector<Point>& pts, const Box& b) {
    for (const auto& p : pts) {
        if (in_box(p, b)) return true;
    }
    return false;
}

// Conteo: O(n), revisa cada punto exactamente una vez.
int count(const std::vector<Point>& pts, const Box& b) {
    int c = 0;
    for (const auto& p : pts) {
        if (in_box(p, b)) ++c;
    }
    return c;
}

// Enumeracion: O(n), revisa cada punto exactamente una vez (no O(k):
// no hay forma de saltar directo a los puntos de la respuesta sin orden).
std::vector<Point> enumeration(const std::vector<Point>& pts, const Box& b) {
    std::vector<Point> result;
    for (const auto& p : pts) {
        if (in_box(p, b)) result.push_back(p);
    }
    return result;
}

int main() {
    std::vector<Point> pts = {
        {3, 10}, {4, 7}, {7, 11}, {9, 6}, {13, 0}, {15, -2}, {18, 3}, {27, 1},
    };
    Box b{5, 16, -3, 8};

    std::cout << "existencia: " << (existence(pts, b) ? "si" : "no") << "\n";
    std::cout << "conteo: " << count(pts, b) << "\n";
    std::cout << "enumeracion: ";
    for (const auto& p : enumeration(pts, b)) {
        std::cout << "(" << p.x << "," << p.y << ") ";
    }
    std::cout << "\n";
    return 0;
}
