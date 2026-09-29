// Paso 6 — Decrease-Key.
//
// DERIVADO; no aparece en las diapositivas (sólo Θ(lg n) en la tabla).
// Nombre "de mínimo" por convención de la tabla, pero en este montículo
// MÁXIMO la operación simétrica es volver una llave MÁS urgente (más
// grande) y subirla; si en cambio se la vuelve menos urgente hay que
// hundirla. change_key cubre ambos sentidos con el mismo argumento de
// altura que insert / max_heapify.

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

    // Decrease-key(i, new_key) tal como lo nombra la tabla del profesor:
    // cambia la llave en la posición i y restaura el invariante subiendo
    // (si new_key es más urgente, o sea mayor en este max-heap) o bajando
    // (si es menos urgente). Ambos casos cuestan O(lg n).
    void decrease_key(int i, int new_key) {
        if (i < 1 || i > size()) throw out_of_range("decrease_key: índice inválido");
        vals[i] = new_key;
        sift_up(i);
        max_heapify(i);
    }
};
