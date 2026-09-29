// Paso 2 — rotate genérico: promueve x sobre SU padre actual, decidiendo
// left/right rotation según de qué lado cuelga x. Es la misma primitiva
// O(1) de bst-computational-model/operations/rotate; aquí se generaliza
// para no tener que escribir rotateLeft/rotateRight por separado, porque
// zig, zig-zig y zig-zag se construyen llamando a esta única función sobre
// distintos nodos en distinto orden.

#include "step-1-node.cpp"

void rotate(Node*& root, Node* x) {
    Node* p = x->parent;
    Node* g = p->parent;

    if (x == p->left) {
        // Right rotation: x sube, p baja a ser hijo derecho de x.
        p->left = x->right;
        if (x->right != nullptr) x->right->parent = p;
        x->right = p;
    } else {
        // Left rotation: caso simétrico.
        p->right = x->left;
        if (x->left != nullptr) x->left->parent = p;
        x->left = p;
    }

    p->parent = x;
    x->parent = g;
    if (g == nullptr) {
        root = x;
    } else if (g->left == p) {
        g->left = x;
    } else {
        g->right = x;
    }
}
