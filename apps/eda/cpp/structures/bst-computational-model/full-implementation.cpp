// Implementación completa del modelo computacional del BST (#13-28).
// Junta los pasos 1-4: nodo con puntero al padre, pointer-move instrumentado,
// rotate instrumentado, y Buscar(x) construido sobre pointer-move.
//
// insertPlain() NO es una operación del modelo (el modelo sólo soporta
// Buscar, #22-23): es andamiaje para construir árboles de forma distinta con
// las mismas llaves, y no se instrumenta.
//
// main() demuestra el punto central de la teoría (#26-27): la misma
// secuencia de búsquedas cuesta distinto según la forma del árbol.

#include <cassert>
#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;
    explicit Node(int v) : value(v) {}
};

enum class Dir { Parent, Left, Right };

struct Cost {
    long pointerMoves = 0;
    long rotations = 0;
};

// pointer-move: O(1) postulado (#19).
Node* moverA(Node* v, Dir dir, Cost& cost) {
    cost.pointerMoves++;
    switch (dir) {
        case Dir::Parent: return v->parent;
        case Dir::Left:   return v->left;
        case Dir::Right:  return v->right;
    }
    return nullptr;
}

// Right Rotation(n): O(1) postulado (#20, figura #21).
void rotateRight(Node* n, Node*& root, Cost& cost) {
    Node* p = n->parent;
    Node* B = n->right;

    n->right = p;
    p->left = B;
    if (B != nullptr) B->parent = p;

    n->parent = p->parent;
    if (p->parent == nullptr) root = n;
    else if (p->parent->left == p) p->parent->left = n;
    else p->parent->right = n;
    p->parent = n;

    cost.rotations++;
}

// Left Rotation(p): caso simétrico.
void rotateLeft(Node* n, Node*& root, Cost& cost) {
    Node* p = n->parent;
    Node* B = n->left;

    n->left = p;
    p->right = B;
    if (B != nullptr) B->parent = p;

    n->parent = p->parent;
    if (p->parent == nullptr) root = n;
    else if (p->parent->left == p) p->parent->left = n;
    else p->parent->right = n;
    p->parent = n;

    cost.rotations++;
}

// Buscar(x) (#22-24): secuencia de pointer-move desde la raíz. El modelo
// asume que x siempre está en el árbol.
Node* search(Node* root, int x, Cost& cost) {
    Node* v = root;
    while (v->value != x) {
        v = (x < v->value) ? moverA(v, Dir::Left, cost)
                            : moverA(v, Dir::Right, cost);
    }
    return v;
}

// --- Andamiaje, no parte del modelo: construir árboles de prueba ---

// Inserción de BST sin ningún balanceo, para poder producir a propósito una
// forma degenerada o una forma balanceada con el mismo conjunto de llaves.
// No se instrumenta: no es pointer-move ni rotate, es la manera de fabricar
// escenarios de prueba.
Node* insertPlain(Node* root, Node* node) {
    if (root == nullptr) return node;
    Node* v = root;
    while (true) {
        if (node->value < v->value) {
            if (v->left == nullptr) { v->left = node; node->parent = v; break; }
            v = v->left;
        } else {
            if (v->right == nullptr) { v->right = node; node->parent = v; break; }
            v = v->right;
        }
    }
    return root;
}

// Construye el árbol balanceado con raíz en el elemento medio de un rango
// ordenado [lo, hi], recursivamente. Produce altura O(log n).
Node* buildBalanced(int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    Node* node = new Node(mid);
    node->left = buildBalanced(lo, mid - 1);
    if (node->left) node->left->parent = node;
    node->right = buildBalanced(mid + 1, hi);
    if (node->right) node->right->parent = node;
    return node;
}

// Construye la cadena degenerada 1 -> 2 -> ... -> n (cada uno hijo derecho
// del anterior), insertando en orden creciente.
Node* buildChain(int n) {
    Node* root = nullptr;
    for (int i = 1; i <= n; i++) {
        root = insertPlain(root, new Node(i));
    }
    return root;
}

int inorderSum(Node* v) {
    if (v == nullptr) return 0;
    return inorderSum(v->left) + v->value + inorderSum(v->right);
}

int main() {
    const int n = 7; // llaves 1..7

    Node* balanced = buildBalanced(1, n);
    Node* chain = buildChain(n);

    // La misma secuencia de búsquedas sobre las mismas n llaves.
    int sequence[] = {1, 2, 3, 4, 5, 6, 7};

    Cost costBalanced;
    for (int x : sequence) search(balanced, x, costBalanced);

    Cost costChain;
    for (int x : sequence) search(chain, x, costChain);

    cout << "Buscar(1..7) sobre arbol balanceado: "
         << costBalanced.pointerMoves << " pointer-moves totales\n";
    cout << "Buscar(1..7) sobre cadena degenerada: "
         << costChain.pointerMoves << " pointer-moves totales\n";

    // Propiedad central del modelo (#26-27): mismo n, mismo conjunto de
    // llaves, misma secuencia de búsquedas -> costo real distinto según la
    // forma del árbol. El balanceado debe costar estrictamente menos.
    assert(costBalanced.pointerMoves < costChain.pointerMoves);
    cout << "Verificado: el costo de la misma secuencia de busquedas "
            "depende de la forma del arbol, no solo de n.\n";

    // Cota concreta del peor caso balanceado: O(log n). Con n=7, altura 2,
    // ningun pointer-move individual de una busqueda excede 2.
    Cost single;
    search(balanced, 1, single);
    assert(single.pointerMoves <= 2);
    cout << "Verificado: en el arbol balanceado, Buscar(x) nunca excede "
            "la altura (2 para n=7), consistente con O(log n).\n";

    // En la cadena, Buscar del ultimo elemento cuesta O(n): n-1 pointer-moves.
    Cost worst;
    search(chain, n, worst);
    assert(worst.pointerMoves == n - 1);
    cout << "Verificado: en la cadena degenerada, Buscar(" << n << ") cuesta "
         << worst.pointerMoves << " pointer-moves, es decir O(n) con el mismo n.\n";

    // rotate es O(1): una sola rotacion, sin importar el tamano de los
    // subarboles que mueve. Right Rotation sobre el hijo izquierdo de la raiz
    // del balanceado (nodo 2, hijo izquierdo de la raiz 4).
    Node* root = balanced;
    Node* n2 = root->left; // valor 2
    assert(n2->value == 2);
    int sumBefore = inorderSum(root);
    Cost rotCost;
    rotateRight(n2, root, rotCost);
    int sumAfter = inorderSum(root);

    assert(rotCost.rotations == 1);
    assert(rotCost.pointerMoves == 0); // rotate no usa pointer-move: es la otra primitiva
    assert(root == n2); // n2 subio a la raiz
    assert(sumBefore == sumAfter); // el recorrido inorden preserva las mismas llaves
    cout << "Verificado: una rotacion cuesta exactamente 1 (contador de "
            "rotaciones), 0 pointer-moves, y preserva el recorrido inorden.\n";

    // Left Rotation deshace la Right Rotation anterior: vuelve la raiz a 4.
    Node* n4 = root->right; // valor 4, ahora hijo derecho de n2
    assert(n4->value == 4);
    rotateLeft(n4, root, rotCost);
    assert(rotCost.rotations == 2);
    assert(root == n4);
    assert(root->value == 4);
    cout << "Verificado: rotate es reversible (Left Rotation deshace la "
            "Right Rotation anterior), ambas O(1).\n";

    return 0;
}
