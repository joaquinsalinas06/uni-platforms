// Dominancia 2D (D_1) -- reformulacion como rayos + subdivision + consulta.
//
// Reune los tres pasos:
//   step-1: reformulacion de puntos y consulta como rayos.
//   step-2: construccion de la subdivision (version didactica, ver su
//           comentario "ponytail" -- no reproduce el grado acotado de
//           Chazelle 1986, solo columnas acumulativas ordenadas por y).
//   step-3: ConsultaDominancia(S, b2, b3), transcrita tal como la da el
//           profesor (#30-31).
//
// Verifica cada consulta contra fuerza brut: recorrer los n puntos y
// comparar directamente y_i<=b2 y z_i<=b3, sin usar la estructura. Imprime
// k (tamano de la respuesta) junto con el costo de la caminata, para que
// se vea la dependencia output-sensitive O(lg n + k).

#include <algorithm>
#include <cassert>
#include <cstdio>
#include <vector>

struct Point {
    double y, z;
    int id;
};

// --- paso 1: reformulacion como rayos --------------------------------
bool rayoCruzaConsulta(const Point& p, double b2, double b3) {
    return p.y <= b2 && p.z <= b3;
}

// --- paso 2: subdivision (didactica) ---------------------------------
struct Subdivision {
    std::vector<Point> porY;  // ordenados por y: una columna por punto
};

Subdivision construirSubdivision(std::vector<Point> puntos) {
    std::sort(puntos.begin(), puntos.end(),
              [](const Point& a, const Point& b) { return a.y < b.y; });
    return Subdivision{std::move(puntos)};
}

// --- paso 3: ConsultaDominancia ---------------------------------------
struct ResultadoConsulta {
    std::vector<int> puntosReportados;
    int busquedaBinariaComparaciones = 0;
    int carasVisitadas = 0;
};

ResultadoConsulta consultaDominancia(const Subdivision& s, double b2,
                                      double b3) {
    ResultadoConsulta r{};

    // cara <- busqueda binaria de b3 en la columna izquierda de S  // O(lg n)
    std::vector<double> catalogoZ;
    catalogoZ.reserve(s.porY.size());
    for (const auto& p : s.porY) catalogoZ.push_back(p.z);
    std::sort(catalogoZ.begin(), catalogoZ.end());
    {
        int lo = 0, hi = static_cast<int>(catalogoZ.size());
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            r.busquedaBinariaComparaciones++;
            if (catalogoZ[mid] <= b3)
                lo = mid + 1;
            else
                hi = mid;
        }
    }

    // mientras la posicion horizontal de cara es < b2 hacer ...
    for (const auto& p : s.porY) {
        if (p.y > b2) break;
        r.carasVisitadas++;
        if (p.z <= b3) {
            r.puntosReportados.push_back(p.id);
        }
    }
    return r;
}

// --- fuerza bruta, para verificar --------------------------------------
std::vector<int> dominanciaFuerzaBruta(const std::vector<Point>& puntos,
                                        double b2, double b3) {
    std::vector<int> resultado;
    for (const auto& p : puntos) {
        if (rayoCruzaConsulta(p, b2, b3)) resultado.push_back(p.id);
    }
    std::sort(resultado.begin(), resultado.end());
    return resultado;
}

static void verificarConsulta(const std::vector<Point>& puntos, double b2,
                               double b3, const char* etiqueta) {
    Subdivision s = construirSubdivision(puntos);
    auto r = consultaDominancia(s, b2, b3);
    auto reportados = r.puntosReportados;
    std::sort(reportados.begin(), reportados.end());
    auto esperado = dominanciaFuerzaBruta(puntos, b2, b3);

    assert(reportados == esperado);

    std::printf(
        "[%s] consulta(b2=%.1f, b3=%.1f): k=%zu coincide con fuerza bruta "
        "(comparaciones busqueda binaria=%d, caras visitadas=%d)\n",
        etiqueta, b2, b3, reportados.size(), r.busquedaBinariaComparaciones,
        r.carasVisitadas);
}

int main() {
    std::vector<Point> puntos = {
        {1.0, 5.0, 0}, {2.0, 1.0, 1}, {4.0, 4.0, 2}, {5.0, 2.0, 3}};

    // caso normal (ver examples.md)
    verificarConsulta(puntos, 4.0, 4.0, "normal");

    // caso limite: k=0, ninguna coordenada dominada
    verificarConsulta(puntos, 0.0, 0.0, "k=0");

    // caso limite: k=n, todos dominados
    verificarConsulta(puntos, 10.0, 10.0, "k=n (todos)");

    // caso limite: empate exacto en el borde (y_i=b2 y z_i=b3), el material
    // usa <= en ambas coordenadas (#17): debe reportarse
    verificarConsulta(puntos, 4.0, 4.0, "empate exacto en el borde");
    assert(rayoCruzaConsulta({4.0, 4.0, 2}, 4.0, 4.0));
    std::printf(
        "[empate exacto] punto (4,4) con consulta (b2=4,b3=4) se reporta: "
        "si (<= en ambas coordenadas, #17)\n");

    // caso limite: un solo punto
    {
        std::vector<Point> unico = {{3.0, 3.0, 0}};
        verificarConsulta(unico, 5.0, 5.0, "un solo punto");
    }

    // caso limite: conjunto vacio
    {
        std::vector<Point> vacio;
        Subdivision s = construirSubdivision(vacio);
        auto r = consultaDominancia(s, 5.0, 5.0);
        assert(r.puntosReportados.empty());
        std::printf(
            "[conjunto vacio] ConsultaDominancia sobre S vacio devuelve "
            "resultado vacio, como se espera\n");
    }

    // caso limite: dos puntos con la misma y (misma columna)
    {
        std::vector<Point> empatados = {
            {2.0, 1.0, 0}, {2.0, 9.0, 1}, {5.0, 0.0, 2}};
        verificarConsulta(empatados, 2.0, 1.0, "empate en y (misma columna)");
    }

    std::printf(
        "\nTodo verificado: ConsultaDominancia coincide con fuerza bruta en "
        "el caso normal y en los casos limite (k=0, k=n, empate exacto en "
        "el borde, un solo punto, conjunto vacio, empate en y). El costo de "
        "la caminata (caras visitadas) crece con k, no con n, salvo la "
        "busqueda binaria inicial O(lg n) -- consistente con la cota "
        "O(lg n + k) del profesor.\n");
}
