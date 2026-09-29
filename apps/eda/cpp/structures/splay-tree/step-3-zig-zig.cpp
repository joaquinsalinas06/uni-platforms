// Paso 3 — zig (#64) y zig-zig (#65).
//
// zigZig rota primero el par (p, a) — el abuelo — y sólo DESPUÉS el par
// (x, p). Ese orden es el punto central del tema: invertirlo (rotar (x, p)
// primero, dos veces) da el algoritmo "move-to-root", que no logra la cota
// amortizada de O(log n) (ver la nota de apoyo en
// content/structures/splay-tree/operations/zig-zig.md).

#include "step-2-rotate.cpp"

// x es hijo directo de la raíz: una sola rotación.
void zig(Node*& root, Node* x) {
    rotate(root, x);
}

// x, p y a (abuelo) alineados del mismo lado.
void zigZig(Node*& root, Node* x) {
    Node* p = x->parent;
    rotate(root, p);   // (p, a) PRIMERO — no (x, p)
    rotate(root, x);   // (x, p) segundo
}
