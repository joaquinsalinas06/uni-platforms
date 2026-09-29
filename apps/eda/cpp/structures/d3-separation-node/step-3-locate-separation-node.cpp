// Paso 3 — localización del nodo de separación.
//
// La operación central de D3 (Sem5_Fractional_Cascading_II.pdf#40): al
// buscar a2 y b2 en el árbol de y, sus caminos coinciden hasta un nodo
// v_split donde se separan — exactamente como en un árbol de rangos 1D
// clásico. No se reexplica ese algoritmo base (referencia a range-tree);
// aquí se instancia sobre el árbol y las satélites de D3.

#include <algorithm>
#include <vector>

struct Point {
    int x;
    int y;
    int id;
};

struct Node {
    int key = 0;
    Point point{};
    Node* left = nullptr;
    Node* right = nullptr;
    std::vector<Point> rightSat;
    std::vector<Point> leftSat;
    bool isLeaf() const { return left == nullptr && right == nullptr; }
};

// Desciende mientras a2 y b2 caigan del mismo lado de key(v); se detiene
// en cuanto divergen, o al llegar a una hoja.
static Node* locateSeparationNode(Node* root, int a2, int b2) {
    Node* v = root;
    while (!v->isLeaf()) {
        if (b2 <= v->key) {
            v = v->left;
        } else if (a2 > v->key) {
            v = v->right;
        } else {
            // a2 <= key(v) < b2: uno va a la izquierda, el otro a la
            // derecha. Se separan aquí.
            return v;
        }
    }
    return v; // ambos terminan en la misma hoja
}
