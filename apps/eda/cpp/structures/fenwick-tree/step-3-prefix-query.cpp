// Fenwick tree — paso 3: Prefix-query. Baja con i -= lowbit(i).
#include <cassert>
#include <iostream>
#include <vector>

struct Fenwick {
    int n;
    std::vector<long long> tree;
    explicit Fenwick(int n_) : n(n_), tree(n_ + 1, 0) {}

    void update(int i, long long delta) {
        for (; i <= n; i += (i & (-i))) tree[i] += delta;
    }
    long long prefix_query(int i) const {
        long long suma = 0;
        for (; i > 0; i -= (i & (-i))) suma += tree[i];
        return suma;
    }
};

int main() {
    Fenwick f(8);
    for (int i = 1; i <= 8; ++i) f.update(i, i); // A = [1..8]

    assert(f.prefix_query(0) == 0);       // suma vacia
    assert(f.prefix_query(1) == 1);
    assert(f.prefix_query(6) == 1+2+3+4+5+6);
    assert(f.prefix_query(8) == 1+2+3+4+5+6+7+8);

    std::cout << "OK: Prefix-query(6)=" << f.prefix_query(6)
              << " y Prefix-query(8)=" << f.prefix_query(8)
              << " coinciden con la suma directa de A[1..i]\n";
}
