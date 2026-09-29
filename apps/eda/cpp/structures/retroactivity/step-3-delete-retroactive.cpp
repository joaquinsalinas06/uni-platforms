// Paso 3 — Delete-retroactive(t).
//
// DERIVADO (el mazo da la firma Delete(t), páginas 14-17, sin
// pseudocódigo). Versión ingenua: ubicar la entrada en tiempo t y
// retirarla. Igual que Insert-retroactive, el "recalcular el presente" no
// es un paso separado: ocurre la próxima vez que se llama a Query, que
// siempre rehace la línea de tiempo completa hasta el t consultado.

#include <algorithm>
#include <stdexcept>
#include <vector>
using namespace std;

struct Op {
    double time;
    int delta;
};

vector<Op> timeline;

void insertRetroactive(double t, int delta) {
    Op entry{t, delta};
    auto pos = upper_bound(
        timeline.begin(), timeline.end(), entry,
        [](const Op& a, const Op& b) { return a.time < b.time; });
    timeline.insert(pos, entry);
}

// O(m): localizar la entrada de tiempo t y retirarla.
void deleteRetroactive(double t) {
    auto it = find_if(timeline.begin(), timeline.end(),
                       [t](const Op& o) { return o.time == t; });
    if (it == timeline.end())
        throw invalid_argument("delete-retroactive: no hay operacion en ese tiempo");
    timeline.erase(it);
}
