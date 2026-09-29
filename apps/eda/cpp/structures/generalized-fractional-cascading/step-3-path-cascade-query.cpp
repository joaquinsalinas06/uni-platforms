// Paso 3 -- la composicion final (#51, #53): fijado un CAMINO del grafo, la
// consulta reduce exactamente a fractional cascading sobre una cadena (ver
// /cpp/structures/fractional-cascading): una unica busqueda binaria real al
// entrar, y O(1) por cada paso hacia el siguiente vertice del camino.

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
using namespace std;

struct Vertex {
    int id;
    vector<int> values;
    vector<int> neighbors;
};

vector<Vertex> build_d4_like_graph() {
    vector<Vertex> g(5);
    g[0] = {0, {2, 8, 15, 23, 31, 40, 55, 61, 70, 88}, {1, 2, 3, 4}};
    g[1] = {1, {3, 5, 12, 26, 34, 45, 58, 66, 75, 91}, {0}};
    g[2] = {2, {4, 9, 13, 18, 22, 36, 49, 63, 77, 95}, {0}};
    g[3] = {3, {1, 6, 14, 21, 33, 47, 59, 68, 82, 90}, {0}};
    g[4] = {4, {7, 11, 17, 20, 29, 41, 52, 60, 80, 99}, {0}};
    return g;
}

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

int main() {
    auto g = build_d4_like_graph();
    // Camino: raiz -> hijo -> raiz -> gemela invertida (#53: los saltos
    // entre estructura normal e invertida tambien son O(1)).
    vector<int> path = {0, 2, 0, 3};
    auto aug = build_along_path(g, path);

    long long cmp = 0;
    auto found = cascade_query_path(aug, 22, cmp);
    for (size_t i = 0; i < path.size(); ++i) {
        cout << "  vertice " << path[i] << ": " << (found[i] ? "encontrado" : "no encontrado") << "\n";
    }
    cout << "[ok] consulta x=22 sobre el camino [0,2,0,3] con " << cmp << " comparaciones\n";
    assert(found[1] == true); // 22 esta en la lista del vertice 2
    return 0;
}
