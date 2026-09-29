// Paso 4 — Cut y Cascading-Cut (Algoritmos 9 y 10, páginas 12-13).
//
// Cut separa un nodo de su padre y lo sube a la lista de raíces, sin
// marca (las raíces nunca están marcadas). Cascading-Cut aplica la regla
// de las marcas: si el padre ya estaba marcado (ya había perdido un
// hijo antes), se corta también y la cascada sigue hacia arriba; si no,
// sólo se marca. La cascada para en la primera raíz (padre nulo) o en el
// primer ancestro que todavía no estaba marcado.

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

    // Algoritmo 9: Cut(H, x, p).
    // Quitar x de la lista de hijos de p; grado(p) <- grado(p) - 1 ;
    // Agregar x a la lista de raíces de H; padre(x) <- nulo; marca(x) <- falso ;
    void cut(Node* x, Node* p) {
        // Quitar x de la lista de hijos de p.
        if (p->child == x) {
            p->child = (x->right == x) ? nullptr : x->right;
        }
        removeFromList(x);
        --p->degree;

        // Agregar x a la lista de raíces; ya no tiene padre ni marca:
        // "las raíces nunca están marcadas".
        x->parent = nullptr;
        x->mark = false;
        spliceInto(minNode, x);
    }

    // Algoritmo 10: Cascading-Cut(H, y).
    // z <- padre(y) ;
    // si z != nulo entonces
    //     si marca(y) = falso entonces marca(y) <- verdadero ;
    //     en otro caso Cut(H, y, z) ; Cascading-Cut(H, z) ;
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
};
