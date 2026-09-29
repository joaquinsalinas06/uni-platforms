// Paso 4 — query: buscar x en todas las listas sin repetir la búsqueda
// binaria (CS3014...+(6).pdf#20-24).
//
//   1. Una única búsqueda binaria de x en L'1: O(lg n).
//   2. Desde esa posición, seguir el puente más cercano hacia L'2: cae a lo
//      más ±1 posición de donde x realmente iría — ajustar con O(1)
//      comparaciones.
//   3. Repetir para bajar a L'3, ..., Lk: O(1) cada uno.

#include <vector>
using namespace std;

struct Elem {
    int value;
    int bridge;
};

using AugList = vector<Elem>;

// Búsqueda binaria real: primer índice con value >= x (o size() si ninguno).
// Cuenta cada comparación en `cmp` para poder contrastar contra la ingenua.
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

// Baja de L'{i-1} a L'i siguiendo el puente más cercano y ajustando
// localmente. El profesor garantiza que el ajuste cae a lo más ±1 posición
// de donde x va; el `while` de abajo es ese ajuste O(1), no otra búsqueda
// binaria completa.
int follow_bridge(const AugList& from, const AugList& to, int pos, int x, long long& cmp) {
    int src = min(pos, (int)from.size() - 1);
    while (src >= 0 && from[src].bridge == -1) --src; // el puente más cercano hacia atrás
    int p = (src >= 0) ? from[src].bridge : 0;

    while (p > 0 && to[p - 1].value >= x) { --p; ++cmp; }
    while (p < (int)to.size() && to[p].value < x) { ++p; ++cmp; }
    return p;
}

// Busca x en L'1, ..., L'k. Devuelve true/false por lista en `found`, y el
// total de comparaciones usadas en `cmp` (una única búsqueda real + O(1) por
// puente bajado).
void query(const vector<AugList>& augmented, int x, vector<bool>& found, long long& cmp) {
    int k = (int)augmented.size();
    found.assign(k, false);
    if (k == 0) return;

    // found[i] exige bridge == -1: un match con puente es un elemento
    // promovido (pertenece de verdad a una lista más abajo), no un miembro
    // propio de Li. Esto asume valores únicos entre listas (ver
    // full-implementation.cpp), como en el resto de este ejemplo.
    int pos = lower_bound_idx(augmented[0], x, cmp);
    found[0] = pos < (int)augmented[0].size() && augmented[0][pos].value == x
               && augmented[0][pos].bridge == -1;

    for (int i = 1; i < k; ++i) {
        pos = follow_bridge(augmented[i - 1], augmented[i], pos, x, cmp);
        found[i] = pos < (int)augmented[i].size() && augmented[i][pos].value == x
                   && augmented[i][pos].bridge == -1;
    }
}
