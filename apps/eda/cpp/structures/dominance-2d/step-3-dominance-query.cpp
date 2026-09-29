// Paso 3 — ConsultaDominancia(S, b2, b3), transcrita tal como la da el
// profesor (#30-31):
//
//   cara <- busqueda binaria de b3 en la columna izquierda de S   // O(lg n)
//   resultado <- lista vacia
//   mientras la posicion horizontal de cara es < b2 hacer
//       si el borde de cara es un rayo de un punto entonces
//           agregar ese punto a resultado
//        cara <- cara vecina hacia la derecha                     // O(1)
//   devolver resultado
//
// "cara" se representa aqui como un indice de columna sobre el arreglo
// ordenado por y del paso 2. La "busqueda binaria de b3 en la columna
// izquierda" se realiza sobre el catalogo global ordenado por z (cuenta
// cuantos puntos, de TODO el conjunto, tienen z<=b3) -- es el paso O(lg n)
// que el pseudocodigo pide antes de empezar a caminar; la caminata en si
// misma solo compara cada columna una vez, O(1) por columna.

#include <algorithm>
#include <vector>

// Usa Point y Subdivision de step-2-subdivision-build.cpp (ver
// full-implementation.cpp para la versión autocontenida y compilable).

struct ResultadoConsulta {
    std::vector<int> puntosReportados;  // ids de los puntos dominados
    int busquedaBinariaComparaciones;   // costo del paso O(lg n)
    int carasVisitadas;                 // costo del paso O(1) por cara (m)
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
        // busqueda binaria manual para contar las comparaciones (log n)
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
    // (la cara que se evalua es la que queda justo a la izquierda del rayo
    // de cada punto: su posicion sigue siendo < b2 mientras el punto mismo
    // cumpla y<=b2, que es exactamente la condicion de dominancia del #17)
    for (const auto& p : s.porY) {
        if (p.y > b2) break;  // cara ya no es < b2: se detiene la caminata
        r.carasVisitadas++;
        // si el borde de cara es un rayo de un punto entonces ...
        if (p.z <= b3) {
            r.puntosReportados.push_back(p.id);
        }
        // cara <- cara vecina hacia la derecha  (siguiente iteracion, O(1))
    }
    return r;
}
