// Paso 3 -- consulta 2D.
// Una unica busqueda binaria real, en la raiz, para pa (primer Y >= y1) y
// pb (primer Y > y2). Al descender hacia los nodos canonicos de [x1,x2]
// (la misma descomposicion canonica de range-tree), pa y pb se trasladan
// por bridgeL/bridgeR en O(1) -- nunca se vuelve a buscar en Y.

#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct LayeredRangeTree {
    int n;
    vector<vector<int>> ys;
    vector<vector<int>> bridgeL, bridgeR;

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
        bridgeL[node].resize(size + 1);
        bridgeR[node].resize(size + 1);
        int pl = 0, pr = 0;
        for (int i = 0; i < size; i++) {
            while (pl < (int)left.size() && left[pl] < ys[node][i]) pl++;
            while (pr < (int)right.size() && right[pr] < ys[node][i]) pr++;
            bridgeL[node][i] = pl;
            bridgeR[node][i] = pr;
        }
        bridgeL[node][size] = (int)left.size();
        bridgeR[node][size] = (int)right.size();
    }

    vector<int> xs;

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

    // Desciende por el nodo, trasladando pa/pb con los puentes en vez de
    // volver a buscar en Y. Sin ninguna busqueda binaria despues de la raiz.
    long long descend(int node, int lo, int hi, int ql, int qr, int pa, int pb) {
        if (qr <= lo || hi <= ql) return 0;               // disjunto
        if (ql <= lo && hi <= qr) return pb - pa;          // nodo canonico: O(1)
        int mid = (lo + hi) / 2;
        long long left = descend(2 * node, lo, mid, ql, qr, bridgeL[node][pa], bridgeL[node][pb]);
        long long right = descend(2 * node + 1, mid, hi, ql, qr, bridgeR[node][pa], bridgeR[node][pb]);
        return left + right;
    }

    long long count(int x1, int x2, int y1, int y2) {
        if (n == 0) return 0;
        int ql = (int)(lower_bound(xs.begin(), xs.end(), x1) - xs.begin());
        int qr = (int)(upper_bound(xs.begin(), xs.end(), x2) - xs.begin());
        if (ql >= qr) return 0;
        // La unica busqueda binaria real de toda la consulta.
        int pa = (int)(lower_bound(ys[1].begin(), ys[1].end(), y1) - ys[1].begin());
        int pb = (int)(lower_bound(ys[1].begin(), ys[1].end(), y2 + 1) - ys[1].begin());
        return descend(1, 0, n, ql, qr, pa, pb);
    }
};

int main() {
    LayeredRangeTree t({{1,4}, {2,9}, {3,1}, {4,7}});
    cout << "count([2,4]x[3,8]) = " << t.count(2, 4, 3, 8) << " (esperado: 1, solo D=(4,7))\n";
}
