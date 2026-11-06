/**
 * File: dc3.cpp
 * Author: racsosabe
 * Date: 31/05/2026
 */

#include <bits/stdc++.h>
using namespace std;

template<typename string_type>
void counting_sort_with_offset(vector<int> &B12, int offset, int alphabet, string_type &S) {
    vector<int> head(alphabet, 0);
    vector<int> new_B12(B12.size());
    int start = 0;
    for (auto &x : B12) {
        if (x + offset >= S.size()) {
            new_B12[start++] = x;
        }
        else {
            ++head[S[x + offset]];
        }
    }
    int sum = start;
    for (int i = 0; i < alphabet; ++i) {
        sum += head[i];
        head[i] = sum - head[i];
    }
    for (auto &x : B12) {
        if (x + offset < S.size()) {
            new_B12[head[S[x + offset]]++] = x;
        }
    }
    B12 = move(new_B12);
}

template<typename string_type>
void special_radix_sort(vector<int> &B0, string_type &S, vector<int> &rnk, int alphabet) {
    const int n = rnk.size();
    vector<int> head(max(alphabet, n), 0);
    vector<int> perm(B0.size());
    int start = 0;
    for (auto &x : B0) {
        if (x + 1 >= S.size()) {
            perm[start++] = x;
        }
        else {
            ++head[rnk[x + 1]];
        }
    }
    int sum = start;
    for (int i = 0; i < n; ++i) {
        sum += head[i];
        head[i] = sum - head[i];
    }
    for (auto &x : B0) {
        if (x + 1 < S.size()) {
            perm[head[rnk[x + 1]]++] = x;
        }
    }
    fill(head.begin(), head.end(), 0);
    for (auto &x : B0) {
        ++head[S[x]];
    }
    sum = 0;
    for (int i = 0; i < alphabet; ++i) {
        sum += head[i];
        head[i] = sum - head[i];
    }
    for (auto &x : perm) {
        B0[head[S[x]]++] = x;
    }
}

template<typename string_type>
bool equal_blocks(string_type &S, int i, int j) {
    if ((i < S.size() ? S[i] : -1) != (j < S.size() ? S[j] : -1)) return false;
    if ((i + 1 < S.size() ? S[i + 1] : -1) != (j + 1 < S.size() ? S[j + 1] : -1)) return false;
    if ((i + 2 < S.size() ? S[i + 2] : -1) != (j + 2 < S.size() ? S[j + 2] : -1)) return false;
    return true;
}

template<typename string_type>
vector<int> dc3(int n, string_type &S) {
    if (n <= 1) {
        return vector<int>(1, 0);
    }
    vector<int> B0, B12;
    for (int i = 0; i < n; ++i) {
        if (i % 3 == 0) {
            B0.emplace_back(i);
        }
    }
    for (int i = 0; i < n; ++i) {
        if (i % 3 == 1) {
            B12.emplace_back(i);
        }
    }
    if (n % 3 == 1) {
        B12.emplace_back(n);
    }
    for (int i = 0; i < n; ++i) {
        if (i % 3 == 2) {
            B12.emplace_back(i);
        }
    }
    for (int s = 2; s >= 0; --s) {
        counting_sort_with_offset(B12, s, max(256, (int)S.size()), S);
    }
    int id = -1;
    vector<int> mapping(n + (n % 3 == 1), -1);
    for (int i = 0; i < B12.size(); ++i) {
        if (i == 0 or not equal_blocks(S, B12[i - 1], B12[i])) ++id;
        mapping[B12[i]] = id;
    }
    vector<int> reduced_string;
    for (int i = 1; i < n; i += 3) {
        reduced_string.emplace_back(mapping[i]);
    }
    if (n % 3 == 1) {
        reduced_string.emplace_back(mapping[n]);
    }
    for (int i = 2; i < n; i += 3) {
        reduced_string.emplace_back(mapping[i]);
    }
    vector<int> AR = dc3(reduced_string.size(), reduced_string);
    vector<int> rnk(n + (n % 3 == 1), -1);
    int size_B1 = (n - 1) / 3 + 1;
    for (int i = 0; i < AR.size(); ++i) {
        int position = AR[i];
        if (position < size_B1) {
            rnk[3 * position + 1] = i;
        }
        else {
            rnk[3 * (position - size_B1) + 2] = i;
        }
    }
    special_radix_sort(B0, S, rnk, max(256, (int)S.size()));
    int ptr = 0;
    vector<int> A;
    for (int &i : B0) {
        while (ptr < AR.size()) {
            int j = AR[ptr] < size_B1 ? 3 * AR[ptr] + 1 : 3 * (AR[ptr] - size_B1) + 2;
            if (j == n) {
                ++ptr;
                continue;
            }
            bool is_greater = false;
            if (j % 3 == 1) {
                if (S[i] != S[j]) {
                    is_greater = S[i] > S[j];
                }
                else {
                    is_greater = (i + 1 < rnk.size() ? rnk[i + 1] : -1) > (j + 1 < rnk.size() ? rnk[j + 1] : -1);
                }
            }
            else {
                if (S[i] != S[j]) {
                    is_greater = S[i] > S[j];
                }
                else if ((i + 1 < S.size() ? S[i + 1] : -1) != (j + 1 < S.size() ? S[j + 1] : -1)) {
                    is_greater = (i + 1 < S.size() ? S[i + 1] : -1) > (j + 1 < S.size() ? S[j + 1] : -1);
                }
                else {
                    is_greater = (i + 2 < rnk.size() ? rnk[i + 2] : -1) > (j + 2 < rnk.size() ? rnk[j + 2] : -1);
                }
            }
            if (not is_greater) break;
            A.emplace_back(j);
            ++ptr;
        }
        A.emplace_back(i);
    }
    while (ptr < AR.size()) {
        int j = AR[ptr] < size_B1 ? 3 * AR[ptr] + 1 : 3 * (AR[ptr] - size_B1) + 2;
        if (j < n) {
            A.emplace_back(j);
        }
        ++ptr;
    }
    return A;
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
    vector<int> a = dc3(s.size(), s);
    vector<int> lcp = lcp_construction(a, s);
    for (int &x : a) cout << x << " ";
    cout << '\n';
    for (int &x : lcp) cout << x << " ";
    cout << '\n';
    return 0;
}
