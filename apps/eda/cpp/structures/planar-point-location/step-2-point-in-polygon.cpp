// Planar Point Location — paso 2: test de punto en poligono por conteo de
// cruces. Es el oraculo de fuerza bruta que "locate" usara cara por cara.
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

// Conteo de cruces (crossing number): lanza un rayo horizontal hacia +x
// desde p y cuenta cuantas aristas del poligono cruza. Un numero impar de
// cruces significa "dentro".
bool pointInPolygon(const Point& p, const std::vector<Point>& polygon) {
    bool inside = false;
    int n = static_cast<int>(polygon.size());
    for (int i = 0, j = n - 1; i < n; j = i++) {
        const Point& a = polygon[i];
        const Point& b = polygon[j];
        // La arista (a,b) cruza el rayo horizontal a la altura p.y si un
        // extremo esta estrictamente arriba y el otro estrictamente abajo
        // (o igual), y si la interseccion en x cae a la derecha de p.x.
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
