// PD04 2026-I, ejercicio 3: posiciones de los valores mayores al promedio (solución del profesor, verificada).
//   g++ -O2 -fopenmp pd4_promedio.cpp
#include <cstdio>
#include <cstdlib>
#include <set>
#include <utility>
#include <omp.h>
using namespace std;
int ejercicio_3_omp(int N, double **A, double posiciones[][2]) {
  int i, j, k = 0;
  double sum = 0.0, prom;
#pragma omp parallel for collapse(2) reduction(+ : sum)      // fase 1: suma paralela
  for (i = 0; i < N; i++)
    for (j = 0; j < N; j++) sum += A[i][j];
  prom = sum / ((double)N * N);
#pragma omp parallel for collapse(2)                          // fase 2: posiciones > promedio
  for (i = 0; i < N; i++)
    for (j = 0; j < N; j++)
      if (A[i][j] > prom) {
        int idx;
#pragma omp atomic capture
        idx = k++;                                            // cada hilo obtiene una posición ÚNICA
        posiciones[idx][0] = i;
        posiciones[idx][1] = j;
      }
  return k;
}
int ejercicio_3_sec(int N, double **A, double posiciones[][2]) {
  int k = 0; double sum = 0;
  for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) sum += A[i][j];
  double prom = sum / ((double)N * N);
  for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) if (A[i][j] > prom) { posiciones[k][0] = i; posiciones[k][1] = j; k++; }
  return k;
}
int main() {
  const int N = 2000;
  double **A = new double *[N]; srand(3);
  for (int i = 0; i < N; i++) { A[i] = new double[N]; for (int j = 0; j < N; j++) A[i][j] = rand() / (double)RAND_MAX; }
  double (*ps)[2] = new double[N * N][2], (*pp)[2] = new double[N * N][2];
  double t = omp_get_wtime(); int ks = ejercicio_3_sec(N, A, ps); double ts = omp_get_wtime() - t;
  t = omp_get_wtime(); int kp = ejercicio_3_omp(N, A, pp); double tp = omp_get_wtime() - t;
  set<pair<int,int>> S, P;                                    // el ORDEN en `posiciones` no está determinado: se compara como conjunto
  for (int q = 0; q < ks; q++) S.insert({(int)ps[q][0], (int)ps[q][1]});
  for (int q = 0; q < kp; q++) P.insert({(int)pp[q][0], (int)pp[q][1]});
  printf("hilos=%d  k_sec=%d k_omp=%d  mismo_conjunto=%d  T_sec=%.4f T_omp=%.4f\n", omp_get_max_threads(), ks, kp, S == P, ts, tp);
}
