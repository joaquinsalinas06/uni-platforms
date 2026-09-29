// BST balanceado (AVL) — concepto de apoyo (supportConcept), NO material del
// curso. El profesor nunca explica un esquema de balanceo en diapositivas;
// se usa aquí para dar el Search/Insert/Predecessor/Successor mínimo que
// necesitan el range tree (BBST con llaves en las hojas), el barrido de
// segmentos (Successor sobre el orden de cruces) y el modelo computacional
// BST de la semana 5 (rotación como primitiva O(1)).
// Derivación estándar de la literatura (AVL), no del profesor.

#include <algorithm>
#include <cassert>
#include <cmath>
#include <iostream>
#include <optional>
using namespace std;

struct Node {
    int key;
    Node* left;
    Node* right;
    int height;

    explicit Node(int k) : key(k), left(nullptr), right(nullptr), height(0) {}
};

int height(Node* n) { return n ? n->height : -1; }
void updateHeight(Node* n) { n->height = 1 + max(height(n->left), height(n->right)); }
int balanceFactor(Node* n) { return n ? height(n->left) - height(n->right) : 0; }

Node* rotateRight(Node* p) {
    Node* n = p->left;
    p->left = n->right;
    n->right = p;
    updateHeight(p);
    updateHeight(n);
    return n;
}

Node* rotateLeft(Node* p) {
    Node* n = p->right;
    p->right = n->left;
    n->left = p;
    updateHeight(p);
    updateHeight(n);
    return n;
}

Node* rebalance(Node* node) {
    updateHeight(node);
    int fb = balanceFactor(node);
    if (fb > 1) { // subárbol izquierdo demasiado alto
        if (balanceFactor(node->left) < 0) node->left = rotateLeft(node->left); // caso izq-der
        return rotateRight(node); // caso izq-izq (o izq-der ya reducido a él)
    }
    if (fb < -1) { // subárbol derecho demasiado alto
        if (balanceFactor(node->right) > 0) node->right = rotateRight(node->right); // caso der-izq
        return rotateLeft(node); // caso der-der (o der-izq ya reducido a él)
    }
    return node; // ya balanceado
}

Node* insert(Node* node, int x) {
    if (!node) return new Node(x);
    if (x < node->key) node->left = insert(node->left, x);
    else if (x > node->key) node->right = insert(node->right, x);
    else return node; // llave duplicada: no se inserta de nuevo (caso límite de insert.md)
    return rebalance(node);
}

// Search: desciende comparando x contra cada nodo hasta encontrarlo o
// caer en un hijo nulo.
Node* search(Node* node, int x) {
    while (node && node->key != x) {
        node = (x < node->key) ? node->left : node->right;
    }
    return node;
}

// Predecessor: desciende guardando en "candidate" el último nodo del que
// se dobló a la derecha (el mayor nodo visto hasta ahora que es < x).
optional<int> predecessor(Node* node, int x) {
    optional<int> candidate;
    while (node) {
        if (node->key < x) {
            candidate = node->key;
            node = node->right;
        } else {
            node = node->left;
        }
    }
    return candidate;
}

// Successor: simétrico. Guarda el último nodo del que se dobló a la
// izquierda (el menor nodo visto hasta ahora que es > x).
optional<int> successor(Node* node, int x) {
    optional<int> candidate;
    while (node) {
        if (node->key > x) {
            candidate = node->key;
            node = node->left;
        } else {
            node = node->right;
        }
    }
    return candidate;
}

// Verifica, recursivamente, que el invariante de balance (|fb| <= 1) se
// cumple en TODO nodo del árbol -- no sólo en la raíz.
bool isBalanced(Node* node) {
    if (!node) return true;
    if (abs(balanceFactor(node)) > 1) return false;
    return isBalanced(node->left) && isBalanced(node->right);
}

int main() {
    // --- Caso normal: árbol de 5 nodos de theory.md ---
    Node* r = nullptr;
    for (int k : {20, 10, 30, 27, 40}) r = insert(r, k);
    assert(isBalanced(r));
    cout << "OK: invariante de balance se cumple en todo nodo tras insertar {20,10,30,27,40}\n";

    assert(search(r, 27) != nullptr && search(r, 27)->key == 27);
    assert(search(r, 99) == nullptr);
    cout << "OK: Search encuentra 27 y reporta ausencia de 99\n";

    assert(predecessor(r, 25) == 20);
    assert(successor(r, 25) == 27);
    cout << "OK: Predecessor(25)=20 y Successor(25)=27, igual que en operations/predecessor.md y successor.md\n";

    // --- Caso límite: predecessor/successor en los extremos ---
    assert(!predecessor(r, 5).has_value());   // menor que toda llave
    assert(!successor(r, 100).has_value());   // mayor que toda llave
    cout << "OK: Predecessor y Successor devuelven vacío fuera de rango\n";

    // --- Caso límite: el ejemplo de insert.md, rotación derecha simple ---
    Node* r2 = nullptr;
    r2 = insert(r2, 30);
    r2 = insert(r2, 20);
    r2 = insert(r2, 10); // rompe el invariante en 30 -> rotación derecha
    assert(r2->key == 20 && r2->left->key == 10 && r2->right->key == 30);
    assert(isBalanced(r2));
    cout << "OK: Insert(10) sobre {30,20} rota y deja 20 como raiz con hijos 10 y 30\n";

    // --- Caso adversario: insertar 1..n YA ORDENADO, el caso que degenera
    // un BST sin balancear en una lista (altura O(n)). Aquí se verifica que
    // la altura se queda cerca de log2(n), no de n. ---
    const int n = 1000;
    Node* adversarial = nullptr;
    for (int i = 1; i <= n; ++i) adversarial = insert(adversarial, i);
    assert(isBalanced(adversarial));
    double log2n = log2((double)n);
    // height() usa la convención altura(nulo) = -1: la altura "humana" del
    // árbol (número de niveles) es height(adversarial) + 1.
    int treeHeight = height(adversarial) + 1;
    cout << "OK: tras insertar " << n << " llaves EN ORDEN CRECIENTE (caso adversario para un BST sin balancear),\n"
         << "    altura resultante = " << treeHeight
         << ", log2(" << n << ") = " << log2n
         << " -- la altura se queda proporcional a log2(n), nunca cerca de n=" << n << "\n";
    // Cota AVL estándar: altura <= 1.44 * log2(n+2) - 0.328 (aprox.); una
    // cota más floja y suficiente para el assert es 2*log2(n+1).
    assert((double)treeHeight <= 2.0 * log2((double)n + 1));

    // --- Caso límite: duplicados no se insertan de nuevo ---
    Node* r3 = nullptr;
    r3 = insert(r3, 5);
    r3 = insert(r3, 5);
    assert(r3->left == nullptr && r3->right == nullptr);
    cout << "OK: insertar una llave duplicada no crea un nodo nuevo\n";

    cout << "OK: todas las propiedades verificadas (balance, search, predecessor, successor, rotacion, caso adversario, duplicados)\n";
}
