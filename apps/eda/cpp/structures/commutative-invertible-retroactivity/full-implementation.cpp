// Implementacion completa — commutative-invertible-retroactivity
// ("El caso facil": operaciones conmutativas e invertibles).
//
// Parte A (Accumulator): Add(delta) conmuta y es invertible. Se demuestra
// que insert_retroactive/delete_retroactive cuestan O(1) -- la MISMA
// llamada que la operacion original, sin overhead -- y que el presente
// sale correcto sin rehacer nada del historial.
//
// Parte B (LastValueHistory): Assign(v), "ultimo valor visto", NO conmuta.
// Se demuestra el contraste explicito que es el punto del tema: el mismo
// truco ("aplicar la operacion ahora, ignorando el tiempo real") da una
// respuesta INCORRECTA en cuanto hay una operacion real mas reciente que
// la insertada retroactivamente. Ahi la tecnica falla y hace falta rehacer
// la secuencia ordenada por tiempo (el costo O(m) que retroactivity ya
// describe como la solucion ingenua).

#include <algorithm>
#include <cassert>
#include <iostream>
#include <utility>
#include <vector>

// ---------------------------------------------------------------------
// Parte A: Add(delta) -- conmutativa e invertible.
// ---------------------------------------------------------------------
class Accumulator {
public:
  void add(int delta) { total_ += delta; }
  int total() const { return total_; }

  // Insert(t, Add(delta)) ≡ Insert(ahora, Add(delta)), por conmutatividad.
  void insert_retroactive(int delta) { add(delta); }

  // Delete(t) ≡ Insert(ahora, Add(-delta)), por invertibilidad, si en t
  // estaba Add(delta).
  void delete_retroactive(int delta) { add(-delta); }

private:
  int total_ = 0;
};

// ---------------------------------------------------------------------
// Parte B: Assign(v) -- NO conmuta. El truco de la parte A aplicado tal
// cual da una respuesta incorrecta.
// ---------------------------------------------------------------------
class LastValueHistory {
public:
  void assign(int time, int value) { history_.push_back({time, value}); }

  // Correcto: rehacer ordenado por tiempo. Esto es el costo O(m) que la
  // tecnica de esta semana existe para evitar -- y que aqui SI hay que
  // pagar, porque Assign no conmuta.
  int correct_present_value() const {
    std::vector<std::pair<int, int>> sorted = history_;
    std::sort(sorted.begin(), sorted.end());
    return sorted.empty() ? 0 : sorted.back().second;
  }

  // Incorrecto: el mismo truco de insert_retroactive, "aplicar ahora sin
  // mirar el tiempo real". Falla en cuanto una operacion real mas
  // reciente deberia ganar sobre la insertada retroactivamente.
  int wrongly_applied_now_value() const {
    if (history_.empty()) return 0;
    return history_.back().second;
  }

private:
  std::vector<std::pair<int, int>> history_;
};

int main() {
  // --- Parte A: Add conmuta y es invertible -> retroactividad casi gratis. ---
  {
    Accumulator acc;
    acc.add(4); // Insert("b") real en t=1, analogo del ejemplo de tabla hash
    acc.add(5); // Insert("c") real en t=2
    assert(acc.total() == 9);

    // Insertar retroactivamente Add(+2) "en t=0" (antes de todo). Por
    // conmutatividad, da igual que se aplique ahora.
    acc.insert_retroactive(2);
    assert(acc.total() == 11); // 9 + 2, sin rehacer add(4) ni add(5)

    // Borrar retroactivamente esa misma operacion: aplicar su inversa ahora.
    acc.delete_retroactive(2);
    assert(acc.total() == 9); // vuelve exactamente al estado previo

    std::cout << "PARTE A (Add, conmutativa e invertible)\n"
              << "  historial real: add(4), add(5) -> total = 9\n"
              << "  insert_retroactive(2) [O(1), = add(2)]     -> total = 11\n"
              << "  delete_retroactive(2) [O(1), = add(-2)]    -> total = 9\n"
              << "  verificado: presente correcto sin rehacer nada del historial\n\n";
  }

  // --- Parte B: Assign NO conmuta -> el mismo truco da una respuesta
  // incorrecta en cuanto hay una operacion real mas reciente. ---
  {
    LastValueHistory h;
    h.assign(1, 5); // Assign(5) real en t=1
    h.assign(2, 9); // Assign(9) real en t=2 -- esta debe ganar en el presente
    assert(h.correct_present_value() == 9);

    // Insertar retroactivamente Assign(3) "en t=0" (antes de t=1 y t=2).
    // Como t=2 es mas reciente, el valor correcto en el presente SIGUE
    // siendo 9 -- Assign(3) queda sepultado por Assign(9).
    h.assign(0, 3);
    int correct = h.correct_present_value();       // rehace ordenado por tiempo: sigue en 9
    int wrongly_now = h.wrongly_applied_now_value(); // aplica "ahora": ultimo insertado, 3

    assert(correct == 9);       // el presente real no cambio
    assert(wrongly_now == 3);   // el truco de la parte A dice que si cambio: INCORRECTO
    assert(correct != wrongly_now); // exactamente el fallo que demuestra el contraste

    std::cout << "PARTE B (Assign, NO conmuta -- contraejemplo)\n"
              << "  historial real: assign(t=1,5), assign(t=2,9) -> presente correcto = 9\n"
              << "  insertar retroactivamente assign(t=0,3) (antes de todo)\n"
              << "  presente correcto (rehaciendo ordenado por tiempo) = " << correct << "\n"
              << "   'aplicado ahora' (el truco de la parte A, mal aplicado) = " << wrongly_now << "\n"
              << "  verificado: difieren -- el truco falla porque Assign no conmuta,\n"
              << "  y aqui si hace falta rehacer la secuencia ordenada por tiempo\n\n";
  }

  std::cout << "OK: conmutativa + invertible = retroactividad casi gratis (Parte A);"
               " sin conmutatividad, el mismo truco falla (Parte B).\n";
  return 0;
}
