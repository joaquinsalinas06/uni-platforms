// Splay tree completo (#59-75, Sem6 #5-14): nodo con puntero al padre,
// rotate (la única primitiva, Sem6 #8), los tres casos armados con ella
// (Sem6 #9), el bucle de Splay (Sem6 #10) y Buscar(k) con su caso fallido
// (Sem6 #13). insertPlain/buildBalanced son andamiaje para construir árboles
// de prueba; Insertar y Eliminar del TDA viven en
// /structures/splay-tree-adt, construidas sobre Buscar + Splay.
//
// main() verifica:
//   1. Que zig, zig-zig y zig-zag producen exactamente la forma de los
//      diagramas del profesor (#64-66), y que zig-zig rota primero el par
//      (p, a) — no (x, p) — sin caer en move-to-root.
//   2. Que Buscar(k) preserva el recorrido inorden (sigue siendo un BST
//      válido) y deja k en la raíz.
//   3. Que Buscar(k) con k AUSENTE devuelve falso y deja en la raíz al
//      predecesor o al sucesor de k — la garantía de Sem6 #13-14.
//   4. La comparación que search-sequence-properties dejó sin medir:
//      acceso secuencial y repetición de un conjunto de trabajo pequeño,
//      splay tree contra BST estático — imprime el costo real de cada uno.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;
    explicit Node(int v) : value(v) {}
};

// rotate: la ÚNICA primitiva del splay tree (Sem6 #8) — "rotar un nodo v
// con su padre, para que v suba un nivel". Es el rotate del modelo BST
// (#20-21), generalizado a "decide el lado según de dónde cuelga x".
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

// Los tres casos, en términos de rotate (tabla de Sem6 #9).

// Zig (#64) = Rotar(x): x hijo directo de la raíz.
void zig(Node*& root, Node* x) { rotate(root, x); }

// Zig-zig (#65) = Rotar(padre(x)); Rotar(x): rota (p, a) PRIMERO, luego
// (x, p). Invertir este orden (rotar (x, p) dos veces) es move-to-root, no
// zig-zig — "nunca al revés" (Sem6 #9).
void zigZig(Node*& root, Node* x) {
    Node* p = x->parent;
    rotate(root, p);
    rotate(root, x);
}

// Zig-zag (#66) = Rotar(x); Rotar(x): las DOS llamadas son sobre x mismo
// (Sem6 #9), porque las dos direcciones opuestas no se refuerzan entre sí.
void zigZag(Node*& root, Node* x) {
    rotate(root, x);
    rotate(root, x);
}

