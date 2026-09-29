// Paso 1 — el nodo del modelo: tres punteros (padre, izquierdo, derecho),
// exactamente los que pide el material (#16). Nada de contadores todavía.

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;

    explicit Node(int v) : value(v) {}
};
