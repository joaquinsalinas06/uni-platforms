// Layered range tree -- implementacion completa. Junta los pasos 1-3:
//   - sorted-array-replacement: arreglo ordenado por nodo (merge de los hijos)
//   - bridge-build: bridgeL/bridgeR con dos punteros + centinela
//   - range-query-2d: una unica busqueda binaria en la raiz, O(1) por
//     nodo canonico despues, via los puentes
//
// main() verifica ambas versiones (con puentes y sin ellos, la version
// "ingenua" que repite busqueda binaria en cada nodo canonico) contra
// fuerza bruta sobre los MISMOS puntos y consultas, y cuenta cuantas
// busquedas binarias hace cada una -- para que el ahorro del factor
// logaritmico se vea en numeros, no solo en la notacion O(.).

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <vector>
using namespace std;

// Contador global de busquedas binarias, compartido por ambas versiones.
// Se resetea antes de correr cada version sobre el mismo lote de consultas.
static long long binarySearchCount = 0;

// ---------------------------------------------------------------------
// Version CON puentes (fractional cascading aplicado al range tree).
// ---------------------------------------------------------------------
struct LayeredRangeTree {
    int n;
    vector<vector<int>> ys;
    vector<vector<int>> bridgeL, bridgeR;
    vector<int> xs;

    void build(int node, int lo, int hi, const vector<pair<int,int>>& points) {
        if (hi - lo == 1) { ys[node] = {points[lo].second}; return; }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, points);
        build(2 * node + 1, mid, hi, points);
        const auto& left = ys[2 * node];
        const auto& right = ys[2 * node + 1];
        int size = (int)left.size() + (int)right.size();
        ys[node].resize(size);
        merge(left.begin(), left.end(), right.begin(), right.end(), ys[node].begin());

        // Puentes con DOS PUNTEROS (no lower_bound por elemento): los
        // indices pl/pr son los mismos que ya usa el merge, y solo avanzan
        // hacia adelante porque tanto el arreglo del nodo como los de sus
        // hijos estan ordenados.
        bridgeL[node].resize(size + 1);
        bridgeR[node].resize(size + 1);
        int pl = 0, pr = 0;
        for (int i = 0; i < size; i++) {
            while (pl < (int)left.size() && left[pl] < ys[node][i]) pl++;
            while (pr < (int)right.size() && right[pr] < ys[node][i]) pr++;
            bridgeL[node][i] = pl;
            bridgeR[node][i] = pr;
        }
        bridgeL[node][size] = (int)left.size();  // centinela
        bridgeR[node][size] = (int)right.size();  // centinela
    }

    explicit LayeredRangeTree(vector<pair<int,int>> points) : n((int)points.size()) {
        sort(points.begin(), points.end());
        int cap = 4 * max(n, 1);
        ys.assign(cap, {});
        bridgeL.assign(cap, {});
        bridgeR.assign(cap, {});
        xs.resize(n);
        for (int i = 0; i < n; i++) xs[i] = points[i].first;
        if (n > 0) build(1, 0, n, points);
    }

    long long descend(int node, int lo, int hi, int ql, int qr, int pa, int pb) {
        if (qr <= lo || hi <= ql) return 0;
        if (ql <= lo && hi <= qr) return pb - pa;   // nodo canonico: O(1), sin buscar
        int mid = (lo + hi) / 2;
        long long l = descend(2 * node, lo, mid, ql, qr, bridgeL[node][pa], bridgeL[node][pb]);
        long long r = descend(2 * node + 1, mid, hi, ql, qr, bridgeR[node][pa], bridgeR[node][pb]);
        return l + r;
    }

    long long count(int x1, int x2, int y1, int y2) {
        if (n == 0) return 0;
        int ql = (int)(lower_bound(xs.begin(), xs.end(), x1) - xs.begin());
        int qr = (int)(upper_bound(xs.begin(), xs.end(), x2) - xs.begin());
        if (ql >= qr) return 0;
        // La UNICA busqueda binaria real en Y de toda la consulta (2 llamadas: pa, pb).
        int pa = (int)(lower_bound(ys[1].begin(), ys[1].end(), y1) - ys[1].begin());
        binarySearchCount++;
        int pb = (int)(lower_bound(ys[1].begin(), ys[1].end(), y2 + 1) - ys[1].begin());
        binarySearchCount++;
        return descend(1, 0, n, ql, qr, pa, pb);
    }
};

// ---------------------------------------------------------------------
// Version INGENUA: mismos arreglos por nodo, pero SIN puentes -- cada
// nodo canonico repite su propia busqueda binaria de pa/pb en Y, en vez
// de heredarlos en O(1). Es exactamente el range tree 2D del material
// antes de aplicar fractional cascading (tabla #37-40: O(lg^2 n)).
// ---------------------------------------------------------------------
struct NaiveRangeTree2D {
    int n;
    vector<vector<int>> ys;
    vector<int> xs;