// Splay(x) (#60-63, Sem6 #10): el bucle del profesor, línea por línea.
// Aplica el caso correspondiente hasta que x es la raíz. Costo real
// proporcional a la profundidad de x — hasta Theta(n) en el peor caso
// individual; la cota O(log n) amortizada se demuestra en
// /structures/access-lemma.
void splay(Node*& root, Node* x) {
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

// Buscar(k) (#60, Sem6 #13): descenso estándar guardando el ÚLTIMO nodo
// visitado, y Splay siempre — del nodo encontrado si k está, del último
// visitado si no. Devuelve verdadero/falso. Al terminar, la raíz es k, o
// bien su predecesor o sucesor: ésa es la precondición de Separar en
// /structures/splay-tree-adt.
// costOut, si no es nullptr, acumula el número de pasos de descenso real
// (para medir el costo real de cada búsqueda, no sólo verificar correctud).
bool search(Node*& root, int k, long* costOut = nullptr) {
    Node* v = root;
    Node* last = nullptr;
    long steps = 0;
    while (v != nullptr) {
        last = v;
        if (k == v->value) {
            if (costOut != nullptr) *costOut += steps;
            splay(root, v);
            return true;
        }
        steps++;
        v = (k < v->value) ? v->left : v->right;
    }
    if (costOut != nullptr) *costOut += steps;
    if (last != nullptr) splay(root, last);
    return false;
}

// --- Andamiaje: no son operaciones del splay tree ---

Node* insertPlain(Node* root, Node* node) {
    if (root == nullptr) return node;
    Node* v = root;
    while (true) {
        if (node->value < v->value) {
            if (v->left == nullptr) { v->left = node; node->parent = v; break; }
            v = v->left;
        } else {
            if (v->right == nullptr) { v->right = node; node->parent = v; break; }
            v = v->right;
        }
    }
    return root;
}

Node* buildBalanced(int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    Node* node = new Node(mid);
    node->left = buildBalanced(lo, mid - 1);
    if (node->left) node->left->parent = node;
    node->right = buildBalanced(mid + 1, hi);
    if (node->right) node->right->parent = node;
    return node;
}

// Búsqueda de sólo lectura sobre un BST estático (nunca reorganiza): mide
// exactamente el mismo tipo de costo (pasos de descenso) que search(), pero
// sin Splay al final. Es el punto de comparación "BST estático" del tema.
long staticSearchCost(Node* root, int x) {
    Node* v = root;
    long steps = 0;
    while (v->value != x) {
        steps++;
        v = (x < v->value) ? v->left : v->right;
    }
    return steps;
}

int inorderSum(Node* v) {
    if (v == nullptr) return 0;
    return inorderSum(v->left) + v->value + inorderSum(v->right);
}

int height(Node* v) {
    if (v == nullptr) return -1;
    return 1 + max(height(v->left), height(v->right));
}

int main() {
    // --- 1. zig (#64): x hijo directo de la raíz ---
    {
        // p(x(A,B),C)  ->  x(A,p(B,C))
        Node *p = new Node(0), *x = new Node(0), *A = new Node(0), *B = new Node(0), *C = new Node(0);
        p->left = x; x->parent = p;
        p->right = C; C->parent = p;
        x->left = A; A->parent = x;
        x->right = B; B->parent = x;
        Node* root = p;

        zig(root, x);

        assert(root == x);
        assert(x->left == A && x->right == p);
        assert(p->left == B && p->right == C);
        cout << "OK: zig deja x en la raiz con (A, p(B, C)), igual que el diagrama #64.\n";
    }

    // --- 2. zig-zig (#65): mismo lado, rota (p,a) antes que (x,p) ---
    {
        // a(p(x(A,B),C),D)  ->  x(A,p(B,a(C,D)))
        Node *a = new Node(0), *p = new Node(0), *x = new Node(0);
        Node *A = new Node(0), *B = new Node(0), *C = new Node(0), *D = new Node(0);
        a->left = p; p->parent = a;
        a->right = D; D->parent = a;
        p->left = x; x->parent = p;
        p->right = C; C->parent = p;
        x->left = A; A->parent = x;
        x->right = B; B->parent = x;
        Node* root = a;

        zigZig(root, x);

        assert(root == x);
        assert(x->left == A && x->right == p);
        assert(p->left == B && p->right == a);
        assert(a->left == C && a->right == D);
        cout << "OK: zig-zig deja x en la raiz con p y a en cascada del lado "
                "derecho (A, p(B, a(C, D))), igual que el diagrama #65.\n";
    }

    // --- 2b. move-to-root (orden invertido) da una forma DISTINTA ---
    {
        // Mismo arbol inicial que arriba, pero rotando (x,p) dos veces en vez
        // de (p,a) primero: el destino final tambien pone a x en la raiz,
        // pero la forma intermedia/final de p y a no es la de zig-zig.
        Node *a = new Node(0), *p = new Node(0), *x = new Node(0);
        Node *A = new Node(0), *B = new Node(0), *C = new Node(0), *D = new Node(0);
        a->left = p; p->parent = a;
        a->right = D; D->parent = a;
        p->left = x; x->parent = p;
        p->right = C; C->parent = p;
        x->left = A; A->parent = x;
        x->right = B; B->parent = x;
        Node* root = a;

        rotate(root, x); // move-to-root: rota (x,p) primero...
        rotate(root, x); // ...luego (x,a)

        assert(root == x);
        // move-to-root SI llega a x en la raiz, pero p y a NO quedan en
        // cascada del mismo lado como en zig-zig: p es hijo IZQUIERDO de x
        // (no colgado bajo el hijo derecho de x, como en el caso correcto).
        bool sameShapeAsZigZig = (x->right == p && p->right == a);
        assert(!sameShapeAsZigZig);
        cout << "OK: invertir el orden (move-to-root) llega a x en la raiz "
                "pero con una forma intermedia distinta a zig-zig -- "
                "consistente con que move-to-root no logra la misma cota "
                "amortizada.\n";
    }

    // --- 3. zig-zag (#66): lados opuestos ---
    {
        // a(p(A,x(B,C)),D)  ->  x(p(A,B),a(C,D))
        Node *a = new Node(0), *p = new Node(0), *x = new Node(0);
        Node *A = new Node(0), *B = new Node(0), *C = new Node(0), *D = new Node(0);
        a->left = p; p->parent = a;
        a->right = D; D->parent = a;
        p->left = A; A->parent = p;
        p->right = x; x->parent = p;
        x->left = B; B->parent = x;
        x->right = C; C->parent = x;
        Node* root = a;

        zigZag(root, x);

        assert(root == x);
        assert(x->left == p && x->right == a);
        assert(p->left == A && p->right == B);
        assert(a->left == C && a->right == D);
        cout << "OK: zig-zag deja a p y a como los DOS HIJOS DIRECTOS de x "
                "(x(p(A,B), a(C,D))), distinto de la cascada de zig-zig -- "
                "igual al diagrama #66.\n";
    }

    // --- 4. Search preserva el inorden y deja x en la raiz ---
    {
        Node* root = buildBalanced(1, 15);
        int sumBefore = inorderSum(root);
        int h0 = height(root);

        bool found = search(root, 1, nullptr); // 1 es la hoja mas profunda
        assert(found);
        assert(root->value == 1);
        assert(inorderSum(root) == sumBefore);
        cout << "OK: Buscar(1) devuelve verdadero, deja 1 en la raiz y "
                "preserva el recorrido inorden (sigue siendo un BST valido). "
                "Altura antes: " << h0
             << ", despues de un solo splay la raiz cambio.\n";
    }

    // --- 5. Caso limite: x ya es la raiz -> Splay es un no-op ---
    {
        Node* root = buildBalanced(1, 7);
        int rootValueBefore = root->value;
        long cost = 0;
        assert(search(root, rootValueBefore, &cost));
        assert(root->value == rootValueBefore);
        assert(cost == 0);
        cout << "OK: Buscar(raiz) cuesta 0 pasos de descenso -- caso limite "
                "de Splay como no-op.\n";
    }

    // --- 5b. Buscar(k) con k AUSENTE (Sem6 #13-14): splay del ULTIMO nodo
    // visitado -- el predecesor o el sucesor de k -- y devolver falso. ---
    {
        // Arbol con huecos, para que existan llaves ausentes "interiores":
        // 20 en la raiz; 10 a su izquierda; 30 a su derecha; 25 como hijo
        // izquierdo de 30; 27 como hijo derecho de 25.
        Node* root = nullptr;
        for (int k : {20, 10, 30, 25, 27}) root = insertPlain(root, new Node(k));
        int sumBefore = inorderSum(root);

        // 26 no esta. El descenso termina en 27 (su SUCESOR), que se splaya.
        assert(!search(root, 26));
        assert(root->value == 27);
        assert(inorderSum(root) == sumBefore); // sigue siendo el mismo BST

        // Sobre el arbol ya reorganizado, buscar 26 otra vez termina en 25
        // (su PREDECESOR): cual de los dos vecinos toca depende del ultimo
        // giro del descenso, pero siempre es uno de los dos.
        assert(!search(root, 26));
        assert(root->value == 25);
        assert(inorderSum(root) == sumBefore);

        // Fuera de rango por ambos lados: minimo y maximo del arbol.
        assert(!search(root, 100));
        assert(root->value == 30); // el maximo es el predecesor de 100
        assert(!search(root, 0));
        assert(root->value == 10); // el minimo es el sucesor de 0
        assert(inorderSum(root) == sumBefore);

        // Arbol vacio: no hay ultimo nodo, no se splaya nada, devuelve falso.
        Node* empty = nullptr;
        assert(!search(empty, 42));
        assert(empty == nullptr);

        cout << "OK: Buscar(k) con k ausente devuelve falso y deja en la raiz "
                "al predecesor o al sucesor de k (Sem6 #13-14), preservando "
                "el inorden. Arbol vacio: falso, sin tocar nada.\n";
    }

    // --- 6. La comparacion que search-sequence-properties dejo sin medir ---
    // n grande para que la diferencia asintotica sea visible.
    const int n = 2000;

    // (a) Acceso secuencial: buscar 1, 2, ..., n en ese orden.
    {
        Node* splayRoot = buildBalanced(1, n);
        Node* staticRoot = buildBalanced(1, n);

        long splayCost = 0, staticCost = 0;
        for (int x = 1; x <= n; x++) {
            search(splayRoot, x, &splayCost);
            staticCost += staticSearchCost(staticRoot, x);
        }

        cout << "\n--- Acceso secuencial 1.." << n << " ---\n";
        cout << "BST estatico (balanceado, nunca reorganiza): " << staticCost
             << " pasos de descenso totales\n";
        cout << "Splay tree (misma raiz inicial, se reorganiza en cada busqueda): "
             << splayCost << " pasos totales\n";
        assert(splayCost < staticCost);
        cout << "Verificado: el splay tree explota la propiedad de acceso "
                "secuencial (search-sequence-properties #70) y sale mas "
                "barato que el BST estatico sobre la MISMA secuencia.\n";
    }

    // (b) Conjunto de trabajo pequeno: repetir pocas llaves muchas veces.
    {
        Node* splayRoot = buildBalanced(1, n);
        Node* staticRoot = buildBalanced(1, n);
        vector<int> workingSet = {37, 501, 1200, 8, 1999};
        const int rounds = 300;

        long splayCost = 0, staticCost = 0;
        for (int r = 0; r < rounds; r++) {
            for (int x : workingSet) {
                search(splayRoot, x, &splayCost);
                staticCost += staticSearchCost(staticRoot, x);
            }
        }

        cout << "\n--- Conjunto de trabajo (" << workingSet.size()
             << " llaves) x " << rounds << " repeticiones ---\n";
        cout << "BST estatico (balanceado, nunca reorganiza): " << staticCost
             << " pasos de descenso totales\n";
        cout << "Splay tree (misma raiz inicial, se reorganiza en cada busqueda): "
             << splayCost << " pasos totales\n";
        assert(splayCost < staticCost);
        cout << "Verificado: el splay tree explota la propiedad del "
                "conjunto de trabajo (search-sequence-properties #71) y "
                "sale mas barato que el BST estatico sobre la MISMA "
                "secuencia repetida.\n";
    }

    return 0;
}
