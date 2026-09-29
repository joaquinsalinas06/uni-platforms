// Paso 2 — pointer-move instrumentado. La única forma de moverse por el
// árbol es a través de uno de los tres punteros del nodo (#19); cada
// llamada cuenta como un pointer-move de costo O(1).

#include "step-1-node.cpp"

enum class Dir { Parent, Left, Right };

struct Cost {
    long pointerMoves = 0;
    long rotations = 0;
};

// pointer-move: O(1) postulado por el profesor (#19), no derivado.
Node* moverA(Node* v, Dir dir, Cost& cost) {
    cost.pointerMoves++;
    switch (dir) {
        case Dir::Parent: return v->parent;
        case Dir::Left:   return v->left;
        case Dir::Right:  return v->right;
    }
    return nullptr;
}
