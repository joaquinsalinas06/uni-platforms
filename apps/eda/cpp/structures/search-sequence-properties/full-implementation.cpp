// search-sequence-properties — cinco propiedades sobre secuencias de
// búsqueda en un BST (Sem5_Dynamic_Optimality_I.pdf#29-50): acceso
// secuencial, puntero dinámico, cota de entropía / optimalidad estática,
// conjunto de trabajo, y la propiedad unificada que las generaliza.
//
// `operations: []` (es un concepto, no una estructura): no hay una interfaz
// que implementar. Lo que sí se puede hacer es medir, sobre un BST simple e
// instrumentado, si las secuencias que el mazo describe como "fáciles"
// cuestan menos que una secuencia sin patrón.
//
// HONESTIDAD (ver CONTENT-AGENT-RULES.md): de las cinco propiedades, sólo la
// de cota de entropía / optimalidad estática se puede verificar de forma
// honesta con un BST ESTÁTICO (no auto-ajustable). Es la única de las cinco
// que no depende de que el árbol se adapte durante la ejecución: si el
// árbol está construido de antemano para reflejar las frecuencias de
// búsqueda (un "BST estático óptimo" aproximado por un heurístico voraz:
// el valor más frecuente del rango va a la raíz, recursivamente), su costo
// promedio por búsqueda queda acotado por la entropía de la distribución,
// sin que el árbol tenga que moverse.
//
// Las otras cuatro (acceso secuencial, puntero dinámico, conjunto de
// trabajo, unificada) son afirmaciones sobre un BST que SE ADAPTA a la
// secuencia mientras la ejecuta -- el profesor las prueba (sin demostración
// en el mazo) sobre el Splay Tree, que reestructura el árbol en cada
// búsqueda. Sobre un BST simple y estático, esas cuatro secuencias no
// saldrían más baratas que una secuencia aleatoria: el costo de una
// búsqueda en un árbol que no cambia depende sólo de la profundidad de la
// llave, no del orden en que se pidan las llaves. Fabricar una demostración
// con, por ejemplo, un heurístico de "mover a la raíz" sería atribuirle a
// un BST simple una garantía que el mazo sólo prueba para el Splay Tree
// (fuera de este alcance: cpp/structures/splay-tree/, otro agente). Por
// eso quedan señaladas como NO MEDIDAS, con la razón impresa, en vez de
// fabricar un experimento que las "confirme".

#include <algorithm>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <memory>
#include <numeric>
#include <random>
#include <vector>

// ---------------------------------------------------------------------
// BST simple: sólo lo que hace falta para medir el costo de Buscar(x),
// tal como lo define el modelo computacional BST (moverse por un puntero,
// en O(1) cada paso). Nada de balanceo, nada de reestructuración.
// ---------------------------------------------------------------------
struct Node {
  int key;
  std::unique_ptr<Node> left, right;
  explicit Node(int k) : key(k) {}
};

class StaticBST {
public:
  // Construye un BST "estático óptimo" aproximado: en cada rango
  // [lo, hi] de keys[] ordenadas por llave, el índice de mayor peso
  // (mayor frecuencia de búsqueda) se vuelve la raíz de ese subárbol, y el
  // resto se reparte recursivamente a izquierda/derecha. Es el mismo
  // principio que un BST óptimo estático exacto (programación dinámica,
  // fuera de este mazo) pero con un heurístico voraz O(n log n): alcanza
  // para ilustrar la propiedad, no para ser la construcción óptima exacta.
  static StaticBST build_frequency_shaped(const std::vector<int>& keys,
                                           const std::vector<double>& weight) {
    StaticBST t;
    std::vector<int> idx(keys.size());
    std::iota(idx.begin(), idx.end(), 0);
    t.root_ = build_range(keys, weight, idx, 0, static_cast<int>(idx.size()) - 1);
    return t;
  }

  // Costo real de Buscar(x): número de nodos visitados hasta encontrarlo
  // (el modelo asume que x siempre está en el árbol, #24).
  int search_cost(int key) const {
    const Node* n = root_.get();
    int cost = 0;
    while (n) {
      ++cost;
      if (key == n->key) return cost;
      n = (key < n->key) ? n->left.get() : n->right.get();
    }
    throw std::logic_error("clave no encontrada: viola la restriccion del modelo (#24)");
  }

  int depth_of(int key) const { return search_cost(key) - 1; }

private:
  std::unique_ptr<Node> root_;

  static std::unique_ptr<Node> build_range(const std::vector<int>& keys,
                                            const std::vector<double>& weight,
                                            const std::vector<int>& idx, int lo, int hi) {
    if (lo > hi) return nullptr;
    int best = lo;
    for (int i = lo + 1; i <= hi; ++i)
      if (weight[idx[i]] > weight[idx[best]]) best = i;
    auto node = std::make_unique<Node>(keys[idx[best]]);
    node->left = build_range(keys, weight, idx, lo, best - 1);
    node->right = build_range(keys, weight, idx, best + 1, hi);
    return node;
  }
};

// Corre una secuencia de búsquedas sobre el árbol y devuelve (costo total,
// costo promedio) -- esto es literalmente "resolver todas las consultas"
// (#30, #32, #34, #38, #45), la cantidad que las cinco propiedades acotan.
static std::pair<long long, double> run_sequence(const StaticBST& t, const std::vector<int>& seq) {
  long long total = 0;
  for (int x : seq) total += t.search_cost(x);
  double avg = static_cast<double>(total) / static_cast<double>(seq.size());
  return {total, avg};
}

