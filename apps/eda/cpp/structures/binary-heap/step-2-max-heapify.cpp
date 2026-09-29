// Paso 2 — la estructura MaxHeap y su primera operación: Max-Heapify.
//
// Invariante de montículo máximo: para todo i con padre, vals[parent(i)] >= vals[i].
// Max-Heapify asume que los SUBÁRBOLES de los hijos de i ya cumplen el
// invariante, y sólo puede estar roto en la raíz i. Lo repara hundiendo i.

#include <vector>
#include <algorithm>
using namespace std;

struct MaxHeap {
    vector<int> vals = {0}; // centinela en vals[0]

    int size() { return (int)vals.size() - 1; }
    bool isEmpty() { return size() == 0; }

    int parent(int i) { return i / 2; }
    int left(int i)   { return 2 * i; }
    int right(int i)  { return 2 * i + 1; }

    // Algoritmo 1 (Sem_1_Heaps_I-1.pdf#10): Max-Heapify(A, i, n).
    // Compara A[i] con sus dos hijos; si alguno es mayor, intercambia con el
    // mayor de los dos y repite en la nueva posición. Recorre a lo más un
    // camino raíz-hoja: por eso cuesta O(altura) = O(lg n).
    void max_heapify(int i) {
        int n = size();
        while (true) {
            int l = left(i), r = right(i), largest = i;
            if (l <= n && vals[l] > vals[largest]) largest = l;
            if (r <= n && vals[r] > vals[largest]) largest = r;
            if (largest == i) break; // caso límite: i es hoja o ya cumple el invariante
            swap(vals[i], vals[largest]);
            i = largest;
        }
    }
};
