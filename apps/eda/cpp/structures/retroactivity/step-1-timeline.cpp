// Paso 1 — la línea de tiempo, nada más.
//
// Retroactividad es un modelo (Insert(t, op) / Delete(t) / Query(t, op)),
// no una estructura concreta. Para hacerlo tangible se elige la estructura
// subyacente más simple posible: un contador, donde cada operación de la
// línea de tiempo es "sumar x" (add(x)). El "estado" en un tiempo t es la
// suma de todos los add(x) con tiempo <= t.
//
// La línea de tiempo se guarda ordenada por tiempo: es lo que permite que
// Query recorra "hasta t" con un solo barrido.

#include <vector>
using namespace std;

struct Op {
    double time; // el t del modelo; puede ser fraccionario para insertar "entre" dos operaciones
    int delta;   // el efecto de add(delta) sobre el contador
};

vector<Op> timeline; // invariante: siempre ordenado por time ascendente
