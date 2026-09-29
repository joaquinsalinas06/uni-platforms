// Paso 2 — las rotaciones (la pieza que operations/insert.md define y que
// la semana 5 reutiliza como primitiva O(1)).
//
// rotateRight(p): p tiene hijo izquierdo n; n sube a la raíz del
// subárbol, p pasa a ser su hijo derecho, y el hijo derecho de n (B)
// pasa a ser el hijo izquierdo de p. rotateLeft es la inversa.

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

// p con hijo izquierdo n: n sube, p baja a hijo derecho de n.
Node* rotateRight(Node* p) {
    Node* n = p->left;
    p->left = n->right;
    n->right = p;
    updateHeight(p); // p primero: ya quedó abajo, su altura depende de sus hijos actuales
    updateHeight(n);
    return n;
}

// p con hijo derecho n: n sube, p baja a hijo izquierdo de n.
Node* rotateLeft(Node* p) {
    Node* n = p->right;
    p->right = n->left;
    n->left = p;
    updateHeight(p);
    updateHeight(n);
    return n;
}
