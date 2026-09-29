// Implementación completa de fractional cascading. Junta los pasos 1-4 y
// contrasta la consulta contra la búsqueda binaria ingenua (independiente
// en cada lista), verificando que ambas dan el mismo resultado y contando
// las comparaciones de cada una — la demostración del ahorro (#20-26).
//
// g++ -std=c++20 -Wall full-implementation.cpp -o fc && ./fc

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
using namespace std;

struct Elem {
    int value;
    int bridge; // índice en L'{i+1}, o -1 si no fue promovido
};
using AugList = vector<Elem>;

// ---- build (paso 3) ----

AugList own_elems(const vector<int>& Li) {
    AugList out;
    for (int v : Li) out.push_back({v, -1});
    return out;
}

// L'i = Li ∪ {cada elemento par de L'{i+1}} (CS3014...+(6).pdf#16-17).
AugList merge_promote(const vector<int>& Li, const AugList& next) {
    AugList promoted;
    // "elemento par" del material es posición 1-indexada par (2, 4, ...),
    // es decir índice 0-indexado impar (1, 3, ...).
    for (int j = 1; j < (int)next.size(); j += 2) {
        promoted.push_back({next[j].value, j});
    }
    AugList own = own_elems(Li);

    AugList out;
    size_t a = 0, b = 0;
    while (a < own.size() && b < promoted.size()) {
        if (own[a].value <= promoted[b].value) out.push_back(own[a++]);
        else out.push_back(promoted[b++]);
    }
    while (a < own.size()) out.push_back(own[a++]);
    while (b < promoted.size()) out.push_back(promoted[b++]);
    return out;
}

vector<AugList> build(const vector<vector<int>>& lists) {
    int k = (int)lists.size();
    vector<AugList> augmented(k);
    augmented[k - 1] = own_elems(lists[k - 1]); // L'k = Lk, no cambia
    for (int i = k - 2; i >= 0; --i) {
        augmented[i] = merge_promote(lists[i], augmented[i + 1]);
    }
    return augmented;
}

// ---- query con fractional cascading (paso 4) ----

