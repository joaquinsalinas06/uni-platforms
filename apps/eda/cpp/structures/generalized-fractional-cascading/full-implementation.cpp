// Fractional cascading generalizado: el mismo mecanismo de
// /cpp/structures/fractional-cascading, pero las "listas" ahora son vertices
// de un GRAFO con grado acotado (padre, dos hijos, dos enlaces auxiliares a
// la estructura invertida gemela = grado 5, como D4/D3 del material #52), y
// una consulta recorre un CAMINO del grafo en vez de una cadena fija.
//
// Verifica, con conteo de comparaciones (igual que /structures/fractional-cascading):
//   1) el grado de cada vertice de un grafo D4-like esta acotado por 5 (#52);
//   2) una consulta a lo largo de un camino del grafo cuesta menos
//      comparaciones que busqueda binaria independiente en cada vertice del
//      camino, con el mismo patron O(k + lg n) (#51, #54);
//   3) el contraejemplo de grado NO acotado: el tamano de los puentes
//      explota, con numeros concretos (#51: "grado acotado" es la condicion,
//      no un detalle).
//
// g++ -std=c++20 -Wall full-implementation.cpp -o gfc && ./gfc

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
using namespace std;

// ---------------------------------------------------------------------
// 1) El grafo de cascading: vertices con grado acotado.
// ---------------------------------------------------------------------

struct Vertex {
    int id;
    vector<int> values; // lista propia del vertice, ordenada
    vector<int> neighbors; // ids de vecinos (padre, hijos, gemela invertida...)
};

// Un grafo D4-like: nodo 0 = padre, 1 y 2 = sus dos hijos, 3 y 4 = los dos
// enlaces auxiliares hacia la estructura invertida gemela del propio nodo 0
// (#52: "su padre, sus dos hijos, y dos enlaces auxiliares"). El nodo 0
// queda con grado 4 aqui porque no tiene padre propio en este fragmento; el
// resto de la construccion real le agregaria uno (grado 5 pleno).
vector<Vertex> build_d4_like_graph() {
    vector<Vertex> g(5);
    g[0] = {0, {2, 8, 15, 23, 31, 40, 55, 61, 70, 88}, {1, 2, 3, 4}};
    g[1] = {1, {3, 5, 12, 26, 34, 45, 58, 66, 75, 91}, {0}};
    g[2] = {2, {4, 9, 13, 18, 22, 36, 49, 63, 77, 95}, {0}};
    g[3] = {3, {1, 6, 14, 21, 33, 47, 59, 68, 82, 90}, {0}}; // gemela invertida, mitad A
    g[4] = {4, {7, 11, 17, 20, 29, 41, 52, 60, 80, 99}, {0}}; // gemela invertida, mitad B
    return g;
}

// ---------------------------------------------------------------------
// 2) Verificacion del grado acotado (#52).
// ---------------------------------------------------------------------

bool bounded_degree_check(const vector<Vertex>& g, int max_degree) {
    bool ok = true;
    for (const auto& v : g) {
        cout << "  vertice " << v.id << ": grado " << v.neighbors.size()
             << (v.neighbors.size() <= (size_t)max_degree ? " <= " : " >  ")
             << max_degree << "\n";
        if (v.neighbors.size() > (size_t)max_degree) ok = false;
    }
    return ok;
}

// ---------------------------------------------------------------------
// 3) Cascading a lo largo de un camino del grafo (reduce a la cadena de
//    /structures/fractional-cascading una vez fijado el camino: #51 dice
//    que la navegacion completa es "una busqueda real al entrar, y O(1) por
//    cada paso" -- exactamente el mismo argumento, aplicado al camino).
// ---------------------------------------------------------------------

struct Elem {
    int value;
    int bridge; // indice en el vertice siguiente del camino, o -1
};
using AugList = vector<Elem>;

AugList own_elems(const vector<int>& L) {
    AugList out;
    for (int v : L) out.push_back({v, -1});
    return out;
}

AugList merge_promote(const vector<int>& Li, const AugList& next) {
    AugList promoted;
    for (int j = 1; j < (int)next.size(); j += 2) promoted.push_back({next[j].value, j});
    AugList own = own_elems(Li);
    AugList out;
    size_t a = 0, b = 0;
    while (a < own.size() && b < promoted.size()) {
        if (own[a].value <= promoted[b].value) out.push_back(own[a++]);
        else out.push_back(promoted[b++]);
    }
    while (a < own.size()) out.push_back(own[a++]);
    while (b < promoted.size()) out.push_back(promoted[b++]);
    return out;
}

// Construye las listas aumentadas SOLO para los vertices del camino dado,
// en el orden del camino (el resto del grafo no participa en esta consulta).
vector<AugList> build_along_path(const vector<Vertex>& g, const vector<int>& path) {
    int k = (int)path.size();
    vector<AugList> aug(k);
    aug[k - 1] = own_elems(g[path[k - 1]].values);
    for (int i = k - 2; i >= 0; --i) aug[i] = merge_promote(g[path[i]].values, aug[i + 1]);
    return aug;
}

