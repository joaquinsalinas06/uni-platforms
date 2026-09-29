// Paso 2 — la lista aumentada L'i como arreglo ordenado de Elem.
//
// L'i mezcla los elementos propios de Li con la mitad promovida de L'{i+1},
// manteniendo el orden. `bridge` de un elemento propio queda en -1.

#include <vector>
using namespace std;

struct Elem {
    int value;
    int bridge; // índice en L'{i+1}, o -1 si no fue promovido
};

using AugList = vector<Elem>;

// Construye Elem "propios" (sin puente) a partir de una lista Li cruda.
AugList own_elems(const vector<int>& Li) {
    AugList out;
    for (int v : Li) out.push_back({v, -1});
    return out;
}
