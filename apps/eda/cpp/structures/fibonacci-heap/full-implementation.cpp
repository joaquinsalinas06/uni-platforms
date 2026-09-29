// Implementación pedagógica completa de un Montículo de Fibonacci.
// Corresponde a las operaciones de la semana 2: Insert, Union, Cut,
// Cascading-Cut, Decrease-Key, Consolidate y Extract-Min.

#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// =====================================================
// NODO
// =====================================================

struct Node {
    int key;
    int degree;       // cantidad de hijos
    bool mark;        // true: ya perdió un hijo desde que se enlazó
    Node* parent;
    Node* child;      // apunta a uno cualquiera de sus hijos
    Node* left;       // hermanos/raíces: lista circular doble
    Node* right;

    explicit Node(int value)
        : key(value), degree(0), mark(false), parent(nullptr), child(nullptr) {
        // Un nodo aislado ya es una lista circular de tamaño uno.
        left = this;
        right = this;
    }
};

// =====================================================
// FIBONACCI HEAP
// =====================================================

class FibonacciHeap {
private:
    Node* minNode; // raíz con menor llave
    int n;         // cantidad total de nodos

    // Quita x de la lista circular donde está y lo deja aislado.
    // Esta operación sólo cambia punteros: O(1).
    static void isolate(Node* x) {
        x->left->right = x->right;
        x->right->left = x->left;
        x->left = x;
        x->right = x;
    }

    // =================================================
    // AGREGAR UNA RAÍZ
    // =================================================
    void addToRootList(Node* x) {
        if (minNode == nullptr) {
            x->left = x;
            x->right = x;
            x->parent = nullptr;
            minNode = x;
            return;
        }

        // Insertar x a la derecha de minNode:
        //
        // minNode <-> antiguo-siguiente
        // minNode <-> x <-> antiguo-siguiente
        x->right = minNode->right;
        x->left = minNode;
        minNode->right->left = x;
        minNode->right = x;
        x->parent = nullptr;

        if (x->key < minNode->key) {
            minNode = x;
        }
    }

    // =================================================
    // LINK
    // =================================================
    // Precondición: x e y son raíces del mismo grado y x tiene la menor llave.
    // Resultado: y pasa a ser hijo de x; grado(x) aumenta en uno.
    void link(Node* y, Node* x) {
        y->parent = x;
        y->mark = false; // un nodo recién enlazado empieza sin marca

        if (x->child == nullptr) {
            x->child = y;
            y->left = y;
            y->right = y;
        } else {
            Node* firstChild = x->child;
            y->right = firstChild->right;
            y->left = firstChild;
            firstChild->right->left = y;
            firstChild->right = y;
        }
        ++x->degree;
    }

    // =================================================
    // CONSOLIDATE
    // =================================================
    // A[d] guarda, temporalmente, una raíz de grado d.
    // Si aparece otra raíz de ese grado, las dos se enlazan.
    void consolidate() {
        if (minNode == nullptr) return;

        // 1. Guardar la lista ORIGINAL de raíces antes de modificarla.
        vector<Node*> roots;
        Node* start = minNode;
        Node* current = start;
        do {
            roots.push_back(current);
            current = current->right;
        } while (current != start);

        // Aislamos cada raíz. Así, si luego una se vuelve hija durante Link,
        // no se procesa accidentalmente otra vez como raíz.
        for (Node* root : roots) {
            root->left = root;
            root->right = root;
        }

        vector<Node*> A(1, nullptr);

        // 2. Procesar raíces y resolver las colisiones por grado.
        for (Node* root : roots) {
            Node* x = root;
            int d = x->degree;

            while (d >= static_cast<int>(A.size())) {
                A.resize(d + 1, nullptr);
            }

            while (A[d] != nullptr) {
                Node* y = A[d];

                // La menor llave debe ser el padre del min-heap.
                if (x->key > y->key) {
                    swap(x, y);
                }

                link(y, x);
                A[d] = nullptr;
                ++d; // x ganó un hijo

                while (d >= static_cast<int>(A.size())) {
                    A.resize(d + 1, nullptr);
                }
            }

            A[d] = x;
        }

        // 3. Reconstruir la lista de raíces y recomputar minNode.
        minNode = nullptr;
        for (Node* root : A) {
            if (root == nullptr) continue;
            root->left = root;
            root->right = root;
            root->parent = nullptr;
            addToRootList(root);
        }
    }

    // =================================================
    // CUT
    // =================================================
    // Separa x de su padre y, y mueve TODO el subárbol de x a las raíces.
    void cut(Node* x, Node* y) {
        if (y->child == x) {
            y->child = (x->right == x) ? nullptr : x->right;
        }

        isolate(x);
        --y->degree;

        x->parent = nullptr;
        x->mark = false; // las raíces nunca están marcadas
        addToRootList(x);
    }

    // =================================================
    // CASCADING-CUT
    // =================================================
    void cascadingCut(Node* y) {
        Node* z = y->parent;

        // Una raíz no tiene padre: la cascada termina.
        if (z == nullptr) return;

        if (!y->mark) {
            // Primer hijo perdido: marcar, pero todavía no cortar.
            y->mark = true;
        } else {
            // Segundo hijo perdido: cortar y continuar hacia arriba.
            cut(y, z);
            cascadingCut(z);
        }
    }

public:
    FibonacciHeap() : minNode(nullptr), n(0) {}

