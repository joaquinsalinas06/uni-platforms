// Paso 1 — el nodo del splay tree: mismos tres punteros del modelo BST
// (padre, izquierdo, derecho, ver bst-computational-model). Ningún campo
// de balance extra: el splay tree no necesita altura ni color, sólo el
// orden de un BST.

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;

    explicit Node(int v) : value(v) {}
};
