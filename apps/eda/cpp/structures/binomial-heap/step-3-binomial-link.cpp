// Paso 3 — Binomial-Link: la pieza que usan Union, Insert y Extract-Min.
// Une dos árboles B_{k-1} de igual grado en un solo B_k: la raíz con la
// llave mayor (y) se vuelve el hijo más a la izquierda de la raíz con la
// llave menor (z). Sólo mueve punteros: nunca copia ni recorre nodos.
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

// Precondición: y, z son raíces del mismo grado y key(y) >= key(z).
void binomialLink(Node* y, Node* z) {
    y->parent = z;
    y->sibling = z->child;
    z->child = y;
    z->degree++;
}
