// Paso 4 — Search, Predecessor y Successor, siguiendo operations/search.md,
// operations/predecessor.md y operations/successor.md: un único descenso
// desde la raíz, guardando el último candidato visitado.

#include <algorithm>
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
    if (fb > 1) {
        if (balanceFactor(node->left) < 0) node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    if (fb < -1) {
        if (balanceFactor(node->right) > 0) node->right = rotateRight(node->right);
        return rotateLeft(node);
    }
    return node;
}

Node* insert(Node* node, int x) {
    if (!node) return new Node(x);
    if (x < node->key) node->left = insert(node->left, x);
    else if (x > node->key) node->right = insert(node->right, x);
    else return node;
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
