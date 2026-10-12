// PD04 2025-I, ejercicio 1: Quicksort con tasks. Una sola fuente secuencial/paralela:
//   g++ -O2 -fopenmp pd4_qsort_tasks.cpp      (paralelo)
//   g++ -O2 pd4_qsort_tasks.cpp               (secuencial: los pragmas se ignoran)
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <utility>
#include <algorithm>
#ifdef _OPENMP
#include <omp.h>
#endif

// Partición en 3 vías (menores | iguales | mayores): con valores en [0,99] y
// n = 10^6 hay muchísimos duplicados y la partición de Lomuto sería O(n^2).
static void qs(int *a, long lo, long hi, long cutoff) {
  while (hi - lo > 1) {
    int pivot = a[lo + (hi - lo) / 2];
    long lt = lo, i = lo, gt = hi;           // [lo,lt) < p, [lt,i) == p, [gt,hi) > p
    while (i < gt) {
      if (a[i] < pivot)      std::swap(a[i++], a[lt++]);
      else if (a[i] > pivot) std::swap(a[i], a[--gt]);
      else                   i++;
    }
    // Un hijo como task (si es lo bastante grande); el otro lo sigue este mismo hilo.
    if (lt - lo > cutoff) {
#pragma omp task firstprivate(a, lo, lt, cutoff)
      qs(a, lo, lt, cutoff);
    } else {
      qs(a, lo, lt, cutoff);
    }
    lo = gt;                                  // iterar sobre la parte mayor
  }
}

int main(int argc, char **argv) {
  long n = argc > 1 ? atol(argv[1]) : 1000000;
  std::vector<int> a(n);
  srand(1);
  for (long i = 0; i < n; i++) a[i] = rand() % 100;
#ifdef _OPENMP
  double t0 = omp_get_wtime();
#pragma omp parallel
#pragma omp single
  qs(a.data(), 0, n, 10000);                  // el implícito taskwait del final de `single`/parallel espera todo
  double t = omp_get_wtime() - t0;
#else
  qs(a.data(), 0, n, 10000);
  double t = 0;
#endif
  bool ok = std::is_sorted(a.begin(), a.end());
  printf("n=%ld ordenado=%d tiempo=%.4f s\n", n, ok, t);
}
