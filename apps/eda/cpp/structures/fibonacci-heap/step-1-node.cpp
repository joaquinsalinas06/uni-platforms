// Paso 1 — el nodo, nada más.
//
// Cada nodo guarda su llave, su grado (número de hijos), si está marcado,
// un puntero a un hijo cualquiera, un puntero al padre, y los punteros de
// una lista circular doblemente enlazada entre sus hermanos (left/right).
// Esa lista circular es la que hace O(1) tanto "agregar a la lista de
// raíces" como "concatenar dos listas de raíces": empalmar cuatro
// punteros, nunca recorrer.
//
// Invariante de montículo mínimo: la llave de un nodo es menor o igual
// que la de sus hijos. Invariante "las raíces nunca están marcadas"
// (página 20 del mazo): marca(x) sólo tiene sentido si x tiene padre.

#include <iostream>
using namespace std;

struct Node {
    int key;
    int degree = 0;
    bool mark = false;
    Node* parent = nullptr;
    Node* child = nullptr;
    Node* left;   // hermano circular a la izquierda
    Node* right;  // hermano circular a la derecha

    explicit Node(int k) : key(k) {
        left = right = this; // recién creado: lista circular de un solo nodo
    }
};
