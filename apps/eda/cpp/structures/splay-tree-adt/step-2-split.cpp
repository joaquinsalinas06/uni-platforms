// Paso 2 — Separar(k) (#15). Precondición: ya se ejecutó Buscar(k), así
// que la raíz r es k (si estaba) o su predecesor/sucesor (si no estaba).
// En cualquiera de los dos casos, uno de los dos subárboles de r es todo
// <= k y el otro todo > k (#16).
//
// Por eso el cuerpo entero es: UNA comparación y UN puntero a NULO.
// Ninguna llamada propia a Splay — reutiliza la que ya hizo Buscar (#20).

#include "step-1-base.cpp"

#include <utility>

// Devuelve (I, D): I con todo <= k, D con todo > k. Consume `root`: el
// árbol original queda repartido entre los dos pedazos, así que se deja
// en NULO para que ningún llamador lo siga usando por error.
std::pair<Node*, Node*> split(Node*& root, int k) {
    if (root == nullptr) return {nullptr, nullptr};

    Node* r = root;
    Node* I;
    Node* D;

    if (r->value <= k) {
        // r pertenece al lado izquierdo; su subárbol derecho es todo > k.
        I = r;
        D = r->right;
        r->right = nullptr;
        if (D != nullptr) D->parent = nullptr;
    } else {
        // r pertenece al lado derecho; su subárbol izquierdo es todo <= k.
        D = r;
        I = r->left;
        r->left = nullptr;
        if (I != nullptr) I->parent = nullptr;
    }

    root = nullptr;
    return {I, D};
}
