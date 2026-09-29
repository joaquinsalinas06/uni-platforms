// Paso 2 — la caja y la prueba de pertenencia.
//
// Una caja es el producto cartesiano de d intervalos: [xl, xr] x [yl, yr]
// en este caso 2D. Un punto está dentro si CADA coordenada cae en su
// intervalo correspondiente, de forma independiente — es literalmente la
// definición del profesor (#7), no un algoritmo inventado.

#include <iostream>

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

int main() {
    Point p{9.0, 6.0};
    Box b{5.0, 16.0, -3.0, 8.0};
    std::cout << "¿(" << p.x << ", " << p.y << ") esta en la caja? "
              << (in_box(p, b) ? "si" : "no") << "\n";
    return 0;
}
