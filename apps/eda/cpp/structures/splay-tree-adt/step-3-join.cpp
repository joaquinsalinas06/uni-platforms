// Paso 3 — Unir(A, B) (#17). Precondición: todo valor de A es menor que
// todo valor de B.
//
// La clave: se desciende por la derecha de A hasta el máximo m, se hace
// Splay(m) — y como m era el máximo, al llegar a la raíz de A NO tiene
// hijo derecho. Ese hueco es exactamente donde entra B.

#include "step-2-split.cpp"

Node* join(Node* A, Node* B) {
    if (A == nullptr) return B;
    if (B == nullptr) return A;

    Node* v = A;
    while (v->right != nullptr) v = v->right;

    splay(A, v);  // v = m, ahora raíz de A — y sin hijo derecho.

    v->right = B;
    B->parent = v;
    return v;
}
