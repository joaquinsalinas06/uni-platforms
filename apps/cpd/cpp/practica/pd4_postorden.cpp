// PD04 2025-I, ejercicio 3: recorrido post-orden de un árbol binario con tasks.
//   paralelo:   g++ -O2 -fopenmp pd4_postorden.cpp
//   secuencial: g++ -O2 pd4_postorden.cpp
#include <cstdio>
#include <cstdlib>
#include <cmath>
#ifdef _OPENMP
#include <omp.h>
#endif
struct Nodo { long val; Nodo *izq, *der; double res; };

Nodo *construir(long n, long &sig) {            // árbol balanceado de n nodos
  if (n == 0) return nullptr;
  Nodo *x = new Nodo{0, nullptr, nullptr, 0};
  long nl = (n - 1) / 2;
  x->izq = construir(nl, sig);
  x->der = construir(n - 1 - nl, sig);
  x->val = sig++;
  return x;
}
static double visitar(Nodo *x) {                // "trabajo" por nodo (~ microsegundo)
  double s = 0;
  for (int k = 1; k <= 40; k++) s += std::sin(x->val * 0.001 + k);
  return s;
}
void postorden(Nodo *x, int prof) {
  if (!x) return;
#ifdef _OPENMP
  if (prof > 0) {                               // por debajo de cierta profundidad, secuencial
#pragma omp task shared(x) firstprivate(prof)
    postorden(x->izq, prof - 1);
#pragma omp task shared(x) firstprivate(prof)
    postorden(x->der, prof - 1);
#pragma omp taskwait                            // hijos terminados ANTES de visitar el nodo
  } else
#endif
  { postorden(x->izq, 0); postorden(x->der, 0); }
  x->res = visitar(x);
}
int main(int argc, char **argv) {
  long n = argc > 1 ? atol(argv[1]) : 1000000, sig = 0;
  Nodo *raiz = construir(n, sig);
#ifdef _OPENMP
  double t0 = omp_get_wtime();
#pragma omp parallel
#pragma omp single
  postorden(raiz, 12);
  double t = omp_get_wtime() - t0;
#else
  postorden(raiz, 0); double t = 0;
#endif
  printf("n=%ld raiz->res=%.6f tiempo=%.4f s\n", n, raiz->res, t);
}
