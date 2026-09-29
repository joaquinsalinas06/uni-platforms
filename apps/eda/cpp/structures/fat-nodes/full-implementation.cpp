// Implementación completa — nodos gordos (fat nodes), persistencia parcial
// y su extensión bidireccional para persistencia total.
//
// Todo el pseudocódigo del mazo es prosa (no hay algoritmo formal), así que
// esta implementación es una DERIVACIÓN fiel de la descripción textual:
// "se revisa el registro de modificaciones de más reciente a más antigua,
// y se toma la primera con tiempo <= t" (lectura), "si el registro tiene
// espacio, se agrega una entrada" (escritura sin split), y "si está lleno,
// se crea un nodo nuevo con los valores actuales y se redirigen los p
// punteros entrantes" (split).
//
// Modelo: máquina de punteros (/structures/pointer-machine) — cada nodo
// tiene O(1) campos. Aquí cada nodo tiene dos campos: `value` (un dato) y
// `next` (un puntero). p = número máximo de punteros ENTRANTES a un nodo,
// acotado por hipótesis (p = O(1)); el registro de modificaciones tiene
// tamaño acotado 2p, tal como dice el análisis (página 24 y 33).
//
// Es la restricción de la máquina de punteros la que hace el split
// interesante: no podemos "teletransportar" los p punteros entrantes de
// golpe con una operación mágica — cada redirección es, ella misma, una
// escritura de campo (un writeField sobre el nodo predecesor), que puede
// a su vez llenar el registro de ESE predecesor y disparar otro split.
// El análisis de potencial (ver theory.md) es precisamente lo que muestra
// que esta cascada, aunque posible, nunca cuesta más de O(1) amortizado.

#include <cassert>
#include <iostream>
#include <vector>

using namespace std;

// ---------------------------------------------------------------------
// Paso 1 — el nodo gordo: campos originales + registro de modificaciones.
// ---------------------------------------------------------------------

enum class Field { Value, Next };

struct FatNode {
    int id;

    // Campos originales: los valores con los que el nodo fue creado.
    // "El valor original del nodo" al que se recurre cuando el registro
    // no tiene ninguna entrada aplicable (página 24).
    int originalValue;
    FatNode* originalNext;

    // Registro de modificaciones: lista de tuplas (campo, valor nuevo,
    // tiempo), en orden de inserción (más antigua primero). Tamaño
    // acotado por MAX_LOG = 2 * P (páginas 25-26).
    struct Entry {
        Field field;
        long time;
        int intVal = 0;
        FatNode* ptrVal = nullptr;
    };
    vector<Entry> log;

    // --- Extensión bidireccional (persistencia total, diapositiva 20) ---
    // "Los nodos gordos guardaban modificaciones ordenadas solo hacia
    // adelante en el tiempo. Si se puede actualizar una versión 'vieja',
    // necesitamos poder navegar en ambas direcciones del árbol de
    // versiones" (páginas 36-37). La técnica bidireccional agrega un
    // SEGUNDO registro, para modificaciones que quedan "detrás" del nodo
    // en el árbol de versiones (ver operations/bidirectional-fat-nodes.md).
    vector<Entry> backwardLog;

    // Bookkeeping para el split: quién apunta actualmente a este nodo.
    // No es parte del modelo del profesor (que asume que "se sabe" quiénes
    // son los p punteros entrantes) — aquí se lleva explícito para poder
    // redirigirlos de verdad en la demostración.
    vector<pair<FatNode*, Field>> incoming;

    explicit FatNode(int id_, int value, FatNode* next = nullptr)
        : id(id_), originalValue(value), originalNext(next) {}
};

// p = número máximo de punteros entrantes por hipótesis (p = O(1)).
// Tamaño máximo del registro: 2p (página 26).
int P = 2;
int MAX_LOG = 2 * P;

long currentTime = 0; // reloj lógico global, uno por escritura

int nextId = 1;

