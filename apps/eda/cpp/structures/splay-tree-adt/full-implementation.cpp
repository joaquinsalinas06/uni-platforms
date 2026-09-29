// El TDA completo del splay tree (#12-20), autocontenido.
//
// Las cinco operaciones — Buscar, Separar, Unir, Insertar, Eliminar — se
// construyen usando SÓLO Splay y el descenso de Buscar, sin ningún
// recorrido extra del árbol (#12). El contador `splayCalls` instrumenta
// la afirmación del #20:
//
//   Buscar, Insertar: 1 llamada · Unir: 1 · Eliminar: 2 · Separar: 0 propias.
//
// main() verifica:
//   1. Separar corta exactamente por k: todo I <= k, todo D > k.
//   2. Unir preserva el recorrido inorden (concatenación de A y B).
//   3. Insertar/Eliminar dejan un BST válido, con los punteros al padre
//      consistentes y el conjunto de llaves correcto.
//   4. El conteo de llamadas a Splay es exactamente el del #20.
//   5. Casos límite: árbol vacío, un solo nodo, k que no está.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// Instrumentación del #20.
long splayCalls = 0;

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;
    explicit Node(int v) : value(v) {}
};

// --- La base que viene de /structures/splay-tree ---

void rotate(Node*& root, Node* x) {
    Node* p = x->parent;
    Node* g = p->parent;

    if (x == p->left) {
        p->left = x->right;
        if (x->right != nullptr) x->right->parent = p;
        x->right = p;
    } else {
        p->right = x->left;
        if (x->left != nullptr) x->left->parent = p;
        x->left = p;
    }

    p->parent = x;
    x->parent = g;
    if (g == nullptr) root = x;
    else if (g->left == p) g->left = x;
    else g->right = x;
}

void zig(Node*& root, Node* x) { rotate(root, x); }

void zigZig(Node*& root, Node* x) {
    Node* p = x->parent;
    rotate(root, p);
    rotate(root, x);
}

void zigZag(Node*& root, Node* x) {
    rotate(root, x);
    rotate(root, x);
}

void splay(Node*& root, Node* x) {
    splayCalls++;
    while (x != root) {
        Node* p = x->parent;
        if (p == root) {
            zig(root, x);
        } else {
            Node* g = p->parent;
            bool xLeftOfP = (x == p->left);
            bool pLeftOfG = (p == g->left);
            if (xLeftOfP == pLeftOfG) zigZig(root, x);
            else zigZag(root, x);
        }
    }
}

// --- Las cinco operaciones del TDA ---

// Buscar(k) (#13). Si k no está, splaya el ÚLTIMO visitado (#14).
bool search(Node*& root, int k) {
    Node* v = root;
    Node* last = nullptr;
    while (v != nullptr) {
        last = v;
        if (k == v->value) {
            splay(root, v);
            return true;
        }
        v = (k < v->value) ? v->left : v->right;
    }
    if (last != nullptr) splay(root, last);
    return false;
}

// Separar(k) (#15). Precondición: ya se ejecutó Buscar(k). Ninguna
// llamada propia a Splay — una comparación y un puntero a NULO (#16).
pair<Node*, Node*> split(Node*& root, int k) {
    if (root == nullptr) return {nullptr, nullptr};

    Node* r = root;
    Node* I;
    Node* D;

    if (r->value <= k) {
        I = r;
        D = r->right;
        r->right = nullptr;
        if (D != nullptr) D->parent = nullptr;
    } else {
        D = r;
        I = r->left;
        r->left = nullptr;
        if (I != nullptr) I->parent = nullptr;
    }

    root = nullptr;
    return {I, D};
}

// Unir(A, B) (#17). Precondición: todo valor de A < todo valor de B.
Node* join(Node* A, Node* B) {
    if (A == nullptr) return B;
    if (B == nullptr) return A;

    Node* v = A;
    while (v->right != nullptr) v = v->right;

    splay(A, v);  // v = m = máximo de A, ahora raíz de A y sin hijo derecho

    v->right = B;
    B->parent = v;
    return v;
}

// Insertar(k) (#18). Ningún recorrido adicional del árbol.
void insert(Node*& root, int k) {
    if (search(root, k)) return;

    pair<Node*, Node*> parts = split(root, k);
    Node* I = parts.first;
    Node* D = parts.second;

    Node* x = new Node(k);
    x->left = I;
    if (I != nullptr) I->parent = x;
    x->right = D;
    if (D != nullptr) D->parent = x;

    root = x;
}

