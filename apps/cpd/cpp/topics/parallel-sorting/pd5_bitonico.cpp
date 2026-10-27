// PD5 / U5.2: ordenamiento bitónico (red de ordenamiento) con OpenMP.
// Versión iterativa de BitonicSort/BitonicMerge de las diapositivas: las fases k = 2, 4, ..., n arman
// secuencias bitónicas de tamaño k y, dentro de cada fase, los pasos j = k/2, ..., 1 hacen
// CompareExchange(A[i], A[i^j]). Los n/2 CompareExchange de un paso son independientes
// -> `parallel for`. Hay log n (log n + 1) / 2 pasos: span O(log² n).
//
// Compilar:  g++-16 -O2 -std=c++17 -fopenmp pd5_bitonico.cpp -o pd5_bitonico
// Ejecutar:  OMP_NUM_THREADS=4 ./pd5_bitonico [log2_n=22]
#include <omp.h>

#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <random>
#include <vector>

// Un CompareExchange: deja el menor en la posición i si dir es ascendente (el mayor si descendente).
static inline void compare_exchange(int* A, int i, int l, bool asc) {
  if ((A[i] > A[l]) == asc) std::swap(A[i], A[l]);
}

static void bitonic_sort(int* A, int n) {
  for (int k = 2; k <= n; k <<= 1) {          // tamaño de la secuencia bitónica que se fusiona
    for (int j = k >> 1; j > 0; j >>= 1) {    // distancia del CompareExchange
#pragma omp parallel for schedule(static)
      for (int i = 0; i < n; i++) {
        int l = i ^ j;
        if (l > i) compare_exchange(A, i, l, (i & k) == 0);  // bloques alternos ASC / DESC
      }
    }
  }
}

int main(int argc, char** argv) {
  int lg = argc > 1 ? atoi(argv[1]) : 22;
  int n = 1 << lg;
  std::vector<int> base(n);
  std::mt19937 gen(42);
  for (int& x : base) x = gen() % 1000000;

  std::vector<int> ref = base;
  double t0 = omp_get_wtime();
  std::sort(ref.begin(), ref.end());
  double t_std = omp_get_wtime() - t0;

  double mejor = 1e30;
  bool ok = true;
  for (int r = 0; r < 3; r++) {
    std::vector<int> a = base;
    t0 = omp_get_wtime();
    bitonic_sort(a.data(), n);
    mejor = std::min(mejor, omp_get_wtime() - t0);
    ok = ok && (a == ref);
  }
  printf("hilos=%d n=2^%d  bitonico=%.4f s  std::sort=%.4f s  correcto=%d  pasos=%d\n", omp_get_max_threads(), lg, mejor,
         t_std, ok, lg * (lg + 1) / 2);
  return 0;
}
