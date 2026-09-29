// Paso 1 — el nodo, nada más.
// Cada nodo de un montículo binomial vive dentro de un árbol binomial B_k
// (ver /structures/binomial-tree). Necesita cuatro punteros: al padre, al
// primer hijo, al siguiente hermano (los hijos de un nodo forman una lista
// enlazada), y su grado (número de hijos).
#include <climits>

struct Node {
    int key;
    int degree = 0;
    Node* parent = nullptr;
    Node* child = nullptr;
    Node* sibling = nullptr;

    explicit Node(int k) : key(k) {}
};
