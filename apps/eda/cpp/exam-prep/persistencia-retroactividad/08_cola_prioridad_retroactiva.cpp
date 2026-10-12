// Cola de Prioridad Retroactiva (Timeline, Replay y Concepto de Puentes)
// Operaciones: Insert(t, key) y DeleteMin(t).
// Replay completo O(m log m) vs. Replay desde el ultimo puente O(k log k).

#include <algorithm>
#include <iostream>
#include <vector>

using namespace std;

struct Op {
  double t;
  bool isInsert;  // true: Insert(key); false: DeleteMin()
  int key;
};

class RetroactivePQ {
 public:
  // INSERCION DE OPERACION EN EL TIEMPO:
  // Mantiene la linea de tiempo siempre ordenada por 't'.
  void insertOp(double t, bool isInsert, int key = 0) {
    Op op{t, isInsert, key};
    auto it = lower_bound(timeline_.begin(), timeline_.end(), t,
                          [](const Op& a, double val) { return a.t < val; });
    timeline_.insert(it, op);
  }

  // EL METODO REPLAY (Reproducir la historia):
  // Ejecuta cronologicamente la linea de tiempo para conocer el estado
  // de la cola de prioridad en el presente (o en cualquier instante).
  vector<int> replay() const {
    vector<int> q;  // Mantenemos la cola ordenada (simulando priority queue)
    for (const auto& op : timeline_) {
      if (op.isInsert) {
        auto pos = lower_bound(q.begin(), q.end(), op.key);
        q.insert(pos, op.key);  // Inserta manteniendo orden
      } else {
        if (!q.empty()) {
          q.erase(q.begin());  // Delete-Min: extrae el menor elemento
        }
      }
    }
    return q;  // Estado final de la cola
  }

  // CONCEPTO DE PUENTES (Bridges):
  // Un tiempo t es un PUENTE si la cola queda completamente vacia en ese instante.
  // Propiedad crucial del examen: Si t es un puente, NADA insertado antes de t
  // puede sobrevivir despues de t. Por lo tanto, para saber el estado actual
  // NO hace falta re-reproducir desde t=0: basta reproducir desde el ultimo puente.
  double findLastEmptyBridge() const {
    int count = 0;
    double lastBridge = 0.0;
    for (const auto& op : timeline_) {
      if (op.isInsert) count++;
      else count = max(0, count - 1);

      if (count == 0) {
        lastBridge = op.t;  // La cola quedo vacia aqui: corte limpio de la historia
      }
    }
    return lastBridge;
  }

  const vector<Op>& timeline() const { return timeline_; }

 private:
  vector<Op> timeline_;
};

int main() {
  RetroactivePQ pq;

  // Construimos una linea de tiempo con inserciones y eliminaciones
  pq.insertOp(1.0, true, 50);   // t=1: insert 50
  pq.insertOp(2.0, true, 20);   // t=2: insert 20
  pq.insertOp(3.0, false);      // t=3: del-min (elimina 20)
  pq.insertOp(4.0, false);      // t=4: del-min (elimina 50 -> COLA QUEDA VACIA: PUENTE)
  pq.insertOp(5.0, true, 80);   // t=5: insert 80
  pq.insertOp(6.0, true, 30);   // t=6: insert 30

  cout << "Ultimo puente vacio encontrado en t = " << pq.findLastEmptyBridge()
       << " (esperado: 4.0)\n";

  // Replay completo
  vector<int> estado = pq.replay();
  cout << "Elementos presentes en la cola ahora: [ ";
  for (int x : estado) cout << x << " ";
  cout << "] (esperado: 30 80)\n";

  // INSERCION RETROACTIVA:
  // Insertamos una llave muy pequenia (10) en el pasado (t = 2.5)
  cout << "\n--- Insert retroactivo en t = 2.5 (insert 10) ---\n";
  pq.insertOp(2.5, true, 10);

  // Al re-reproducir, el 10 es absorbido por el del-min de t=3,
  // por lo que el puente y los sobrevivientes finales cambian de acuerdo a la historia.
  vector<int> nuevoEstado = pq.replay();
  cout << "Elementos presentes tras la insercion retroactiva: [ ";
  for (int x : nuevoEstado) cout << x << " ";
  cout << "]\n";

  return 0;
}
