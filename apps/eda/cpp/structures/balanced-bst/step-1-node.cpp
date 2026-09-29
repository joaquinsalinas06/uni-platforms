// Paso 1 — el nodo y nada más.
//
// Concepto de apoyo (sin diapositiva propia). Elegimos AVL como el esquema
// de balanceo concreto porque es el más corto de implementar bien; el
// invariante que importa para el curso es genérico (altura O(lg n)), no
// "es AVL" en particular. Cada nodo guarda su altura para poder calcular
// el factor de balance en O(1) sin recorrer el subárbol.

#include <algorithm>
using namespace std;

struct Node {
    int key;
    Node* left;
    Node* right;
    int height; // altura del subárbol con raíz en este nodo; hoja = 0

    explicit Node(int k) : key(k), left(nullptr), right(nullptr), height(0) {}
};

// Nodo nulo tiene altura -1 (convención que usaremos en todos los pasos).
int height(Node* n) { return n ? n->height : -1; }

void updateHeight(Node* n) { n->height = 1 + max(height(n->left), height(n->right)); }

// Factor de balance: altura(izq) - altura(der). Positivo = izquierda más
// alta; negativo = derecha más alta. |factor| > 1 rompe el invariante.
int balanceFactor(Node* n) { return n ? height(n->left) - height(n->right) : 0; }
