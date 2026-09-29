// Paso 8 — Union: combina dos montículos en uno.
//
// DERIVADO; no aparece en las diapositivas (sólo Θ(n) en la tabla, y es la
// debilidad que el resumen usa para motivar el montículo binomial). Un
// montículo binario no tiene forma de fusionar dos montículos más rápido
// que concatenar sus arreglos y reconstruir: mismo análisis agregado de
// Build-Max-Heap, ahora sobre n = n1 + n2.

#include <vector>
#include <algorithm>
#include <stdexcept>
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

    void build_from(const vector<int>& input) {
        vals = {0};
        vals.insert(vals.end(), input.begin(), input.end());
        for (int i = size() / 2; i >= 1; --i) max_heapify(i);
    }

    explicit MaxHeap(const vector<int>& input) { build_from(input); }
    MaxHeap() = default;

    void sift_up(int i) {
        while (i > 1 && vals[parent(i)] < vals[i]) {
            swap(vals[parent(i)], vals[i]);
            i = parent(i);
        }
    }

    void insert(int key) {
        vals.push_back(key);
        sift_up(size());
    }

    int find_min() {
        if (isEmpty()) throw runtime_error("find_min: montículo vacío");
        return vals[1];
    }

    int extract_min() {
        if (isEmpty()) throw runtime_error("extract_min: montículo vacío");
        int top = vals[1];
        vals[1] = vals.back();
        vals.pop_back();
        if (!isEmpty()) max_heapify(1);
        return top;
    }

    void decrease_key(int i, int new_key) {
        if (i < 1 || i > size()) throw out_of_range("decrease_key: índice inválido");
        vals[i] = new_key;
        sift_up(i);
        max_heapify(i);
    }

    void delete_key(int i) {
        if (i < 1 || i > size()) throw out_of_range("delete_key: índice inválido");
        vals[i] = vals.back();
        vals.pop_back();
        if (i <= size()) {
            sift_up(i);
            max_heapify(i);
        }
    }

    // Union(other): concatena los dos arreglos (sin el centinela ajeno) y
    // reconstruye desde cero. Θ(n1 + n2), no O(lg n): esta es la debilidad
    // que el binomial arregla.
    void heap_union(const MaxHeap& other) {
        vector<int> merged(vals.begin() + 1, vals.end());
        merged.insert(merged.end(), other.vals.begin() + 1, other.vals.end());
        build_from(merged);
    }
};
