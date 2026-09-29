// Paso 3 — el build completo: árbol de rango + localización del nodo de
// separación, que es lo que hace falta para que cada nodo pueda decidir cuál
// de sus dos satélites (normal / invertida) responde una consulta.
//
// El profesor no separa "construir el árbol" de "construir el satélite de
// cada nodo" en el material (#46 lo describe como un solo paso), así que
// aquí tampoco: build_range_tree ya deja, en cada nodo, todo lo que hace
// falta para that el satélite de la derecha use "normal" (z/y <= b) y el de
// la izquierda use "invertida" (z/y >= a) — sólo falta, en tiempo de
// consulta, encontrar el nodo de separación.

#include "step-2-range-tree-generic.cpp"

// Localiza el nodo de separación de un árbol de rango 1D clásico: el punto
// donde los caminos de búsqueda de `lo` y `hi` divergen (#40, heredado sin
// cambios de D_3 a D_4 según el análisis).
inline RangeTreeNode* locate_split_node(RangeTreeNode* root, double lo, double hi) {
    RangeTreeNode* v = root;
    while (v != nullptr) {
        if (hi < v->key) {
            v = v->left;
        } else if (lo > v->key) {
            v = v->right;
        } else {
            return v;  // lo <= v->key <= hi: los caminos ya divergieron aquí
        }
    }
    return nullptr;
}
