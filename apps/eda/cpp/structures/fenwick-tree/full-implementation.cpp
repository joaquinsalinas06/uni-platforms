// Fenwick tree — concepto de apoyo (supportConcept), NO material del curso.
// El profesor lo nombra una sola vez, sin explicarlo, como alternativa al
// segment tree para el caso simple del barrido de segmentos (ver theory.md).
// Derivacion estandar de la literatura, no del profesor.
//
// La mejor verificacion posible para esta estructura es contrastarla contra
// una suma por fuerza bruta sobre el mismo arreglo: si ambas coinciden en
// cada update y cada consulta, el truco de lowbit es correcto.
#include <cassert>
#include <iostream>
#include <numeric>
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

// Fuerza bruta: mismo A[1..n], suma directa del prefijo. Contra esto se
// contrasta cada operacion del Fenwick tree.
struct BruteForce {
    std::vector<long long> a;
    explicit BruteForce(int n) : a(n + 1, 0) {}
    void update(int i, long long delta) { a[i] += delta; }
    long long prefix_query(int i) const { return std::accumulate(a.begin() + 1, a.begin() + 1 + i, 0LL); }
};

int main() {
    const int n = 8;
    Fenwick fw(n);
    BruteForce bf(n);

    // Inicializa A = [1..8] en ambas estructuras vía Update.
    for (int i = 1; i <= n; ++i) {
        fw.update(i, i);
        bf.update(i, i);
    }
    for (int i = 0; i <= n; ++i) assert(fw.prefix_query(i) == bf.prefix_query(i));
    std::cout << "OK: tras inicializar A=[1..8], Fenwick y fuerza bruta coinciden en prefix_query(0..8)\n";

    // Update(3, +5): compara ambas tras la misma modificacion.
    fw.update(3, 5);
    bf.update(3, 5);
    for (int i = 0; i <= n; ++i) assert(fw.prefix_query(i) == bf.prefix_query(i));
    std::cout << "OK: tras Update(3,+5), Fenwick=" << fw.prefix_query(n)
              << " vs fuerza bruta=" << bf.prefix_query(n) << " (coinciden)\n";

    // Caso limite: i = n, el prefijo mas largo posible.
    assert(fw.prefix_query(n) == bf.prefix_query(n));
    std::cout << "OK: prefix_query(n) (rango completo) coincide con la suma total\n";

    // Caso limite: i = 0, suma vacia.
    assert(fw.prefix_query(0) == 0 && bf.prefix_query(0) == 0);
    std::cout << "OK: prefix_query(0) = 0 en ambas (suma vacia)\n";

    // Suma de rango(l, r) via resta de prefijos: exacta porque suma es invertible.
    auto range_sum = [&](int l, int r) { return fw.prefix_query(r) - fw.prefix_query(l - 1); };
    auto range_sum_bf = [&](int l, int r) { return bf.prefix_query(r) - bf.prefix_query(l - 1); };
    assert(range_sum(2, 6) == range_sum_bf(2, 6));
    std::cout << "OK: suma(2,6) via resta de prefijos coincide con fuerza bruta: " << range_sum(2, 6) << "\n";

    std::cout << "\nOK: Fenwick tree (update, prefix-query) verificado contra suma por fuerza bruta en todos los casos.\n";
}
