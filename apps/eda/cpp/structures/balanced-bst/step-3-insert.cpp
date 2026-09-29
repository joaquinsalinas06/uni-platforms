// Paso 3 — Insert con rebalanceo, siguiendo el pseudocódigo de
// operations/insert.md: bajar como en un BST común, subir recalculando
// alturas, y en el primer nodo donde el invariante se rompe, rotar.
//
// El pseudocódigo del profesor (derivado, sin diapositiva) sólo muestra el
// caso simple (una rotación). Aquí completamos los cuatro casos AVL
// estándar: izq-izq y der-der se corrigen con una rotación simple;
// izq-der y der-izq necesitan una rotación doble (primero sobre el hijo,
// luego sobre el nodo) porque una sola rotación simple no restaura el
// invariante en esos dos casos.

#include <algorithm>
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
