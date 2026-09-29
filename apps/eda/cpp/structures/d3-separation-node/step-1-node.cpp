// Paso 1 — el nodo del árbol de rango sobre y, y sus dos satélites.
//
// D3 es un árbol de rango sobre `y` (no sobre `x`, a diferencia de D2).
// Cada nodo interno guarda, sobre los puntos de sus DOS hijos, dos
// estructuras satélite (Sem5_Fractional_Cascading_II.pdf#37-39):
//   - en derecha(v): una D2 normal, acotada por arriba (y <= b2)
//   - en izquierda(v): una D2' invertida, acotada por abajo (y >= a2)
//
// Aquí las satélites se representan como el conjunto de puntos que
// contienen, ordenado por x (como haría un D2 real por debajo). Su
// implementación completa (BST sobre x + dominancia D1) es alcance de
// otro agente (d2-bound-x / dominance-2d): aquí se referencian, no se
// reexplican — sólo se filtran por x y por el lado de y que falta.

#include <vector>

struct Point {
    int x;
    int y;
    int id; // identifica el punto para los asserts de verificación
};

struct Node {
    int key = 0;         // la coordenada y que separa izquierda/derecha
    Point point{};        // sólo tiene sentido si el nodo es hoja
    Node* left = nullptr;
    Node* right = nullptr;

    // Satélites construidas en build (paso 2): puntos de cada subárbol,
    // ordenados por x. rightSat = "D2 normal" (todo punto ahí ya cumple
    // y >= a2 para cualquier a2 <= key de este nodo); leftSat = "D2'
    // invertida" (todo punto ahí ya cumple y <= b2 para cualquier
    // b2 > key de este nodo).
    std::vector<Point> rightSat;
    std::vector<Point> leftSat;

    bool isLeaf() const { return left == nullptr && right == nullptr; }
};
