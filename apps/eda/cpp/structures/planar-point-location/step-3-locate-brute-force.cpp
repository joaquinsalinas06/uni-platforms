// Planar Point Location — paso 3: locate por fuerza bruta.
// Prueba cada cara en orden; si ninguna contiene al punto, la respuesta es
// la cara infinita (#64), no un error.
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

using namespace std;

struct Point {
  double x;
  double y;
};

struct Face {
  string label;
  vector<Point> polygon;
};

const string INFINITE_FACE = "region-infinita";

bool onBoundary(const Point& p, const vector<Point>& polygon) {
  for (size_t i = 0; i < polygon.size(); ++i) {
    const Point& a = polygon[i];
    const Point& b = polygon[(i + 1) % polygon.size()];
    double cross = (b.x-a.x)*(p.y-a.y) - (b.y-a.y)*(p.x-a.x);
    double eps = 1e-9;
    if (abs(cross) <= eps * max(1.0, hypot(b.x-a.x, b.y-a.y)) &&
        p.x >= min(a.x,b.x)-eps && p.x <= max(a.x,b.x)+eps &&
        p.y >= min(a.y,b.y)-eps && p.y <= max(a.y,b.y)+eps) return true;
  }
  return false;
}

bool pointInPolygon(const Point& p, const vector<Point>& polygon) {
  if (onBoundary(p, polygon)) return false; // interior estricto
  bool inside = false;
  int n = (int)(polygon.size());
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
string locateBruteForce(const Point& p, const vector<Face>& faces) {
  for (const Face& face : faces) {
    if (onBoundary(p, face.polygon)) return "frontera";
  }
  for (const Face& face : faces) {
    if (pointInPolygon(p, face.polygon)) {
      return face.label;
    }
  }
  return INFINITE_FACE;
}