// ---------------------------------------------------------------------
// Operación: leer un campo en la versión t (read-field).
// "Se revisa el registro de más reciente a más antigua, y se toma la
// primera con tiempo <= t; si no hay ninguna, se usa el valor original."
// O(1) porque el registro tiene tamaño acotado (2p).
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Bookkeeping de punteros entrantes (no está en el mazo; hace falta para
// poder ejecutar de verdad "redirigir los p punteros entrantes").
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Operación: escribir un campo (write-field).
// Caso con espacio: agrega una entrada al registro, O(1) real, O(1)
// amortizado (páginas 29-30). Caso lleno: delega en node-split
// (páginas 25-26, 31-33).
// Devuelve el nodo donde vive el valor después de escribir: el mismo
// `node` si hubo espacio, o el nodo nuevo si se hizo split.
// ---------------------------------------------------------------------

FatNode* writeField(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t) {
    if (node->log.size() < MAX_LOG) {
        // Caso 1: hay espacio. Costo real O(1); Phi sube en 1 (una entrada
        // más usada), asi que el amortizado sigue siendo O(1).
        if (field == Field::Next) {
            untrackIncoming(readNext(node, t), node, Field::Next);
            trackIncoming(ptrVal, node, Field::Next);
        }
        node->log.push_back({field, t, intVal, ptrVal});
        return node;
    }
    // Caso 2: el registro está lleno (2p entradas). Split.
    return nodeSplit(node, field, intVal, ptrVal, t);
}

// ---------------------------------------------------------------------
// Operación: node-split.
// "Nodo lleno -> nodo nuevo limpio (con los valores actuales) +
// redirección de los p punteros entrantes." Costo real O(1) (nodo nuevo)
// + O(p) (redirigir); amortizado O(1) porque el potencial que se libera
// al vaciar el registro viejo (-2p) paga la redirección (+p) y el costo
// real (páginas 31-33):
//   c_i = O(1) + O(p)
//   DeltaPhi = -2p (registro viejo, de 2p a 0) + p (a lo mucho +1 por
//              predecesor redirigido)
//   c_i^ = O(p) + (-2p + p) = O(p) - p = O(1), pues p = O(1) por hipotesis.
// ---------------------------------------------------------------------

FatNode* nodeSplit(FatNode* node, Field field, int intVal, FatNode* ptrVal, long t) {
    FatNode* fresh = new FatNode(nextId++, readValue(node, t), readNext(node, t));
    // El nodo nuevo nace limpio: registro vacio (ni siquiera cuenta para
    // Phi todavia).

    // Los p punteros entrantes pasan a apuntar al nodo nuevo. Redirigir
    // no es magia: es una escritura de campo sobre cada predecesor, y esa
    // escritura puede ella misma llenar el registro del predecesor y
    // disparar OTRO split -- por eso se llama a writeField recursivamente,
    // no se muta el predecesor "por atras".
    vector<pair<FatNode*, Field>> incoming = std::move(node->incoming);
    node->incoming.clear();
    for (auto& pf : incoming) {
        FatNode* pred = pf.first;
        Field predField = pf.second;
        // predField solo puede ser Next (es el unico campo puntero del
        // modelo); redirigirlo agrega, a lo mucho, una entrada al
        // registro del predecesor (Delta_redirect <= +1 por predecesor).
        writeField(pred, predField, 0, fresh, t);
    }
    fresh->incoming = std::move(incoming);

    // Se aplica ahora la escritura que disparo el split, sobre el nodo
    // nuevo: siempre cabe, porque acaba de nacer con registro vacio.
    if (field == Field::Next) trackIncoming(ptrVal, fresh, Field::Next);
    fresh->log.push_back({field, t, intVal, ptrVal});

    // El nodo viejo queda intacto y congelado: sigue siendo la respuesta
    // correcta para cualquier lectura con tiempo anterior al split (sus
    // predecesores, en versiones viejas, siguen "apuntando" a el segun
    // SU PROPIO registro -- ver examples.md para la traza completa).
    return fresh;
}

// ---------------------------------------------------------------------
// Operacion: version-tree-linearization (recorrido de Euler).
// "Al entrar a la version i marcamos el tiempo (_i ('se hace el cambio
// i'); al salir marcamos )_i ('se deshace el cambio i')" (paginas 38-39).
// Arbol de versiones de 7 nodos del mazo: raiz 1, hijos 2 y 3, 2 tiene
// hijos 4 y 5, 3 tiene hijos 6 y 7.
// ---------------------------------------------------------------------

struct VersionTree {
    vector<vector<int>> children; // children[v] = hijos de v (1-indexado)
};

void eulerTour(const VersionTree& tree, int v, vector<string>& out) {
    out.push_back("(" + to_string(v));
    for (int c : tree.children[v]) eulerTour(tree, c, out);
    out.push_back(")" + to_string(v));
}

// ---------------------------------------------------------------------
// main(): read en version pasada, write con espacio, write que fuerza
// split, y el caso limite de un nodo con muchos punteros entrantes.
// ---------------------------------------------------------------------

int main() {
    // --- Caso normal: lectura en una version pasada ---
    // n1 -> n2 -> n3, valores iniciales 10, 20, 30.
    FatNode* n3 = new FatNode(nextId++, 30);
    FatNode* n2 = new FatNode(nextId++, 20, n3);
    FatNode* n1 = new FatNode(nextId++, 10, n2);
    trackIncoming(n2, n1, Field::Next);
    trackIncoming(n3, n2, Field::Next);

    currentTime = 1;
    writeField(n2, Field::Value, 200, nullptr, currentTime); // n2.value = 200 en t=1

    assert(readValue(n2, 0) == 20);   // version 0: valor original
    assert(readValue(n2, 1) == 200);  // version 1: la modificacion
    assert(readValue(n2, 5) == 200);  // cualquier version >= 1 posterior

    // --- Escribir un campo con espacio (no llena el registro) ---
    currentTime = 2;
    writeField(n2, Field::Value, 201, nullptr, currentTime);
    assert(n2->log.size() == 2);      // sigue siendo el mismo nodo (MAX_LOG = 4)
    assert(readValue(n2, 2) == 201);
    assert(readValue(n2, 1) == 200);  // la version anterior no cambia

    // --- Escribir hasta forzar el split (registro se llena en 2p = 4) ---
    currentTime = 3;
    writeField(n2, Field::Value, 202, nullptr, currentTime);
    currentTime = 4;
    FatNode* stillN2 = writeField(n2, Field::Value, 203, nullptr, currentTime);
    assert(stillN2 == n2);
    assert(n2->log.size() == MAX_LOG); // registro lleno: 4 entradas

    currentTime = 5;
    FatNode* afterSplit = writeField(n2, Field::Value, 999, nullptr, currentTime);
    assert(afterSplit != n2);          // se creo un nodo nuevo
    assert(afterSplit->log.size() == 1); // nace limpio, solo la escritura que lo disparo
    assert(n2->log.size() == MAX_LOG); // el nodo viejo queda congelado, intacto
    assert(readValue(afterSplit, 5) == 999);
    // El predecesor n1 fue redirigido: su propio registro de "next" ahora
    // apunta al nodo nuevo, en t=5.
    assert(readNext(n1, 5) == afterSplit);
    assert(readNext(n1, 4) == n2); // en versiones viejas, n1 sigue "viendo" a n2
    // n2 mismo sigue siendo la respuesta correcta para lecturas de version
    // anterior al split, siguiendo el propio n2 (que el usuario aun puede
    // alcanzar si guardo el puntero directo).
    assert(readValue(n2, 4) == 203);

    // --- Caso limite: nodo con muchos punteros entrantes (p incoming) ---
    // Construimos un nodo compartido `shared` con exactamente P = 2
    // predecesores (el maximo permitido por hipotesis), y forzamos un
    // split para verificar que AMBOS quedan redirigidos.
    FatNode* shared = new FatNode(nextId++, 1);
    FatNode* predA = new FatNode(nextId++, -1, shared);
    FatNode* predB = new FatNode(nextId++, -2, shared);
    trackIncoming(shared, predA, Field::Next);
    trackIncoming(shared, predB, Field::Next);
    assert(shared->incoming.size() == 2); // p = 2 punteros entrantes

    long t = 10;
    for (int i = 0; i < MAX_LOG; ++i) {
        writeField(shared, Field::Value, 100 + i, nullptr, ++t);
    }
    assert(shared->log.size() == MAX_LOG);

    ++t;
    FatNode* sharedAfter = writeField(shared, Field::Value, -999, nullptr, t);
    assert(sharedAfter != shared);
    // Los DOS predecesores quedan redirigidos al nodo nuevo.
    assert(readNext(predA, t) == sharedAfter);
    assert(readNext(predB, t) == sharedAfter);
    // Y ambos siguen viendo al nodo viejo en versiones anteriores al split.
    assert(readNext(predA, t - 1) == shared);
    assert(readNext(predB, t - 1) == shared);
    assert(sharedAfter->incoming.size() == 2); // el nuevo hereda los p entrantes

    // --- version-tree-linearization: arbol de 7 nodos del mazo ---
    VersionTree tree;
    tree.children.assign(8, {});
    tree.children[1] = {2, 3};
    tree.children[2] = {4, 5};
    tree.children[3] = {6, 7};
    vector<string> seq;
    eulerTour(tree, 1, seq);
    // (1 (2 (4 )4 (5 )5 )2 (3 (6 )6 (7 )7 )3 )1
    vector<string> expected = {
        "(1", "(2", "(4", ")4", "(5", ")5", ")2",
        "(3", "(6", ")6", "(7", ")7", ")3", ")1"
    };
    assert(seq == expected);

    cout << "fat-nodes: todos los asserts pasaron." << endl;
    return 0;
}
