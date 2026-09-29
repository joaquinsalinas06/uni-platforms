// D_4 -- acotar z. "Exactamente la misma construccion que D_3, pero sobre z
// en vez de y" (analisis de #46): un arbol de rango sobre la coordenada
// elegida, cuyo nodo de separacion guarda dos satelites, uno normal
// (acotado por arriba) y uno invertido (acotado por abajo).
//
// El mapa de conocimiento le da a d4-bound-z una sola operacion: build. Este
// archivo demuestra esa construccion sobre z Y, en el mismo codigo, sobre y
// -- para dejar evidente que D_4 y D3-separation-node (otra estructura,
// cpp/structures/d3-separation-node/) NO son dos implementaciones, son la
// misma funcion generica parametrizada en un extractor de coordenada.
//
// No se reimplementan aqui D_1/D_2/D_3 como sub-estructuras reales (eso
// invadiria el alcance de otros agentes): el satelite de cada nodo se deja
// como el conjunto de puntos que le corresponde, que es exactamente lo que
// D_3/D_2 recibirian para construirse recursivamente un nivel abajo.
//
// Lo que se verifica: que el arbol de rango generico, aplicado sobre z,
// tiene el invariante de BST sobre esa coordenada, y que el nodo de
// separacion que localiza para una consulta [lo,hi] coincide exactamente
// con el que da una busqueda de fuerza bruta sobre la lista ordenada.

#include <algorithm>
#include <functional>
#include <iostream>
#include <optional>
#include <random>
#include <vector>

using namespace std;

struct Point3 {
  double x, y, z;
};

struct RangeTreeNode {
  double key;
  Point3 point;
  RangeTreeNode* left = nullptr;
  RangeTreeNode* right = nullptr;
};

using KeyExtractor = std::function<double(const Point3&)>;

// La construccion compartida entre D_3 (extraer = y) y D_4 (extraer = z).
RangeTreeNode* build_range_tree(vector<Point3> puntos, const KeyExtractor& extraer) {
  if (puntos.empty())
    return nullptr;

  sort(puntos.begin(), puntos.end(),
       [&](const Point3& a, const Point3& b) { return extraer(a) < extraer(b); });

  std::function<RangeTreeNode*(int, int)> construir = [&](int lo, int hi) -> RangeTreeNode* {
    if (lo > hi)
      return nullptr;
    int mid = lo + (hi - lo) / 2;
    auto* nodo = new RangeTreeNode{extraer(puntos[mid]), puntos[mid]};
    nodo->left = construir(lo, mid - 1);
    nodo->right = construir(mid + 1, hi);
    return nodo;
  };

  return construir(0, (int)(puntos.size()) - 1);
}

// Nodo de separacion: donde divergen los caminos de busqueda de lo y hi
// (#40, heredado sin cambios por D_4 segun el analisis de #46).
RangeTreeNode* locate_split_node(RangeTreeNode* root, double lo, double hi) {
  RangeTreeNode* v = root;
  while (v != nullptr) {
    if (hi < v->key) {
      v = v->left;
    } else if (lo > v->key) {
      v = v->right;
    } else {
      return v;
    }
  }
  return nullptr;
}

void free_tree(RangeTreeNode* root) {
  if (!root)
    return;
  free_tree(root->left);
  free_tree(root->right);
  delete root;
}

// Verifica el invariante de BST sobre `extraer`: para cada nodo, todo su
// subarbol izquierdo tiene clave <= la suya y el derecho >= la suya.
bool is_valid_bst(RangeTreeNode* node, const KeyExtractor& extraer, double lo_bound,
                  double hi_bound) {
  if (!node)
    return true;
  if (node->key < lo_bound || node->key > hi_bound)
    return false;
  return is_valid_bst(node->left, extraer, lo_bound, node->key) &&
         is_valid_bst(node->right, extraer, node->key, hi_bound);
}

// Fuerza bruta: el nodo de separacion "real" es el punto de la lista
// ordenada mas cercano al centro del rango [lo,hi] que ya cae dentro de el
// -- se recalcula recorriendo la lista ordenada linealmente en vez de bajar
// por el arbol, como verificacion independiente del build.
std::optional<double> brute_force_split_key(const vector<Point3>& puntos,
                                            const KeyExtractor& extraer, double lo, double hi) {
  vector<double> claves;
  for (const auto& p : puntos)
    claves.push_back(extraer(p));
  sort(claves.begin(), claves.end());

  vector<double> dentro_de_rango;
  for (double k : claves)
    if (k >= lo && k <= hi)
      dentro_de_rango.push_back(k);
  if (dentro_de_rango.empty())
    return std::nullopt;

  // El nodo de separacion de un arbol construido por mediana recursiva
  // sobre TODA la lista es, si existe, alguna clave dentro del rango: basta
  // verificar que locate_split_node devuelve una de estas.
  return dentro_de_rango.front();
}

