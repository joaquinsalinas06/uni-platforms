// Paso 2: el puente (bridge) — el corazon del tema.
//
// Definicion (paginas 56-57): un tiempo t' es un puente si Q_t' esta
// contenido en Q_ahora — nada de lo presente en t' fue eliminado despues.
// El inicio de la linea de tiempo (Q = vacio) es siempre un puente
// trivial, porque el conjunto vacio esta contenido en cualquier cosa.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <vector>
using namespace std;

struct Op {
    double t;
    bool is_insert;
    int key;
};

struct RetroactivePQ {
    vector<Op> timeline;

    void insert_op(double t, bool is_insert, int key = 0) {
        Op op{t, is_insert, key};
        auto it = lower_bound(timeline.begin(), timeline.end(), t,
                               [](const Op& a, double tt) { return a.t < tt; });
        timeline.insert(it, op);
    }

    struct Replay {
        vector<set<int>> after;
        set<int> now;
    };
    Replay replay() const {
        Replay r;
        multiset<int> q;
        for (const auto& op : timeline) {
            if (op.is_insert) {
                q.insert(op.key);
            } else if (!q.empty()) {
                q.erase(q.begin());
            }
            r.after.push_back(set<int>(q.begin(), q.end()));
        }
        r.now = set<int>(q.begin(), q.end());
        return r;
    }

    set<int> Q_now() const { return replay().now; }

    // Q_tprima ⊆ Q_ahora: exactamente la definicion de puente.
    static bool is_bridge(const set<int>& q_tprime, const set<int>& q_now) {
        return includes(q_now.begin(), q_now.end(), q_tprime.begin(), q_tprime.end());
    }

    // Indice en timeline del puente mas cercano ANTES de t (estado tras
    // timeline[i]), o -1 si el unico puente antes de t es el inicio de la
    // linea de tiempo (Q = vacio, antes de toda operacion).
    int nearest_bridge_before(double t) const {
        Replay r = replay();
        int best = -1; // -1 = "inicio", siempre valido como puente
        for (size_t i = 0; i < timeline.size(); ++i) {
            if (timeline[i].t >= t) break;
            if (is_bridge(r.after[i], r.now)) best = static_cast<int>(i);
        }
        return best;
    }
};

int main() {
    // Ejemplo derivado con un puente INTERIOR real (el ejemplo del
    // profesor solo tiene el puente trivial del inicio): ins(10),
    // del-min (quita 10, Q queda vacio: puente), ins(1), ins(2),
    // del-min (quita 1). Q_ahora = {2}.
    RetroactivePQ pq;
    pq.insert_op(1, true, 10);
    pq.insert_op(2, false);
    pq.insert_op(3, true, 1);
    pq.insert_op(4, true, 2);
    pq.insert_op(5, false);

    assert((pq.Q_now() == set<int>{2}));

    int idx = pq.nearest_bridge_before(2.5);
    assert(idx == 1); // timeline[1] es el del-min en t=2
    cout << "OK: puente encontrado en t=" << pq.timeline[idx].t
         << " (Q en ese instante quedo vacio tras eliminar el 10)\n";

    // Antes de t=1 (antes de toda operacion), el unico puente es el inicio.
    int idx0 = pq.nearest_bridge_before(0.5);
    assert(idx0 == -1);
    cout << "OK: antes de t=0.5 el unico puente es el inicio de la linea de tiempo\n";

    return 0;
}
