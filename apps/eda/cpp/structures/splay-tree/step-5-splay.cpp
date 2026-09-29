// Paso 5 — Splay(x): el bucle completo del profesor (Sem6 #10), traducido
// línea por línea. Aplica zig / zig-zig / zig-zag según la posición relativa
// de x hasta que x llega a la raíz. Los tres casos son sólo combinaciones de
// rotate (Sem6 #8-9). El costo real es proporcional a la profundidad de x —
// hasta Theta(n) en el peor caso individual; la cota O(log n) es amortizada
// y se demuestra en /structures/access-lemma.

#include "step-4-zig-zag.cpp"

void splay(Node*& root, Node* x) {
    while (x != root) {
        Node* p = x->parent;
        if (p == root) {
            zig(root, x);
        } else {
            Node* g = p->parent;
            bool xLeftOfP = (x == p->left);
            bool pLeftOfG = (p == g->left);
            if (xLeftOfP == pLeftOfG) {
                zigZig(root, x);
            } else {
                zigZag(root, x);
            }
        }
    }
}
