// Implementación completa del MODELO de retroactividad (retroactivity es
// `type: concept`, no una estructura concreta). Junta los pasos 1-4 sobre
// una estructura mínima: un contador cuya línea de tiempo son operaciones
// add(x). main() demuestra, con asserts, que el presente cambia al alterar
// el pasado — sin que la versión anterior siga existiendo en paralelo
// (eso sería persistencia, no retroactividad) — y compara el modelo contra
// la solución ingenua "rehacer desde el principio" que da el mazo.
//
// Todo aquí es DERIVADO: el mazo (páginas 8-20) da las firmas
// Insert(t, op)/Delete(t)/Query(t, op) y la taxonomía parcial/completa,
// pero ningún pseudocódigo ni ejemplo numérico.

#include <algorithm>
#include <cassert>
#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

struct Op {
    double time; // el t del modelo; real para poder insertar "entre" dos operaciones existentes
    int delta;   // el efecto de add(delta) sobre el contador
};

struct RetroactiveCounter {
    vector<Op> timeline; // invariante: siempre ordenado por time ascendente

    // Insert-retroactive(t, op): Algoritmo derivado, O(m) por el
    // desplazamiento del insert() sobre un vector ordenado.
    void insertRetroactive(double t, int delta) {
        Op entry{t, delta};
        auto pos = upper_bound(
            timeline.begin(), timeline.end(), entry,
            [](const Op& a, const Op& b) { return a.time < b.time; });
        timeline.insert(pos, entry);
    }

    // Delete-retroactive(t): Algoritmo derivado, O(m) por la búsqueda lineal
    // de la entrada en tiempo t.
    void deleteRetroactive(double t) {
        auto it = find_if(timeline.begin(), timeline.end(),
                           [t](const Op& o) { return o.time == t; });
        if (it == timeline.end())
            throw invalid_argument("delete-retroactive: no hay operacion en ese tiempo");
        timeline.erase(it);
    }

    // Query(t): Algoritmo derivado, O(m). Recalcula por fuerza bruta el
    // estado en el tiempo t cada vez que se llama — nunca lee un valor
    // cacheado. Esto es exactamente el "recalcular el presente" del modelo:
    // no es un paso separado de Insert/Delete-retroactive, es lo que Query
    // hace siempre.
    int query(double t) const {
        int total = 0;
        for (const Op& o : timeline) {
            if (o.time <= t) total += o.delta;
            else break; // ordenado por tiempo: nada más que ver
        }
        return total;
    }

    size_t size() const { return timeline.size(); }
};

int main() {
    RetroactiveCounter c;

    // --- Mínimo (examples.md): una sola operación. ---
    c.insertRetroactive(1, 5);
    assert(c.query(1) == 5);
    assert(c.query(100) == 5); // "ahora" también ve la única operación
    assert(c.size() == 1);
    cout << "MINIMO   una linea de tiempo con una sola operacion add(5)@1:\n"
         << "         Query(1) = Query(ahora) = 5 -- verificado\n";

    // --- Normal (examples.md): tres operaciones, luego una insercion
    // retroactiva ENTRE la primera y la segunda. ---
    c.insertRetroactive(2, 3);
    c.insertRetroactive(3, 10);
    assert(c.query(1e9) == 18); // 5 + 3 + 10, "ahora"
    cout << "NORMAL   add(5)@1, add(3)@2, add(10)@3 -- Query(ahora) = 18 -- verificado\n";

    int antes = c.query(1e9);
    c.insertRetroactive(1.5, 100); // retroactivo: se inserta EN EL PASADO, entre t=1 y t=2
    int despues = c.query(1e9);
    assert(antes == 18);
    assert(despues == 118);
    assert(antes != despues); // el presente SI cambio al editar el pasado
    cout << "         Insert-retroactive(1.5, add(100)) -- Query(ahora) paso de "
         << antes << " a " << despues
         << " -- el presente se actualizo al modificar el pasado (RETROACTIVIDAD)\n";

    // La diferencia con persistencia: no queda ninguna version "18" viva en
    // paralelo. Solo hay una linea de tiempo, y solo se puede consultar el
    // resultado ACTUAL de recorrerla -- no existe una "version anterior a la
    // insercion" que Query pueda ver.
    assert(c.query(1e9) == 118); // sigue siendo 118, no volvio a 18 en ningun momento
    cout << "         Query(ahora) sigue dando 118 -- no existe una version 'con 18'\n"
         << "         consultable en paralelo (asi se distingue de persistencia)\n";

    // Retroactividad COMPLETA: se puede consultar un tiempo intermedio del
    // pasado, no solo el presente.
    assert(c.query(1.5) == 105);  // 5 + 100 (add(3)@2 y add(10)@3 aun no ocurrieron)
    assert(c.query(1.4) == 5);    // justo antes de la insercion retroactiva: solo add(5)@1
    cout << "         Query(1.5) = 105, Query(1.4) = 5 -- Query en tiempos pasados\n"
         << "         distintos da resultados distintos (retroactividad COMPLETA)\n";

    // --- Limite (examples.md): borrar la operacion MAS ANTIGUA fuerza a
    // rehacer todas las que quedan -- el caso O(m) completo. ---
    c.deleteRetroactive(1); // elimina add(5)@1
    assert(c.size() == 3);
    assert(c.query(1e9) == 113); // 100 + 3 + 10, sin el add(5) original
    cout << "LIMITE   Delete-retroactive(1) borra add(5)@1 -- Query(ahora) paso de "
         << despues << " a " << c.query(1e9)
         << " -- borrar el pasado tambien propaga el efecto al presente\n";

    // Borrar un tiempo que no existe: la version ingenua debe rechazarlo,
    // no fallar en silencio.
    bool rechazado = false;
    try {
        c.deleteRetroactive(1); // ya se borro antes
    } catch (const invalid_argument&) {
        rechazado = true;
    }
    assert(rechazado);
    cout << "         Delete-retroactive(1) otra vez (ya no existe): RECHAZADO -- verificado\n";

    cout << "\nOK: retroactividad es UNA linea de tiempo que se reescribe -- el\n"
            "presente siempre refleja la ultima edicion del pasado, sin que\n"
            "ninguna version anterior quede consultable en paralelo.\n";
    return 0;
}
