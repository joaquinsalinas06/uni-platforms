//
// Created by Profesor08 on 3/06/2026.
//

#include<bits/stdc++.h>
using namespace::std;

template<typename string_type>
vector<int> suffix_array(string_type &s) {
    // 1 -> O(nlogn)
    // k > 1 -> O(n), k ~ O(logn) -> O(nlogn)
    s.push_back(0); // Sentinela $
    const int n = s.size();
    vector<int> a(n);
    for (int i = 0; i < n; ++i) a[i] = i;
    sort(a.begin(), a.end(), [&] (int i, int j) {
        return s[i] < s[j];
    });
    vector<int> mapeo(n);
    mapeo[a[0]] = 0;
    for (int i = 1; i < n; ++i) {
        mapeo[a[i]] = mapeo[a[i - 1]] + (s[a[i - 1]] != s[a[i]]);
    }
    int len = 1;
    vector<int> head(n);
    vector<int> new_mapeo(n);
    vector<int> sorted_by_second(n);
    while (len < n) {
        for (int i = 0; i < n; ++i) {
            sorted_by_second[i] = (a[i] + n - len) % n;
        }
        for (int i = n - 1; i >= 0; --i) {
            head[mapeo[a[i]]] = i;
        }
        for (int i = 0; i < n; ++i) {
            int x = sorted_by_second[i];
            a[head[mapeo[x]]++] = x;
        }
        new_mapeo[a[0]] = 0;
        for (int i = 1; i < n; ++i) {
            if (mapeo[a[i - 1]] != mapeo[a[i]]) {
                new_mapeo[a[i]] = new_mapeo[a[i - 1]] + 1;
            }
            else {
                int previous = mapeo[(a[i - 1] + len) % n];
                int current = mapeo[(a[i] + len) % n];
                new_mapeo[a[i]] = new_mapeo[a[i - 1]] + (previous != current);
            }
        }
        len <<= 1;
        swap(mapeo, new_mapeo);
    }
    s.pop_back();
    return vector<int>(a.begin() + 1, a.end());
}

template<typename string_type>
vector<int> lcp_construction(vector<int> &a, string_type &s) {
    const int n = s.size();
    vector<int> rnk(n);
    for (int i = 0; i < n; ++i) {
        rnk[a[i]] = i;
    }
    int k = 0;
    vector<int> lcp(n);
    for (int i = 0; i < n; ++i) {
        if (rnk[i] + 1 == n) {
            k = 0;
            continue;
        }
        int j = a[rnk[i] + 1];
        while (i + k < n and j + k < n and s[i + k] == s[j + k]) ++k;
        lcp[rnk[i]] = k;
        if (k) --k;
    }
    lcp.pop_back();
    return lcp;
}

int main() {
    cin.tie(0) -> sync_with_stdio(false);
    string s;
    cin >> s;
    vector<int> a = suffix_array(s);
    vector<int> lcp = lcp_construction(a, s);
    for (int &x : a) cout << x << " ";
    cout << '\n';
    for (int &x : lcp) cout << x << " ";
    cout << '\n';
    return 0;
}