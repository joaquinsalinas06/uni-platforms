// Trie Persistente (Path Copying para cadenas y prefijos)
// Complejidad: Insert O(L) tiempo y nodos nuevos | Search O(L) tiempo, donde L = longitud de la palabra.

#include <iostream>
#include <string>
#include <vector>

using namespace std;

const int ALPHABET = 26;

struct TrieNode {
  bool isEnd;
  vector<TrieNode*> child;

  TrieNode(bool end = false) : isEnd(end), child(ALPHABET, nullptr) {}

  // Constructor de copia: clona el vector de punteros a hijos.
  // Esencial para path-copying: hereda todas las ramas existentes en O(ALPHABET).
  TrieNode(const TrieNode& other) : isEnd(other.isEnd), child(other.child) {}
};

// INSERT: Clona únicamente el nodo actual y delega en el hijo correspondiente.
// Los 25 hijos restantes que no coinciden con s[idx] se quedan apuntando
// a las ramas viejas ya existentes (compartición de prefijos y sufijos).
TrieNode* insert(TrieNode* cur, const string& s, size_t idx = 0) {
  // 1. Si cur existe, lo copiamos; si no, creamos un nodo limpio
  TrieNode* nuevo = cur ? new TrieNode(*cur) : new TrieNode();

  // 2. Si terminamos de insertar los caracteres de la palabra
  if (idx == s.size()) {
    nuevo->isEnd = true;
    return nuevo;
  }

  // 3. Calculamos la posición del caracter ('a' -> 0, 'b' -> 1, ...)
  int c = s[idx] - 'a';

  // 4. Clona recursivamente SOLO el hijo 'c'
  TrieNode* hijoViejo = cur ? cur->child[c] : nullptr;
  nuevo->child[c] = insert(hijoViejo, s, idx + 1);

  return nuevo;
}

// SEARCH: Búsqueda tradicional sobre el trie de la versión especificada.
bool contains(TrieNode* cur, const string& s, size_t idx = 0) {
  if (!cur) return false;
  if (idx == s.size()) return cur->isEnd;
  int c = s[idx] - 'a';
  return contains(cur->child[c], s, idx + 1);
}

int main() {
  // v0: Trie vacío
  TrieNode* v0 = nullptr;

  // v1: insertamos "pato"
  TrieNode* v1 = insert(v0, "pato");

  // v2: insertamos "palo" partiendo de v1
  // Ambas palabras comparten el prefijo "pa". v2 crea nodos nuevos solo para 'l' y 'o',
  // y reutiliza la rama "to" de v1 sin duplicarla.
  TrieNode* v2 = insert(v1, "palo");

  // v3: insertamos "pez" partiendo de v1 (ramificación)
  TrieNode* v3 = insert(v1, "pez");

  // Verificamos que v1 sigue inmutable (solo contiene "pato")
  cout << "v1 tiene 'pato': " << (contains(v1, "pato") ? "SI" : "NO") << " (esperado: SI)\n";
  cout << "v1 tiene 'palo': " << (contains(v1, "palo") ? "SI" : "NO") << " (esperado: NO)\n";

  // Verificamos v2 (debe tener "pato" y "palo")
  cout << "v2 tiene 'pato': " << (contains(v2, "pato") ? "SI" : "NO") << " (esperado: SI)\n";
  cout << "v2 tiene 'palo': " << (contains(v2, "palo") ? "SI" : "NO") << " (esperado: SI)\n";

  // Verificamos v3 (debe tener "pato" y "pez", pero NO "palo")
  cout << "v3 tiene 'pez':  " << (contains(v3, "pez") ? "SI" : "NO") << " (esperado: SI)\n";
  cout << "v3 tiene 'palo': " << (contains(v3, "palo") ? "SI" : "NO") << " (esperado: NO)\n";

  return 0;
}
