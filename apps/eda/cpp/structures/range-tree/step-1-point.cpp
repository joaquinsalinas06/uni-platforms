// Paso 1 — el punto y el nodo, nada más.
//
// Un punto es un vector de coordenadas: en 1D tiene una sola ({llave}), en
// 2D dos ({x, y}), en d dimensiones d. La misma representación sirve para
// todos los casos (build-1d, build-2d, d-dimensions): sólo cambia cuántas
// coordenadas trae.
//
// El profesor guarda las llaves SOLO en las hojas (a diferencia de un BST
// de libro): un nodo interno nunca guarda un punto real, sólo el máximo
// del subárbol izquierdo (Sem4_Orthogonal_Range_Search.pdf#26), para
// minimizar la memoria usada.

#include <vector>
using namespace std;

using Point = vector<long>; // Point[i] = coordenada i.

struct Node {
    bool leaf = false;
    Point pt;                    // válido solo si leaf: el punto completo.
    long maxLeft = 0;            // válido solo si interno: delimitador (#26).
    long loKey = 0, hiKey = 0;   // extremos (en la coordenada de este árbol)
                                 // del subárbol; los usa range-query-1d/2d
                                 // para la descomposición canónica.
    int count = 0;               // hojas en el subárbol (existence-count, #37).
    int leafIndex = -1;           // posición in-order; solo se llena en el
                                   // árbol primario (predecessor-successor).
    Node* left = nullptr;
    Node* right = nullptr;
    Node* nextDim = nullptr;      // range tree de la dimensión siguiente,
                                   // colgado de este nodo (build-2d,
                                   // d-dimensions); nullptr en la última
                                   // dimensión.
};
