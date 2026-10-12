// PD04 2025-II S1, ejercicio 1: gradiente de la regresión logística (n >> d).
// Se paraleliza el bucle EXTERNO (muestras): tiene n iteraciones; el interno sólo d.
//   g++ -O2 -fopenmp pd4_gradiente.cpp
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <vector>
#include <omp.h>
using namespace std;
int main(int argc, char **argv) {
  const int n = argc > 1 ? atoi(argv[1]) : 2000000, d = 16;
  vector<double> X((size_t)n * d), y(n), w(d, 0.1), g_seq(d, 0), g_red(d, 0), g_cri(d, 0), g_ato(d, 0);
  srand(1);
  for (size_t i = 0; i < X.size(); i++) X[i] = (rand() / (double)RAND_MAX) - 0.5;
  for (int i = 0; i < n; i++) y[i] = rand() % 2;
  auto err = [&](int i) {                        // p_i - y_i
    double z = 0; for (int j = 0; j < d; j++) z += w[j] * X[(size_t)i * d + j];
    return 1.0 / (1.0 + exp(-z)) - y[i];
  };
  double t = omp_get_wtime();
  for (int i = 0; i < n; i++) { double e = err(i); for (int j = 0; j < d; j++) g_seq[j] += e * X[(size_t)i * d + j]; }
  double ts = omp_get_wtime() - t;

  double *gr = g_red.data();                     // 1.1 reduction sobre un arreglo (OpenMP >= 4.5)
  t = omp_get_wtime();
#pragma omp parallel for reduction(+ : gr[0 : d])
  for (int i = 0; i < n; i++) { double e = err(i); for (int j = 0; j < d; j++) gr[j] += e * X[(size_t)i * d + j]; }
  double tr = omp_get_wtime() - t;

  t = omp_get_wtime();                           // 1.2 critical: gradiente local por hilo y UN critical por hilo
#pragma omp parallel
  { vector<double> loc(d, 0);
#pragma omp for
    for (int i = 0; i < n; i++) { double e = err(i); for (int j = 0; j < d; j++) loc[j] += e * X[(size_t)i * d + j]; }
#pragma omp critical
    for (int j = 0; j < d; j++) g_cri[j] += loc[j];
  }
  double tc = omp_get_wtime() - t;

  t = omp_get_wtime();                           // 1.3 atomic: actualiza g[j] directamente, una vez por (i,j)
#pragma omp parallel for
  for (int i = 0; i < n; i++) { double e = err(i);
    for (int j = 0; j < d; j++) {
#pragma omp atomic
      g_ato[j] += e * X[(size_t)i * d + j];
    } }
  double ta = omp_get_wtime() - t;

  vector<double> g_cn(d, 0);                     // 1.2' critical ingenuo: UN critical por muestra (n entradas)
  t = omp_get_wtime();
#pragma omp parallel for
  for (int i = 0; i < n; i++) { double e = err(i);
#pragma omp critical
    for (int j = 0; j < d; j++) g_cn[j] += e * X[(size_t)i * d + j]; }
  double tn = omp_get_wtime() - t;

  double dif_r = 0, dif_c = 0, dif_a = 0;
  for (int j = 0; j < d; j++) { dif_r += fabs(g_red[j]-g_seq[j]); dif_c += fabs(g_cri[j]-g_seq[j]); dif_a += fabs(g_ato[j]-g_seq[j]); }
  printf("hilos=%d  sec=%.3f  reduction=%.3f  critical(local)=%.3f  critical(ingenuo)=%.3f  atomic=%.3f   |dif| r=%.2e c=%.2e a=%.2e\n",
         omp_get_max_threads(), ts, tr, tc, tn, ta, dif_r, dif_c, dif_a);
}
