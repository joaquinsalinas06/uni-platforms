// Implementacion completa: cola de prioridad retroactiva PARCIAL.
// Junta los pasos 1-5. main() imprime la linea de tiempo, el puente
// encontrado, el M calculado, y verifica con assert cada propiedad.
//
// ponytail: el monticulo concreto es std::multiset<int> (Insert/Delete-Min
// de un heap real ya es el tema de binary-heap); y Delete-retroactive usa
// el metodo DIRECTO (recalcular desde la linea de tiempo) en vez del
// mecanismo de puentes mantenidos dinamicamente que el resultado citado
// (Demaine-Iacono-Langerman 2007) supone y el mazo no desarrolla —
// ver delete-retroactive.md. Subir a ese mecanismo O(lg n) amortizado
// solo si el material del curso llega a desarrollarlo.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <limits>
#include <set>
#include <vector>
using namespace std;

struct Op {
    double t;
    bool is_insert; // true: insert(key); false: delete-min
    int key;
};

struct RetroactivePQ {
    vector<Op> timeline; // siempre ordenada por t

    void insert_op(double t, bool is_insert, int key = 0) {
        Op op{t, is_insert, key};
        auto it = lower_bound(timeline.begin(), timeline.end(), t,
                               [](const Op& a, double tt) { return a.t < tt; });
        timeline.insert(it, op);
    }

    // AUSENCIA DEL MATERIAL (delete-retroactive.md): metodo directo.
    void delete_retroactive(double t) {
        timeline.erase(
            remove_if(timeline.begin(), timeline.end(), [t](const Op& o) { return o.t == t; }),
            timeline.end());
    }

    // Reproduce la linea de tiempo completa. Q_t despues de cada
    // operacion (alineado con timeline) + Q_ahora.
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

    // BRIDGE (bridge.md): Q_t' ⊆ Q_ahora.
    static bool is_bridge(const set<int>& q_tprime, const set<int>& q_now) {
        return includes(q_now.begin(), q_now.end(), q_tprime.begin(), q_tprime.end());
    }

    // Indice del puente mas cercano antes de t; -1 = inicio de la linea
    // de tiempo (Q=vacio), que siempre es un puente valido.
    int nearest_bridge_before(double t) const {
        Replay r = replay();
        int best = -1;
        for (size_t i = 0; i < timeline.size(); ++i) {
            if (timeline[i].t >= t) break;
            if (is_bridge(r.after[i], r.now)) best = static_cast<int>(i);
        }
        return best;
    }

    // COMPUTE-M (compute-m.md): version ingenua, O(r).
    int compute_M_naive(double t, int k) const {
        Replay r = replay();
        int M = k;
        for (size_t i = 0; i < timeline.size(); ++i) {
            if (!timeline[i].is_insert && timeline[i].t >= t) {
                set<int> before = (i == 0) ? set<int>{} : r.after[i - 1];
                vector<int> removed;
                set_difference(before.begin(), before.end(), r.after[i].begin(),
                                r.after[i].end(), back_inserter(removed));
                if (!removed.empty()) M = max(M, removed.front());
            }
        }
        return M;
    }

    // COMPUTE-M: version con el puente mas cercano (formula reconstruida
    // en compute-m.md: las dos expresiones de la diapositiva original
    // apiladas van unidas por "=").
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

