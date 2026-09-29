// Paso 3 — build: construir L'1, ..., L'k de abajo hacia arriba.
//
// Construcción (de abajo hacia arriba) (CS3014...+(6).pdf#16-17):
//   Sea L'k = Lk. Para i de k-1 a 1:
//       L'i = Li ∪ {cada elemento par de L'i+1}.
//   Cada elemento promovido guarda un puente a su posición exacta en L'i+1.

#include <vector>
using namespace std;

struct Elem {
    int value;
    int bridge; // índice en L'{i+1}, o -1 si no fue promovido
};

using AugList = vector<Elem>;

AugList own_elems(const vector<int>& Li) {
    AugList out;
    for (int v : Li) out.push_back({v, -1});
    return out;
}

// Mezcla los elementos propios de Li (ordenados) con la mitad promovida de
// L'{i+1} (posiciones 1-indexadas pares: 2, 4, ...), preservando el orden.
AugList merge_promote(const vector<int>& Li, const AugList& next) {
    AugList promoted;
    // "elemento par" del material es posición 1-indexada par (2, 4, ...),
    // es decir índice 0-indexado impar (1, 3, ...).
    for (int j = 1; j < (int)next.size(); j += 2) {
        promoted.push_back({next[j].value, j}); // puente = índice j en next
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

// Construye L'1, ..., L'k a partir de las listas originales L1, ..., Lk.
// lists[0] = L1, ..., lists[k-1] = Lk. Devuelve augmented[0..k-1] en el
// mismo orden (augmented[k-1] = L'k = Lk sin cambios).
vector<AugList> build(const vector<vector<int>>& lists) {
    int k = (int)lists.size();
    vector<AugList> augmented(k);
    augmented[k - 1] = own_elems(lists[k - 1]); // L'k = Lk
    for (int i = k - 2; i >= 0; --i) {
        augmented[i] = merge_promote(lists[i], augmented[i + 1]);
    }
    return augmented;
}
