// Paso 7 — Delete: retira un elemento arbitrario (no sólo la raíz).
//
// DERIVADO; no aparece en las diapositivas (sólo Θ(lg n) en la tabla).
// Se sustituye la posición i por el último elemento y se restaura el
// invariante subiendo o bajando, lo que aplique: mismo argumento de
// altura, O(lg n).

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

    void sift_up(int i) {
        while (i > 1 && vals[parent(i)] < vals[i]) {
            swap(vals[parent(i)], vals[i]);
            i = parent(i);
        }
    }

    explicit MaxHeap(const vector<int>& input) {
        vals.insert(vals.end(), input.begin(), input.end());
        for (int i = size() / 2; i >= 1; --i) max_heapify(i);
    }
    MaxHeap() = default;

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

    // Delete(i): quita el elemento en la posición i (caso límite: i == n
    // sólo requiere el pop, sin restaurar nada).
    void delete_key(int i) {
        if (i < 1 || i > size()) throw out_of_range("delete_key: índice inválido");
        vals[i] = vals.back();
        vals.pop_back();
        if (i <= size()) {
            sift_up(i);
            max_heapify(i);
        }
    }
};
