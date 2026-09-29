// Paso 7 — Extract-Min (páginas 19-21, Algoritmo 13).
//
// Dos pasos, tal como los describe el profesor en prosa:
//   Paso 1 (remover): se quita la raíz mínima; todos sus hijos pasan a
//   la lista de raíces, sin marca (las raíces nunca están marcadas).
//   Paso 2 (consolidar): Consolidate fusiona árboles del mismo grado
//   hasta que todos los grados en la lista de raíces sean distintos.
// Caso límite explícito en el pseudocódigo del profesor: si z era la
// única raíz, min(H) queda en nulo sin llamar a Consolidate.

#include <iostream>
#include <vector>
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

    void decreaseKey(Node* x, int k) {
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

    static void linkTrees(Node* y, Node* x) {
        removeFromList(y);
        y->parent = x;
        y->mark = false;
        if (x->child == nullptr) {
            x->child = y;
            y->left = y->right = y;
        } else {
            spliceInto(x->child, y);
        }
        ++x->degree;
    }

    void consolidate() {
        if (minNode == nullptr) return;

        int maxDegree = 2;
        while ((1 << maxDegree) < n + 1) ++maxDegree;
        vector<Node*> A(maxDegree + 2, nullptr);

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

        minNode = nullptr;
        for (Node* x : A) {
            if (x == nullptr) continue;
            x->left = x->right = x;
            if (minNode == nullptr) minNode = x;
            else {
                spliceInto(minNode, x);
                if (x->key < minNode->key) minNode = x;
            }
        }
    }

    // Algoritmo 13: Extract-Min(H).
    // z <- min(H) ;
    // si z != nulo entonces
    //     Agregar cada hijo de z a la lista de raíces, quitándole el padre ;
    //     Quitar z de la lista de raíces ;
    //     si z era la única raíz entonces min(H) <- nulo ;
    //     en otro caso min(H) <- alguna raíz restante ; Consolidate(H) ;
    // devolver z ;
    Node* extractMin() {
        Node* z = minNode;
        if (z != nullptr) {
            // Paso 1: subir cada hijo de z a la lista de raíces, sin padre
            // ni marca (las raíces nunca están marcadas).
            if (z->child != nullptr) {
                Node* c = z->child;
                vector<Node*> children;
                Node* cc = c;
                do {
                    children.push_back(cc);
                    cc = cc->right;
                } while (cc != c);
                for (Node* child : children) {
                    removeFromList(child);
                    child->parent = nullptr;
                    child->mark = false;
                    spliceInto(z, child); // z sigue en su lugar hasta el siguiente paso
                }
                z->child = nullptr;
            }

            // z->right ya refleja, en este punto, a los hijos recién
            // agregados junto a z (si los había) o a la siguiente raíz
            // original. Si sigue apuntando a z mismo, z estaba solo en la
            // lista de raíces y no tenía hijos: el montículo queda vacío.
            Node* remaining = z->right;
            bool heapBecomesEmpty = (remaining == z);
            removeFromList(z);

            if (heapBecomesEmpty) {
                minNode = nullptr;
            } else {
                minNode = remaining; // alguna raíz restante, cualquiera sirve
                // Paso 2: consolidar.
                consolidate();
            }
            --n;
        }
        return z;
    }
};
