// Planar Point Location — paso 1: los tipos base.
//
// El mazo (Sem4_Planar_Point_Location.pdf) no trae pseudocodigo ni codigo
// para esta operacion: es una cadena de reducciones (PPL -> vertical ray
// shooting -> interseccion de segmentos -> RSQ / BBST + persistencia).
// Lo que sigue aqui es fuerza bruta, derivada para este tema, que sirve de
// linea base y de oraculo para verificar las tecnicas eficientes que vienen
// despues.
#include <string>
#include <vector>

struct Point {
    double x;
    double y;
};

// Una cara del mapa planar: una etiqueta y su contorno como poligono simple
// (lista ordenada de vertices). El contorno se recorre como si el ultimo
// vertice se conectara de vuelta al primero.
struct Face {
    std::string label;
    std::vector<Point> polygon;
};

// Etiqueta reservada para la cara infinita (#64): el complemento de todas
// las caras descritas.
const std::string INFINITE_FACE = "region-infinita";
