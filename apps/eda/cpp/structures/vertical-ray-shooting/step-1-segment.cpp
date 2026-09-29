// Paso 1 — el segmento, nada más.
//
// Un segmento se guarda por sus dos extremos. Para ray-query sólo importan
// dos cosas de cada segmento: si su rango en x cubre la vertical x_i de la
// consulta, y a qué altura y cruza esa vertical.

struct Segment {
    double x1, y1, x2, y2;
};

// Un segmento vertical tiene x1 == x2: no cruza x_i en un único punto si
// x_i == x1, así que se trata aparte (paso 2).
bool is_vertical(const Segment& s) {
    return s.x1 == s.x2;
}

// ¿El rango horizontal del segmento cubre x_i? (frontera inclusiva: un
// rayo que pasa exactamente por un extremo cuenta como cruce válido).
bool covers_x(const Segment& s, double xq) {
    double lo = s.x1 < s.x2 ? s.x1 : s.x2;
    double hi = s.x1 < s.x2 ? s.x2 : s.x1;
    return xq >= lo && xq <= hi;
}
