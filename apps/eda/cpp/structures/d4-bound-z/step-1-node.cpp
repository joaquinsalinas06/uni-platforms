// Paso 1 — el nodo del árbol de rango, sin nada de satélite todavía.
// D_4 (sobre z) y D_3 (sobre y) comparten exactamente este nodo: sólo la
// clave que se guarda cambia (coordenada z para D_4, y para D_3). Por eso
// el nodo no menciona z ni y: guarda una "key" genérica.

#include <cstddef>

struct Point3 {
    double x, y, z;
};

struct RangeTreeNode {
    double key;              // el valor de la coordenada elegida (y o z) en este nodo
    Point3 point;            // el punto asociado a esa clave
    RangeTreeNode* left = nullptr;
    RangeTreeNode* right = nullptr;
};
