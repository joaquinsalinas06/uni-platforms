// Paso 8 — Decrease-Key (Algoritmo 14, diapositiva 27).
// Baja la llave de x y la burbujea hacia la raíz intercambiando con el
// padre mientras rompa el orden de min-heap. x está a profundidad a lo
// mucho k = O(lg n) dentro de su árbol B_k, así que el ciclo hace a lo
// mucho O(lg n) intercambios.
#include <climits>
#include <utility>

struct Node {
    int key;
    int degree = 0;
    Node* parent = nullptr;
    Node* child = nullptr;
    Node* sibling = nullptr;

    explicit Node(int k) : key(k) {}
};

struct BinomialHeap {
    Node* head = nullptr;
};

void binomialLink(Node* y, Node* z) {
    y->parent = z;
    y->sibling = z->child;
    z->child = y;
    z->degree++;
}

void decreaseKey(Node* x, int newKey) {
    x->key = newKey;
    Node* y = x;
    Node* z = y->parent;
    while (z != nullptr && y->key < z->key) {
        std::swap(y->key, z->key);
        y = z;
        z = y->parent;
    }
}