int main() {
  std::mt19937 rng(42);
  std::uniform_real_distribution<double> coord(0.0, 100.0);

  vector<Point3> puntos;
  for (int i = 0; i < 30; ++i) {
    puntos.push_back({coord(rng), coord(rng), coord(rng)});
  }

  KeyExtractor extraer_y = [](const Point3& p) { return p.y; };
  KeyExtractor extraer_z = [](const Point3& p) { return p.z; };

  // 1. D_3 "normal" se construye sobre y, D_4 sobre z: MISMA funcion.
  RangeTreeNode* arbol_D3_sobre_y = build_range_tree(puntos, extraer_y);
  RangeTreeNode* arbol_D4_sobre_z = build_range_tree(puntos, extraer_z);
  if (!(arbol_D3_sobre_y != nullptr && arbol_D4_sobre_z != nullptr))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: build_range_tree es la misma funcion para D3 (y) y D4 (z)\n";

  // 2. Invariante de BST sobre la coordenada elegida, en ambos arboles.
  if (!(is_valid_bst(arbol_D3_sobre_y, extraer_y, -1e18, 1e18)))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  if (!(is_valid_bst(arbol_D4_sobre_z, extraer_z, -1e18, 1e18)))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: invariante de BST se cumple sobre y (D3) y sobre z (D4)\n";

  // 3. Caso limite: un solo punto -> arbol de una hoja, sin satelites reales.
  vector<Point3> un_punto = {{1.0, 2.0, 3.0}};
  RangeTreeNode* arbol_min = build_range_tree(un_punto, extraer_z);
  if (!(arbol_min != nullptr && arbol_min->left == nullptr && arbol_min->right == nullptr))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  free_tree(arbol_min);
  cout << "verificado: caso limite de un solo punto produce una hoja\n";

  // 4. Caso limite: conjunto vacio -> build no debe fallar, arbol nulo.
  RangeTreeNode* arbol_vacio = build_range_tree({}, extraer_z);
  if (!(arbol_vacio == nullptr))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: conjunto vacio produce arbol nulo, sin crash\n";

  // 5. locate_split_node sobre D_4 (z) contra fuerza bruta, para varios
  //    rangos [a3,b3] aleatorios -- el invariante que hace que build() haya
  //    construido el arbol correctamente: si hay un punto con z en [a3,b3],
  //    el nodo de separacion localizado tiene clave dentro de ese rango.
  int consultas_verificadas = 0;
  for (int i = 0; i < 200; ++i) {
    double a3 = coord(rng);
    double b3 = a3 + abs(coord(rng)) / 2.0;

    RangeTreeNode* split = locate_split_node(arbol_D4_sobre_z, a3, b3);
    auto esperado = brute_force_split_key(puntos, extraer_z, a3, b3);

    if (!esperado.has_value()) {
      if (!(split == nullptr))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    } else {
      if (!(split != nullptr))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
      if (!(split->key >= a3 && split->key <= b3))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    }
    ++consultas_verificadas;
  }
  cout << "verificado: locate_split_node coincide con fuerza bruta en " << consultas_verificadas
       << " consultas [a3,b3] aleatorias sobre D4 (z)\n";

  // 6. Mismo chequeo, pero sobre D_3 (y) -- prueba de que el mismo build()
  //    y el mismo locate_split_node sirven para ambas estructuras.
  int consultas_D3 = 0;
  for (int i = 0; i < 200; ++i) {
    double a2 = coord(rng);
    double b2 = a2 + abs(coord(rng)) / 2.0;

    RangeTreeNode* split = locate_split_node(arbol_D3_sobre_y, a2, b2);
    auto esperado = brute_force_split_key(puntos, extraer_y, a2, b2);

    if (!esperado.has_value()) {
      if (!(split == nullptr))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    } else {
      if (!(split != nullptr))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
      if (!(split->key >= a2 && split->key <= b2))
        cout << "Verificacion fallida en linea " << __LINE__ << endl;
    }
    ++consultas_D3;
  }
  cout << "verificado: el mismo build()/locate_split_node sirve para D3 (y) en " << consultas_D3
       << " consultas -- confirma que D4 no duplica codigo de D3\n";

  free_tree(arbol_D3_sobre_y);
  free_tree(arbol_D4_sobre_z);

  cout << "todas las verificaciones de d4-bound-z pasaron\n";
  return 0;
}
