// Paso 1 — la reformulación como rayos, nada más.
// Un punto (y,z) se convierte en un rayo vertical hacia z=+inf; la consulta
// (b2,b3) se convierte en un rayo horizontal hacia y=-inf. Un punto está
// dominado (y<=b2 y z<=b3) exactamente cuando su rayo vertical es atravesado
// por el rayo horizontal de la consulta (#20-21).

struct Point {
    double y, z;
};

// El rayo vertical de p es cruzado por el rayo horizontal de la consulta
// (b2, b3) si y solo si p.y <= b2 (el rayo vertical está a la izquierda de
// donde entra el rayo horizontal) y p.z <= b3 (el rayo vertical arranca a
// una altura no mayor que la del rayo horizontal).
bool rayoCruzaConsulta(const Point& p, double b2, double b3) {
    return p.y <= b2 && p.z <= b3;
}
