// Paso 3 — rotate instrumentado. Reasigna un número constante de punteros
// entre n, su padre p y el subárbol B que cambia de lado (#20, figura #21).
// No usa moverA: reasignar punteros no es "moverse", es la otra operación
// de costo O(1) del modelo, y se cuenta aparte.

#include "step-2-instrumented-move.cpp"

// Right Rotation(n): n sube, p baja a ser su hijo derecho.
// Precondición: n es hijo izquierdo de su padre p.
void rotateRight(Node* n, Node*& root, Cost& cost) {
    Node* p = n->parent;
    Node* B = n->right;

    n->right = p;
    p->left = B;
    if (B != nullptr) B->parent = p;

    n->parent = p->parent;
    if (p->parent == nullptr) {
        root = n;
    } else if (p->parent->left == p) {
        p->parent->left = n;
    } else {
        p->parent->right = n;
    }
    p->parent = n;

    cost.rotations++;
}

// Left Rotation(p): caso simétrico. Precondición: n es hijo derecho de p.
void rotateLeft(Node* n, Node*& root, Cost& cost) {
    Node* p = n->parent;
    Node* B = n->left;

    n->left = p;
    p->right = B;
    if (B != nullptr) B->parent = p;

    n->parent = p->parent;
    if (p->parent == nullptr) {
        root = n;
    } else if (p->parent->left == p) {
        p->parent->left = n;
    } else {
        p->parent->right = n;
    }
    p->parent = n;

    cost.rotations++;
}
