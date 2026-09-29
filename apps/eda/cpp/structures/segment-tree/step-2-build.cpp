// Paso 2: Build. Combinar = suma en este ejemplo.
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
};

int main() {
    SegmentTree st({1, 2, 3, 4});
    cout << "raiz [1,4] = " << st.tree[1] << "\n"; // 10
}
