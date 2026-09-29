// Paso 3 — Insert y Union (Algoritmos 5 y 6 del profesor, páginas 7-9).
//
// Ambas son casi gratis: Insert agrega un árbol de un solo nodo a la
// lista de raíces; Union concatena dos listas circulares. Ninguna
// reorganiza nada más — es la pereza que el resumen del mazo señala
// ("El montículo de Fibonacci es perezoso").

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

    // Algoritmo 5: Insert(H, x).
    // grado(x) <- 0; padre(x) <- nulo; marca(x) <- falso ;
    // Agregar x como un árbol de un solo nodo a la lista de raíces de H ;
    // si min(H) = nulo o llave(x) < llave(min(H)) entonces min(H) <- x ;
    Node* insert(int key) {
        Node* x = new Node(key);
        // x ya nace con degree=0, parent=nullptr, mark=false (paso 1).
        if (minNode == nullptr) {
            minNode = x;
        } else {
            spliceInto(minNode, x);
            if (x->key < minNode->key) minNode = x;
        }
        ++n;
        return x;
    }

    // Algoritmo 6: Union(H1, H2).
    // Concatenar las listas de raíces de H1 y H2 en una sola lista circular ;
    // min(H) <- min(min(H1), min(H2)) ;
    // devolver H ;
    //
    // Se implementa "meldeando" H2 dentro de este heap (H1) y vaciando H2,
    // porque H2 deja de existir como estructura independiente tras la unión.
    void unionWith(FibHeap& other) {
        if (other.minNode == nullptr) return;
        if (minNode == nullptr) {
            minNode = other.minNode;
        } else {
            // Empalmar las dos listas circulares completas: unir la lista
            // de other a la de este heap es la misma operación de splice
            // que insertar un nodo, sólo que "x" aquí es la cabeza de toda
            // una lista circular en vez de un nodo suelto.
            spliceInto(minNode, other.minNode);
            if (other.minNode->key < minNode->key) minNode = other.minNode;
        }
        n += other.n;
        other.minNode = nullptr; // H2 queda vacío: sus nodos ahora son de H1
        other.n = 0;
    }
};
