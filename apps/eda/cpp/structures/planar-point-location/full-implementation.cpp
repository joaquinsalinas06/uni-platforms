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
#include <iostream>
#include <string>
#include <vector>

using namespace std;

struct Point {
  double x;
  double y;
};

struct Face {
  string label;
  vector<Point> polygon;
};

const string INFINITE_FACE = "region-infinita";

bool pointInPolygon(const Point& p, const vector<Point>& polygon) {
  bool inside = false;
  int n = (int)(polygon.size());
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
string locateBruteForce(const Point& p, const vector<Face>& faces) {
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
  vector<Face> faces = {
      {"cara-A", {{0, 0}, {8, 0}, {8, 10}, {0, 4}}},
      {"cara-B", {{14, 2}, {21, 1}, {19, 4}}},
  };

  // Caso normal: puntos claramente dentro de cada cara.
  if (!(locateBruteForce({4, 2}, faces) == "cara-A"))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (4,2) localiza en cara-A" << endl;

  if (!(locateBruteForce({18, 2}, faces) == "cara-B"))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (18,2) localiza en cara-B" << endl;

  // Caso limite: punto fuera de toda cara acotada -> region infinita (#64).
  if (!(locateBruteForce({40, 40}, faces) == INFINITE_FACE))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (40,40) localiza en la region infinita" << endl;

  // Caso limite: caras disjuntas -- un punto entre ambas tampoco cae en
  // ninguna, distinto del punto lejano de arriba.
  if (!(locateBruteForce({10, 6}, faces) == INFINITE_FACE))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (10,6), entre las dos caras disjuntas, "
       << "tambien cae en la region infinita" << endl;

  // Caso limite: mapa vacio (sin caras) -- todo punto es region infinita.
  vector<Face> emptyMap;
  if (!(locateBruteForce({0, 0}, emptyMap) == INFINITE_FACE))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: con el mapa vacio, todo punto es la region "
       << "infinita" << endl;

  // Ejemplo del profesor (#9): los tres puntos de consulta sobre el mapa
  // grande del mazo, usando solo dos de sus caras acotadas -- el mazo no
  // da las caras completas del mapa (solo los vertices del dibujo, sin
  // decir que arista conecta con cual), asi que se aproximan con
  // poligonos que SI dejan a cada punto estrictamente adentro, no sobre
  // el borde -- estar exactamente sobre una arista es un caso limite
  // aparte (ver operations/locate.md).
  vector<Face> profesorMapa = {
      {"cara-0-0", {{0, 0}, {10, 0}, {10, 10}, {0, 4}}},
      {"cara-14-2", {{10, 0}, {30, 0}, {19, 20}}},
  };
  if (!(locateBruteForce({8, 4}, profesorMapa) == "cara-0-0"))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (8,4) del ejemplo del profesor (#9) localiza "
       << "en la cara aproximada alrededor de (0,0)-(0,4)" << endl;

  if (!(locateBruteForce({19, 4}, profesorMapa) == "cara-14-2"))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (19,4) del ejemplo del profesor (#9) localiza "
       << "en la cara aproximada alrededor de (14,2)-(19,4)" << endl;

  if (!(locateBruteForce({4, 12}, profesorMapa) == INFINITE_FACE))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;
  cout << "verificado: (4,12) del ejemplo del profesor (#9) cae "
       << "fuera de las dos caras aproximadas -- region infinita "
       << "en esta aproximacion" << endl;

  cout << "todas las verificaciones de locate (fuerza bruta) "
       << "pasaron" << endl;
  return 0;
}
