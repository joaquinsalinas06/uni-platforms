// Niveles de Persistencia (Taxonomía: Parcial vs Total)
// Parcial: Línea de tiempo lineal | Solo escribe sobre la versión actual | Consulta cualquier versión.
// Total: Árbol de versiones | Escribe y ramifica sobre CUALQUIER versión | Consulta cualquier versión.

#include <iostream>
#include <string>
#include <vector>

using namespace std;

// ---------------------------------------------------------------------
// 1. PERSISTENCIA PARCIAL: Grafo de versiones es una LÍNEA.
// ---------------------------------------------------------------------
class PartialArray {
 public:
  explicit PartialArray(vector<int> init) {
    versions.push_back(init);
  }

  int latest() const {
    return (int)versions.size() - 1;
  }

  const vector<int>& get(int v) const {
    if (v < 0 || v >= (int)versions.size()) throw string("Version inexistente");
    return versions[v];
  }

  // Regla clave: Solo se puede modificar si v == latest().
  // Escribir en el pasado es ilegal por definición de persistencia parcial.
  int set(int v, size_t idx, int val) {
    if (v != latest()) {
      throw string("Error: Persistencia parcial solo admite escribir en la version mas reciente");
    }
    vector<int> nuevo = versions[v];
    nuevo[idx] = val;
    versions.push_back(nuevo);
    return latest();  // Retorna el ID de la nueva versión creada
  }

 private:
  vector<vector<int>> versions;
};

// ---------------------------------------------------------------------
// 2. PERSISTENCIA TOTAL: Grafo de versiones es un ÁRBOL.
// ---------------------------------------------------------------------
class TotalArray {
 public:
  explicit TotalArray(vector<int> init) {
    versions.push_back(init);
    parent.push_back(-1);  // La versión raíz v0 no tiene padre
  }

  const vector<int>& get(int v) const {
    if (v < 0 || v >= (int)versions.size()) throw string("Version inexistente");
    return versions[v];
  }

  int getParent(int v) const {
    return parent.at(v);
  }

  // Regla clave: Se puede modificar CUALQUIER versión del pasado.
  // Cada escritura genera una nueva versión hija de 'v', ramificando la historia.
  int set(int v, size_t idx, int val) {
    vector<int> nuevo = get(v);
    nuevo[idx] = val;
    versions.push_back(nuevo);
    parent.push_back(v);  // Registramos que la nueva versión es hija de v
    return (int)versions.size() - 1;
  }

 private:
  vector<vector<int>> versions;
  vector<int> parent;  // Guarda el padre de cada versión para formar el árbol
};

int main() {
  cout << "=== DEMO PERSISTENCIA PARCIAL ===\n";
  PartialArray p({10, 20, 30});
  int pv1 = p.set(0, 0, 99);  // v0 -> v1 (legal: v0 era la última)
  int pv2 = p.set(pv1, 1, 88); // v1 -> v2 (legal: v1 era la última)

  cout << "v0[0]: " << p.get(0)[0] << " (esperado: 10 - intacto)\n";
  cout << "v1[0]: " << p.get(pv1)[0] << " (esperado: 99)\n";
  cout << "v2[1]: " << p.get(pv2)[1] << " (esperado: 88)\n";

  // Intento ilegal: modificar v0 cuando ya existe v2
  try {
    p.set(0, 2, 77);
  } catch (const string& err) {
    cout << "Rechazado como debe ser: " << err << "\n";
  }

  cout << "\n=== DEMO PERSISTENCIA TOTAL ===\n";
  TotalArray t({10, 20, 30});
  int tv1 = t.set(0, 0, 99);  // v0 -> v1
  int tv2 = t.set(0, 2, 77);  // v0 -> v2 (RAMIFICACIÓN: v1 y v2 son ambas hijas de v0)

  cout << "tv1[0]: " << t.get(tv1)[0] << ", padre: " << t.getParent(tv1) << "\n";
  cout << "tv2[2]: " << t.get(tv2)[2] << ", padre: " << t.getParent(tv2) << "\n";
  cout << "v0 original intacto: " << t.get(0)[0] << ", " << t.get(0)[2] << "\n";

  return 0;
}
