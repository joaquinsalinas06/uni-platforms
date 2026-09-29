// Árbol binomial B_k: construcción recursiva y verificación de sus
// propiedades de conteo. No hay operaciones (es un concepto, no una
// estructura con interfaz) — todo el archivo es: nodo, construcción,
// medición, main() con asserts.
//
// g++ -std=c++20 -Wall full-implementation.cpp -o bt && ./bt

#include <algorithm>
#include <cassert>
#include <cstdio>
#include <vector>

// --- Paso 1: el nodo -------------------------------------------------------
// Representación hijo-izquierdo/hermano-derecho: cada nodo guarda su primer
// hijo y su siguiente hermano. Es la única forma natural de guardar un
// número variable de hijos por nodo.
struct Node {
    int key;
    Node* first_child = nullptr;
    Node* next_sibling = nullptr;
    explicit Node(int k) : key(k) {}
};

// --- Paso 2: construcción recursiva ----------------------------------------
// B_0 = un solo nodo (caso base).
// B_k = dos copias de B_{k-1} enlazadas: la raíz de una se convierte en el
// hijo más a la izquierda de la raíz de la otra.

// Enlaza dos árboles del MISMO orden: la raíz de `b` se convierte en el
// hijo más a la izquierda de la raíz de `a`. Devuelve la nueva raíz (a).
Node* binomial_link(Node* a, Node* b) {
    b->next_sibling = a->first_child;
    a->first_child = b;
    return a;
}

// Construye B_k enlazando dos B_{k-1} construidos por separado.
Node* build_tree(int k, int& next_key) {
    if (k == 0) return new Node(next_key++);
    Node* a = build_tree(k - 1, next_key);
    Node* b = build_tree(k - 1, next_key);
    return binomial_link(a, b);
}

// --- Paso 3: verificación de propiedades -----------------------------------

int count_nodes(Node* root) {
    if (!root) return 0;
    int total = 1;
    for (Node* c = root->first_child; c; c = c->next_sibling)
        total += count_nodes(c);
    return total;
}

int height(Node* root) {
    int max_child_height = -1;
    for (Node* c = root->first_child; c; c = c->next_sibling)
        max_child_height = std::max(max_child_height, height(c));
    return max_child_height + 1;
}

int root_degree(Node* root) {
    int degree = 0;
    for (Node* c = root->first_child; c; c = c->next_sibling) degree++;
    return degree;
}

void count_by_depth(Node* root, int depth, std::vector<int>& counts) {
    if (static_cast<int>(counts.size()) <= depth) counts.resize(depth + 1, 0);
    counts[depth]++;
    for (Node* c = root->first_child; c; c = c->next_sibling)
        count_by_depth(c, depth + 1, counts);
}

long long binomial_coeff(int k, int i) {
    if (i < 0 || i > k) return 0;
    long long result = 1;
    for (int j = 0; j < i; j++) result = result * (k - j) / (j + 1);
    return result;
}

void free_tree(Node* root) {
    if (!root) return;
    for (Node* c = root->first_child; c;) {
        Node* next = c->next_sibling;
        free_tree(c);
        c = next;
    }
    delete root;
}

int main() {
    for (int k = 0; k <= 4; k++) {
        int next_key = 0;
        Node* root = build_tree(k, next_key);

        int nodes = count_nodes(root);
        int h = height(root);
        int deg = root_degree(root);
        std::vector<int> depth_counts;
        count_by_depth(root, 0, depth_counts);

        printf("B_%d: nodos=%d altura=%d grado_raiz=%d\n", k, nodes, h, deg);

        assert(nodes == (1 << k));      // 2^k nodos
        assert(h == k);                 // altura k
        assert(deg == k);               // grado de la raiz k

        for (int i = 0; i <= k; i++) {
            long long expected = binomial_coeff(k, i);
            int actual = (i < static_cast<int>(depth_counts.size())) ? depth_counts[i] : 0;
            assert(actual == expected);  // C(k,i) nodos a profundidad i
        }

        free_tree(root);
    }

    printf("Todas las propiedades de B_0..B_4 verificadas.\n");
    return 0;
}