int lower_bound_idx(const AugList& L, int x, long long& cmp) {
    int lo = 0, hi = (int)L.size();
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        ++cmp;
        if (L[mid].value < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Ajuste O(1): el puente cae a lo más ±1 posición de donde x va (#22).
int follow_bridge(const AugList& from, const AugList& to, int pos, int x, long long& cmp) {
    int src = min(pos, (int)from.size() - 1);
    while (src >= 0 && from[src].bridge == -1) --src;
    int p = (src >= 0) ? from[src].bridge : 0;

    while (p > 0 && to[p - 1].value >= x) { --p; ++cmp; }
    while (p < (int)to.size() && to[p].value < x) { ++p; ++cmp; }
    return p;
}

// Devuelve, por lista, si x pertenece a Li, y el total de comparaciones
// usadas: una única búsqueda binaria real + O(1) por puente bajado.
vector<bool> cascade_query(const vector<AugList>& augmented, int x, long long& cmp) {
    int k = (int)augmented.size();
    vector<bool> found(k, false);
    if (k == 0) return found;

    int pos = lower_bound_idx(augmented[0], x, cmp);
    found[0] = pos < (int)augmented[0].size() && augmented[0][pos].value == x
               && augmented[0][pos].bridge == -1;

    for (int i = 1; i < k; ++i) {
        pos = follow_bridge(augmented[i - 1], augmented[i], pos, x, cmp);
        found[i] = pos < (int)augmented[i].size() && augmented[i][pos].value == x
                   && augmented[i][pos].bridge == -1;
    }
    return found;
}

// ---- búsqueda ingenua: binaria independiente en cada lista, O(k lg n) ----

vector<bool> naive_query(const vector<vector<int>>& lists, int x, long long& cmp) {
    vector<bool> found(lists.size(), false);
    for (size_t i = 0; i < lists.size(); ++i) {
        int lo = 0, hi = (int)lists[i].size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            ++cmp;
            if (lists[i][mid] < x) lo = mid + 1;
            else hi = mid;
        }
        found[i] = lo < (int)lists[i].size() && lists[i][lo] == x;
    }
    return found;
}

int main() {
    // Rangos disjuntos entre listas: evita la ambigüedad de un valor que
    // aparece a la vez como propio de Li y como promovido de L{i+1} (el
    // material no cubre ese caso límite; se evita por diseño del ejemplo).
    vector<vector<int>> lists = {
        {2, 8, 15, 23, 31, 40, 55, 61, 70, 88},   // L1
        {3, 5, 12, 26, 34, 45, 58, 66, 75, 91},   // L2
        {4, 9, 13, 18, 22, 36, 49, 63, 77, 95},   // L3
        {7, 11, 17, 20, 29, 41, 52, 60, 80, 99},  // L4
    };
    int k = (int)lists.size();
    auto augmented = build(lists);

    // 1) El ejemplo literal del material (#18-19), k = 3, verifica la forma
    //    exacta de la construcción.
    {
        vector<vector<int>> ex = {{2, 8, 15}, {3, 5, 12}, {4, 9, 13, 18, 22}};
        auto aug = build(ex);
        assert(aug[2].size() == ex[2].size()); // L'3 = L3, no cambia
        vector<int> Lp2_values;
        for (auto& e : aug[1]) Lp2_values.push_back(e.value);
        assert((Lp2_values == vector<int>{3, 5, 9, 12, 18}));
        cout << "[ok] build reproduce L'2 = [3, 5, 9*, 12, 18*] del material (#18-19)\n";
    }

    // 2) Tamaño de L'1: la cota de la serie geométrica (#26) dice O(n) total,
    //    no Θ(kn). Con 4 listas de 10 elementos (n_total = 40), Θ(kn) sería
    //    hasta 40; O(n) por nivel implica que L'1 se queda cerca del tamaño
    //    de una sola lista más lo promovido, muy por debajo de sumarlas todas.
    {
        int n_total = 0;
        for (auto& L : lists) n_total += (int)L.size();
        assert((int)augmented[0].size() < n_total); // no explota a la suma de todas
        cout << "[ok] |L'1| = " << augmented[0].size()
             << " < suma de las " << k << " listas (" << n_total
             << "); la serie geometrica evita el Theta(kn)\n";
    }

    // 3) Contraste cascade vs. ingenua: mismo resultado, y la cascada usa
    //    menos comparaciones — la demostración del tema (#20-26).
    {
        vector<int> queries = {9, 26, 100, 2, 41, 63, -5, 91};
        long long total_cascade = 0, total_naive = 0;
        for (int x : queries) {
            long long c_cascade = 0, c_naive = 0;
            auto found_cascade = cascade_query(augmented, x, c_cascade);
            auto found_naive = naive_query(lists, x, c_naive);
            assert(found_cascade == found_naive);
            total_cascade += c_cascade;
            total_naive += c_naive;
            cout << "  x=" << x << ": cascade=" << c_cascade
                 << " comparaciones, ingenua=" << c_naive << " comparaciones\n";
        }
        cout << "[ok] cascade y busqueda ingenua coinciden en las " << queries.size()
             << " consultas\n";
        cout << "[ok] total comparaciones -- cascade: " << total_cascade
             << ", ingenua: " << total_naive
             << " (" << queries.size() << " consultas x " << k << " listas)\n";
        assert(total_cascade < total_naive);
        cout << "[ok] fractional cascading usa menos comparaciones en total: "
             << total_cascade << " < " << total_naive << "\n";
    }

    // 4) Caso límite: x menor que todo (found en ninguna lista).
    {
        long long c = 0;
        auto found = cascade_query(augmented, -100, c);
        assert(none_of(found.begin(), found.end(), [](bool b) { return b; }));
        cout << "[ok] x menor que todos los elementos: no encontrado en ninguna lista\n";
    }

    // 5) Caso límite: k = 1 (una sola lista), query se reduce a binaria simple.
    {
        vector<vector<int>> one = {{1, 4, 7, 10}};
        auto aug_one = build(one);
        long long c = 0;
        auto found = cascade_query(aug_one, 7, c);
        assert(found[0] == true);
        cout << "[ok] k=1: la consulta se reduce a una unica busqueda binaria (encontro 7)\n";
    }

    cout << "Todas las verificaciones pasaron.\n";
    return 0;
}
