// Paso 6 — Insert: caso particular de Union (diapositiva 23).
// Insert(H, x) es Union(H, {x}), con x como un B_0 nuevo. El peor caso es
// O(lg n) (hereda el de Union), pero el análisis agregado (diapositiva 24,
// "Bono") muestra que amortizado cada Insert cuesta O(1): es la misma
// cuenta que decir cuántas veces cambia cada bit en n incrementos de un
// contador binario.
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

BinomialHeap insert(BinomialHeap h, int key) {
    BinomialHeap single;
    single.head = new Node(key);
    return heapUnion(h, single);
}