    void build(int node, int lo, int hi, const vector<pair<int,int>>& points) {
        if (hi - lo == 1) { ys[node] = {points[lo].second}; return; }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, points);
        build(2 * node + 1, mid, hi, points);
        const auto& left = ys[2 * node];
        const auto& right = ys[2 * node + 1];
        ys[node].resize(left.size() + right.size());
        merge(left.begin(), left.end(), right.begin(), right.end(), ys[node].begin());
    }

    explicit NaiveRangeTree2D(vector<pair<int,int>> points) : n((int)points.size()) {
        sort(points.begin(), points.end());
        int cap = 4 * max(n, 1);
        ys.assign(cap, {});
        xs.resize(n);
        for (int i = 0; i < n; i++) xs[i] = points[i].first;
        if (n > 0) build(1, 0, n, points);
    }

    long long descend(int node, int lo, int hi, int ql, int qr, int y1, int y2) {
        if (qr <= lo || hi <= ql) return 0;
        if (ql <= lo && hi <= qr) {
            // Nodo canonico: busqueda binaria PROPIA en este nodo (el costo
            // que los puentes evitan).
            int pa = (int)(lower_bound(ys[node].begin(), ys[node].end(), y1) - ys[node].begin());
            binarySearchCount++;
            int pb = (int)(lower_bound(ys[node].begin(), ys[node].end(), y2 + 1) - ys[node].begin());
            binarySearchCount++;
            return pb - pa;
        }
        int mid = (lo + hi) / 2;
        return descend(2 * node, lo, mid, ql, qr, y1, y2)
             + descend(2 * node + 1, mid, hi, ql, qr, y1, y2);
    }

    long long count(int x1, int x2, int y1, int y2) {
        if (n == 0) return 0;
        int ql = (int)(lower_bound(xs.begin(), xs.end(), x1) - xs.begin());
        int qr = (int)(upper_bound(xs.begin(), xs.end(), x2) - xs.begin());
        if (ql >= qr) return 0;
        return descend(1, 0, n, ql, qr, y1, y2);
    }
};

// Fuerza bruta: O(n) por consulta, sin ninguna busqueda binaria. Es el
// oraculo contra el que se verifican ambas versiones.
long long bruteForce(const vector<pair<int,int>>& points, int x1, int x2, int y1, int y2) {
    long long c = 0;
    for (auto& [x, y] : points)
        if (x1 <= x && x <= x2 && y1 <= y && y <= y2) c++;
    return c;
}

int main() {
    mt19937 rng(20260913);

    // --- Caso normal + limites, verificados a mano contra el ejemplo del material ---
    {
        vector<pair<int,int>> points = {{1,4}, {2,9}, {3,1}, {4,7}};
        LayeredRangeTree t(points);
        long long r = t.count(2, 4, 3, 8);
        assert(r == 1); // solo D=(4,7)
        cout << "verificado: ejemplo normal [2,4]x[3,8] -> " << r << " punto (D=(4,7))\n";
    }
    {
        // Caso limite: rango de Y que no contiene ningun punto.
        vector<pair<int,int>> points = {{1,4}, {2,9}, {3,1}, {4,7}};
        LayeredRangeTree t(points);
        long long r = t.count(1, 4, 100, 200);
        assert(r == 0);
        cout << "verificado: rango de Y vacio -> " << r << " puntos\n";
    }
    {
        // Caso limite: un solo punto.
        vector<pair<int,int>> points = {{5, 5}};
        LayeredRangeTree t(points);
        assert(t.count(0, 10, 0, 10) == 1);
        assert(t.count(0, 4, 0, 10) == 0);
        cout << "verificado: arbol de un solo punto, dentro y fuera del rango\n";
    }
    {
        // Caso limite: n = 0.
        vector<pair<int,int>> points = {};
        LayeredRangeTree t(points);
        assert(t.count(0, 10, 0, 10) == 0);
        cout << "verificado: arbol vacio -> 0 puntos, sin excepciones\n";
    }

    // --- Fuzz contra fuerza bruta: n puntos, q consultas aleatorias ---
    const int N = 400, Q = 500, COORD = 200;
    uniform_int_distribution<int> coord(0, COORD);
    vector<pair<int,int>> points;
    for (int i = 0; i < N; i++) points.push_back({coord(rng), coord(rng)});

    vector<array<int,4>> queries;
    for (int i = 0; i < Q; i++) {
        int x1 = coord(rng), x2 = coord(rng);
        int y1 = coord(rng), y2 = coord(rng);
        if (x1 > x2) swap(x1, x2);
        if (y1 > y2) swap(y1, y2);
        queries.push_back({x1, x2, y1, y2});
    }

    LayeredRangeTree layered(points);
    NaiveRangeTree2D naive(points);

    long long layeredSearches = 0, naiveSearches = 0;
    for (auto& q : queries) {
        long long expected = bruteForce(points, q[0], q[1], q[2], q[3]);

        binarySearchCount = 0;
        long long got = layered.count(q[0], q[1], q[2], q[3]);
        layeredSearches += binarySearchCount;
        assert(got == expected);

        binarySearchCount = 0;
        long long gotNaive = naive.count(q[0], q[1], q[2], q[3]);
        naiveSearches += binarySearchCount;
        assert(gotNaive == expected);
    }
    cout << "verificado: " << Q << " consultas aleatorias sobre " << N
         << " puntos -- con puentes y sin ellos coinciden con fuerza bruta\n";

    cout << "\nbusquedas binarias totales sobre las " << Q << " consultas:\n";
    cout << "  con puentes (layered) : " << layeredSearches
         << "  (2 por consulta: pa y pb, solo en la raiz)\n";
    cout << "  sin puentes (naive)   : " << naiveSearches
         << "  (2 por nodo canonico visitado)\n";
    cout << "  razon naive/layered   : "
         << (double)naiveSearches / (double)layeredSearches << "x\n";
    assert(naiveSearches > layeredSearches);
    cout << "verificado: el factor de lg n menos se ve en numeros, no solo en la notacion\n";
}
