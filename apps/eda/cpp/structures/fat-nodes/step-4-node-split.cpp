// Paso 4 — escribir un campo, caso lleno: node-split.
//
// "Escribir un campo (caso lleno) / split" -- paginas 25-26 (la idea) y
// 31-33 (el analisis): si el registro esta lleno (2p entradas), se crea
// un nodo nuevo y limpio con los valores actuales, y se redirigen los p
// punteros entrantes hacia el.
//
// El mazo tampoco dibuja el split (segunda ausencia grave senalada en el
// analisis): "nodo lleno -> nodo nuevo limpio + redireccion de los p
// punteros entrantes" se deriva aqui como codigo ejecutable.
//
// Redirigir un puntero entrante NO es una operacion magica: es una
// escritura de campo sobre el predecesor (writeField recursivo), que
// puede a su vez llenar el registro de ESE predecesor y disparar otro
// split -- por eso node-split y write-field se llaman mutuamente.
//
// Analisis (metodo del potencial, /structures/potential-method), Phi =
// suma sobre nodos de las entradas usadas en su registro:
//   c_i = O(1) (nodo nuevo) + O(p) (redirigir los p punteros)
//   DeltaPhi_split    = -2p   (el nodo viejo pasa de 2p entradas a 0)
//   DeltaPhi_redirect <= +p   (cada redireccion agrega a lo mas 1 entrada
//                              en su predecesor)
//   c_i^ = O(p) + (-2p + p) = O(p) - p = O(1), pues p = O(1) por hipotesis.

#include <vector>
#include <utility>
using namespace std;

enum class Field { Value, Next };

struct FatNode {
    int id;
    int originalValue;
    FatNode* originalNext;

    struct Entry {
        Field field;
        long time;
        int intVal = 0;
        FatNode* ptrVal = nullptr;
    };
    vector<Entry> log;
    vector<pair<FatNode*, Field>> incoming;

    explicit FatNode(int id_, int value, FatNode* next = nullptr)
        : id(id_), originalValue(value), originalNext(next) {}
};

int P = 2;
int MAX_LOG = 2 * P;
int nextId = 1;

int readValue(const FatNode* node, long t) {
    for (auto it = node->log.rbegin(); it != node->log.rend(); ++it) {
        if (it->field == Field::Value && it->time <= t) return it->intVal;
    }
    return node->originalValue;
}

FatNode* readNext(const FatNode* node, long t) {
    for (auto it = node->log.rbegin(); it != node->log.rend(); ++it) {
        if (it->field == Field::Next && it->time <= t) return it->ptrVal;
    }
    return node->originalNext;
}

void trackIncoming(FatNode* target, FatNode* pred, Field f) {
    if (target) target->incoming.push_back({pred, f});
}

void untrackIncoming(FatNode* target, FatNode* pred, Field f) {
    if (!target) return;
    auto& v = target->incoming;
    for (size_t i = 0; i < v.size(); ++i) {
        if (v[i].first == pred && v[i].second == f) {
            v.erase(v.begin() + i);
            return;
        }
    }
}

FatNode* nodeSplit(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t);

FatNode* writeField(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t) {
    if (node->log.size() < MAX_LOG) {
        if (field == Field::Next) {
            untrackIncoming(readNext(node, t), node, Field::Next);
            trackIncoming(ptrVal, node, Field::Next);
        }
        node->log.push_back({field, t, intVal, ptrVal});
        return node;
    }
    return nodeSplit(node, field, intVal, ptrVal, t);
}

FatNode* nodeSplit(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t) {
    // Nodo nuevo, limpio, con los valores actuales (los que se leerian en
    // t justo antes de esta escritura).
    FatNode* fresh = new FatNode(nextId++, readValue(node, t), readNext(node, t));

    // Redirigir los p punteros entrantes: cada uno es una escritura sobre
    // el predecesor, no una mutacion directa.
    vector<pair<FatNode*, Field>> incoming = std::move(node->incoming);
    node->incoming.clear();
    for (auto& pf : incoming) {
        writeField(pf.first, pf.second, 0, fresh, t);
    }
    fresh->incoming = std::move(incoming);

    // La escritura que disparo el split siempre cabe en el nodo nuevo.
    if (field == Field::Next) trackIncoming(ptrVal, fresh, Field::Next);
    fresh->log.push_back({field, t, intVal, ptrVal});

    // El nodo viejo NO se toca mas: queda congelado, y sigue siendo la
    // respuesta correcta para cualquier lectura con tiempo anterior al
    // split (ver examples.md).
    return fresh;
}
