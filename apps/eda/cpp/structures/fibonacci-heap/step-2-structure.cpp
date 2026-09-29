// Paso 2 — la estructura y su invariante: la lista circular de raíces y
// el puntero min(H).
//
// El montículo mismo no tiene pseudocódigo propio en el mazo (nunca lo
// dibuja como figura completa): se arma aquí a partir de lo que Insert,
// Union, Cut y Extract-Min asumen que existe: una lista circular de
// raíces y un puntero directo al mínimo.

#include <iostream>
using namespace std;

struct Node {
    int key;
    int degree = 0;
    bool mark = false;
    Node* parent = nullptr;
    Node* child = nullptr;
    Node* left;
    Node* right;

    explicit Node(int k) : key(k) {
        left = right = this;
    }
};

struct FibHeap {
    Node* minNode = nullptr; // min(H); nullptr si el montículo está vacío
    int n = 0;               // número total de nodos, no sólo raíces

    bool isEmpty() const { return minNode == nullptr; }

    // Empalma el nodo x (o la lista circular que encabeza x) dentro de la
    // lista circular que encabeza "head". O(1): sólo reconecta 4 punteros,
    // sin importar cuántos nodos tenga cada lista.
    static void spliceInto(Node* head, Node* x) {
        Node* headLeft = head->left;
        headLeft->right = x;
        Node* xLeft = x->left;
        x->left = headLeft;
        xLeft->right = head;
        head->left = xLeft;
    }

    // Quita x de la lista circular en la que vive (deja a x apuntando a
    // sí mismo). O(1).
    static void removeFromList(Node* x) {
        x->left->right = x->right;
        x->right->left = x->left;
        x->left = x->right = x;
    }

    ~FibHeap() {
        // Liberación simple: recorrer y borrar. No es el foco del tema,
        // pero evita fugas de memoria en las pruebas de main().
        freeAll(minNode);
    }

    static void freeAll(Node* start) {
        if (!start) return;
        Node* cur = start;
        do {
            Node* next = cur->right;
            freeAll(cur->child);
            delete cur;
            cur = next;
        } while (cur != start);
    }
};
