// Paso 4 — Find-Min: recorrer la lista de raíces buscando la menor llave.
// No hace falta más estructura que la del paso 2: el mínimo del montículo
// siempre es la llave de alguna raíz (la propiedad de min-heap de cada
// árbol B_k garantiza que ningún nodo interno es menor que su raíz).
#include <climits>

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

// nullptr si el montículo está vacío.
Node* findMin(const BinomialHeap& h) {
    Node* best = nullptr;
    for (Node* x = h.head; x != nullptr; x = x->sibling) {
        if (best == nullptr || x->key < best->key) best = x;
    }
    return best;
}
