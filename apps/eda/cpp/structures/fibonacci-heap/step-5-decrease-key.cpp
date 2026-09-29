// Paso 5 — Decrease-Key (Algoritmo 12, páginas 14-15).
//
// Cambia la llave y, si eso rompe el invariante de montículo mínimo con
// el padre, corta el nodo (Cut) y dispara la cascada hacia arriba
// (Cascading-Cut). Al final, si la nueva llave es menor que el mínimo
// actual, actualiza min(H).

#include <iostream>
#include <stdexcept>
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
    Node* minNode = nullptr;
    int n = 0;

    bool isEmpty() const { return minNode == nullptr; }

    static void spliceInto(Node* head, Node* x) {
        Node* headLeft = head->left;
        headLeft->right = x;
        Node* xLeft = x->left;
        x->left = headLeft;
        xLeft->right = head;
        head->left = xLeft;
    }

    static void removeFromList(Node* x) {
        x->left->right = x->right;
        x->right->left = x->left;
        x->left = x->right = x;
    }

    Node* insert(int key) {
        Node* x = new Node(key);
        if (minNode == nullptr) minNode = x;
        else {
            spliceInto(minNode, x);
            if (x->key < minNode->key) minNode = x;
        }
        ++n;
        return x;
    }

    void unionWith(FibHeap& other) {
        if (other.minNode == nullptr) return;
        if (minNode == nullptr) minNode = other.minNode;
        else {
            spliceInto(minNode, other.minNode);
            if (other.minNode->key < minNode->key) minNode = other.minNode;
        }
        n += other.n;
        other.minNode = nullptr;
        other.n = 0;
    }

    void cut(Node* x, Node* p) {
        if (p->child == x) {
            p->child = (x->right == x) ? nullptr : x->right;
        }
        removeFromList(x);
        --p->degree;
        x->parent = nullptr;
        x->mark = false;
        spliceInto(minNode, x);
    }

    void cascadingCut(Node* y) {
        Node* z = y->parent;
        if (z != nullptr) {
            if (!y->mark) {
                y->mark = true;
            } else {
                cut(y, z);
                cascadingCut(z);
            }
        }
    }

    // Algoritmo 12: Decrease-Key(H, x, k).
    // llave(x) <- k ;
    // p <- padre(x) ;
    // si p != nulo y llave(x) < llave(p) entonces Cut(H, x, p) ; Cascading-Cut(H, p) ;
    // si llave(x) < llave(min(H)) entonces min(H) <- x ;
    void decreaseKey(Node* x, int k) {
        // El profesor no comenta este caso: el pseudocódigo asignaría la
        // llave igual, rompiendo en silencio el invariante de montículo
        // mínimo. Se rechaza explícitamente en vez de corromper la estructura.
        if (k > x->key) {
            throw invalid_argument("decrease-key: la nueva llave es mayor que la actual");
        }
        x->key = k;
        Node* p = x->parent;
        if (p != nullptr && x->key < p->key) {
            cut(x, p);
            cascadingCut(p);
        }
        if (x->key < minNode->key) {
            minNode = x;
        }
    }
};
