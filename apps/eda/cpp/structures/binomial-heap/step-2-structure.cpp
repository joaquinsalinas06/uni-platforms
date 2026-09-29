// Paso 2 — la estructura y su invariante.
// Un montículo binomial es una LISTA DE RAÍCES: a lo mucho un árbol B_k por
// cada orden k, ordenados por grado ascendente. Con n nodos hay a lo mucho
// floor(lg n) + 1 raíces (tantas como bits en la representación binaria de
// n) — de ahí que Union se piense como una suma binaria con acarreo.
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
    // head de la lista de raíces, ordenada por grado ascendente. nullptr
    // si el montículo está vacío (caso límite: ningún árbol).
    Node* head = nullptr;
};
