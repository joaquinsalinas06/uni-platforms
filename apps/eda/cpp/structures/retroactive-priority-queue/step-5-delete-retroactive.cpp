// Paso 5: Delete-retroactive.
//
// AUSENCIA DEL MATERIAL: el profesor no desarrolla esta operacion. Solo
// aparece en el enunciado del resultado final ("Insert y Delete
// retroactivos parciales... O(lg n) amortizado"), sin formula de efecto
// neto, sin pseudocodigo y sin ejemplo. Lo que sigue es el METODO DIRECTO
// (quitar de la linea de tiempo y recalcular) — correcto, pero O(m) y no
// el mecanismo O(lg n) amortizado que el resultado citado supone.

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

    // DERIVADO: el mazo no dice como se mantienen los puentes al borrar
    // una operacion intermedia. Metodo directo: quitar y recalcular todo.
    void delete_retroactive(double t) {
        timeline.erase(
            remove_if(timeline.begin(), timeline.end(), [t](const Op& o) { return o.t == t; }),
            timeline.end());
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

    // Borrar 'insert(5)' en t=1: el 5 ya no esta para "absorber" el
    // primer delete-min, asi que el efecto se propaga distinto.
    pq.delete_retroactive(1);
    set<int> after = pq.Q_now();
    assert(after.empty());

    cout << "Q_ahora antes de borrar t=1: ";
    print_set(before);
    cout << "\nDelete-retroactive(t=1) (quita insert(5)) -> Q_ahora: ";
    print_set(after);
    cout << "\nOK: borrar una operacion del pasado tambien cambia el presente"
            " (metodo directo, no el mecanismo O(lg n) amortizado citado)\n";

    return 0;
}
