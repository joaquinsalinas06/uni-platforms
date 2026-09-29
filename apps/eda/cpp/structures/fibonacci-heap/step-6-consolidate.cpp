// Paso 6 — Consolidate (Algoritmo 14, página 22).
//
// El paso más intrincado del mazo: recorre la lista de raíces y enlaza
// pares del mismo grado hasta que todos los grados sean distintos —
// "igual que un montículo binomial" (página 20). El profesor llama
// Binomial-Link(y, x) sin redefinirlo aquí: está definido en el mazo de
// binomial (Sem_1_Heaps_I-1.pdf#47-48) como "hacer de y un hijo de x",
// asumiendo llave(y) >= llave(x). Aquí se reimplementa como linkTrees
// porque los nodos son de este archivo, pero es la misma operación.

#include <iostream>
#include <vector>
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

    // Binomial-Link(y, x) del mazo de binomial: y se vuelve hijo de x.
    // Precondición que impone el llamador: llave(y) >= llave(x).
    static void linkTrees(Node* y, Node* x) {
        removeFromList(y); // sale de la lista de raíces
        y->parent = x;
        y->mark = false; // y es hijo nuevo: nunca empieza marcado
        if (x->child == nullptr) {
            x->child = y;
            y->left = y->right = y;
        } else {
            spliceInto(x->child, y);
        }
        ++x->degree;
    }

    // Algoritmo 14: Consolidate(H).
    // Crear arreglo A[0..D(n)], todo en nulo ;
    // para cada raíz w de la lista original de raíces hacer
    //    x <- w ; d <- grado(x) ;
    //    mientras A[d] != nulo hacer
    //        y <- A[d] ;
    //        si llave(x) > llave(y) entonces intercambiar x y y
    //        Binomial-Link(y, x) ;
    //        A[d] <- nulo; d <- d + 1 ;
    //      A[d] <- x ;
    // Reconstruir la lista de raíces a partir de A; actualizar min(H) ;
    void consolidate() {
        if (minNode == nullptr) return;

        // D(n) = O(lg n): cota de grado probada por la recurrencia de
        // Fibonacci en theory.md. Un tamaño generoso y seguro para n
        // nodos es 2*log2(n+1)+1; nunca se llega a usar tanto.
        int maxDegree = 2;
        while ((1 << maxDegree) < n + 1) ++maxDegree;
        vector<Node*> A(maxDegree + 2, nullptr);

        // Recolectar la lista original de raíces primero: consolidar va
        // a reordenarla mientras se recorre, y no se puede recorrer una
        // lista circular que cambia bajo los pies.
        vector<Node*> roots;
        Node* start = minNode;
        Node* cur = start;
        do {
            roots.push_back(cur);
            cur = cur->right;
        } while (cur != start);

        for (Node* w : roots) {
            Node* x = w;
            int d = x->degree;
            while (A[d] != nullptr) {
                Node* y = A[d];
                if (x->key > y->key) swap(x, y);
                linkTrees(y, x);
                A[d] = nullptr;
                ++d;
            }
            A[d] = x;
        }

        // Reconstruir la lista de raíces a partir de A; actualizar min(H).
        minNode = nullptr;
        for (Node* x : A) {
            if (x == nullptr) continue;
            x->left = x->right = x; // aislarlo antes de reinsertarlo
            if (minNode == nullptr) minNode = x;
            else {
                spliceInto(minNode, x);
                if (x->key < minNode->key) minNode = x;
            }
        }
    }
};
