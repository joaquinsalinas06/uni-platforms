// Paso 1 — la estructura de base: un acumulador con una sola operación,
// Add(delta), que es CONMUTATIVA (sumar en cualquier orden da el mismo
// total) e INVERTIBLE (la inversa de Add(delta) es Add(-delta)). Estas dos
// propiedades son la condición que toda esta técnica necesita — no se
// prueban aquí, se heredan de la aritmética de enteros.

class Accumulator {
public:
  void add(int delta) { total_ += delta; }
  int total() const { return total_; }

private:
  int total_ = 0;
};