int main() {
  // Ocho llaves con pesos geométricamente decrecientes (potencias de 2):
  // la más frecuente es 1/2 de las búsquedas, la menos frecuente 1/255.
  // Es una distribución sesgada a propósito, la contraparte de "todas las
  // llaves igual de probables".
  const std::vector<int> keys = {1, 2, 3, 4, 5, 6, 7, 8};
  std::vector<double> weight(keys.size());
  double total_weight = 0.0;
  for (std::size_t i = 0; i < keys.size(); ++i) {
    weight[i] = static_cast<double>(1ULL << (keys.size() - 1 - i)); // 128,64,...,1
    total_weight += weight[i];
  }
  std::vector<double> p(keys.size());
  for (std::size_t i = 0; i < keys.size(); ++i) p[i] = weight[i] / total_weight;

  // Entropía de Shannon de esa distribución: Σ p_k log2(1/p_k). El
  // profesor da la cota como "O(Σ_k p_k log(1/p_k)) por búsqueda" (#34).
  double entropy_bits = 0.0;
  for (double pk : p)
    if (pk > 0.0) entropy_bits += pk * std::log2(1.0 / pk);
  std::cout << "entropia de la distribucion de frecuencias: " << entropy_bits << " bits\n";

  StaticBST tree = StaticBST::build_frequency_shaped(keys, weight);

  // La llave más frecuente (peso 128) debe haber quedado en la raíz
  // (profundidad 0) y la menos frecuente (peso 1) en la hoja más profunda:
  // así es como un árbol construido por frecuencia se distingue de uno
  // cualquiera.
  assert(tree.depth_of(1) == 0);
  assert(tree.depth_of(8) == static_cast<int>(keys.size()) - 1);
  std::cout << "arbol construido por frecuencia: clave mas frecuente (1) en profundidad "
            << tree.depth_of(1) << ", clave menos frecuente (8) en profundidad "
            << tree.depth_of(8) << "\n";

  // Secuencia SESGADA: cada llave aparece exactamente weight[i] veces
  // (reproduce p_k exactamente), en orden mezclado con una semilla fija
  // para no depender de qué tan "acomodada" quede la secuencia.
  std::vector<int> skewed_seq;
  for (std::size_t i = 0; i < keys.size(); ++i)
    for (int r = 0; r < static_cast<int>(weight[i]); ++r) skewed_seq.push_back(keys[i]);
  std::mt19937 rng(12345); // semilla fija: reproducible, no un p-hack
  std::shuffle(skewed_seq.begin(), skewed_seq.end(), rng);

  // Secuencia ALEATORIA de contraste: mismo largo, mismas llaves, pero
  // muestreada de una distribución UNIFORME (ninguna llave más probable
  // que otra) -- la secuencia "sin patrón" con la que se compara.
  std::vector<int> random_seq(skewed_seq.size());
  std::uniform_int_distribution<int> uni(0, static_cast<int>(keys.size()) - 1);
  for (auto& x : random_seq) x = keys[uni(rng)];

  auto [total_skewed, avg_skewed] = run_sequence(tree, skewed_seq);
  auto [total_random, avg_random] = run_sequence(tree, random_seq);

  std::cout << "cota de entropia / optimalidad estatica -- MEDIDA sobre "
            << skewed_seq.size() << " busquedas:\n"
            << "  secuencia sesgada (coincide con las frecuencias del arbol): costo promedio = "
            << avg_skewed << "\n"
            << "  secuencia aleatoria uniforme (mismo arbol, sin relacion con sus frecuencias): costo promedio = "
            << avg_random << "\n";

  // El punto central de la propiedad: la secuencia sesgada, sobre el árbol
  // construido para ESA distribución, sale mas barata que la secuencia sin
  // patrón sobre el mismo árbol.
  assert(avg_skewed < avg_random);

  // Y el costo promedio de la secuencia sesgada queda del orden de la
  // entropía (cota superior con una constante razonable, no una igualdad
  // exacta -- el mazo da una O grande, no una constante): la construcción
  // voraz no es la óptima exacta, así que se admite un factor de holgura.
  assert(avg_skewed <= 2.0 * entropy_bits + 1.0);

  std::cout << "OK: la secuencia sesgada por frecuencia cuesta menos que la aleatoria, "
               "y su costo promedio queda acotado por O(entropia), como enuncia #34.\n";

  // --- Lo que NO se mide, y por qué (ver comentario del encabezado) ---
  std::cout << "acceso secuencial: NO MEDIDA -- requiere un BST que se auto-ajuste "
               "(Splay Tree, #29-30); en un BST estatico el costo de una busqueda "
               "no depende del orden de la secuencia, solo de la profundidad fija de la llave.\n";
  std::cout << "puntero dinamico: NO MEDIDA -- misma razon: la ventaja de que k_i "
               "chico sea barato depende de que el arbol se reestructure hacia donde "
               "se buscó la ultima vez (#32), lo que un BST estatico no hace.\n";
  std::cout << "conjunto de trabajo: NO MEDIDA -- misma razon: que una repeticion "
               "reciente salga barata (#38) depende de mover esa llave hacia arriba "
               "al buscarla, no de su posicion fija en un arbol estatico.\n";
  std::cout << "propiedad unificada: NO MEDIDA -- generaliza a las tres anteriores "
               "(#45), que ya quedan fuera del alcance de un BST estatico.\n";

  return 0;
}
