// Paso 4 — Query(t).
//
// DERIVADO (el mazo da la firma Query(t, op), páginas 14-17, sin
// pseudocódigo). Versión ingenua: recorrer la línea de tiempo completa,
// acumulando el efecto de toda operación con tiempo <= t. Esto es lo que
// hace tangible al modelo: Query no lee un valor guardado, LO RECALCULA
// por fuerza bruta cada vez — así que cualquier Insert/Delete-retroactive
// anterior en el pasado ya se refleja, sin ningún paso extra.
//
// Nótese que esta implementación soporta retroactividad COMPLETA sin
// esfuerzo adicional: puede consultar cualquier t, no sólo el presente.
// La restricción "parcial" (Query solo en el presente) es una restricción
// de la INTERFAZ que se decide exponer, no una necesidad de esta
// implementación de fuerza bruta.

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

void deleteRetroactive(double t) {
    auto it = find_if(timeline.begin(), timeline.end(),
                       [t](const Op& o) { return o.time == t; });
    if (it == timeline.end())
        throw invalid_argument("delete-retroactive: no hay operacion en ese tiempo");
    timeline.erase(it);
}

// O(m): recorre toda la línea de tiempo hasta t. El punto de referencia
// "solución ingenua = O(m)" de theory.md es exactamente este recorrido.
int query(double t) {
    int total = 0;
    for (const Op& o : timeline) {
        if (o.time <= t) total += o.delta;
        else break; // timeline está ordenado por tiempo: nada más que ver
    }
    return total;
}
