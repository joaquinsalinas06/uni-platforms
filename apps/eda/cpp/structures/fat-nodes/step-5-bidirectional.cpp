// Paso 5 — nodos gordos bidireccionales (persistencia total).
//
// "Los nodos gordos guardaban modificaciones ordenadas solo hacia
// adelante en el tiempo. Si se puede actualizar una version 'vieja',
// necesitamos poder navegar en ambas direcciones del arbol de versiones"
// (paginas 36-37). La solucion (diapositiva 20, paginas 42-43): DOS
// registros por nodo -- uno hacia adelante (`log`, igual que antes) y uno
// hacia atras (`backwardLog`, para modificaciones que quedan "detras" del
// nodo cuando el arbol de versiones se ramifica hacia atras) -- y "un
// split mas delicado", porque ahora hay que decidir en cual de los dos
// registros cae cada modificacion segun la posicion relativa de la
// version que escribe respecto al nodo en el arbol de versiones.
//
// El mazo no da pseudocodigo de este split "mas delicado"; el analisis
// del texto (analysis) solo da la cota final ("O(1) amortizado por
// operacion", paginas 44-45), sin la mecanica interna. Esta clase agrega
// el segundo registro y dos lecturas (adelante/atras); el split
// bidireccional pleno queda fuera del alcance de este mazo (ver
// operations/bidirectional-fat-nodes.md, seccion "Casos limite").

#include <vector>
#include <utility>
using namespace std;

enum class Field { Value, Next };

struct BiFatNode {
    int id;
    int originalValue;
    BiFatNode* originalNext;

    struct Entry {
        Field field;
        long time;
        int intVal = 0;
        BiFatNode* ptrVal = nullptr;
    };

    // Registro hacia adelante: igual que en la version unidireccional,
    // modificaciones con tiempo >= tiempo de creacion del nodo.
    vector<Entry> log;

    // Registro hacia atras: modificaciones que corresponden a versiones
    // "anteriores" en el arbol de versiones desde la perspectiva de este
    // nodo (diapositiva 20). Tamano tambien acotado (el profesor no da un
    // numero distinto de 2p para este registro).
    vector<Entry> backwardLog;

    vector<pair<BiFatNode*, Field>> incoming;

    explicit BiFatNode(int id_, int value, BiFatNode* next = nullptr)
        : id(id_), originalValue(value), originalNext(next) {}
};

int P = 2;
int MAX_LOG = 2 * P;

// Lectura hacia adelante: igual que read-field original.
int readValueForward(const BiFatNode* node, long t) {
    for (auto it = node->log.rbegin(); it != node->log.rend(); ++it) {
        if (it->field == Field::Value && it->time <= t) return it->intVal;
    }
    return node->originalValue;
}

// Lectura hacia atras: se revisa el registro de modificaciones "pasadas"
// para versiones anteriores a la creacion del nodo -- la pieza que la
// version unidireccional no puede resolver.
int readValueBackward(const BiFatNode* node, long t) {
    for (auto it = node->backwardLog.rbegin(); it != node->backwardLog.rend(); ++it) {
        if (it->field == Field::Value && it->time >= t) return it->intVal;
    }
    return node->originalValue;
}
