// Paso 3: Compute-M — el efecto neto de una insercion retroactiva.
//
// Formula ingenua (paginas 52-53):
//   M = max( {k} U { k' : k' eliminado en tiempo >= t } )      -- O(r)
//
// Formula con el puente mas cercano t' antes de t (paginas 58-59,
// reconstruida: la diapositiva original apila las dos expresiones sin
// el "=" entre ellas):
//   max{ k' : k' eliminado en tiempo >= t }
//     = max{ k' que no esta en Q_ahora : k' insertado en tiempo >= t' }
//
// Se implementan ambas y se verifica con assert que coinciden.

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

    // Metodo ingenuo, O(r): recorre todo lo eliminado en tiempo >= t.
    int compute_M_naive(double t, int k) const {
        Replay r = replay();
        int M = k;
        for (size_t i = 0; i < timeline.size(); ++i) {
            if (!timeline[i].is_insert && timeline[i].t >= t) {
                set<int> before = (i == 0) ? set<int>{} : r.after[i - 1];
                vector<int> removed;
                set_difference(before.begin(), before.end(), r.after[i].begin(),
                                r.after[i].end(), back_inserter(removed));
                // Delete-Min quita a lo mas un elemento por operacion.
                if (!removed.empty()) M = max(M, removed.front());
            }
        }
        return M;
    }

    // Metodo con el puente: restringe los candidatos a lo insertado desde
    // el puente mas cercano antes de t, filtrado contra Q_ahora.
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
};

int main() {
    // Ejemplo del profesor: M = max({3} U {2, 5}) = 5, para t=2.5, k=3.
    RetroactivePQ pq;
    pq.insert_op(1, true, 5);
    pq.insert_op(2, true, 2);
    pq.insert_op(3, false);
    pq.insert_op(4, true, 8);
    pq.insert_op(5, false);

    int m_naive = pq.compute_M_naive(2.5, 3);
    int m_bridge = pq.compute_M_bridge(2.5, 3);
    assert(m_naive == 5);
    assert(m_bridge == 5);
    cout << "OK: ambos metodos dan M=5 para Insert(2.5, insert(3))\n";

    // Ejemplo con puente interior: mismo resultado, pero el puente acota
    // el trabajo a lo insertado desde t=2 en vez de mirar toda la linea.
    RetroactivePQ pq2;
    pq2.insert_op(1, true, 10);
    pq2.insert_op(2, false);
    pq2.insert_op(3, true, 1);
    pq2.insert_op(4, true, 2);
    pq2.insert_op(5, false);

    int m2_naive = pq2.compute_M_naive(2.5, 5);
    int m2_bridge = pq2.compute_M_bridge(2.5, 5);
    assert(m2_naive == m2_bridge);
    cout << "OK: metodo ingenuo y metodo con puente coinciden (M="
         << m2_bridge << ") tambien cuando hay un puente interior real\n";

    return 0;
}
