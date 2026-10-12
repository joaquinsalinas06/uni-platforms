// Segment Tree en el Tiempo (Problemas de Busqueda Descomponibles)
// Complejidad: Build O(m) | Update retroactivo O(log m) | Query en tiempo t O(log m).
// Convierte una estructura estatica descomponible en totalmente retroactiva con overhead logaritmico.

#include <iostream>
#include <vector>

using namespace std;

// Funcion asociativa f: aqui suma, pero puede ser min, max, gcd, etc.
long long combine(long long a, long long b) {
  return a + b;
}

struct TimeSegNode {
  long long val;  // Resumen acumulado de las operaciones en el intervalo de tiempo [l, r]
  TimeSegNode* left;
  TimeSegNode* right;

  TimeSegNode(long long v = 0, TimeSegNode* l = nullptr, TimeSegNode* r = nullptr)
      : val(v), left(l), right(r) {}
};

// BUILD: Inicializa el arbol sobre el rango de tiempo [1, m]
// Cada hoja representa un instante de tiempo t.
TimeSegNode* buildTimeTree(int l, int r) {
  if (l == r) {
    return new TimeSegNode(0);  // Sin operacion inicial en el tiempo l
  }
  int m = (l + r) / 2;
  TimeSegNode* izq = buildTimeTree(l, m);
  TimeSegNode* der = buildTimeTree(m + 1, r);
  return new TimeSegNode(combine(izq->val, der->val), izq, der);
}

// UPDATE RETROACTIVO: Inserta o modifica una operacion ocurrida en el tiempo 't'.
// Costo: O(log m) nodos visitados. Reemplaza el costoso Rollback & Replay de O(r).
void updateRetroactive(TimeSegNode* cur, int l, int r, int t, long long delta) {
  if (l == r) {
    cur->val += delta;  // Se aplica el cambio en el instante t exacto
    return;
  }
  int m = (l + r) / 2;
  if (t <= m) {
    updateRetroactive(cur->left, l, m, t, delta);
  } else {
    updateRetroactive(cur->right, m + 1, r, t, delta);
  }
  // Actualizamos el resumen del nodo interno que domina el rango de tiempo
  cur->val = combine(cur->left->val, cur->right->val);
}

// QUERY RETROACTIVA: Responde "¿cual era el estado acumulado en el tiempo 't'?"
// Simplemente consulta el rango de tiempo [1, t] en el Segment Tree en O(log m).
long long queryAtTime(TimeSegNode* cur, int l, int r, int ql, int qr) {
  if (!cur || qr < l || r < ql) return 0;
  if (ql <= l && r <= qr) return cur->val;
  int m = (l + r) / 2;
  return combine(queryAtTime(cur->left, l, m, ql, qr),
                 queryAtTime(cur->right, m + 1, r, ql, qr));
}

int main() {
  // Linea de tiempo con m = 8 instantes (t = 1..8)
  int m = 8;
  TimeSegNode* root = buildTimeTree(1, m);

  // t=2: agregamos +10
  updateRetroactive(root, 1, m, 2, 10);
  // t=5: agregamos +25
  updateRetroactive(root, 1, m, 5, 25);
  // t=7: agregamos +5
  updateRetroactive(root, 1, m, 7, 5);

  cout << "Estado acumulado en t=1: " << queryAtTime(root, 1, m, 1, 1) << " (esperado: 0)\n";
  cout << "Estado acumulado en t=4: " << queryAtTime(root, 1, m, 1, 4) << " (esperado: 10)\n";
  cout << "Estado acumulado en t=8: " << queryAtTime(root, 1, m, 1, 8) << " (esperado: 40)\n";

  // MODIFICACION RETROACTIVA EN EL PASADO:
  // Insertamos en el tiempo t=3 un valor de +100
  cout << "\n--- Insercion retroactiva en t=3 (+100) ---\n";
  updateRetroactive(root, 1, m, 3, 100);

  // Las consultas posteriores se actualizan automaticamente en O(log m)
  // sin necesidad de rehacer o re-reproducir la historia:
  cout << "Estado acumulado en t=4: " << queryAtTime(root, 1, m, 1, 4) << " (esperado: 110)\n";
  cout << "Estado acumulado en t=8: " << queryAtTime(root, 1, m, 1, 8) << " (esperado: 140)\n";

  return 0;
}
