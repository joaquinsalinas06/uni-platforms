// Stack Persistente (Path Copying en listas enlazadas)
// Complejidad: Push O(1) tiempo, O(1) memoria | Pop O(1) tiempo, O(1) memoria.

#include <iostream>
#include <vector>

using namespace std;

struct Node {
  int val;
  Node* next;  // Puntero al elemento inferior (versión previa)

  Node(int v, Node* nxt = nullptr) : val(v), next(nxt) {}
};

// PUSH: Crea un nodo nuevo cuya 'cola' apunta a la versión anterior.
// No clona nada del pasado; ambas versiones coexisten y comparten memoria.
Node* push(Node* root, int val) {
  return new Node(val, root);
}

// POP: Simplemente devuelve el puntero al siguiente nodo.
// La versión previa no se destruye, sigue viva e intacto su tope.
Node* pop(Node* root) {
  if (!root) return nullptr;
  return root->next;
}

// TOP: Consulta el elemento en la cima de la versión dada.
int top(Node* root) {
  if (!root) return -1;
  return root->val;
}

int main() {
  // v0: Pila vacía
  Node* v0 = nullptr;

  // v1: push(10) -> [10]
  Node* v1 = push(v0, 10);

  // v2: push(20) -> [20, 10]
  Node* v2 = push(v1, 20);

  // Ramificación: Creamos dos versiones distintas desde v2
  // v3_ramaA: push(30) sobre v2 -> [30, 20, 10]
  Node* v3_ramaA = push(v2, 30);

  // v3_ramaB: pop() sobre v2   -> [10]
  Node* v3_ramaB = pop(v2);

  // Verificación: v2 no fue modificado por ninguna de sus dos ramas hijas
  cout << "v2 top: " << top(v2) << " (esperado: 20)\n";
  cout << "v3_ramaA top: " << top(v3_ramaA) << " (esperado: 30)\n";
  cout << "v3_ramaB top: " << top(v3_ramaB) << " (esperado: 10)\n";

  // Ambas ramas comparten la referencia física a los nodos anteriores:
  // El next de v3_ramaA es v2; el tope de v3_ramaB es exactamente el nodo de v1.
  if (v3_ramaA->next == v2 && v3_ramaB == v1) {
    cout << "OK: Memoria compartida correctamente sin duplicación.\n";
  }

  return 0;
}
