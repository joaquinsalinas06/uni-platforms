// Fenwick tree — paso 2: Update. Sube con i += lowbit(i).
#include <iostream>
#include <vector>

using namespace std;

struct Fenwick {
  int n;
  vector<long long> tree;
  explicit Fenwick(int n_) : n(n_), tree(n_ + 1, 0) {}

  void update(int i, long long delta) {
    for (; i <= n; i += (i & (-i)))
      tree[i] += delta;
  }
};

int main() {
  Fenwick f(8);
  f.update(3, 5);  // toca tree[3] -> tree[4] -> tree[8]
  if (!(f.tree[3] == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(f.tree[4] == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(f.tree[8] == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(f.tree[5] == 0 && f.tree[6] == 0 && f.tree[7] == 0))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // rango no incluye i=3

  f.update(5, 3);  // toca tree[5] -> tree[6] -> tree[8]
  if (!(f.tree[5] == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(f.tree[6] == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(f.tree[8] == 5 + 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;

  cout << "OK: Update(3,+5) y Update(5,+3) tocan exactamente los indices que suben con i += "
          "lowbit(i)\n";
}
