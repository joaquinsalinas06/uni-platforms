// Planar Point Location — implementacion completa.
//
// El profesor (Sem4_Planar_Point_Location.pdf) plantea PPL como un problema,
// no una estructura: dada una subdivision del plano en caras y un punto,
// ¿en que cara cae? El mazo entero es una cadena de reducciones (PPL ->
// vertical ray shooting -> interseccion de segmentos -> RSQ / BBST +
// persistencia) y no trae pseudocodigo ni codigo propio para "locate".
//
// Lo que sigue es fuerza bruta -- derivada para este tema, no aparece en las
// diapositivas -- que resuelve "locate" probando cada cara con un test de
// punto en poligono por conteo de cruces. Sirve de linea base (O(F*V)) y de
// oraculo para verificar, mas adelante, las tecnicas eficientes a las que el
// profesor reduce el problema.
//
// edge-update (insertar/eliminar aristas, #17) no se implementa: el mazo
// solo la enuncia, sin algoritmo -- inventarlo violaria la fidelidad al
// material (ver operations/edge-update.md).
#include <cassert>
#include <iostream>
#include <string>
#include <vector>

struct Point {
    double x;
    double y;
};

struct Face {
    std::string label;
    std::vector<Point> polygon;
};

const std::string INFINITE_FACE = "region-infinita";

bool pointInPolygon(const Point& p, const std::vector<Point>& polygon) {
    bool inside = false;
    int n = static_cast<int>(polygon.size());
    for (int i = 0, j = n - 1; i < n; j = i++) {
        const Point& a = polygon[i];
        const Point& b = polygon[j];
        bool straddles = (a.y > p.y) != (b.y > p.y);
        if (straddles) {
            double xCross = a.x + (p.y - a.y) * (b.x - a.x) / (b.y - a.y);
            if (p.x < xCross) {
                inside = !inside;
            }
        }
    }
    return inside;
}

// ponytail: O(F * V) -- linea base de fuerza bruta, no la cota reducida
// O(log n) que da el profesor (#51) via persistencia sobre el BBST.
std::string locateBruteForce(const Point& p, const std::vector<Face>& faces) {
    for (const Face& face : faces) {
        if (pointInPolygon(p, face.polygon)) {
            return face.label;
        }
    }
    return INFINITE_FACE;
}

int main() {
    // Mapa derivado (no aparece en las diapositivas): dos caras cuadradas
    // disjuntas, para ilustrar caras disjuntas + region infinita (#64).
    std::vector<Face> faces = {
        {"cara-A", {{0, 0}, {8, 0}, {8, 10}, {0, 4}}},
        {"cara-B", {{14, 2}, {21, 1}, {19, 4}}},
    };

    // Caso normal: puntos claramente dentro de cada cara.
    assert(locateBruteForce({4, 2}, faces) == "cara-A");
    std::cout << "verificado: (4,2) localiza en cara-A" << std::endl;

    assert(locateBruteForce({18, 2}, faces) == "cara-B");
    std::cout << "verificado: (18,2) localiza en cara-B" << std::endl;

    // Caso limite: punto fuera de toda cara acotada -> region infinita (#64).
    assert(locateBruteForce({40, 40}, faces) == INFINITE_FACE);
    std::cout << "verificado: (40,40) localiza en la region infinita" << std::endl;

    // Caso limite: caras disjuntas -- un punto entre ambas tampoco cae en
    // ninguna, distinto del punto lejano de arriba.
    assert(locateBruteForce({10, 6}, faces) == INFINITE_FACE);
    std::cout << "verificado: (10,6), entre las dos caras disjuntas, "
              << "tambien cae en la region infinita" << std::endl;

    // Caso limite: mapa vacio (sin caras) -- todo punto es region infinita.
    std::vector<Face> emptyMap;
    assert(locateBruteForce({0, 0}, emptyMap) == INFINITE_FACE);
    std::cout << "verificado: con el mapa vacio, todo punto es la region "
              << "infinita" << std::endl;

    // Ejemplo del profesor (#9): los tres puntos de consulta sobre el mapa
    // grande del mazo, usando solo dos de sus caras acotadas -- el mazo no
    // da las caras completas del mapa (solo los vertices del dibujo, sin
    // decir que arista conecta con cual), asi que se aproximan con
    // poligonos que SI dejan a cada punto estrictamente adentro, no sobre
    // el borde -- estar exactamente sobre una arista es un caso limite
    // aparte (ver operations/locate.md).
    std::vector<Face> profesorMapa = {
        {"cara-0-0", {{0, 0}, {10, 0}, {10, 10}, {0, 4}}},
        {"cara-14-2", {{10, 0}, {30, 0}, {19, 20}}},
    };
    assert(locateBruteForce({8, 4}, profesorMapa) == "cara-0-0");
    std::cout << "verificado: (8,4) del ejemplo del profesor (#9) localiza "
              << "en la cara aproximada alrededor de (0,0)-(0,4)" << std::endl;

    assert(locateBruteForce({19, 4}, profesorMapa) == "cara-14-2");
    std::cout << "verificado: (19,4) del ejemplo del profesor (#9) localiza "
              << "en la cara aproximada alrededor de (14,2)-(19,4)" << std::endl;

    assert(locateBruteForce({4, 12}, profesorMapa) == INFINITE_FACE);
    std::cout << "verificado: (4,12) del ejemplo del profesor (#9) cae "
              << "fuera de las dos caras aproximadas -- region infinita "
              << "en esta aproximacion" << std::endl;

    std::cout << "todas las verificaciones de locate (fuerza bruta) "
              << "pasaron" << std::endl;
    return 0;
}