    // INSERT-RETROACTIVE (insert-retroactive.md): la unica operacion con
    // desarrollo propio del profesor.
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

static void print_timeline(const RetroactivePQ& pq) {
    for (const auto& op : pq.timeline) {
        cout << "  t=" << op.t << ": "
             << (op.is_insert ? ("insert(" + to_string(op.key) + ")") : "delete-min") << "\n";
    }
}

int main() {
    // --- El ejemplo trabajado del profesor (paginas 60-62). Sin marca de
    // derivado: es el unico ejemplo numerico completo del tema. ---
    RetroactivePQ pq;
    pq.insert_op(1, true, 5);
    pq.insert_op(2, true, 2);
    pq.insert_op(3, false); // delete-min: quita 2
    pq.insert_op(4, true, 8);
    pq.insert_op(5, false); // delete-min: quita 5

    cout << "=== Linea de tiempo original (ejemplo del profesor) ===\n";
    print_timeline(pq);
    set<int> q_ahora = pq.Q_now();
    cout << "Q_ahora = ";
    print_set(q_ahora);
    cout << "\n";
    assert((q_ahora == set<int>{8}));
    cout << "VERIFICADO: Q_ahora coincide con el ejemplo del profesor: {8}\n\n";

    // --- BRIDGE: en este ejemplo el unico puente es el inicio de la
    // linea de tiempo (todo estado intermedio contiene 5 o 2, que no
    // estan en Q_ahora={8}). ---
    int bridge_idx = pq.nearest_bridge_before(2.5);
    assert(bridge_idx == -1);
    cout << "VERIFICADO: en el ejemplo del profesor, el puente mas cercano"
            " antes de t=2.5 es el inicio de la linea de tiempo (no hay uno interior)\n\n";

    // --- COMPUTE-M: Insert(2.5, insert(3)) -> M = max({3, 2, 5}) = 5 ---
    int m_naive = pq.compute_M_naive(2.5, 3);
    int m_bridge = pq.compute_M_bridge(2.5, 3);
    assert(m_naive == 5 && m_bridge == 5);
    cout << "VERIFICADO: Compute-M da M=5 tanto por el metodo ingenuo como"
            " por el metodo con el puente, para Insert(2.5, insert(3))\n\n";

    // --- INSERT-RETROACTIVE: el efecto neto cambia Q_ahora ---
    set<int> antes = pq.Q_now();
    int M = pq.insert_retroactive(2.5, 3);
    set<int> despues = pq.Q_now();
    assert(M == 5);
    assert((despues == set<int>{5, 8}));
    assert(!despues.count(3));
    cout << "=== Insert-retroactive(t=2.5, insert(3)) ===\n";
    cout << "Q_ahora antes:   ";
    print_set(antes);
    cout << "\nM calculado:     " << M << " (M != 3: el 3 no sobrevive, el 5 si)\n";
    cout << "Q_ahora despues: ";
    print_set(despues);
    cout << "\nVERIFICADO: insertar 'insert(3)' en el tiempo 2.5 (pasado) cambio"
            " lo que la cola devuelve en el presente, de {8} a {5, 8}\n\n";

    // --- BRIDGE con un puente interior real (ejemplo derivado): valida
    // que nearest_bridge_before no solo encuentra el trivial. ---
    RetroactivePQ pq2;
    pq2.insert_op(1, true, 10);
    pq2.insert_op(2, false); // quita 10: Q queda vacio -> puente
    pq2.insert_op(3, true, 1);
    pq2.insert_op(4, true, 2);
    pq2.insert_op(5, false); // quita 1

    cout << "=== Linea de tiempo con puente interior (ejemplo derivado) ===\n";
    print_timeline(pq2);
    set<int> q2_ahora = pq2.Q_now();
    assert((q2_ahora == set<int>{2}));

    int idx2 = pq2.nearest_bridge_before(2.5);
    assert(idx2 == 1); // el del-min de t=2 dejo Q vacio: es el puente
    assert(pq2.timeline[idx2].t == 2);
    cout << "VERIFICADO: puente interior localizado correctamente en t="
         << pq2.timeline[idx2].t << " (Q quedo vacio ahi tras eliminar el 10)\n";

    int m2_naive = pq2.compute_M_naive(2.5, 5);
    int m2_bridge = pq2.compute_M_bridge(2.5, 5);
    assert(m2_naive == m2_bridge);
    cout << "VERIFICADO: con puente interior, ambos metodos de Compute-M"
            " siguen coincidiendo (M=" << m2_bridge << ")\n\n";

    // --- DELETE-RETROACTIVE (metodo directo; ausencia del material) ---
    // Timeline en este punto: ins5@1, ins2@2, ins3@2.5, del-min@3,
    // ins8@4, del-min@5. Quitar ins5@1 deja: ins2@2 -> {2}; ins3@2.5 ->
    // {2,3}; del-min@3 quita el 2 -> {3}; ins8@4 -> {3,8}; del-min@5
    // quita el 3 -> {8}. El resultado cambia de {5,8} a {8}: sin el 5
    // original, el primer del-min ahora quita a otro elemento.
    set<int> antes_del = pq.Q_now(); // {5, 8}, tras la insercion de arriba
    pq.delete_retroactive(1);        // quita 'insert(5)' en t=1
    set<int> despues_del = pq.Q_now();
    assert((despues_del == set<int>{8}));
    assert(despues_del != antes_del); // borrar en el pasado si cambio el presente
    cout << "=== Delete-retroactive(t=1) sobre la linea ya modificada ===\n";
    cout << "Q_ahora antes:   ";
    print_set(antes_del);
    cout << "\nQ_ahora despues: ";
    print_set(despues_del);
    cout << "\nVERIFICADO: borrar 'insert(5)' del pasado tambien cambia el"
            " presente (metodo directo: recalcula, no mantiene puentes)\n\n";

    cout << "TODO VERIFICADO: bridge, compute-m, insert-retroactive y"
            " delete-retroactive (metodo directo) sobre una cola de"
            " prioridad retroactiva parcial.\n";
    return 0;
}