// Eliminar(k) (#19). Buscar deja k en la raíz; sus dos hijos ya cumplen
// la precondición de Unir.
void remove(Node*& root, int k) {
    if (!search(root, k)) return;

    Node* r = root;
    Node* A = r->left;
    Node* B = r->right;
    if (A != nullptr) A->parent = nullptr;
    if (B != nullptr) B->parent = nullptr;

    root = join(A, B);
    if (root != nullptr) root->parent = nullptr;

    r->left = nullptr;
    r->right = nullptr;
    delete r;
}

// --- Andamiaje de verificación ---

void inorder(Node* v, vector<int>& out) {
    if (v == nullptr) return;
    inorder(v->left, out);
    out.push_back(v->value);
    inorder(v->right, out);
}

vector<int> inorder(Node* v) {
    vector<int> out;
    inorder(v, out);
    return out;
}

// Un BST es válido si su inorden es estrictamente creciente, y el árbol
// está bien enlazado si cada hijo apunta de vuelta a su padre.
bool isSortedStrictly(const vector<int>& v) {
    for (size_t i = 1; i < v.size(); i++) {
        if (v[i - 1] >= v[i]) return false;
    }
    return true;
}

bool parentsConsistent(Node* v, Node* expectedParent) {
    if (v == nullptr) return true;
    if (v->parent != expectedParent) return false;
    return parentsConsistent(v->left, v) && parentsConsistent(v->right, v);
}

bool isValidBST(Node* root) {
    return isSortedStrictly(inorder(root)) && parentsConsistent(root, nullptr);
}

int size(Node* v) {
    if (v == nullptr) return 0;
    return 1 + size(v->left) + size(v->right);
}

void destroy(Node* v) {
    if (v == nullptr) return;
    destroy(v->left);
    destroy(v->right);
    delete v;
}

