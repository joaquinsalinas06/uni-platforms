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

bool smaller_in_first_chars(int start, string &text, string &s) {
    int ptr = 0;
    while (ptr + start < text.size() and ptr < s.size() and text[ptr + start] == s[ptr]) {
        ++ptr;
    }
    if (ptr + start == text.size()) return ptr < s.size(); // es menor
    if (ptr == s.size()) return false; // son iguales
    return text[ptr + start] < s[ptr];
}

bool direct_compare(int start, string &text, string &s) {
    for (int i = 0; i < s.size(); ++i) {
        if (start + i == text.size()) return false;
        if (s[i] != text[start + i]) return false;
    }
    return true;
}

bool contains(string &text, vector<int> &a, string &s) {
    const int n = text.size();
    int lo = 0, hi = n - 1;
    while (lo < hi) {
        int mi = lo + (hi - lo) / 2;
        if (smaller_in_first_chars(a[mi], text, s)) lo = mi + 1;
        else hi = mi;
    }
    return direct_compare(a[lo], text, s);
}

int main() {
    cin.tie(0) -> sync_with_stdio(false);
    string text;
    cin >> text;
    vector<int> a = suffix_array(text);
    int q;
    cin >> q;
    while (q--) {
        string s;
        cin >> s;
        cout << (contains(text, a, s) ? "Yes" : "No") << endl;
    }
    return 0;
}