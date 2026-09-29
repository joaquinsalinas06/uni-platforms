// Paso 1: la linea de tiempo retroactiva de una priority queue.
//
// El profesor no da pseudocodigo para este tema (es el unico de las tres
// semanas sin un solo "Algoritmo N"): solo formulas y una definicion. Esta
// implementacion es la traduccion directa de esas formulas.
//
// ponytail: el "monticulo" concreto se representa con std::multiset<int>
// en vez de reimplementar un binary heap a mano — la mecanica de Insert /
// Delete-Min de un monticulo ya es el tema de binary-heap; aqui lo que
// importa es la capa RETROACTIVA por encima, no el heap en si.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <vector>
using namespace std;

struct Op {
    double t;
    bool is_insert; // true: insert(key); false: delete-min
    int key;        // solo relevante si is_insert
};

struct RetroactivePQ {
    vector<Op> timeline; // siempre ordenada por t

    void insert_op(double t, bool is_insert, int key = 0) {
        Op op{t, is_insert, key};
        auto it = lower_bound(timeline.begin(), timeline.end(), t,
                               [](const Op& a, double tt) { return a.t < tt; });
        timeline.insert(it, op);
    }

    // Reproduce toda la linea de tiempo desde cero. Devuelve el estado
    // Q_t despues de cada operacion (alineado con timeline) y Q_ahora.
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
                q.erase(q.begin()); // delete-min: quita el minimo
            }
            r.after.push_back(set<int>(q.begin(), q.end()));
        }
        r.now = set<int>(q.begin(), q.end());
        return r;
    }

    set<int> Q_now() const { return replay().now; }

    void print() const {
        cout << "linea de tiempo:\n";
        for (const auto& op : timeline) {
            cout << "  t=" << op.t << ": "
                 << (op.is_insert ? ("insert(" + to_string(op.key) + ")") : "delete-min")
                 << "\n";
        }
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
    // Ejemplo del profesor (paginas 60-62): ins(5), ins(2), del-min,
    // ins(8), del-min.
    RetroactivePQ pq;
    pq.insert_op(1, true, 5);
    pq.insert_op(2, true, 2);
    pq.insert_op(3, false);
    pq.insert_op(4, true, 8);
    pq.insert_op(5, false);

    pq.print();
    auto q_now = pq.Q_now();
    cout << "Q_ahora = ";
    print_set(q_now);
    cout << "\n";

    assert((q_now == set<int>{8}));
    cout << "OK: Q_ahora coincide con el ejemplo del profesor: {8}\n";
    return 0;
}
