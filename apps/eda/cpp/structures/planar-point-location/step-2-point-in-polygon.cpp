// Planar Point Location — paso 2: test de punto en poligono por conteo de
// cruces. Es el oraculo de fuerza bruta que "locate" usara cara por cara.
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

// Conteo de cruces (crossing number): lanza un rayo horizontal hacia +x
// desde p y cuenta cuantas aristas del poligono cruza. Un numero impar de
// cruces significa "dentro".
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
