// Paso 9 — d dimensiones: NO hace falta código nuevo. `buildRangeTree`
// (paso 7) y `rangeQuery` (paso 8) ya son genéricos en `totalDims`/`dim`:
// build-2d y d-dimensions son el MISMO código, sólo con un número de
// dimensiones distinto (Sem4_Orthogonal_Range_Search.pdf#52: "en cada uno
// de los árboles de una componente en la dimensión k podemos agregar
// punteros hacia range trees ordenados por la dimensión (k+1)").
//
// Este paso sólo agrega el uso concreto para d=3, como ejemplo.

#include <vector>
using namespace std;

using Point = vector<long>; // {x, y, z, ...}

struct Node; // igual que en los pasos 7-8, con `nextDim` anidado d-1 veces
Node* buildRangeTree(vector<Point> pts, int dim, int totalDims);
vector<Point> rangeQuery(Node* root, const vector<pair<long, long>>& ranges, int dim = 0);

// Construcción y consulta en 3 dimensiones: mismo código de build-2d /
// range-query-2d, con totalDims=3 y una caja de 3 rangos.
Node* buildRangeTree3D(vector<Point> pts) { return buildRangeTree(pts, 0, 3); }

vector<Point> rangeQuery3D(Node* root, long x1, long x2, long y1, long y2, long z1, long z2) {
    return rangeQuery(root, {{x1, x2}, {y1, y2}, {z1, z2}});
}
