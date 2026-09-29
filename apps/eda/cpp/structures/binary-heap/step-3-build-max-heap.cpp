// Paso 3 — Build-Max-Heap: convierte un arreglo arbitrario en montículo máximo.
//
// Algoritmo 3 (Sem_1_Heaps_I-1.pdf#20-21): recorre de n/2 hacia 1 llamando
// Max-Heapify. Toda posición i > n/2 es hoja (caso límite explícito del
// profesor: "ya es trivialmente un montículo máximo de un solo nodo"), así
// que empezar en n/2 es correcto y no hace falta tocar las hojas.

#include <vector>
#include <algorithm>
using namespace std;

struct MaxHeap {
    vector<int> vals = {0};

    int size() { return (int)vals.size() - 1; }
    bool isEmpty() { return size() == 0; }
    int parent(int i) { return i / 2; }
    int left(int i)   { return 2 * i; }
    int right(int i)  { return 2 * i + 1; }

    void max_heapify(int i) {
        int n = size();
        while (true) {
            int l = left(i), r = right(i), largest = i;
            if (l <= n && vals[l] > vals[largest]) largest = l;
            if (r <= n && vals[r] > vals[largest]) largest = r;
            if (largest == i) break;
            swap(vals[i], vals[largest]);
            i = largest;
        }
    }

    // Algoritmo 3: Build-Max-Heap(A, n).
    explicit MaxHeap(const vector<int>& input) {
        vals.insert(vals.end(), input.begin(), input.end());
        for (int i = size() / 2; i >= 1; --i) {
            max_heapify(i);
        }
    }
    MaxHeap() = default;
};
