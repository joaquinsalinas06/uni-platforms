// Paso 5 — Eliminar(k) (#19). Buscar(k) deja a k EN LA RAÍZ; sus dos
// hijos ya cumplen la precondición de Unir (todo el subárbol izquierdo es
// menor que todo el derecho) — Unir hace el resto.
//
// Es la única de las cinco con dos llamadas a Splay: una de Buscar y una
// de Unir (#20).

#include "step-4-insert.cpp"

void remove(Node*& root, int k) {
    if (!search(root, k)) return;  // k no está en el árbol

    Node* r = root;
    Node* A = r->left;
    Node* B = r->right;
    if (A != nullptr) A->parent = nullptr;
    if (B != nullptr) B->parent = nullptr;

    root = join(A, B);
    if (root != nullptr) root->parent = nullptr;

    // El pseudocódigo no lo dice (no gestiona memoria); en C++ el nodo
    // desenganchado hay que liberarlo.
    r->left = nullptr;
    r->right = nullptr;
    delete r;
}
