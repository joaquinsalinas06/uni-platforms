// Paso 2 — Insert-retroactive(t, op).
//
// DERIVADO (el mazo da la firma Insert(t, op), páginas 14-17, sin
// pseudocódigo). Versión ingenua: ubicar la posición de t en la línea de
// tiempo ordenada e insertar ahí. No hace falta "recalcular el presente"
// como un paso aparte: como Query (paso 4) siempre recorre la línea de
// tiempo completa hasta el t consultado, el presente queda recalculado la
// próxima vez que se consulta, automáticamente.

#include <algorithm>
#include <vector>
using namespace std;

struct Op {
    double time;
    int delta;
};

vector<Op> timeline;

// Mantiene el invariante de orden por tiempo. O(m) por el desplazamiento de
// insert() sobre un vector — el costo ingenuo del que habla el profesor.
void insertRetroactive(double t, int delta) {
    Op entry{t, delta};
    auto pos = upper_bound(
        timeline.begin(), timeline.end(), entry,
        [](const Op& a, const Op& b) { return a.time < b.time; });
    timeline.insert(pos, entry);
}
