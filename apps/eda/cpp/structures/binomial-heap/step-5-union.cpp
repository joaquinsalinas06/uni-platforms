// Paso 5 — Union: la razón de ser del montículo binomial.
// Dos pasos (diapositiva 21): (1) mezclar las dos listas de raíces
// ordenadas por grado en una sola lista ordenada; (2) recorrerla enlazando
// pares consecutivos de igual grado con Binomial-Link — igual que un
// acarreo al sumar en binario. El caso sutil (Algoritmo 7, diapositiva 23)
// es cuando hay TRES raíces consecutivas del mismo grado: hay que enlazar
// el segundo par, no el primero, para no perder la tercera.
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

// Mezcla dos listas de raíces (cada una ya ordenada por grado ascendente)
// en una sola lista ordenada por grado, sin todavía enlazar nada.
Node* mergeRootLists(Node* a, Node* b) {
    Node dummy(0);
    Node* tail = &dummy;
    while (a != nullptr && b != nullptr) {
        if (a->degree <= b->degree) {
            tail->sibling = a;
            a = a->sibling;
        } else {
            tail->sibling = b;
            b = b->sibling;
        }
        tail = tail->sibling;
    }
    tail->sibling = (a != nullptr) ? a : b;
    return dummy.sibling;
}

BinomialHeap heapUnion(BinomialHeap h1, BinomialHeap h2) {
    BinomialHeap h;
    h.head = mergeRootLists(h1.head, h2.head);
    if (h.head == nullptr) return h; // caso límite: las dos vacías

    Node* prev = nullptr;
    Node* x = h.head;
    Node* next = x->sibling;
    while (next != nullptr) {
        bool thirdSameDegree = (next->sibling != nullptr && next->sibling->degree == x->degree);
        if (x->degree != next->degree || thirdSameDegree) {
            // grados distintos, o hay una tercera raíz igual: avanzar sin
            // enlazar todavía (se enlazará en la siguiente vuelta).
            prev = x;
            x = next;
        } else if (x->key <= next->key) {
            // enlazar next bajo x
            x->sibling = next->sibling;
            binomialLink(next, x);
        } else {
            // enlazar x bajo next
            if (prev == nullptr) h.head = next; else prev->sibling = next;
            binomialLink(x, next);
            x = next;
        }
        next = x->sibling;
    }
    return h;
}