int main() {
    // --- 1. Separar corta exactamente por k (#15-16) ---
    {
        Node* root = nullptr;
        for (int k : {50, 30, 70, 20, 40, 60, 80, 35, 65}) insert(root, k);
        assert(isValidBST(root));
        vector<int> todo = inorder(root);

        const int k = 45;  // k NO está en el árbol: caso interesante
        search(root, k);   // precondición de Separar
        // Tras Buscar(45), la raíz es el predecesor (40) o el sucesor (50).
        assert(root->value == 40 || root->value == 50);

        pair<Node*, Node*> parts = split(root, k);
        Node* I = parts.first;
        Node* D = parts.second;

        vector<int> vi = inorder(I), vd = inorder(D);
        for (int x : vi) assert(x <= k);
        for (int x : vd) assert(x > k);
        assert(isValidBST(I) && isValidBST(D));

        vector<int> reunidos = vi;
        reunidos.insert(reunidos.end(), vd.begin(), vd.end());
        assert(reunidos == todo);  // no se perdió ni se duplicó ninguna llave
        cout << "OK 1: Separar(45) corta por k -- I={<=45}, D={>45}, sin "
                "perder llaves (#15-16).\n";

        destroy(I);
        destroy(D);
    }

    // --- 2. Unir preserva el inorden (#17) ---
    {
        Node* A = nullptr;
        for (int k : {10, 5, 15, 12, 18}) insert(A, k);
        Node* B = nullptr;
        for (int k : {40, 30, 50, 45}) insert(B, k);

        vector<int> esperado = inorder(A);
        vector<int> vb = inorder(B);
        esperado.insert(esperado.end(), vb.begin(), vb.end());

        Node* U = join(A, B);
        assert(isValidBST(U));
        assert(inorder(U) == esperado);
        // El máximo de A quedó como raíz, y B cuelga entero a su derecha.
        assert(U->value == 18);
        assert(U->right == nullptr || inorder(U->right) == vb);
        cout << "OK 2: Unir(A,B) deja el maximo de A (18) en la raiz con B "
                "entero colgando a la derecha, preservando el inorden (#17).\n";

        destroy(U);
    }

    // --- 3. Insertar/Eliminar dejan siempre un BST válido (#18-19) ---
    {
        Node* root = nullptr;
        vector<int> llaves;
        // Orden deliberadamente adverso: creciente puro, el que degenera
        // un BST ordinario en cadena.
        for (int k = 1; k <= 200; k++) {
            insert(root, k);
            llaves.push_back(k);
            assert(isValidBST(root));
        }
        assert(size(root) == 200);
        assert(inorder(root) == llaves);

        // Insertar un duplicado no debe cambiar nada.
        insert(root, 137);
        assert(size(root) == 200);

        // Eliminar las 100 llaves pares, en orden decreciente (distinto al
        // de inserción): sólo deben quedar las impares.
        for (int k = 200; k >= 1; k -= 2) {
            remove(root, k);
            assert(isValidBST(root));
        }
        vector<int> restantes = inorder(root);
        assert(restantes.size() == 100);
        for (int x : restantes) assert(x % 2 == 1);
        cout << "OK 3: 200 Insertar en orden creciente + 100 Eliminar dejan "
                "un BST valido en todo momento (#18-19).\n";

        destroy(root);
    }

    // --- 4. El conteo de llamadas a Splay es el del #20 ---
    {
        Node* root = nullptr;
        for (int k : {50, 30, 70, 20, 40, 60, 80}) insert(root, k);

        // Buscar: 1 llamada (esté o no esté k).
        splayCalls = 0;
        assert(search(root, 40) == true);
        assert(splayCalls == 1);

        splayCalls = 0;
        assert(search(root, 45) == false);  // k ausente: splaya el último visitado
        assert(splayCalls == 1);

        // Separar: NINGUNA llamada propia -- reutiliza la de Buscar.
        splayCalls = 0;
        search(root, 45);
        long trasBuscar = splayCalls;
        pair<Node*, Node*> parts = split(root, 45);
        assert(splayCalls == trasBuscar);  // Separar no sumó ni una
        assert(trasBuscar == 1);

        // Unir: 1 llamada (splaya el máximo de A).
        splayCalls = 0;
        root = join(parts.first, parts.second);
        assert(splayCalls == 1);
        assert(isValidBST(root));

        // Insertar: 1 llamada (la de su propio Buscar; Separar no suma).
        splayCalls = 0;
        insert(root, 45);
        assert(splayCalls == 1);

        // Eliminar = Buscar + Unir: 2 llamadas.
        splayCalls = 0;
        remove(root, 45);
        assert(splayCalls == 2);
        assert(isValidBST(root));

        cout << "OK 4: conteo del #20 verificado -- Buscar 1, Insertar 1, "
                "Unir 1, Eliminar 2, Separar 0 propias.\n";
        destroy(root);
    }

    // --- 5. Casos límite: vacío, un solo nodo, k ausente ---
    {
        // Árbol vacío: ninguna operación rompe nada, y ninguna splaya.
        Node* root = nullptr;
        splayCalls = 0;
        assert(search(root, 7) == false);
        assert(splayCalls == 0);  // no hay ningún nodo que splayar

        pair<Node*, Node*> vacio = split(root, 7);
        assert(vacio.first == nullptr && vacio.second == nullptr);

        remove(root, 7);  // no-op sobre un árbol vacío
        assert(root == nullptr);

        assert(join(nullptr, nullptr) == nullptr);

        // Un solo nodo.
        splayCalls = 0;
        insert(root, 7);
        assert(splayCalls == 0);  // Buscar sobre el árbol vacío no splayó
        assert(root != nullptr && root->value == 7 && size(root) == 1);

        // Buscar sobre un árbol de un nodo: 1 llamada, x ya es la raíz.
        splayCalls = 0;
        assert(search(root, 7) == true);
        assert(splayCalls == 1 && root->value == 7);

        // Separar por k = 7 con r.valor <= k: I = {7}, D vacío.
        search(root, 7);
        pair<Node*, Node*> p1 = split(root, 7);
        assert(p1.first != nullptr && p1.first->value == 7);
        assert(p1.second == nullptr);
        root = join(p1.first, p1.second);
        assert(size(root) == 1);

        // Separar por k = 3 con r.valor > k: I vacío, D = {7}.
        search(root, 3);
        pair<Node*, Node*> p2 = split(root, 3);
        assert(p2.first == nullptr);
        assert(p2.second != nullptr && p2.second->value == 7);
        root = join(p2.first, p2.second);

        // Eliminar el único nodo: Unir(NULO, NULO) = NULO, y Eliminar
        // gasta sólo 1 llamada (la de Buscar) porque Unir corta antes.
        splayCalls = 0;
        remove(root, 7);
        assert(root == nullptr);
        assert(splayCalls == 1);

        // Eliminar una k que no está: 1 llamada (la de Buscar), sin cambios.
        insert(root, 10);
        insert(root, 20);
        vector<int> antes = inorder(root);
        splayCalls = 0;
        remove(root, 99);
        assert(splayCalls == 1);
        assert(inorder(root) == antes);

        cout << "OK 5: casos limite -- arbol vacio, un solo nodo, k ausente "
                "y las dos ramas de Separar.\n";
        destroy(root);
    }

    cout << "\nTodas las verificaciones pasaron: el TDA completo se construye "
            "sobre Splay y el descenso de Buscar, sin ningun recorrido extra "
            "(#12).\n";
    return 0;
}
