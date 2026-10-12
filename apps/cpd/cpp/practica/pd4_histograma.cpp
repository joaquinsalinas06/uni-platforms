// PD04 2025-II S2, ejercicio 1: histograma en paralelo.
//   g++ -O2 -fopenmp pd4_histograma.cpp
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <random>
#include <omp.h>
using namespace std;
int main(int argc, char **argv) {
  const long N = argc > 1 ? atol(argv[1]) : (1L << 26);
  const int B = argc > 2 ? atoi(argv[2]) : 256;
  vector<int> x(N);
  mt19937 g(1); for (long i = 0; i < N; i++) x[i] = g() % B;      // x_i en [0, B-1]

  vector<long> Hs(B, 0), Hr(B, 0), Ha(B, 0);
  double t = omp_get_wtime();
  for (long i = 0; i < N; i++) Hs[x[i]]++;                         // secuencial
  double ts = omp_get_wtime() - t;

  long *hr = Hr.data();                                            // 1.1 reduction: un histograma privado por hilo
  t = omp_get_wtime();
#pragma omp parallel for reduction(+ : hr[0 : B])
  for (long i = 0; i < N; i++) hr[x[i]]++;
  double tr = omp_get_wtime() - t;

  t = omp_get_wtime();                                             // 1.2 atomic: un histograma compartido
#pragma omp parallel for
  for (long i = 0; i < N; i++) {
#pragma omp atomic
    Ha[x[i]]++;
  }
  double ta = omp_get_wtime() - t;

  long sr = 0, sa = 0; bool ok = true;
  for (int b = 0; b < B; b++) { sr += Hr[b]; sa += Ha[b]; ok = ok && Hr[b] == Hs[b] && Ha[b] == Hs[b]; }
  printf("hilos=%d B=%d  sec=%.3f  reduction=%.3f  atomic=%.3f  suma_red=%ld suma_atom=%ld N=%ld  igual_a_secuencial=%d\n",
         omp_get_max_threads(), B, ts, tr, ta, sr, sa, N, ok);
}
