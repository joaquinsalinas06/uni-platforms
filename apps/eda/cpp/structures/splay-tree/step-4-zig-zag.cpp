// Paso 4 — zig-zag (#66): x y p en lados opuestos respecto de a. Aquí no
// hay distinción de orden como en zig-zig: rotar x dos veces seguidas
// (primero sobre p, luego sobre a) es simplemente correcto, porque las dos
// direcciones opuestas no se refuerzan entre sí.

#include "step-3-zig-zig.cpp"

void zigZag(Node*& root, Node* x) {
    rotate(root, x);   // (x, p)
    rotate(root, x);   // (x, a) — x ya está en la posición de p
}
