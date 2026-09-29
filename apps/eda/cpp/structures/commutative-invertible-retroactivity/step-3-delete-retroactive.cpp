// Paso 3 — Delete retroactivo: Delete(t) ≡ Insert(ahora, op^-1), por
// invertibilidad. Si en t habia Add(delta), su inversa es Add(-delta): se
// aplica ahora y cancela exactamente el efecto de la operacion borrada, sin
// tener que localizar t ni rehacer nada entre t y el presente.

class Accumulator {
public:
  void add(int delta) { total_ += delta; }
  int total() const { return total_; }

  void insert_retroactive(int delta) { add(delta); }

  // Delete(t) donde la operacion que estaba en t era Add(delta). Se reduce
  // a insertar la inversa, Add(-delta), ahora.
  void delete_retroactive(int delta) { add(-delta); }

private:
  int total_ = 0;
};
