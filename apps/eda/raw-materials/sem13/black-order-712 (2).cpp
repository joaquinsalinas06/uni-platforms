#include <bits/stdc++.h>
using namespace std;

struct Data {
    int leftmost;
    int rightmost;
    Data() {
        leftmost = rightmost = -1;
    }

    Data(int x) {
        leftmost = rightmost = x;
    }

    Data operator + (const Data &rhs) const {
        if (rhs.leftmost == -1) return *this;
        if (leftmost == -1) return rhs;
        Data q;
        q.leftmost = min(leftmost, rhs.leftmost);
        q.rightmost = max(rightmost, rhs.rightmost);
        return q;
    }
};

template<int E = 26>
struct AhoCorasick {
    vector<Data> positions;
    vector<int> order;
    vector<int> height;
    vector<bool> is_pattern;
    vector<int> suffix_link;
    vector<array<int, E>> trie;

    AhoCorasick() {
        add_node();
    }

    int id(char c) {
        return c - 'a';
    }

    void add_node() {
        is_pattern.emplace_back(false);
        suffix_link.emplace_back(0);
        trie.emplace_back();
        positions.emplace_back();
        height.emplace_back();
    }

    int insert(string &s) {
        int pos = 0;
        int h = 0;
        for (auto &x : s) {
            int c = id(x);
            if (trie[pos][c] == 0) {
                trie[pos][c] = trie.size();
                add_node();
            }
            pos = trie[pos][c];
            height[pos] = ++h;
        }
        is_pattern[pos] = true;
        return pos;
    }

    void build() {
        queue<int> Q;
        Q.emplace(0);
        while (not Q.empty()) {
            int u = Q.front(); Q.pop();
            order.emplace_back(u);
            for (int c = 0; c < E; ++c) {
                if (trie[u][c]) {
                    int v = trie[u][c];
                    suffix_link[v] = u == 0 ? 0 : trie[suffix_link[u]][c];
                    Q.emplace(v);
                }
                else {
                    trie[u][c] = u == 0 ? 0 : trie[suffix_link[u]][c];
                }
            }
        }
    }

    void bottom_up() {
        for (int i = (int)order.size() - 1; i > 0; --i) {
            int x = order[i];
            positions[suffix_link[x]] = positions[suffix_link[x]] + positions[x];
        }
    }

};

int main() {
	cin.tie(0) -> sync_with_stdio(false);
    int n;
    cin >> n;
    AhoCorasick<26> AC;
    vector<int> position_in_ac(n);
    for (int i = 0; i < n; ++i) {
        string s;
        cin >> s;
        position_in_ac[i] = AC.insert(s);
    }
    AC.build();
    string text;
    cin >> text;
    int pos = 0;
    for (int i = 0; i < text.size(); ++i) {
        int c = text[i] - 'a';
        pos = AC.trie[pos][c];
        AC.positions[pos] = AC.positions[pos] + Data(i);
    }
    AC.bottom_up();
    for (int i = 0; i < n; ++i) {
        int l = AC.positions[position_in_ac[i]].leftmost;
        int r = AC.positions[position_in_ac[i]].rightmost;
        if (l == -1) {
            cout << -1 << " " << -1 << '\n';
            continue;
        }
        int h = AC.height[position_in_ac[i]];
        cout << l - h + 1 << " " << r - h + 1 << '\n';
    }
    return 0;
}
