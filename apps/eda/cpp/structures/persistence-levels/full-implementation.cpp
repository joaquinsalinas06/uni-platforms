// Niveles de persistencia — taxonomía, no una estructura con operaciones
// propias (persistence-levels es `type: concept`, `operations: []`). Para
// hacerla tangible en C++ se implementa la MISMA estructura mínima (una
// lista de asignaciones indexadas, tipo arreglo) en dos variantes que
// demuestran la diferencia entre PARCIAL y TOTAL:
//
//   - PartialList: sólo se puede escribir sobre la versión más reciente
//     ("Solo se puede actualizar la versión más reciente; se puede
//     consultar cualquier versión anterior. Las versiones quedan ordenadas
//     linealmente, como una línea de tiempo.") — set() sobre una versión
//     vieja es ilegal y se rechaza en tiempo de ejecución.
//   - TotalList: se puede escribir sobre cualquier versión, y cada
//     escritura crea una hija de la versión modificada ("cada actualización
//     crea una nueva versión hija de la que se modificó. Las versiones
//     forman un árbol.") — cualquier versión existente admite set().
//
// Confluente (merge de dos versiones, DAG) y funcional (técnica de nunca
// mutar un nodo) no se implementan aquí: confluente no tiene técnica propia
// en este curso, y funcional es la técnica que usa path-copying (otro
// agente, cpp/structures/path-copying/) — invadir ese alcance duplicaría
// contenido de otra estructura.
//
// Ambas variantes guardan, por simplicidad, una copia completa del arreglo
// por versión (no son fat-nodes ni path-copying de verdad — esa eficiencia
// es justamente lo que esas dos técnicas aportan). Lo que se demuestra aquí
// es la REGLA DE NIVEL (qué escritura es legal en cada uno), no el costo.

#include <cassert>
#include <iostream>
#include <optional>
#include <stdexcept>
#include <vector>

// ---------------------------------------------------------------------
// Persistencia PARCIAL: grafo de versiones = línea. set() sólo es legal
// sobre la versión más reciente.
// ---------------------------------------------------------------------
class PartialList {
public:
  explicit PartialList(std::vector<int> initial) { versions_.push_back(std::move(initial)); }

  // Versión 0 = estado inicial. Cada set() exitoso agrega una versión nueva.
  int latest() const { return static_cast<int>(versions_.size()) - 1; }

  const std::vector<int>& get(int version) const {
    if (version < 0 || version >= static_cast<int>(versions_.size()))
      throw std::out_of_range("versión inexistente");
    return versions_[version];
  }

  // Legal SOLO si version == latest(): "solo se puede actualizar la versión
  // más reciente". Escribir sobre cualquier otra versión es la operación
  // que persistencia parcial prohíbe por definición.
  int set(int version, std::size_t index, int value) {
    if (version != latest())
      throw std::logic_error("persistencia parcial: solo se puede escribir sobre la version mas reciente");
    std::vector<int> next = versions_[version];
    next.at(index) = value;
    versions_.push_back(std::move(next));
    return latest();
  }

private:
  std::vector<std::vector<int>> versions_;
};

// ---------------------------------------------------------------------
// Persistencia TOTAL: grafo de versiones = árbol. set() es legal sobre
// CUALQUIER versión existente; cada escritura crea una hija de esa versión.
// ---------------------------------------------------------------------
class TotalList {
public:
  explicit TotalList(std::vector<int> initial) {
    versions_.push_back(std::move(initial));
    parent_.push_back(-1); // v0 no tiene padre
  }

  const std::vector<int>& get(int version) const {
    if (version < 0 || version >= static_cast<int>(versions_.size()))
      throw std::out_of_range("versión inexistente");
    return versions_[version];
  }

  int parent_of(int version) const { return parent_.at(version); }

  // Legal sobre cualquier version existente: crea una hija nueva de ella.
  // No hay restricción de "más reciente" — eso es justo lo que distingue
  // total de parcial.
  int set(int version, std::size_t index, int value) {
    std::vector<int> next = get(version); // valida el rango
    next.at(index) = value;
    versions_.push_back(std::move(next));
    parent_.push_back(version);
    return static_cast<int>(versions_.size()) - 1;
  }

private:
  std::vector<std::vector<int>> versions_;
  std::vector<int> parent_;
};

int main() {
  // --- Persistencia parcial: la línea de tiempo del ejemplo mínimo de
  // examples.md (v0 -> v1 -> v2). ---
  {
    PartialList lst({1, 2, 3});
    int v0 = 0;
    int v1 = lst.set(v0, 0, 9); // set sobre la más reciente (v0): legal
    assert(v1 == 1);
    assert((lst.get(v1) == std::vector<int>{9, 2, 3}));

    int v2 = lst.set(v1, 1, 7); // set sobre la más reciente (v1): legal
    assert(v2 == 2);
    assert((lst.get(v2) == std::vector<int>{9, 7, 3}));

    // v0 sigue consultable sin cambios: la esencia de persistencia.
    assert((lst.get(v0) == std::vector<int>{1, 2, 3}));

    // Ilegal: volver a escribir sobre v0 una vez que v1 existe y es más
    // reciente. Esta es exactamente la operación que "total" sí permite y
    // "parcial" prohíbe.
    bool rechazado = false;
    try {
      lst.set(v0, 2, 5);
    } catch (const std::logic_error&) {
      rechazado = true;
    }
    assert(rechazado);

    std::cout << "PARCIAL  v0=[1,2,3] -> v1=[9,2,3] -> v2=[9,7,3]\n"
              << "         v0 sigue consultable e intacto\n"
              << "         escribir otra vez sobre v0 (ya no es la ultima): RECHAZADO\n";
  }

  // --- Persistencia total: el ejemplo "normal" de examples.md — v1 y v2
  // ambas hijas de v0, ninguna hija de la otra. ---
  {
    TotalList lst({1, 2, 3});
    int v0 = 0;
    int v1 = lst.set(v0, 0, 9); // set sobre v0
    int v2 = lst.set(v0, 2, 5); // set OTRA VEZ sobre v0: legal en total, no en parcial
    assert((lst.get(v1) == std::vector<int>{9, 2, 3}));
    assert((lst.get(v2) == std::vector<int>{1, 2, 5}));
    assert(lst.parent_of(v1) == v0);
    assert(lst.parent_of(v2) == v0);
    // v1 y v2 son ambas hijas de v0: el grafo de versiones es un arbol,
    // no una linea (v0 tiene dos hijos).

    int v3 = lst.set(v1, 1, 7); // se puede seguir ramificando desde v1
    assert((lst.get(v3) == std::vector<int>{9, 7, 3}));
    assert(lst.parent_of(v3) == v1);

    // v0, v1, v2 siguen consultables e intactos.
    assert((lst.get(v0) == std::vector<int>{1, 2, 3}));
    assert((lst.get(v1) == std::vector<int>{9, 2, 3}));
    assert((lst.get(v2) == std::vector<int>{1, 2, 5}));

    std::cout << "\nTOTAL    v1=[9,2,3] y v2=[1,2,5] son AMBAS hijas de v0\n"
              << "         escribir dos veces sobre v0: PERMITIDO\n"
              << "         v3=[9,7,3] ramifica desde v1\n"
              << "         el grafo de versiones es un arbol, no una linea\n";
  }

  std::cout << "\nOK: la diferencia entre parcial y total es exactamente que"
               " total deja ramificar.\n";
  return 0;
}
