// Source: https://usaco.guide/general/io

#include <bits/stdc++.h>
using namespace std;

const int N = 100000 + 5;

int n;
int h[N];
int sz[N];
int par[N];
bool removed[N];
vector<int> G[N];

void DFS(int u, int p = -1) {
    sz[u] = 1;
    for (int &v : G[u]) {
        if (v == p or removed[v]) continue;
        DFS(v, u);
        sz[u] += sz[v];
    }
}

int centroid(int u, int p, int s) {
    for (int &v : G[u]) {
        if (v == p) continue;
        if (removed[v]) continue;
        if (2 * sz[v] > s) {
            return centroid(v, u, s);
        }
    }
    return u;
}

void decompose(int u, int p) {
    DFS(u, p);
    int c = centroid(u, p, sz[u]);
    par[c] = p;
    removed[c] = true;
    h[c] = p == -1 ? 0 : h[p] + 1;
    for (int &v : G[c]) {
        if (removed[v]) continue;  
        decompose(v, c);
    }
}

int get_depth(int x) {
    int res = 0;
    while (par[x] != -1) {
        ++res;
        x = par[x];
    }
    return res;
}

int main() {
	cin.tie(0) -> sync_with_stdio(false);
    cin >> n;
    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    decompose(1, -1);
    for (int i = 1; i <= n; ++i) {
        cout << char('A' + h[i]) << " \n"[i == n];
    }
    return 0;
}
