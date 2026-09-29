// Paso 4 — Insert: agrega un elemento y lo sube hasta su lugar (sift-up).
//
// DERIVADO del pseudocódigo del profesor; no aparece en las diapositivas
// (la tabla comparativa sólo da su complejidad, Θ(lg n)). El argumento es
// simétrico al de Max-Heapify: en vez de hundir, sube el nuevo elemento
// mientras sea mayor que su padre. Recorre a lo más un camino hoja-raíz,
// de ahí la misma cota O(altura) = O(lg n).

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

    explicit MaxHeap(const vector<int>& input) {
        vals.insert(vals.end(), input.begin(), input.end());
        for (int i = size() / 2; i >= 1; --i) max_heapify(i);
    }
    MaxHeap() = default;

    // Insert(A, key): agrega al final y sube mientras el padre sea menor.
    void insert(int key) {
        vals.push_back(key);
        int i = size();
        while (i > 1 && vals[parent(i)] < vals[i]) {
            swap(vals[parent(i)], vals[i]);
            i = parent(i);
        }
    }
};
