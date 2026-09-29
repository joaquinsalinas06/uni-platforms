// Paso 1 — la base que YA se conoce, traída tal cual de
// /structures/splay-tree: nodo con punteros a padre/izq/der, rotate
// genérico O(1), los tres casos de Splay (zig #64, zig-zig #65, zig-zag
// #66 del mazo de la semana 5) y el bucle Splay(x) (#10 de este mazo).
//
// Nada de este archivo es nuevo: está acá sólo para que los pasos 2-5
// tengan de dónde colgar. Lo único añadido es `splayCalls`, el contador
// que instrumenta el conteo de llamadas del #20 — sin él no se puede
// verificar la afirmación central del tema.
//
// La pieza que sí es de este mazo es Buscar(k) (#13): a diferencia del
// Search de la semana 5, éste devuelve un booleano y, cuando k NO está,
// splaya el ÚLTIMO nodo visitado — el predecesor o sucesor de k (#14).
// Esa precondición es la que después hace a Separar O(1).

// Contador de llamadas a Splay. Es la instrumentación del #20:
//   Buscar, Insertar: 1 · Unir: 1 · Eliminar: 2 · Separar: 0 propias.
long splayCalls = 0;

struct Node {
    int value;
    Node* parent = nullptr;
    Node* left = nullptr;
    Node* right = nullptr;

    explicit Node(int v) : value(v) {}
};

// rotate genérico: promueve x sobre SU padre actual, decidiendo
// left/right rotation según de qué lado cuelga x. O(1) por el modelo BST.
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

// Zig-zig: rota (p, a) PRIMERO, luego (x, p) — ver splay-tree/zig-zig.
void zigZig(Node*& root, Node* x) {
    Node* p = x->parent;
    rotate(root, p);
    rotate(root, x);
}

void zigZag(Node*& root, Node* x) {
    rotate(root, x);
    rotate(root, x);
}

// Splay(x) (#10): mientras x no sea la raíz, aplicar el caso que
// corresponda. Una llamada cuenta como una llamada aunque x ya sea raíz
// (el bucle no se ejecuta) — así lo cuenta el #20.
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

// Buscar(k) (#13): descenso estándar de BST. Si k está, lo splaya y
// devuelve verdadero. Si no está, splaya el último nodo visitado — el
// predecesor o sucesor de k (#14) — y devuelve falso.
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
