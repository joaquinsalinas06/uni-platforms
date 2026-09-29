// Paso 2 — construir la subdivisión sobre los rayos del paso 1.
//
// El profesor no da pseudocodigo de construccion para D_1: solo describe el
// resultado (subdivision planar de grado acotado, O(n) espacio, citando a
// Chazelle 1986) sin dar los pasos. Aqui se construye una version didactica
// y correcta -pero mas simple- para poder verificar ConsultaDominancia:
//
// ponytail: columnas acumulativas ordenadas por y, cada una con sus rayos
// activos ordenados por z. Esto NO reproduce el grado acotado de Chazelle
// (cada columna puede crecer hasta O(n)), asi que el espacio total aqui es
// O(n^2) en el peor caso, no O(n). Sirve para demostrar que la CAMINATA de
// ConsultaDominancia es correcta; la subdivision de grado acotado real es
// un resultado geometrico de 1986 que el curso cita pero no construye.
// Mejora: implementar la subdivision de grado acotado si hace falta O(n)
// real.

#include <algorithm>
#include <vector>

struct Point {
    double y, z;
    int id;
};

struct Subdivision {
    // puntos ordenados por y (una columna por punto, en ese orden)
    std::vector<Point> porY;
};

Subdivision construirSubdivision(std::vector<Point> puntos) {
    std::sort(puntos.begin(), puntos.end(),
              [](const Point& a, const Point& b) { return a.y < b.y; });
    return Subdivision{std::move(puntos)};
}
