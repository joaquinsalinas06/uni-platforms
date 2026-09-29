// Problemas de busqueda descomponibles -- implementacion completa.
//
// Resumen del tema (paginas 29-37 del mazo):
//   1. decomposability: la CONDICION. S es descomponible si para cualquier
//      particion S = A U B existe f en O(1) tal que
//      Query(x, A U B) = f(Query(x,A), Query(x,B)). No es un algoritmo.
//   2. time-segment-tree-build: si S es descomponible, se construye un
//      segment tree (ver /structures/segment-tree) sobre el EJE DEL TIEMPO
//      en vez de sobre un arreglo: cada hoja es un instante, cada nodo
//      interno resume con f el rango de tiempo que domina.
//   3. update: Insert(t,op)/Delete(t) retroactivos son el mismo Update de
//      segment tree ya conocido -- O(lg m) nodos tocados.
//   4. query: Query(t) retroactiva es el mismo Query de rango de segment
//      tree, sobre [1,t] -- retroactividad COMPLETA con overhead O(lg m).
//
// f = suma es el ejemplo elegido para esta implementacion (derivado: el
// profesor no da un ejemplo numerico, solo la lista de f candidatas: min,
// max, suma, OR). El mismo armazon (Update, Query estructurales) sirve para
// cualquiera de las otras f sin cambiar nada salvo combinar() y el neutro
// -- ver exercises.md nivel 4.
//
// Simplificacion marcada (nota de apoyo en theory.md): el mazo no explica
// como se representan los tiempos t. Aqui se usan m franjas ENTERAS FIJAS
// (0..m-1 desplazado a 1..m), no tiempos densos/fraccionarios arbitrarios.

#include <algorithm>
#include <iostream>
#include <set>
#include <vector>

using namespace std;

// ---------------------------------------------------------------------
// 1. decomposability -- la condicion, verificada sobre ejemplos concretos
//    (no una estructura de datos: es una propiedad de (S, Query, f)).
// ---------------------------------------------------------------------
int mini(const vector<int>& v) {
  return *std::min_element(v.begin(), v.end());
}
int maxi(const vector<int>& v) {
  return *std::max_element(v.begin(), v.end());
}
int suma_de(const vector<int>& v) {
  int s = 0;
  for (int x : v)
    s += x;
  return s;
}
bool existe_par(const vector<int>& v) {
  for (int x : v)
    if (x % 2 == 0)
      return true;
  return false;
}

void verificar_decomposability() {
  vector<int> A = {5, 1, 8};
  vector<int> B = {3, 9, 2};
  vector<int> AuB = {5, 1, 8, 3, 9, 2};

  if (!(mini(AuB) == min(mini(A), mini(B))))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // f = min
  if (!(maxi(AuB) == max(maxi(A), maxi(B))))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // f = max
  if (!(suma_de(AuB) == suma_de(A) + suma_de(B)))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // f = +
  if (!(existe_par(AuB) == (existe_par(A) || existe_par(B))))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // f = OR
  cout << "[1/6] decomposability: min, max, suma, existe-par cumplen "
          "Query(AuB) = f(Query(A), Query(B))\n";

  // Contraejemplo derivado: cardinalidad NO es descomponible.
  set<int> Sa = {1, 2}, Sb = {2, 3}, SaUb = {1, 2, 3};
  bool f_candidata_falla = (Sa.size() + Sb.size() != SaUb.size());
  if (!(f_candidata_falla))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "[2/6] decomposability: contraejemplo -- cardinalidad no es "
          "descomponible (|A|+|B|="
       << (Sa.size() + Sb.size()) << " != |AuB|=" << SaUb.size() << ")\n";
}

// ---------------------------------------------------------------------
// 2-4. time-segment-tree-build, update, query: un unico segment tree sobre
//      el eje del tiempo, f = suma.
// ---------------------------------------------------------------------
struct TimeSegmentTree {
  int m;
  vector<long long> val;     // val[nodo] = suma acumulada de su rango de tiempo
  vector<long long> activo;  // activo[t] = valor actualmente insertado en el tiempo t

  explicit TimeSegmentTree(int m_) : m(m_), val(4 * (m_ > 0 ? m_ : 1), 0), activo(m_ + 1, 0) {}

