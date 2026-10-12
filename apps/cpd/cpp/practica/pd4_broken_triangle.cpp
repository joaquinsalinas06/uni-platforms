// PD04 2025-II (S1 y S2), ejercicio 2: "broken triangle" por Monte Carlo en paralelo.
//   g++ -O2 -fopenmp pd4_broken_triangle.cpp
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <algorithm>
#include <random>
#include <omp.h>
int main(int argc, char **argv) {
  long N = argc > 1 ? atol(argv[1]) : 100000000;
  long n_tri = 0, n_obt = 0;
#pragma omp parallel reduction(+ : n_tri, n_obt)
  {
    // Un generador PROPIO por hilo, con semilla distinta (semilla base + id): los hilos
    // no comparten estado (sin carrera) ni generan la misma secuencia.
    std::mt19937_64 gen(12345 + 7919ULL * omp_get_thread_num());
    std::uniform_real_distribution<double> U(0.0, 1.0);
#pragma omp for schedule(static)
    for (long i = 0; i < N; i++) {
      double u = U(gen), v = U(gen);
      if (u > v) std::swap(u, v);
      double s1 = u, s2 = v - u, s3 = 1.0 - v;                 // los 3 segmentos
      double smax = std::max({s1, s2, s3});
      if (smax < 0.5) {                                         // forman triángulo
        n_tri++;
        if (2.0 * smax * smax > s1 * s1 + s2 * s2 + s3 * s3) n_obt++;   // obtuso
      }
    }
  }
  printf("N=%ld  P(triangulo)=%.5f  P(obtuso | triangulo)=%.5f  P(obtuso)=%.5f\n",
         N, (double)n_tri / N, (double)n_obt / n_tri, (double)n_obt / N);
}
