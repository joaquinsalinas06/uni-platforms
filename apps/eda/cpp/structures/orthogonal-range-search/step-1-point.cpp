// Paso 1 — el punto, nada más.
//
// Búsqueda ortogonal por rangos trabaja sobre puntos en R^d. Para no
// complicar el ejemplo con d genérico, usamos d = 2 (x, y): es el caso
// donde el problema ya deja de ser trivial (el profesor lo señala en #22:
// un arreglo no se anida bien más allá de una dimensión) y es el mismo
// caso que ilustran las diapositivas 2D del deck (#47).

#include <iostream>

struct Point {
    double x;
    double y;
};

int main() {
    Point p{9.0, 6.0};
    std::cout << "Punto: (" << p.x << ", " << p.y << ")\n";
    return 0;
}
