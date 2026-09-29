// Planar Point Location — paso 3: locate por fuerza bruta.
// Prueba cada cara en orden; si ninguna contiene al punto, la respuesta es
// la cara infinita (#64), no un error.
#include <string>
#include <vector>

struct Point {
    double x;
    double y;
};

struct Face {
    std::string label;
    std::vector<Point> polygon;
};

const std::string INFINITE_FACE = "region-infinita";

bool pointInPolygon(const Point& p, const std::vector<Point>& polygon) {
    bool inside = false;
    int n = static_cast<int>(polygon.size());
    for (int i = 0, j = n - 1; i < n; j = i++) {
        const Point& a = polygon[i];
        const Point& b = polygon[j];
        bool straddles = (a.y > p.y) != (b.y > p.y);
        if (straddles) {
            double xCross = a.x + (p.y - a.y) * (b.x - a.x) / (b.y - a.y);
            if (p.x < xCross) {
                inside = !inside;
            }
        }
    }
    return inside;
}

// ponytail: O(F * V) — F caras, V vertices por cara. Es la linea base que
// la cadena de reducciones del mazo viene a mejorar (rayo vertical, barrido,
// BBST persistente); no es la cota que da el profesor para "locate".
std::string locateBruteForce(const Point& p, const std::vector<Face>& faces) {
    for (const Face& face : faces) {
        if (pointInPolygon(p, face.polygon)) {
            return face.label;
        }
    }
    return INFINITE_FACE;
}