    bool empty() const { return minNode == nullptr; }
    int size() const { return n; }

    // =================================================
    // INSERT
    // =================================================
    Node* insert(int key) {
        Node* x = new Node(key);
        addToRootList(x);
        ++n;

        // No llamamos Consolidate: el heap es perezoso.
        return x;
    }

    // =================================================
    // GET-MIN
    // =================================================
    int getMin() const {
        if (minNode == nullptr) {
            cout << "Heap vacio" << endl;
            return -1;
        }
        return minNode->key;
    }

    // =================================================
    // UNION
    // =================================================
    void unionHeap(FibonacciHeap& other) {
        if (other.minNode == nullptr) return;

        if (minNode == nullptr) {
            minNode = other.minNode;
            n = other.n;
            other.minNode = nullptr;
            other.n = 0;
            return;
        }

        // H1: minNode <-> firstAfterMin
        // H2: other.minNode ... lastOther
        // Se empalman ambos anillos con cuatro cambios de puntero.
        Node* firstAfterMin = minNode->right;
        Node* lastOther = other.minNode->left;

        minNode->right = other.minNode;
        other.minNode->left = minNode;
        lastOther->right = firstAfterMin;
        firstAfterMin->left = lastOther;

        if (other.minNode->key < minNode->key) {
            minNode = other.minNode;
        }

        n += other.n;
        other.minNode = nullptr; // transferimos la propiedad de sus nodos
        other.n = 0;

        // No hay Consolidate: Union sólo concatena listas.
    }

    // =================================================
    // DECREASE-KEY
    // =================================================
    void decreaseKey(Node* x, int newKey) {
        if (newKey > x->key) {
            cout << "La nueva llave debe ser menor o igual" << endl;
            return;
        }

        x->key = newKey;
        Node* y = x->parent;

        // Sólo se corta si se rompió el invariante de min-heap.
        if (y != nullptr && x->key < y->key) {
            cut(x, y);
            cascadingCut(y);
        }

        if (minNode == nullptr || x->key < minNode->key) {
            minNode = x;
        }
    }

    // =================================================
    // EXTRACT-MIN
    // =================================================
    int extractMin() {
        Node* z = minNode;

        if (z == nullptr) {
            cout << "Heap vacio" << endl;
            return -1;
        }

        int result = z->key;

        // Paso 1: los hijos de z pasan a ser raíces.
        if (z->child != nullptr) {
            vector<Node*> children;
            Node* start = z->child;
            Node* current = start;
            do {
                children.push_back(current);
                current = current->right;
            } while (current != start);

            for (Node* child : children) {
                isolate(child);
                child->parent = nullptr;
                child->mark = false;
                addToRootList(child);
            }
            z->child = nullptr;
            z->degree = 0;
        }

        // Paso 2: retirar la raíz mínima.
        Node* remaining = z->right;
        bool heapBecomesEmpty = (remaining == z);
        isolate(z);

        if (heapBecomesEmpty) {
            minNode = nullptr;
        } else {
            minNode = remaining; // punto de inicio temporal
            consolidate();
        }

        --n;
        delete z;
        return result;
    }

    // =================================================
    // IMPRIMIR RAÍCES
    // =================================================
    void printRoots() const {
        if (minNode == nullptr) {
            cout << "Heap vacio" << endl;
            return;
        }

        cout << "Raices: ";
        Node* current = minNode;
        do {
            cout << current->key << "(grado " << current->degree << ") ";
            current = current->right;
        } while (current != minNode);

        cout << "\nMinimo: " << minNode->key << "\n";
    }
};

// =====================================================
// MAIN: RECORRIDO DE LAS OPERACIONES
// =====================================================

int main() {
    FibonacciHeap heap;

    // Insert: todos empiezan como raíces de grado 0.
    Node* n5 = heap.insert(5);
    Node* n3 = heap.insert(3);
    Node* n9 = heap.insert(9);
    Node* n7 = heap.insert(7);
    (void)n5;
    (void)n3;
    (void)n9; // Insert devuelve handles: siguen identificando al mismo nodo.

    cout << "Despues de insertar:\n";
    heap.printRoots();

    // Extract-Min elimina 3 y entonces sí ejecuta Consolidate.
    cout << "\nExtract-Min: " << heap.extractMin() << "\n";
    heap.printRoots();

    // n7 sigue apuntando al mismo nodo. Puede estar como raíz o como hijo
    // después de Consolidate; Decrease-Key decide si hace falta cortar.
    heap.decreaseKey(n7, 1);
    cout << "\nDespues de Decrease-Key(7, 1):\n";
    heap.printRoots();

    // Union empalma otra lista circular sin consolidarla.
    FibonacciHeap heap2;
    heap2.insert(20);
    heap2.insert(2);
    heap2.insert(15);

    cout << "\nSegundo heap:\n";
    heap2.printRoots();

    heap.unionHeap(heap2);
    cout << "\nDespues de Union:\n";
    heap.printRoots();

    // Comprobaciones visibles de los casos trabajados.
    cout << "\nTamano final: " << heap.size() << "\n";
    cout << "Minimo final: " << heap.getMin() << "\n";
    return 0;
}
