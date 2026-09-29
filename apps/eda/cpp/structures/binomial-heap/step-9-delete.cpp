// Paso 9 — Delete (Algoritmo 15, diapositiva 27): dos líneas, reutiliza
// Decrease-Key y Extract-Min. Bajar la llave a -infinito garantiza que x
// suba hasta ser una raíz (y, si hace falta, el mínimo), y de ahí
// Extract-Min lo saca del montículo. Costo: O(lg n) + O(lg n) = O(lg n).
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
    if (minNode == nullptr) return nullptr;

    if (h.head == minNode) {
        h.head = minNode->sibling;
    } else {
        Node* p = h.head;
        while (p->sibling != minNode) p = p->sibling;
        p->sibling = minNode->sibling;
    }

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

void deleteKey(BinomialHeap& h, Node* x) {
    decreaseKey(x, INT_MIN);
    Node* removed = extractMin(h);
    delete removed;
}
