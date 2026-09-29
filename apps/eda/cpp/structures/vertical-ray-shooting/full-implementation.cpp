// Vertical ray shooting — ray-query por fuerza bruta.
//
// Reduccion del profesor (#22): "si consideramos las rectas verticales
// x = x_i para los puntos de consulta, la respuesta se reducira al menor
// y >= y_i de los segmentos que se intersectan con la recta". Esta es la
// version de fuerza bruta de esa reduccion, O(n) por consulta: para cada
// segmento que cruza x = x_i, calcular la altura del cruce y quedarse con
// el minimo por encima de y_i.
//
// ponytail: fuerza bruta O(n) por consulta; la version O(log n) del curso
// se obtiene reduciendo esto a segment-intersection-sweep-line (otro
// agente) — ver theory.md, "Analisis de complejidad".
//
// Casos degenerados que el material NO resuelve explicitamente (#19-23 no
// los menciona; #58 solo deja abierta la direccion arbitraria del rayo) y
// que esta implementacion decide por convencion, marcados en el codigo:
//   - el rayo pasa exactamente por un extremo de un segmento -> cruce valido
//   - segmentos verticales alineados con x_i -> sin altura de cruce unica,
//     se tratan aparte
//   - el punto de consulta esta sobre un segmento (y_i == altura de cruce)
//     -> se cuenta como cruce valido (frontera inclusiva)

#include <cassert>
#include <iostream>
#include <optional>
#include <vector>

struct Segment {
    double x1, y1, x2, y2;
};

bool is_vertical(const Segment& s) {
    return s.x1 == s.x2;
}

// Rango horizontal cubre x_i (frontera inclusiva: un rayo que pasa
// exactamente por un extremo cuenta como cruce valido).
bool covers_x(const Segment& s, double xq) {
    double lo = s.x1 < s.x2 ? s.x1 : s.x2;
    double hi = s.x1 < s.x2 ? s.x2 : s.x1;
    return xq >= lo && xq <= hi;
}

double crossing_height(const Segment& s, double xq) {
    double t = (xq - s.x1) / (s.x2 - s.x1);
    return s.y1 + t * (s.y2 - s.y1);
}

// Devuelve el indice del primer segmento que toca el rayo vertical hacia
// arriba desde (xq, yq), o -1 si ninguno lo toca. Ignora segmentos
// verticales alineados con xq (caso degenerado, sin altura de cruce unica).
int ray_query_up(const std::vector<Segment>& segs, double xq, double yq) {
    int best = -1;
    double best_y = 0;
    for (std::size_t i = 0; i < segs.size(); i++) {
        const Segment& s = segs[i];
        if (!covers_x(s, xq)) continue;
        if (is_vertical(s)) continue; // degenerado: se resuelve aparte
        double y = crossing_height(s, xq);
        if (y >= yq && (best == -1 || y < best_y)) { // frontera inclusiva: y == yq cuenta
            best = static_cast<int>(i);
            best_y = y;
        }
    }
    return best;
}

// Simetrico: rayo hacia abajo busca el MAYOR y <= yq.
int ray_query_down(const std::vector<Segment>& segs, double xq, double yq) {
    int best = -1;
    double best_y = 0;
    for (std::size_t i = 0; i < segs.size(); i++) {
        const Segment& s = segs[i];
        if (!covers_x(s, xq)) continue;
        if (is_vertical(s)) continue;
        double y = crossing_height(s, xq);
        if (y <= yq && (best == -1 || y > best_y)) {
            best = static_cast<int>(i);
            best_y = y;
        }
    }
    return best;
}

int main() {
    // --- Caso minimo (examples.md): un solo segmento horizontal. ---
    {
        std::vector<Segment> segs = {{2, 5, 10, 5}};
        int hit = ray_query_up(segs, 6, 2);
        assert(hit == 0);
        std::cout << "MINIMO   S=((2,5),(10,5)), consulta (6,2) -> toca S a y=5\n";
    }

    // --- Caso normal: los tres puntos del profesor sobre un mapa con techo
    //     y dos segmentos internos. ---
    {
        std::vector<Segment> segs = {
            {0, 8, 20, 8},   // 0: techo del mapa
            {4, 4, 12, 4},   // 1: segmento bajo (4,12)
            {12, 2, 24, 2},  // 2: segmento bajo (19,4)... y bajo (8,4) tambien
        };
        int hit_4_12 = ray_query_up(segs, 4, 12);
        // (4,12) esta por encima de todos los segmentos que cubren x=4
        // (solo el segmento 0, y=8 < 12): ningun segmento por encima -> -1.
        assert(hit_4_12 == -1);

        int hit_8_4 = ray_query_up(segs, 8, 4);
        // en x=8 cruzan: seg0 (y=8) y seg1 (y=4). El rayo hacia arriba desde
        // y=4 exige y >= 4: seg1 cruza exactamente en y=4 (frontera
        // inclusiva, punto sobre el segmento) y es menor que seg0 -> gana seg1.
        assert(hit_8_4 == 1);

        int hit_19_4 = ray_query_up(segs, 19, 4);
        // en x=19 cruzan: seg0 (y=8) y seg2 (y=2, por debajo de 4, no cuenta).
        // el menor y>=4 es seg0.
        assert(hit_19_4 == 0);

        std::cout << "NORMAL   (4,12)->ninguno por encima, (8,4)->seg1 (y=4, sobre el segmento),"
                     " (19,4)->seg0 (techo)\n";
    }

    // --- Casos limite / degenerados. ---
    {
        // El rayo pasa exactamente por un extremo del segmento: debe contar
        // como cruce valido (frontera inclusiva en covers_x).
        std::vector<Segment> segs = {{5, 3, 5, 3}}; // extremo degenerado: punto, no interesa aqui
        std::vector<Segment> normal = {{0, 0, 10, 6}};
        int hit_endpoint = ray_query_up(normal, 0, 0); // x=0 es el extremo izquierdo
        assert(hit_endpoint == 0);
        assert(covers_x(normal[0], 10)); // el otro extremo tambien cuenta

        // Segmento vertical alineado con x_i: se ignora (sin altura de
        // cruce unica), no rompe la consulta ni se cuela como resultado.
        std::vector<Segment> con_vertical = {{4, 0, 4, 10}, {0, 5, 8, 5}};
        int hit_vertical = ray_query_up(con_vertical, 4, 1);
        assert(hit_vertical == 1); // ignora el segmento 0 (vertical), toma el 1

        // Punto de consulta exactamente sobre un segmento: cuenta como
        // cruce valido (y == yq, frontera inclusiva).
        std::vector<Segment> sobre = {{0, 5, 10, 5}};
        int hit_on_segment = ray_query_up(sobre, 5, 5);
        assert(hit_on_segment == 0);

        // Rayo hacia abajo: simetrico, mayor y <= yq.
        std::vector<Segment> abajo = {{0, 2, 10, 2}, {0, 6, 10, 6}};
        int hit_down = ray_query_down(abajo, 5, 8);
        assert(hit_down == 1); // el mayor y<=8 es 6, no 2

        std::cout << "LIMITE   extremo de segmento: valido | segmento vertical alineado: ignorado,"
                     " se usa el siguiente | punto sobre segmento: valido | rayo hacia abajo: simetrico\n";
    }

    std::cout << "\nOK: ray-query reduce PPL a 'menor segmento por encima' y "
                 "los casos degenerados (extremo, vertical, sobre el segmento) "
                 "quedan resueltos por convencion.\n";
    return 0;
}
