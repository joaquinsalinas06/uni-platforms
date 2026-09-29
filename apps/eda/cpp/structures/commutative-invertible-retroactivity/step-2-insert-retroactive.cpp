// Paso 2 — Insert retroactivo: Insert(t, op) ≡ Insert(ahora, op), por
// conmutatividad. No se representa la linea de tiempo en absoluto: no hace
// falta, porque no importa en que posicion "real" caeria op, el efecto
// sobre el presente es el mismo. insert_retroactive es, literalmente, add.

class Accumulator {
public:
  void add(int delta) { total_ += delta; }
  int total() const { return total_; }

  // Insert(t, Add(delta)) para cualquier t pasado. El parametro t ni
  // siquiera se necesita: por conmutatividad da igual insertarlo en
  // cualquier punto del historial que aplicarlo ahora mismo.
  void insert_retroactive(int delta) { add(delta); }

private:
  int total_ = 0;
};
