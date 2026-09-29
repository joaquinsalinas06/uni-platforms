// Paso 2 — ray-query por fuerza bruta: para cada segmento que cruza la
// vertical del punto, calcular la altura del cruce y quedarse con el mínimo
// por encima del punto (rayo hacia arriba).
//
// Reduccion del profesor (#22): "la respuesta se reducira al menor y >= y_i
// de los segmentos que se intersectan con la recta x = x_i".

#include "step-1-segment.cpp"
#include <optional>
#include <vector>
using namespace std;

// Altura a la que el segmento (no vertical) cruza x = xq.
double crossing_height(const Segment& s, double xq) {
    double t = (xq - s.x1) / (s.x2 - s.x1);
    return s.y1 + t * (s.y2 - s.y1);
}

// Devuelve el indice del primer segmento que toca el rayo vertical hacia
// arriba desde (xq, yq), o -1 si ninguno lo toca.
// ponytail: fuerza bruta O(n) por consulta; la version O(log n) del curso
// se construye reduciendo a segment-intersection-sweep-line (ver theory.md).
int ray_query_up(const vector<Segment>& segs, double xq, double yq) {
    int best = -1;
    double best_y = 0;
    for (size_t i = 0; i < segs.size(); i++) {
        const Segment& s = segs[i];
        if (!covers_x(s, xq)) continue;
        if (is_vertical(s)) continue; // caso degenerado: sin altura de cruce unica (paso 3 / full)
        double y = crossing_height(s, xq);
        if (y >= yq && (best == -1 || y < best_y)) {
            best = (int)i;
            best_y = y;
        }
    }
    return best;
}
