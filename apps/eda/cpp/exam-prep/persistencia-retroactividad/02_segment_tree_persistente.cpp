// Segment Tree Persistente (Path Copying clásico)
// Complejidad: Build O(n) | Update O(log n) tiempo y nodos nuevos | Query O(log n) tiempo.

#include <iostream>
#include <vector>

using namespace std;

struct SegNode {
  long long sum;
  SegNode* left;
  SegNode* right;

  SegNode(long long s = 0, SegNode* l = nullptr, SegNode* r = nullptr)
      : sum(s), left(l), right(r) {}
};

// Combinación asociativa: aquí suma, pero puede ser min, max, gcd, etc.
long long combine(long long a, long long b) {
  return a + b;
}

// Construye la versión base v0 en O(n) tiempo y O(n) memoria.
SegNode* build(const vector<long long>& arr, int l, int r) {
  if (l == r) {
    return new SegNode(arr[l]);
  }
  int m = (l + r) / 2;
  SegNode* izq = build(arr, l, m);
  SegNode* der = build(arr, m + 1, r);
  return new SegNode(combine(izq->sum, der->sum), izq, der);
}

// UPDATE: La clave de la persistencia por copia de caminos.
// En lugar de mutar el nodo existente, creamos uno nuevo.
// El hijo que cambia se calcula recursivamente; el hijo que no cambia
// SE COMPARTE DIRECTO por puntero (cero memoria adicional para ese subárbol).
SegNode* update(SegNode* cur, int l, int r, int pos, long long val) {
  if (l == r) {
    // Hoja alcanzada: nodo nuevo con el valor actualizado
    return new SegNode(val);
  }
  int m = (l + r) / 2;
  SegNode* nuevoIzq = nullptr;
  SegNode* nuevoDer = nullptr;

  if (pos <= m) {
    // El cambio está a la izquierda: clonamos camino a la izquierda
    nuevoIzq = update(cur->left, l, m, pos, val);
    // La derecha queda intacta: reutilizamos el puntero viejo en O(1)
    nuevoDer = cur->right;
  } else {
    // La izquierda queda intacta: reutilizamos el puntero viejo en O(1)
    nuevoIzq = cur->left;
    // El cambio está a la derecha: clonamos camino a la derecha
    nuevoDer = update(cur->right, m + 1, r, pos, val);
  }

  // Retornamos un nuevo nodo interno que une la rama nueva con la compartida
  return new SegNode(combine(nuevoIzq->sum, nuevoDer->sum), nuevoIzq, nuevoDer);
}

// QUERY: Consulta idéntica a un Segment Tree estándar.
// Simplemente se le pasa el puntero a la raíz de la versión deseada.
long long query(SegNode* cur, int l, int r, int ql, int qr) {
  if (!cur || qr < l || r < ql) return 0;
  if (ql <= l && r <= qr) return cur->sum;
  int m = (l + r) / 2;
  return combine(query(cur->left, l, m, ql, qr),
                 query(cur->right, m + 1, r, ql, qr));
}

int main() {
  // Arreglo 1-indexado de tamaño 4: [1, 2, 3, 4]
  int n = 4;
  vector<long long> arr = {0, 1, 2, 3, 4};

  // v0: árbol original
  vector<SegNode*> versions;
  versions.push_back(build(arr, 1, n));

  // v1: modificamos la posición 4 con valor 100 (partiendo de v0)
  // El arreglo lógico en v1 es [1, 2, 3, 100]
  versions.push_back(update(versions[0], 1, n, 4, 100));

  // v2: modificamos la posición 1 con valor 50 (partiendo de v1)
  // El arreglo lógico en v2 es [50, 2, 3, 100]
  versions.push_back(update(versions[1], 1, n, 1, 50));

  // Consultamos el rango [1, 4] en las tres versiones
  cout << "v0 sum[1..4]: " << query(versions[0], 1, n, 1, 4) << " (esperado: 10)\n";
  cout << "v1 sum[1..4]: " << query(versions[1], 1, n, 1, 4) << " (esperado: 106)\n";
  cout << "v2 sum[1..4]: " << query(versions[2], 1, n, 1, 4) << " (esperado: 155)\n";

  // Verificamos la compartición física de nodos:
  // Al actualizar pos=4 (rama derecha), la rama izquierda [1..2] de v0 y v1 es idéntica en memoria
  if (versions[0]->left == versions[1]->left) {
    cout << "OK: v0 y v1 comparten el subarbol izquierdo exactamente.\n";
  }

  return 0;
}
