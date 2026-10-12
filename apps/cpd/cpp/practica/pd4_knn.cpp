// PD04 2026-I, ejercicio 1: KNN (fuerza bruta) con OpenMP. Se paraleliza el bucle de la
// data de PRUEBA (Ntest): cada punto de prueba recorre todo Ntrain y no hace falta una
// reducción posterior de distancias.
//   g++ -O2 -fopenmp pd4_knn.cpp
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <algorithm>
#include <random>
#include <omp.h>
using namespace std;
int main(int argc, char **argv) {
  const int Ntrain = atoi(argv[1]), Ntest = atoi(argv[2]), D = 16, K = 5;
  vector<float> tr((size_t)Ntrain * D), te((size_t)Ntest * D); vector<int> lab(Ntrain), pred(Ntest);
  mt19937 g(1); uniform_real_distribution<float> U(0, 1);
  for (auto &v : tr) v = U(g); for (auto &v : te) v = U(g); for (auto &l : lab) l = g() % 3;
  double t = omp_get_wtime();
#pragma omp parallel for schedule(static)
  for (int q = 0; q < Ntest; q++) {
    vector<pair<float,int>> best(K, {1e30f, 0});                    // k mejores (distancia, etiqueta), privado
    for (int i = 0; i < Ntrain; i++) {
      float s = 0; for (int j = 0; j < D; j++) { float df = te[(size_t)q*D+j] - tr[(size_t)i*D+j]; s += df*df; }
      if (s < best[K-1].first) { best[K-1] = {s, lab[i]}; sort(best.begin(), best.end()); }
    }
    int cnt[3] = {0,0,0}; for (auto &b : best) cnt[b.second]++;
    pred[q] = max_element(cnt, cnt+3) - cnt;
  }
  double T = omp_get_wtime() - t;
  long chk = 0; for (int p : pred) chk += p;
  printf("p=%d Ntrain=%d Ntest=%d  T=%.4f s  (chk=%ld)\n", omp_get_max_threads(), Ntrain, Ntest, T, chk);
}
