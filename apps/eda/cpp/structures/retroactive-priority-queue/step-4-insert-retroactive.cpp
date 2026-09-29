// Paso 4: Insert-retroactive — la unica operacion desarrollada por el
// profesor. Inserta 'insert(k)' en el tiempo t (posiblemente pasado) y
// actualiza Q_ahora con el efecto neto: k entra a Q_ahora, o desplaza a
// exactamente el elemento M entre los eliminados.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <limits>
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

    static bool is_bridge(const set<int>& q_tprime, const set<int>& q_now) {
        return includes(q_now.begin(), q_now.end(), q_tprime.begin(), q_tprime.end());
    }

    int nearest_bridge_before(double t) const {
        Replay r = replay();
        int best = -1;
        for (size_t i = 0; i < timeline.size(); ++i) {
            if (timeline[i].t >= t) break;
            if (is_bridge(r.after[i], r.now)) best = static_cast<int>(i);
        }
        return best;
    }

    int compute_M_bridge(double t, int k) const {
        Replay r = replay();
        int idx = nearest_bridge_before(t);
        double t_prime = (idx == -1) ? -numeric_limits<double>::infinity() : timeline[idx].t;
        int M = k;
        for (const auto& op : timeline) {
            if (op.is_insert && op.t >= t_prime && !r.now.count(op.key)) {
                M = max(M, op.key);
            }
        }
        return M;
    }

    // Efecto neto (paginas 52-53): calcula M con el puente, lo inserta en
    // Q_ahora (agregando 'insert(k)' a la linea de tiempo). Devuelve M
    // para que quien llama pueda comprobar si hubo desplazamiento (M!=k).
    int insert_retroactive(double t, int k) {
        int M = compute_M_bridge(t, k);
        insert_op(t, true, k);
        return M;
    }
};

static void print_set(const set<int>& s) {
    cout << "{";
    bool first = true;
    for (int x : s) {
        if (!first) cout << ", ";
        cout << x;
        first = false;
    }
    cout << "}";
}

int main() {
    RetroactivePQ pq;
    pq.insert_op(1, true, 5);
    pq.insert_op(2, true, 2);
    pq.insert_op(3, false);
    pq.insert_op(4, true, 8);
    pq.insert_op(5, false);

    set<int> before = pq.Q_now();
    assert((before == set<int>{8}));

    int M = pq.insert_retroactive(2.5, 3);
    assert(M == 5); // 3 no era el mayor de lo eliminado desde 2.5: lo desplaza el 5

    set<int> after = pq.Q_now();
    assert((after == set<int>{5, 8}));
    assert(!after.count(3)); // 3 termino entre los eliminados, no en Q_ahora

    cout << "Q_ahora antes de la insercion retroactiva: ";
    print_set(before);
    cout << "\nInsert(2.5, insert(3)) -> M=" << M << " (M != 3: 3 desplaza a nadie, 5 sobrevive)\n";
    cout << "Q_ahora despues: ";
    print_set(after);
    cout << "\nOK: insertar en el pasado (t=2.5) cambio lo que la cola devuelve en el presente\n";

    return 0;
}
