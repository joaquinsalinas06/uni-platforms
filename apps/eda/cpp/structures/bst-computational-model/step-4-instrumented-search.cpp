// Paso 4 — Buscar(x) instrumentado (#22-23): una secuencia de pointer-move
// desde la raíz. El modelo asume que x siempre está en el árbol (#24), así
// que no hay caso de "no encontrado".

#include "step-3-instrumented-rotate.cpp"

Node* search(Node* root, int x, Cost& cost) {
    Node* v = root;
    while (v->value != x) {
        v = (x < v->value) ? moverA(v, Dir::Left, cost)
                            : moverA(v, Dir::Right, cost);
    }
    return v;
}
