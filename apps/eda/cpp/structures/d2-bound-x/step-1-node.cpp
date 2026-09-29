// Paso 1 — el punto y el nodo de D2, nada más.
//
// "Un BST estándar sobre x. Cada nodo guarda, para los puntos de su
// subárbol, una copia de la estructura de dominancia (D1) que acabamos de
// construir." (Sem5_Fractional_Cascading_II.pdf#33)
//
// A diferencia del range tree del profesor (que guarda las llaves solo en
// las hojas), aquí es un BST ESTÁNDAR: cada nodo guarda un punto real. La
// D1 satélite se representa aquí de forma simplificada -un vector de los
// puntos del subárbol- porque D1 (dominance-2d) es alcance de otro agente;
// esta simplificación basta para demostrar la composición, no reimplementa
// la D1 real.

#include <vector>
using namespace std;

struct Point {
    long x, y, z;
};

struct Node {
    Point p;                 // el punto de este nodo (BST estándar, no solo hojas).
    vector<Point> subtreeD1; // "copia de D1" satélite: puntos del subárbol de este nodo.
    Node* left = nullptr;
    Node* right = nullptr;
};
