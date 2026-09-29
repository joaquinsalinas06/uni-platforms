// Montículo binomial completo: nodo, lista de raíces, Binomial-Link,
// Find-Min, Union, Insert, Extract-Min, Decrease-Key, Delete.
// Ver content/structures/binomial-heap/ para la explicación paso a paso;
// este archivo es la unión de todos los step-N.
//
// main() prueba:
//   1. el caso normal: insertar una secuencia y extraer en orden.
//   2. el caso límite del montículo vacío.
//   3. Union de dos montículos cuyos grados "se acarrean" como una suma
//      binaria (3 nodos + 1 nodo -> un solo árbol B2 de 4 nodos).
#include <algorithm>
#include <cassert>
#include <climits>
#include <iostream>
#include <utility>
#include <vector>

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
    if (h.head == nullptr) return h; // caso límite: las dos vacías

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

BinomialHeap insert(BinomialHeap h, int key) {
    BinomialHeap single;
    single.head = new Node(key);
    return heapUnion(h, single);
}

Node* extractMin(BinomialHeap& h) {
    Node* minNode = findMin(h);
    if (minNode == nullptr) return nullptr; // caso límite: montículo vacío

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
    assert(newKey <= x->key);
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

int countNodes(Node* x) {
    if (x == nullptr) return 0;
    return 1 + countNodes(x->child) + countNodes(x->sibling);
}

int main() {
    // 1) caso normal: insertar y extraer en orden (heap sort implícito).
    BinomialHeap h;
    std::vector<int> valores = {10, 3, 25, 7, 1, 18, 4};
    for (int v : valores) h = insert(h, v);

    std::vector<int> extraidos;
    BinomialHeap work = h;
    while (Node* m = findMin(work)) {
        extraidos.push_back(m->key);
        Node* removed = extractMin(work);
        delete removed;
    }
    std::vector<int> esperado = valores;
    std::sort(esperado.begin(), esperado.end());
    assert(extraidos == esperado);
    std::cout << "Caso normal OK: extraidos en orden = ";
    for (int v : extraidos) std::cout << v << " ";
    std::cout << "\n";

    // 2) caso límite: montículo vacío.
    BinomialHeap vacio;
    assert(findMin(vacio) == nullptr);
    assert(extractMin(vacio) == nullptr);
    std::cout << "Caso limite OK: monticulo vacio no revienta.\n";

    // 3) Union con acarreo binario: 3 nodos (B0 + B1, como "11" en binario)
    //    union con 1 nodo (B0, "1") debe dar un solo arbol B2 de 4 nodos
    //    (como 11 + 1 = 100).
    BinomialHeap tres;
    tres = insert(tres, 5);
    tres = insert(tres, 2);
    tres = insert(tres, 9); // 3 nodos: un B0 y un B1
    int gradosTres = 0;
    for (Node* r = tres.head; r != nullptr; r = r->sibling) gradosTres++;
    assert(gradosTres == 2);

    BinomialHeap uno;
    uno = insert(uno, 1); // 1 nodo: un B0

    BinomialHeap acarreo = heapUnion(tres, uno);
    int totalRaices = 0;
    for (Node* r = acarreo.head; r != nullptr; r = r->sibling) totalRaices++;
    int totalNodos = countNodes(acarreo.head);
    assert(totalRaices == 1); // 3 + 1 = 4 = "100", un solo arbol B2
    assert(acarreo.head->degree == 2);
    assert(totalNodos == 4);
    assert(findMin(acarreo)->key == 1);
    std::cout << "Caso de acarreo binario OK: 3 + 1 nodos -> 1 arbol B2 con "
              << totalNodos << " nodos, min = " << findMin(acarreo)->key << "\n";

    std::cout << "Todas las pruebas pasaron.\n";
    return 0;
}
