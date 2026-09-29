// Paso 1: representación del árbol como arreglo (indexación tipo montículo).
// Concepto de apoyo (no material del curso): derivación estándar.
#include <vector>
#include <iostream>
using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree; // tamaño 4n, nodo i -> hijos 2i, 2i+1

    explicit SegmentTree(int n_) : n(n_), tree(4 * n_, 0) {}
};

int main() {
    SegmentTree st(4);
    cout << "nodos reservados: " << st.tree.size() << "\n";
}
