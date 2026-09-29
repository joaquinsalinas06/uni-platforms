// Paso 4 — Insertar(k) (#18). En pocas líneas, y sin ningún recorrido
// adicional del árbol: Buscar(k) ya dejó al predecesor o sucesor de k en
// la raíz, Separar lo parte en dos, y x se cuelga encima.

#include "step-3-join.cpp"

void insert(Node*& root, int k) {
    if (search(root, k)) return;  // k ya estaba en el árbol

    std::pair<Node*, Node*> parts = split(root, k);
    Node* I = parts.first;
    Node* D = parts.second;

    Node* x = new Node(k);
    x->left = I;
    if (I != nullptr) I->parent = x;
    x->right = D;
    if (D != nullptr) D->parent = x;

    root = x;
}
