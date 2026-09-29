// Paso 1 — el nodo gordo: campos originales + registro de modificaciones.
//
// El mazo nunca dibuja un nodo gordo (ausencia sealada en el analisis);
// esta es la derivacion directa de su descripcion textual: cada nodo
// gordo guarda sus campos originales (los valores con los que nacio) mas
// un registro de modificaciones -- una lista de tuplas (campo, valor
// nuevo, tiempo) -- de tamano acotado.
//
// Modelo: maquina de punteros (/structures/pointer-machine), O(1) campos
// por nodo. Aqui, dos campos: `value` (un dato) y `next` (un puntero).

#include <vector>
using namespace std;

enum class Field { Value, Next };

struct FatNode {
    int id;

    // Campos originales: "el valor original del nodo", al que se recurre
    // si el registro no tiene ninguna entrada aplicable (pagina 24).
    int originalValue;
    FatNode* originalNext;

    // Registro de modificaciones: tuplas (campo, valor nuevo, tiempo), en
    // orden de insercion. Tamano acotado por 2p (paginas 25-26): p = numero
    // maximo de punteros ENTRANTES a un nodo, p = O(1) por hipotesis.
    struct Entry {
        Field field;
        long time;
        int intVal = 0;
        FatNode* ptrVal = nullptr;
    };
    vector<Entry> log;

    explicit FatNode(int id_, int value, FatNode* next = nullptr)
        : id(id_), originalValue(value), originalNext(next) {}
};

int P = 2;             // p = O(1) por hipotesis
int MAX_LOG = 2 * P; // tamano acotado del registro
