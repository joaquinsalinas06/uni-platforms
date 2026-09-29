// Paso 2 — el árbol de rango genérico, parametrizado en la dimensión.
// Esta es la pieza que el análisis dice que D_4 comparte con D_3 "exactamente
// igual, pero sobre z en vez de y" (#46). En vez de escribirla dos veces
// (una para y, una para z), se escribe una sola vez recibiendo un extractor
// de coordenada: D_3 la llama con extraer = y, D_4 con extraer = z.

#include "step-1-node.cpp"
#include <vector>
#include <algorithm>
#include <functional>

using KeyExtractor = std::function<double(const Point3&)>;

// Construye un árbol de rango balanceado (partición por mediana) sobre la
// coordenada que devuelve `extraer`. `puntos` no necesita venir ordenado.
inline RangeTreeNode* build_range_tree(std::vector<Point3> puntos, const KeyExtractor& extraer) {
    if (puntos.empty()) return nullptr;

    std::sort(puntos.begin(), puntos.end(), [&](const Point3& a, const Point3& b) {
        return extraer(a) < extraer(b);
    });

    // Construcción recursiva por mediana: mismo criterio de balance en
    // ambas dimensiones, y = clave de D_3, z = clave de D_4.
    std::function<RangeTreeNode*(int, int)> construir = [&](int lo, int hi) -> RangeTreeNode* {
        if (lo > hi) return nullptr;
        int mid = lo + (hi - lo) / 2;
        auto* nodo = new RangeTreeNode{extraer(puntos[mid]), puntos[mid]};
        nodo->left = construir(lo, mid - 1);
        nodo->right = construir(mid + 1, hi);
        return nodo;
    };

    return construir(0, static_cast<int>(puntos.size()) - 1);
}
