// Paso 1 — el elemento de una lista aumentada, nada más.
//
// Cada L'i es un arreglo de estos elementos. `bridge` es el puntero
// (índice) a la posición exacta de este elemento en L'{i+1}, cuando fue
// promovido desde ahí. -1 significa "no promovido, es propio de Li".

#include <vector>
using namespace std;

struct Elem {
    int value;
    int bridge; // índice en L'{i+1}, o -1 si no fue promovido
};
