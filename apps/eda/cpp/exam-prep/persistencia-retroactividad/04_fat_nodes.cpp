// Nodos Gordos (Fat Nodes - Driscoll et al.)
// Complejidad: Lectura en version t O(1) | Escritura O(1) amortizado con cota de punteros entrantes p.

#include <iostream>
#include <string>
#include <vector>

using namespace std;

// Cota fija de punteros entrantes: p = 2 -> capacidad máxima del log = 2*p = 4
const int P = 2;
const int MAX_LOG = 2 * P;

struct Entry {
  long time;
  int val;
};

struct FatNode {
  int id;
  int originalVal;
  FatNode* next;  // Puntero al siguiente nodo en la lista
  vector<Entry> log;

  // Bookkeeping para el split: lista de predecesores que apuntan a este nodo
  vector<FatNode*> incoming;

  FatNode(int id_, int v, FatNode* nxt = nullptr)
      : id(id_), originalVal(v), next(nxt) {}
};

// LECTURA EN TIEMPO t:
// Recorre el log de atrás hacia adelante (de más reciente a más antiguo).
// La primera entrada con time <= t es la respuesta. Si no hay ninguna, usa el original.
int readValue(const FatNode* node, long t) {
  for (int i = (int)node->log.size() - 1; i >= 0; --i) {
    if (node->log[i].time <= t) {
      return node->log[i].val;
    }
  }
  return node->originalVal;
}

FatNode* nodeSplit(FatNode* node, int val, long t, int& nextId);

// ESCRITURA EN TIEMPO t:
// Caso 1: Hay espacio en el log (< 2p). Agrega la tupla y termina en O(1).
// Caso 2: Log lleno (== 2p). Dispara nodeSplit y redirige los predecesores.
FatNode* writeValue(FatNode* node, int val, long t, int& nextId) {
  if ((int)node->log.size() < MAX_LOG) {
    node->log.push_back({t, val});
    return node;
  }
  // Registro lleno: delegamos en el split
  return nodeSplit(node, val, t, nextId);
}

// NODE SPLIT:
// 1. Crea un nuevo nodo limpio que hereda el valor vigente en el tiempo t.
// 2. Redirige los punteros entrantes de los predecesores hacia el nuevo nodo.
// 3. Aplica la nueva escritura en el nuevo nodo (nace con espacio limpio).
// 4. El nodo viejo queda congelado en el pasado (sigue respondiendo a lecturas anteriores).
FatNode* nodeSplit(FatNode* node, int val, long t, int& nextId) {
  // Nodo nuevo nace con el valor vigente en t y su log limpio
  FatNode* nuevo = new FatNode(nextId++, readValue(node, t), node->next);

  // Redirigimos a los predecesores hacia el nodo nuevo
  for (FatNode* pred : node->incoming) {
    pred->next = nuevo;
    nuevo->incoming.push_back(pred);
  }
  node->incoming.clear();

  // Guardamos la nueva modificación en el nodo nuevo
  nuevo->log.push_back({t, val});
  return nuevo;
}

// RECORRIDO DE EULER (Persistencia Total):
// Lineariza el árbol de versiones con paréntesis '(' y ')'
// para saber qué cambios están vigentes en cualquier rama del árbol de versiones.
void eulerTour(int u, const vector<vector<int>>& adj, vector<string>& tour) {
  tour.push_back("(" + to_string(u));
  for (int v : adj[u]) {
    eulerTour(v, adj, tour);
  }
  tour.push_back(")" + to_string(u));
}

int main() {
  int nextId = 1;

  // Creamos nodo inicial con valor 10 en t=0
  FatNode* n1 = new FatNode(nextId++, 10);

  // t=1..4: Modificaciones dentro de la capacidad del log (MAX_LOG = 4)
  writeValue(n1, 20, 1, nextId);
  writeValue(n1, 30, 2, nextId);
  writeValue(n1, 40, 3, nextId);
  writeValue(n1, 50, 4, nextId);

  cout << "Valor en t=0: " << readValue(n1, 0) << " (esperado: 10 - original)\n";
  cout << "Valor en t=2: " << readValue(n1, 2) << " (esperado: 30)\n";
  cout << "Valor en t=4: " << readValue(n1, 4) << " (esperado: 50)\n";

  // t=5: El log está lleno (4 entradas). Esta escritura forzará un SPLIT.
  FatNode* postSplit = writeValue(n1, 999, 5, nextId);

  cout << "\n--- Despues del Split ---\n";
  cout << "Es nodo nuevo: " << (postSplit != n1 ? "SI" : "NO") << " (esperado: SI)\n";
  cout << "Valor en nodo nuevo t=5: " << readValue(postSplit, 5) << " (esperado: 999)\n";
  // El nodo viejo sigue intacto para lecturas del pasado:
  cout << "Valor en nodo viejo t=4: " << readValue(n1, 4) << " (esperado: 50)\n";
  cout << "Valor en nodo viejo t=1: " << readValue(n1, 1) << " (esperado: 20)\n";

  return 0;
}