  // time-segment-tree-build: Build heredado de segment-tree, sobre m
  // instantes de tiempo en vez de n posiciones de arreglo.
  void build(int nodo, int l, int r) {
    if (l == r) {
      val[nodo] = 0;
      return;
    }  // neutro de suma: franja vacia
    int mid = (l + r) / 2;
    build(2 * nodo, l, mid);
    build(2 * nodo + 1, mid + 1, r);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }
  void build() {
    build(1, 1, m);
  }

  // update: el mismo Update de segment tree, sin modificacion -- O(lg m).
  void update(int nodo, int l, int r, int t, long long nuevo_valor) {
    if (l == r) {
      val[nodo] = nuevo_valor;
      return;
    }
    int mid = (l + r) / 2;
    if (t <= mid)
      update(2 * nodo, l, mid, t, nuevo_valor);
    else
      update(2 * nodo + 1, mid + 1, r, t, nuevo_valor);
    val[nodo] = val[2 * nodo] + val[2 * nodo + 1];
  }

  // Insert(t, op) / Delete(t) retroactivos.
  void insert_retroactive(int t, long long delta) {
    activo[t] = delta;
    update(1, 1, m, t, delta);
  }
  void delete_retroactive(int t) {
    activo[t] = 0;
    update(1, 1, m, t, 0);
  }

  // query: el mismo Query de rango de segment tree, sobre [ql,qr].
  long long query(int nodo, int l, int r, int ql, int qr) {
    if (r < ql || qr < l)
      return 0;
    if (ql <= l && r <= qr)
      return val[nodo];
    int mid = (l + r) / 2;
    return query(2 * nodo, l, mid, ql, qr) + query(2 * nodo + 1, mid + 1, r, ql, qr);
  }

  // Query(t) retroactiva completa: "que paso hasta el instante t".
  long long query_at_time(int t) {
    return query(1, 1, m, 1, t);
  }
};

void verificar_time_segment_tree() {
  TimeSegmentTree tree(4);  // m=4 franjas de tiempo, t=1..4
  tree.build();
  if (!(tree.val[1] == 0))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "[3/6] time-segment-tree-build: arbol de m=4 instantes "
          "construido, raiz [1,4] en el neutro de suma (0)\n";

  // update: Insert(t=2, op) con efecto +5 -- O(lg m)=2 nodos tocados.
  tree.insert_retroactive(2, 5);
  if (!(tree.activo[2] == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(tree.val[1] == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "[4/6] update: Insert(t=2, +5) actualizo el camino "
          "raiz->[1,2]->[2,2] (2 nodos = O(lg 4))\n";

  // query: la operacion insertada en t=2 SOLO afecta consultas con t>=2 --
  // es la propiedad central de retroactividad completa.
  if (!(tree.query_at_time(1) == 0))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // antes de t=2: no la ve
  if (!(tree.query_at_time(2) == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // exactamente en t=2: ya la ve
  if (!(tree.query_at_time(3) == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // despues: la sigue viendo
  if (!(tree.query_at_time(4) == 5))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "[5/6] query: Query(1)=0, Query(2)=5, Query(3)=5, Query(4)=5 "
          "-- la operacion de t=2 solo afecta consultas con t>=2\n";

  // Insertar una SEGUNDA operacion mas al pasado (t=1) y verificar que
  // update+query siguen siendo consistentes con ambas operaciones activas,
  // y que Delete revierte exactamente su propio efecto sin tocar la otra.
  tree.insert_retroactive(1, 3);  // Insert(t=1, +3), mas antigua que la de t=2
  if (!(tree.query_at_time(1) == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // ya ve la de t=1
  if (!(tree.query_at_time(2) == 8))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // ve ambas: 3+5
  if (!(tree.query_at_time(4) == 8))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;

  tree.delete_retroactive(2);  // Delete(t=2): borra SOLO esa operacion
  if (!(tree.activo[2] == 0))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(tree.query_at_time(1) == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // la de t=1 sigue intacta
  if (!(tree.query_at_time(2) == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // ya no ve la borrada
  if (!(tree.query_at_time(4) == 3))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "[6/6] update+query: una operacion insertada en el pasado "
          "(t=1) convive con otra (t=2); Delete(t=2) borra solo esa, "
          "sin afectar la de t=1 ni las consultas anteriores a su "
          "propio intervalo de vida\n";
}

int main() {
  verificar_decomposability();
  verificar_time_segment_tree();
  cout << "Todas las verificaciones pasaron: decomposability como "
          "condicion, y el segment tree sobre el tiempo dando "
          "retroactividad completa con overhead O(lg m).\n";
  return 0;
}
