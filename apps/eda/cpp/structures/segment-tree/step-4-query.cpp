// Paso 4: + Query. Tres casos: sin traslape, contenido completo, parcial.
#include <vector>
#include <iostream>
using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree;
    vector<long long> a;

    explicit SegmentTree(const vector<long long>& values)
        : n((int)values.size()), tree(4 * (int)values.size(), 0), a(values) {
        if (n > 0) build(1, 0, n - 1);
    }

    void build(int node, int l, int r) {
        if (l == r) {
            tree[node] = a[l];
            return;
        }
        int m = (l + r) / 2;
        build(2 * node, l, m);
        build(2 * node + 1, m + 1, r);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void update(int node, int l, int r, int pos, long long val) {
        if (l == r) {
            tree[node] = val;
            return;
        }
        int m = (l + r) / 2;
        if (pos <= m) update(2 * node, l, m, pos, val);
        else update(2 * node + 1, m + 1, r, pos, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void update(int pos, long long val) { update(1, 0, n - 1, pos, val); }

    long long query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0; // neutro de la suma
        if (ql <= l && r <= qr) return tree[node];
        int m = (l + r) / 2;
        return query(2 * node, l, m, ql, qr) + query(2 * node + 1, m + 1, r, ql, qr);
    }

    long long query(int ql, int qr) { return query(1, 0, n - 1, ql, qr); }
};

int main() {
    SegmentTree st({1, 2, 3, 4});
    cout << "query(1,3) 0-idx = " << st.query(1, 3) << "\n"; // 2+3+4=9
}
