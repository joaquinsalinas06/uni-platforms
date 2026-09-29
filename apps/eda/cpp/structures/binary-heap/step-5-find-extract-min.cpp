// Paso 5 — Find-Min y Extract-Min.
//
// DERIVADO; no aparece en las diapositivas (sólo Θ(1) y Θ(lg n) en la
// tabla). Nombres "de mínimo" por convención de la tabla comparativa, pero
// aquí el montículo es MÁXIMO: "find-min" lee la raíz (el máximo),
// "extract-min" la retira. Ver la nota de apoyo en theory.md sobre la
// simetría max<->min.
//
// Extract-min mueve el último elemento a la raíz y llama Max-Heapify: por
// eso su costo es el mismo O(lg n) de Max-Heapify.

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

    explicit MaxHeap(const vector<int>& input) {
        vals.insert(vals.end(), input.begin(), input.end());
        for (int i = size() / 2; i >= 1; --i) max_heapify(i);
    }
    MaxHeap() = default;

    void insert(int key) {
        vals.push_back(key);
        int i = size();
        while (i > 1 && vals[parent(i)] < vals[i]) {
            swap(vals[parent(i)], vals[i]);
            i = parent(i);
        }
    }

    // Find-min (== find-max en este montículo): la raíz, Θ(1).
    int find_min() {
        if (isEmpty()) throw runtime_error("find_min: montículo vacío");
        return vals[1];
    }

    // Extract-min (== extract-max): retira la raíz y restaura el invariante.
    int extract_min() {
        if (isEmpty()) throw runtime_error("extract_min: montículo vacío");
        int top = vals[1];
        vals[1] = vals.back();
        vals.pop_back();
        if (!isEmpty()) max_heapify(1);
        return top;
    }
};
