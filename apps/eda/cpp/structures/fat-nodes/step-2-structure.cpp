// Paso 2 — leer un campo en la version t (read-field), y el bookkeeping
// de punteros entrantes que hace falta para poder ejecutar de verdad el
// split del paso 4.
//
// "Se revisa el registro de modificaciones de mas reciente a mas antigua,
// y se toma la primera con tiempo <= t; si no hay ninguna, se usa el
// valor original del nodo. O(1), pues el registro tiene tamano acotado"
// (pagina 24).

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

    // Bookkeeping para el split (paso 4): quien apunta actualmente a este
    // nodo. No esta en el mazo -- el profesor asume que "se sabe" quienes
    // son los p punteros entrantes; aqui se lleva explicito para poder
    // redirigirlos de verdad.
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
