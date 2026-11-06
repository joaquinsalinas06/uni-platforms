//
// Created by Profesor08 on 3/06/2026.
//

/**
 * Author: negiizhao
 * Date: Unknown
 * License: Unknown
 * Source: https://judge.yosupo.jp/submission/144630
 * Description: Computes the Suffix Array of a sequence of symbols s[] in O(|s|).
 *				Tested in https://judge.yosupo.jp/problem/suffixarray
 */

#include<bits/stdc++.h>
using namespace::std;

const int N = 500000 + 2; // Set to the maximum size possible

template<typename _Char>
void sais_core(const int n, const int m, const _Char s[], char type[], int lms[], int cnt[], int *sa)
{
	int n1 = 0, ch = -1;

	type[n - 1] = 1;
	for (int i = n - 2; i >= 0; --i)
		type[i] = s[i] == s[i + 1] ? type[i + 1] : s[i] < s[i + 1];

	std::fill(cnt, cnt + m, 0);
	for (int i = 0; i < n; ++i)
		++cnt[static_cast<int>(s[i])];
	std::partial_sum(cnt, cnt + m, cnt);

	auto induced_sort = [&](const int v[])
	{
		std::fill(sa, sa + n, 0);

		int *cur = cnt + m;
		auto push_S = [&](const int x) { sa[--cur[static_cast<int>(s[x])]] = x; };
		auto push_L = [&](const int x) { sa[cur[static_cast<int>(s[x])]++] = x; };

		std::copy(cnt, cnt + m, cur);
		for (int i = n1 - 1; i >= 0; --i)
			push_S(v[i]);

		std::copy(cnt, cnt + m - 1, cur + 1);
		for (int i = 0; i < n; ++i)
			if (sa[i] > 0 && type[sa[i] - 1] == 0)
				push_L(sa[i] - 1);

		std::copy(cnt, cnt + m, cur);
		for (int i = n - 1; i >= 0; --i)
			if (sa[i] > 0 && type[sa[i] - 1])
				push_S(sa[i] - 1);
	};

	for (int i = 1; i < n; ++i)
		if (type[i - 1] == 0 && type[i] == 1)
			type[i] = 2, lms[n1++] = i;
	induced_sort(lms);

	auto lms_equal = [&](int x, int y)
	{
		if (s[x] == s[y])
			while (s[++x] == s[++y] && type[x] == type[y])
				if (type[x] == 2 || type[y] == 2)
					return true;
		return false;
	};

	int *s1 = std::remove_if(sa, sa + n, [&](const int x) { return type[x] != 2; });
	for (int i = 0; i < n1; ++i)
		s1[sa[i] >> 1] = ch += ch <= 0 || !lms_equal(sa[i], sa[i - 1]);
	for (int i = 0; i < n1; ++i)
		s1[i] = s1[lms[i] >> 1];

	if (ch + 1 < n1)
		sais_core(n1, ch + 1, s1, type + n, lms + n1, cnt + m, sa);
	else
		for (int i = 0; i < n1; ++i)
			sa[s1[i]] = i;

	for (int i = 0; i < n1; ++i)
		lms[n1 + i] = lms[sa[i]];
	induced_sort(lms + n1);
}

template<typename _Char>
vector<int> sais(const _Char s[], const int n, const int m)
{
	static int _lms[N], _cnt[N << 1];
	static char _type[N << 1];
	static int *sa = (int*)malloc((n + 1) * sizeof(int));
	sais_core(n + 1, m, s, _type, _lms, _cnt, sa);
	return vector<int>(sa + 1, sa + n + 1);
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
	vector<int> a = sais(s.data(), s.size(), 256);
	vector<int> lcp = lcp_construction(a, s);
	for (int &x : a) cout << x << " ";
	cout << '\n';
	for (int &x : lcp) cout << x << " ";
	cout << '\n';
	return 0;
}