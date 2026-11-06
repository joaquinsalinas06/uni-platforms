#include <bits/stdc++.h>
using namespace std;

template<int E = 26>
struct AhoCorasick {
    vector<int> freq;
    vector<int> order;
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
        freq.emplace_back(0);
    }

    int insert(string &s) {
        int pos = 0;
        for (auto &x : s) {
            int c = id(x);
            if (trie[pos][c] == 0) {
                trie[pos][c] = trie.size();
                add_node();
            }
            pos = trie[pos][c];
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
            freq[suffix_link[x]] += freq[x];
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
        ++AC.freq[pos];
    }
    AC.bottom_up();
    for (int i = 0; i < n; ++i) {
        cout << AC.freq[position_in_ac[i]] << '\n';
    }
    return 0;
}