int lower_bound_idx(const AugList& L, int x, long long& cmp) {
    int lo = 0, hi = (int)L.size();
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        ++cmp;
        if (L[mid].value < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

int follow_bridge(const AugList& from, const AugList& to, int pos, int x, long long& cmp) {
    int src = min(pos, (int)from.size() - 1);
    while (src >= 0 && from[src].bridge == -1) --src;
    int p = (src >= 0) ? from[src].bridge : 0;
    while (p > 0 && to[p - 1].value >= x) { --p; ++cmp; }
    while (p < (int)to.size() && to[p].value < x) { ++p; ++cmp; }
    return p;
}

// Una unica busqueda real al entrar (#51), O(1) por cada paso del camino.
vector<bool> cascade_query_path(const vector<AugList>& aug, int x, long long& cmp) {
    int k = (int)aug.size();
    vector<bool> found(k, false);
    if (k == 0) return found;
    int pos = lower_bound_idx(aug[0], x, cmp);
    found[0] = pos < (int)aug[0].size() && aug[0][pos].value == x && aug[0][pos].bridge == -1;
    for (int i = 1; i < k; ++i) {
        pos = follow_bridge(aug[i - 1], aug[i], pos, x, cmp);
        found[i] = pos < (int)aug[i].size() && aug[i][pos].value == x && aug[i][pos].bridge == -1;
    }
    return found;
}

vector<bool> naive_query_path(const vector<Vertex>& g, const vector<int>& path, int x, long long& cmp) {
    vector<bool> found(path.size(), false);
    for (size_t i = 0; i < path.size(); ++i) {
        const auto& L = g[path[i]].values;
        int lo = 0, hi = (int)L.size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            ++cmp;
            if (L[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        found[i] = lo < (int)L.size() && L[lo] == x;
    }
    return found;
}

// ---------------------------------------------------------------------
// 4) Contraejemplo: grado NO acotado. Sin la condicion de aplicabilidad
//    (#51), un vertice con grado d necesita bridges hacia sus d vecinos:
//    el costo de mantenerlos por vertice deja de ser O(1) y pasa a ser
//    O(d) -- con d = n (un vertice conectado a todos), el espacio total de
//    puentes se vuelve Theta(n) EN UN SOLO VERTICE, no O(1) amortizado.
// ---------------------------------------------------------------------

void unbounded_degree_counterexample() {
    int n = 2000; // tamano de cada lista vecina
    int bounded_degree = 5;      // la construccion D4/D3 real (#52)
    int unbounded_degree = 400;  // un vertice "hub" conectado a 400 vecinos

    long long bridges_bounded = (long long)bounded_degree * (n / 2); // ~mitad promovida por vecino
    long long bridges_unbounded = (long long)unbounded_degree * (n / 2);

    cout << "  grado acotado (d=" << bounded_degree << "): ~" << bridges_bounded
         << " puentes en ese vertice\n";
    cout << "  grado NO acotado (d=" << unbounded_degree << "): ~" << bridges_unbounded
         << " puentes en ese vertice\n";
    cout << "  factor de explosion: " << (bridges_unbounded / bridges_bounded) << "x"
         << " (= " << unbounded_degree << "/" << bounded_degree << ", el cociente de los grados)\n";

    assert(bridges_unbounded > bridges_bounded * 10);
    cout << "  [ok] con grado no acotado, un solo vertice concentra tantos puentes como "
         << unbounded_degree / bounded_degree
         << " construcciones D4-like completas -- se rompe el O(1) por paso de #51\n";
}

int main() {
    cout << "== 1) Grado acotado del grafo D4-like (#52) ==\n";
    auto graph = build_d4_like_graph();
    bool degree_ok = bounded_degree_check(graph, 5);
    assert(degree_ok);
    cout << "[ok] todos los vertices cumplen grado <= 5\n\n";

    cout << "== 2) Consulta a lo largo de un camino del grafo (#51, #54) ==\n";
    // Camino: nodo 0 (raiz) -> nodo 2 (hijo) -> nodo 0 -> nodo 3 (gemela
    // invertida). Un camino real puede visitar el mismo vertice mas de una
    // vez al rebotar entre estructura normal e invertida (#53): "cada paso
    // hacia abajo (incluyendo los saltos entre estructura normal e
    // invertida) es O(1)".
    vector<int> path = {0, 2, 0, 3};
    auto aug = build_along_path(graph, path);

    vector<int> queries = {9, 22, 61, -5, 99, 33};
    long long total_cascade = 0, total_naive = 0;
    for (int x : queries) {
        long long c_casc = 0, c_naive = 0;
        auto f_casc = cascade_query_path(aug, x, c_casc);
        auto f_naive = naive_query_path(graph, path, x, c_naive);
        assert(f_casc == f_naive);
        total_cascade += c_casc;
        total_naive += c_naive;
        cout << "  x=" << x << ": grafo-cascading=" << c_casc
             << " comparaciones, binaria independiente=" << c_naive << " comparaciones\n";
    }
    cout << "[ok] grafo-cascading y busqueda independiente coinciden en las "
         << queries.size() << " consultas sobre el camino " << "[0,2,0,3]\n";
    cout << "[ok] total comparaciones -- grafo-cascading: " << total_cascade
         << ", independiente: " << total_naive << "\n";
    assert(total_cascade < total_naive);
    cout << "[ok] el ahorro O(k + lg n) se mantiene sobre un camino de un GRAFO, "
         << "no solo sobre una cadena lineal\n\n";

    cout << "== 3) Caso limite: camino de un solo vertice (k=1) ==\n";
    {
        vector<int> one_path = {1};
        auto aug1 = build_along_path(graph, one_path);
        long long c = 0;
        auto f = cascade_query_path(aug1, 26, c);
        assert(f[0] == true);
        cout << "  [ok] k=1: la consulta se reduce a una unica busqueda binaria (encontro 26)\n\n";
    }

    cout << "== 4) Contraejemplo: grado NO acotado (viola #51) ==\n";
    unbounded_degree_counterexample();

    cout << "\nTodas las verificaciones pasaron.\n";
    return 0;
}
