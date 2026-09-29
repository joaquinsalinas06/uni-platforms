// Paso 6 — Buscar(k) completo (Sem6 #13): descenso estándar guardando el
// ÚLTIMO nodo visitado, y Splay siempre — del nodo encontrado si k está,
// del último visitado (predecesor o sucesor de k) si no. Devuelve bool.
// Después de la llamada, la raíz es k, o su vecino inmediato: ésa es la
// garantía que usa /structures/splay-tree-adt.
// insertPlain de abajo es andamiaje para construir árboles de prueba;
// Insertar/Eliminar de verdad viven en splay-tree-adt.

#include "step-5-splay.cpp"

bool search(Node*& root, int k) {
    Node* v = root;
    Node* last = nullptr;
    while (v != nullptr) {
        last = v;
        if (k == v->value) {
            splay(root, v);
            return true;
        }
        v = (k < v->value) ? v->left : v->right;
    }
    if (last != nullptr) splay(root, last);
    return false;
}

// Andamiaje: inserción de BST sin balanceo, para construir árboles de
// prueba con las llaves que hagan falta. No es la Insertar del TDA (ésa
// está en /structures/splay-tree-adt, y se construye sobre Buscar+Splay).
Node* insertPlain(Node* root, Node* node) {
    if (root == nullptr) return node;
    Node* v = root;
    while (true) {
        if (node->value < v->value) {
            if (v->left == nullptr) { v->left = node; node->parent = v; break; }
            v = v->left;
        } else {
            if (v->right == nullptr) { v->right = node; node->parent = v; break; }
            v = v->right;
        }
    }
    return root;
}
