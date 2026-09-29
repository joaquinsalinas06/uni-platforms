// Implementación completa del montículo binario (máximo), 1-indexado.
// Junta los pasos 1-8. main() prueba el caso normal y casos límite.

#include <iostream>
#include <vector>
#include <algorithm>
#include <stdexcept>
using namespace std;

struct MaxHeap {
    vector<int> vals = {0}; // centinela en vals[0]; elementos reales en vals[1..n]

    int size() { return (int)vals.size() - 1; }
    bool isEmpty() { return size() == 0; }
    int parent(int i) { return i / 2; }
    int left(int i)   { return 2 * i; }
    int right(int i)  { return 2 * i + 1; }

    // Algoritmo 1 (Sem_1_Heaps_I-1.pdf#10). O(lg n): recorre a lo más un
    // camino raíz-hoja.
    void max_heapify(int i) {
        int n = size();
        while (true) {
            int l = left(i), r = right(i), largest = i;
            if (l <= n && vals[l] > vals[largest]) largest = l;
            if (r <= n && vals[r] > vals[largest]) largest = r;
            if (largest == i) break; // i es hoja o ya cumple el invariante
            swap(vals[i], vals[largest]);
            i = largest;
        }
    }

    void build_from(const vector<int>& input) {
        vals = {0};
        vals.insert(vals.end(), input.begin(), input.end());
        // Algoritmo 3 (Sem_1_Heaps_I-1.pdf#20-21): toda posición > n/2 es
        // hoja, así que basta empezar en n/2. Θ(n) agregado, no O(n lg n).
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

    // DERIVADO (no en las diapositivas): sube el nuevo elemento. O(lg n).
    void insert(int key) {
        vals.push_back(key);
        sift_up(size());
    }

    // DERIVADO. La raíz es el extremo (aquí, el máximo). Θ(1).
    int find_min() {
        if (isEmpty()) throw runtime_error("find_min: montículo vacío");
        return vals[1];
    }

    // DERIVADO. Retira la raíz y restaura con max_heapify. O(lg n).
    int extract_min() {
        if (isEmpty()) throw runtime_error("extract_min: montículo vacío");
        int top = vals[1];
        vals[1] = vals.back();
        vals.pop_back();
        if (!isEmpty()) max_heapify(1);
        return top;
    }

    // DERIVADO. Nombrada "decrease-key" por la tabla del profesor; en este
    // max-heap cambia la llave y restaura subiendo o bajando, lo que aplique.
    void decrease_key(int i, int new_key) {
        if (i < 1 || i > size()) throw out_of_range("decrease_key: índice inválido");
        vals[i] = new_key;
        sift_up(i);
        max_heapify(i);
    }

    // DERIVADO. Sustituye por el último y restaura. O(lg n).
    void delete_key(int i) {
        if (i < 1 || i > size()) throw out_of_range("delete_key: índice inválido");
        vals[i] = vals.back();
        vals.pop_back();
        if (i <= size()) {
            sift_up(i);
            max_heapify(i);
        }
    }

    // DERIVADO. Concatena y reconstruye: Θ(n1 + n2), la debilidad que
    // motiva el montículo binomial.
    void heap_union(const MaxHeap& other) {
        vector<int> merged(vals.begin() + 1, vals.end());
        merged.insert(merged.end(), other.vals.begin() + 1, other.vals.end());
        build_from(merged);
    }

    bool is_valid_max_heap() {
        int n = size();
        for (int i = 2; i <= n; ++i) {
            if (vals[parent(i)] < vals[i]) return false;
        }
        return true;
    }
};

int main() {
    // Caso normal: el ejemplo del profesor, Max-Heapify(A, 1, 7) sobre
    // A = [4, 14, 10, 8, 2, 9, 3] (Sem_1_Heaps_I-1.pdf#11-15).
    // Resultado esperado tras un solo Max-Heapify: [14, 8, 10, 4, 2, 9, 3].
    {
        MaxHeap h;
        h.vals = {0, 4, 14, 10, 8, 2, 9, 3};
        h.max_heapify(1);
        vector<int> expected = {0, 14, 8, 10, 4, 2, 9, 3};
        if (h.vals != expected) { cerr << "FALLO: max_heapify\n"; return 1; }
        cout << "OK max_heapify: raiz = " << h.vals[1] << "\n";
    }

    // Build-Max-Heap sobre un arreglo arbitrario, y verificación del invariante.
    {
        MaxHeap h({4, 1, 3, 2, 16, 9, 10, 14, 8, 7});
        if (!h.is_valid_max_heap()) { cerr << "FALLO: build_from invariante\n"; return 1; }
        if (h.find_min() != 16) { cerr << "FALLO: find_min\n"; return 1; }
        cout << "OK build_max_heap: raiz = " << h.find_min() << "\n";
    }

    // Insert, extract_min (extract-max en este montículo), decrease_key, delete,
    // encadenados, verificando el invariante después de cada uno.
    {
        MaxHeap h({5, 3, 8, 1});
        h.insert(20);
        if (!h.is_valid_max_heap() || h.find_min() != 20) { cerr << "FALLO: insert\n"; return 1; }

        int top = h.extract_min();
        if (top != 20 || !h.is_valid_max_heap()) { cerr << "FALLO: extract_min\n"; return 1; }

        h.decrease_key(h.size(), 100); // vuelve más urgente la última posición
        if (!h.is_valid_max_heap() || h.find_min() != 100) { cerr << "FALLO: decrease_key\n"; return 1; }

        h.delete_key(1); // borra la raíz
        if (!h.is_valid_max_heap()) { cerr << "FALLO: delete_key\n"; return 1; }

        cout << "OK insert/extract_min/decrease_key/delete_key\n";
    }

    // Union de dos montículos.
    {
        MaxHeap a({3, 1, 4});
        MaxHeap b({9, 2, 6});
        a.heap_union(b);
        if (!a.is_valid_max_heap() || a.size() != 6 || a.find_min() != 9) {
            cerr << "FALLO: heap_union\n"; return 1;
        }
        cout << "OK heap_union: raiz = " << a.find_min() << "\n";
    }

    // Casos límite: montículo vacío y de un solo elemento.
    {
        MaxHeap empty;
        bool threw = false;
        try { empty.extract_min(); } catch (const runtime_error&) { threw = true; }
        if (!threw) { cerr << "FALLO: extract_min en vacio deberia lanzar\n"; return 1; }

        MaxHeap one({42});
        if (one.find_min() != 42 || one.extract_min() != 42 || !one.isEmpty()) {
            cerr << "FALLO: caso de un solo elemento\n"; return 1;
        }
        cout << "OK casos limite: vacio y un solo elemento\n";
    }

    cout << "Todas las pruebas pasaron.\n";
    return 0;
}
