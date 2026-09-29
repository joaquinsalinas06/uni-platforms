// El modelo pointer machine — no es una estructura, es un modelo de cómputo
// (content/structures/pointer-machine/theory.md, semana 3, diapositiva 5,
// páginas 9-12). Las tres reglas que se instrumentan aquí:
//
//   1. Cada nodo tiene O(1) campos (datos y/o punteros a otros nodos).
//   2. Hay un único nodo raíz: el único punto de entrada a la estructura.
//   3. Cada operación (leer un campo, escribir un campo, seguir un puntero)
//      cuesta O(1).
//
// Lo que se implementa: una cadena de nodos mínima que respeta el modelo
// (sólo campos y punteros; nunca aritmética de direcciones ni acceso
// indexado) y un contador de operaciones del modelo (PointerMachineCounter)
// que instrumenta "seguir un puntero" y "leer un campo" cada vez que se
// invocan. El programa recorre la cadena y compara ese conteo contra lo que
// costaría indexar un arreglo equivalente, mostrando en qué se diferencia
// un modelo de otro: en el arreglo, llegar a la posición k es 1 operación
// (aritmética de direcciones); en la máquina de punteros, son k operaciones
// (seguir k punteros desde la raíz) — el caso límite descrito en
// examples.md.

#include <cassert>
#include <cstdint>
#include <iostream>
#include <vector>

// Contador global de operaciones del modelo: cada "seguir puntero" o
// "leer campo" se registra aquí. No es parte del modelo en sí (el modelo no
// se instrumenta a sí mismo) — es la herramienta con la que este programa
// observa cuántas operaciones O(1) hacen falta para llegar a un nodo.
struct PointerMachineCounter {
  long long follows = 0; // veces que se siguió un puntero (regla 3)
  long long reads = 0;   // veces que se leyó el campo dato de un nodo (regla 3)
};

// Nodo del modelo: exactamente O(1) campos -- un dato y un puntero al
// siguiente nodo. Nada de índices, nada de aritmética de direcciones: la
// única forma de llegar de un nodo a otro es a través del campo `next`.
struct Node {
  int data;
  Node* next = nullptr;
};

// Construye una cadena de `n` nodos con datos 0..n-1 y devuelve la raíz
// (regla 2: único punto de entrada). El llamador es dueño de liberar los
// nodos (ver `free_chain`).
Node* build_chain(int n) {
  Node* root = nullptr;
  Node* tail = nullptr;
  for (int i = 0; i < n; ++i) {
    Node* node = new Node{i, nullptr};
    if (!root) {
      root = node;
    } else {
      tail->next = node;
    }
    tail = node;
  }
  return root;
}

void free_chain(Node* root) {
  while (root) {
    Node* next = root->next;
    delete root;
    root = next;
  }
}

// Lee el dato del nodo en la posición `k` desde la raíz, siguiendo
// únicamente punteros (regla 2 + regla 3): no hay otra forma de llegar bajo
// este modelo. Cuenta cada operación en `counter`.
int read_at(Node* root, int k, PointerMachineCounter& counter) {
  Node* cur = root; // arrancar en la raíz: regla 2
  for (int i = 0; i < k; ++i) {
    assert(cur != nullptr && "posición fuera de la cadena");
    cur = cur->next;   // seguir un puntero: regla 3, O(1) esta operación
    ++counter.follows;
  }
  assert(cur != nullptr);
  ++counter.reads;      // leer el campo dato: regla 3, O(1) esta operación
  return cur->data;
}

// Contraparte de máquina RAM: acceder a la posición k de un arreglo es
// aritmética de direcciones, una sola operación sin importar k. Esto es
// exactamente lo que el modelo pointer machine NO permite (theory.md,
// comparación con estructuras relacionadas).
int read_array_at(const std::vector<int>& arr, int k) {
  return arr[k]; // O(1) sin seguir nada -- no existe como operación del modelo
}

int main() {
  // Caso normal: cadena de 4 nodos, igual en forma a la figura del mazo
  // (raíz -> 7 -> 2 -> 7 -> 42), aunque aquí con datos 0..3 para simplificar
  // el conteo.
  {
    Node* root = build_chain(4);
    PointerMachineCounter counter;

    int value = read_at(root, 3, counter); // llegar al último nodo (k=3)
    assert(value == 3);
    // Para llegar a la posición 3 hace falta seguir 3 punteros (regla 3),
    // más 1 lectura final del campo dato -- exactamente lo que se traza en
    // examples.md ("Normal").
    assert(counter.follows == 3);
    assert(counter.reads == 1);

    std::cout << "cadena de 4 nodos, leer posicion 3: "
              << counter.follows << " punteros seguidos, "
              << counter.reads << " lectura de campo\n";

    free_chain(root);
  }

  // Caso límite: cadena de n nodos, llegar al último. El costo crece
  // linealmente con n -- O(n) operaciones de seguir-puntero, cada una O(1)
  // individualmente (examples.md, "Límite"). Es justo lo que distingue al
  // modelo de un arreglo indexado.
  {
    const int n = 100;
    Node* root = build_chain(n);
    PointerMachineCounter counter;

    int value = read_at(root, n - 1, counter);
    assert(value == n - 1);
    assert(counter.follows == n - 1); // n-1 punteros para llegar al último
    assert(counter.reads == 1);

    // Contraste: el arreglo equivalente llega a la misma posición sin
    // seguir nada -- 0 "operaciones de puntero", por definición no
    // representable como conteo de follows bajo este modelo.
    std::vector<int> arr(n);
    for (int i = 0; i < n; ++i) arr[i] = i;
    int array_value = read_array_at(arr, n - 1);
    assert(array_value == n - 1);

    std::cout << "cadena de " << n << " nodos, llegar al ultimo: "
              << counter.follows << " punteros seguidos (O(n))\n";
    std::cout << "arreglo equivalente, mismo acceso: 0 punteros seguidos, "
                 "1 operacion de indexado (O(1))\n";

    free_chain(root);
  }

  std::cout << "OK: el costo de llegar a un nodo crece con su profundidad "
               "bajo el modelo pointer machine; el arreglo indexado no.\n";
  return 0;
}
