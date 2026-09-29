// Paso 3 — escribir un campo, caso con espacio (write-field).
//
// "Escribir un campo (caso con espacio)" -- paginas 29-30, diapositiva 14:
// si el registro no esta lleno, se agrega una entrada (campo, valor,
// tiempo). Costo real O(1); con el potencial Phi = suma de entradas
// usadas en cada registro, esta operacion sube Phi en 1, asi que el
// costo amortizado tambien es O(1).
//
// El caso lleno (que dispara el split) se agrega en el paso 4.

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

// write-field, SOLO el caso con espacio. Cuando el registro esta lleno,
// esta version todavia no hace nada (el paso 4 agrega node-split ahi).
FatNode* writeFieldNoSplit(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t) {
    // precondicion de este paso: node->log.size() < MAX_LOG.
    if (field == Field::Next) {
        untrackIncoming(readNext(node, t), node, Field::Next);
        trackIncoming(ptrVal, node, Field::Next);
    }
    node->log.push_back({field, t, intVal, ptrVal});
    return node;
}
