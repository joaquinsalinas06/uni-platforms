// Paso 7 — Extract-Min (Algoritmo 9, diapositiva 26).
// 1. Encontrar la raíz x con menor llave (Find-Min).
// 2. Quitarla de la lista de raíces de H.
// 3. Los hijos de x, invertidos, forman la lista de raíces de un H' nuevo
//    (Binomial-Link siempre agrega el hijo más nuevo al frente, así que la
//    lista de hijos queda en orden de grado DEScendente: hay que invertirla
//    para que Union reciba algo ordenado ascendentemente).
// 4. H <- Union(H, H').
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

Node* mergeRootLists(Node* a, Node* b) {
    Node dummy(0);
    Node* tail = &dummy;
    while (a != nullptr && b != nullptr) {
        if (a->degree <= b->degree) { tail->sibling = a; a = a->sibling; }
        else { tail->sibling = b; b = b->sibling; }
        tail = tail->sibling;
    }
    tail->sibling = (a != nullptr) ? a : b;
    return dummy.sibling;
}

BinomialHeap heapUnion(BinomialHeap h1, BinomialHeap h2) {
    BinomialHeap h;
    h.head = mergeRootLists(h1.head, h2.head);
    if (h.head == nullptr) return h;

    Node* prev = nullptr;
    Node* x = h.head;
    Node* next = x->sibling;
    while (next != nullptr) {
        bool thirdSameDegree = (next->sibling != nullptr && next->sibling->degree == x->degree);
        if (x->degree != next->degree || thirdSameDegree) {
            prev = x;
            x = next;
        } else if (x->key <= next->key) {
            x->sibling = next->sibling;
            binomialLink(next, x);
        } else {
            if (prev == nullptr) h.head = next; else prev->sibling = next;
            binomialLink(x, next);
            x = next;
        }
        next = x->sibling;
    }
    return h;
}

Node* findMin(const BinomialHeap& h) {
    Node* best = nullptr;
    for (Node* x = h.head; x != nullptr; x = x->sibling) {
        if (best == nullptr || x->key < best->key) best = x;
    }
    return best;
}

Node* extractMin(BinomialHeap& h) {
    Node* minNode = findMin(h);
    if (minNode == nullptr) return nullptr; // caso límite: montículo vacío

    // quitar minNode de la lista de raíces de h
    if (h.head == minNode) {
        h.head = minNode->sibling;
    } else {
        Node* p = h.head;
        while (p->sibling != minNode) p = p->sibling;
        p->sibling = minNode->sibling;
    }

    // invertir la lista de hijos de minNode para dejarla ordenada por grado
    // ascendente antes de tratarla como los root de H'
    Node* childList = nullptr;
    for (Node* c = minNode->child; c != nullptr; ) {
        Node* next = c->sibling;
        c->sibling = childList;
        c->parent = nullptr;
        childList = c;
        c = next;
    }

    BinomialHeap hPrime;
    hPrime.head = childList;
    h = heapUnion(h, hPrime);
    return minNode;
}
