// Segment tree — concepto de apoyo (supportConcept), NO material del curso.
// El profesor nunca lo explica en diapositivas; se usa aqui para dar el
// Build/Update/Query minimo que necesitan path-copying (persistencia) y
// decomposable-search-problem (retroactividad sobre el eje del tiempo).
// Derivacion estandar de la literatura, no del profesor.
#include <vector>
#include <iostream>
#include <cassert>
#include <functional>
#include <limits>
using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree;
    vector<long long> a;
    long long neutral;
    function<long long(long long, long long)> combine;

    // combine debe ser asociativa; neutral es su elemento neutro
    // (0 para suma, +infinito para minimo, -infinito para maximo, ...).
    SegmentTree(const vector<long long>& values, long long neutral_,
                function<long long(long long, long long)> combine_)
        : n((int)values.size()), tree(n > 0 ? 4 * n : 4, 0), a(values),
          neutral(neutral_), combine(std::move(combine_)) {
        if (n > 0) build(1, 0, n - 1);
    }

    void build(int node, int l, int r) {
        if (l == r) {
            tree[node] = a[l];
            return;
        }
        int m = (l + r) / 2;
        build(2 * node, l, m);
        build(2 * node + 1, m + 1, r);
        tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    }

    void update(int node, int l, int r, int pos, long long val) {
        if (l == r) {
            tree[node] = val;
            return;
        }
        int m = (l + r) / 2;
        if (pos <= m) update(2 * node, l, m, pos, val);
        else update(2 * node + 1, m + 1, r, pos, val);
        tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    }
    void update(int pos, long long val) { update(1, 0, n - 1, pos, val); }

    long long query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return neutral;
        if (ql <= l && r <= qr) return tree[node];
        int m = (l + r) / 2;
        return combine(query(2 * node, l, m, ql, qr),
                        query(2 * node + 1, m + 1, r, ql, qr));
    }
    long long query(int ql, int qr) { return query(1, 0, n - 1, ql, qr); }
};

int main() {
    // --- Caso normal: A = [1,2,3,4], combinar = suma ---
    SegmentTree sum({1, 2, 3, 4}, 0, [](long long x, long long y) { return x + y; });
    assert(sum.query(0, 3) == 10);           // rango completo
    assert(sum.query(1, 3) == 9);            // 2+3+4
    sum.update(3, 10);                       // posicion 4 (0-idx 3) -> 10
    assert(sum.query(0, 3) == 16);           // 1+2+3+10
    assert(sum.query(1, 3) == 15);           // 2+3+10, es el camino [3,4] resaltado en update.md

    // --- Caso de un solo elemento ---
    SegmentTree single({5}, 0, [](long long x, long long y) { return x + y; });
    assert(single.query(0, 0) == 5);
    single.update(0, 42);
    assert(single.query(0, 0) == 42);

    // --- Consulta de rango completo tras varias actualizaciones ---
    SegmentTree full({1, 1, 1, 1, 1}, 0, [](long long x, long long y) { return x + y; });
    for (int i = 0; i < 5; ++i) full.update(i, i + 1); // [1,2,3,4,5]
    assert(full.query(0, 4) == 15);

    // --- combinar = minimo, para mostrar que solo cambia combine/neutral ---
    SegmentTree mn({5, 3, 8, 1}, numeric_limits<long long>::max(),
                    [](long long x, long long y) { return min(x, y); });
    assert(mn.query(0, 3) == 1);
    assert(mn.query(0, 1) == 3);
    mn.update(3, 100);
    assert(mn.query(0, 3) == 3);

    cout << "OK: build, update, query correctos (caso normal, un elemento, rango completo, minimo)\n";
}
