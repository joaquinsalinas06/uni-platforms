// PD5 2026-I, ejercicio 2: OMP tasks. Pseudocódigo del enunciado:
//   min_x = minimo(x,n);   max_x = maximo(x,n);
//   calculo_z(z, min_x, max_x, n);   calculo_y(y, x, n);
//   calculo_x(x, y, n);              calculo_v(v, z, x);
// Sólo el primer argumento de cada calculo_*() se modifica.
//
// El `ejercicio02.cpp` del enunciado está en Canvas y no se tiene; este archivo es un modelo propio con
// las mismas dependencias. El costo de cada función (veces que recorre el vector) se fija a propósito
// distinto para que se vea la diferencia entre `sections` y `task depend`.
//
// Compilar:  g++-16 -O2 -fopenmp pd5_tareas.cpp -o pd5_tareas   (o clang++ -Xclang -fopenmp con libomp)
// Ejecutar:  OMP_NUM_THREADS=4 ./pd5_tareas [n=4000000] [repeticiones=5]
//
// DAG (aristas = dependencias; las WAR vienen de que calculo_x ESCRIBE x):
//   min_x ──┬─> z ───────────┐
//   max_x ──┤                ├─> v
//           └─WAR─┐          │
//   y ──────────> x ─────────┘      (y lee x original; x se escribe después de min, max e y)
#include <omp.h>

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <vector>

static const int R_Y = 4, R_Z = 3, R_X = 1;  // pasadas de cada función: y pesa más que x, z más que x

static double minimo(const double* x, int n) { return *std::min_element(x, x + n); }
static double maximo(const double* x, int n) { return *std::max_element(x, x + n); }

static void calculo_z(double* z, double mn, double mx, int n) {
  double span = mx - mn;
  for (int r = 0; r < R_Z; r++)
    for (int i = 0; i < n; i++) z[i] = std::sin(span * (i % 97) + mn + r) + 1.0;
}
static void calculo_y(double* y, const double* x, int n) {
  for (int r = 0; r < R_Y; r++)
    for (int i = 0; i < n; i++) y[i] = std::sin(x[i] + r) * std::cos(x[i] - r);
}
static void calculo_x(double* x, const double* y, int n) {
  for (int r = 0; r < R_X; r++)
    for (int i = 0; i < n; i++) x[i] = 0.5 * x[i] + 0.5 * y[i];
}
static void calculo_v(double* v, const double* z, const double* x, int n) {
  double s = 0;
  for (int i = 0; i < n; i++) s += z[i] * x[i];
  *v = s;
}

struct Datos {
  int n;
  std::vector<double> x, y, z;
  double mn = 0, mx = 0, v = 0;
  explicit Datos(int n_) : n(n_), x(n_), y(n_), z(n_) { reset(); }
  void reset() {
    for (int i = 0; i < n; i++) x[i] = 1.0 + 0.001 * (i % 1000);
    mn = mx = v = 0;
  }
};

static void secuencial(Datos& d) {
  d.mn = minimo(d.x.data(), d.n);
  d.mx = maximo(d.x.data(), d.n);
  calculo_z(d.z.data(), d.mn, d.mx, d.n);
  calculo_y(d.y.data(), d.x.data(), d.n);
  calculo_x(d.x.data(), d.y.data(), d.n);
  calculo_v(&d.v, d.z.data(), d.x.data(), d.n);
}

// Versión 1: sections. No puede expresar dependencias: se agrupa por NIVELES del DAG y cada
// `sections` termina en una barrera implícita (z debe esperar a y aunque no dependa de ella).
static void con_sections(Datos& d) {
#pragma omp parallel
  {
#pragma omp sections
    {
#pragma omp section
      d.mn = minimo(d.x.data(), d.n);
#pragma omp section
      d.mx = maximo(d.x.data(), d.n);
#pragma omp section
      calculo_y(d.y.data(), d.x.data(), d.n);
    }  // barrera: nivel 1 completo
#pragma omp sections
    {
#pragma omp section
      calculo_z(d.z.data(), d.mn, d.mx, d.n);
#pragma omp section
      calculo_x(d.x.data(), d.y.data(), d.n);
    }  // barrera: nivel 2 completo
#pragma omp single
    calculo_v(&d.v, d.z.data(), d.x.data(), d.n);
  }
}

// Versión 2: tasks con depend. Cada tarea arranca en cuanto se cumplen SUS dependencias.
static void con_tasks(Datos& d) {
  double *px = d.x.data(), *py = d.y.data(), *pz = d.z.data();
#pragma omp parallel
#pragma omp single
  {
#pragma omp task depend(out : d.mn) depend(in : px[0])
    d.mn = minimo(px, d.n);
#pragma omp task depend(out : d.mx) depend(in : px[0])
    d.mx = maximo(px, d.n);
#pragma omp task depend(out : py[0]) depend(in : px[0])
    calculo_y(py, px, d.n);
#pragma omp task depend(out : pz[0]) depend(in : d.mn, d.mx)
    calculo_z(pz, d.mn, d.mx, d.n);
    // calculo_x escribe x: espera a y (RAW) y a que min, max e y hayan leído x (WAR)
#pragma omp task depend(inout : px[0]) depend(in : py[0], d.mn, d.mx)
    calculo_x(px, py, d.n);
#pragma omp task depend(in : pz[0], px[0])
    calculo_v(&d.v, pz, px, d.n);
  }
}

template <class F>
static double medir(Datos& d, F f, int reps, double* v_out) {
  double mejor = 1e30;
  for (int r = 0; r < reps; r++) {
    d.reset();
    double t0 = omp_get_wtime();
    f(d);
    mejor = std::min(mejor, omp_get_wtime() - t0);
  }
  *v_out = d.v;
  return mejor;
}

int main(int argc, char** argv) {
  int n = argc > 1 ? atoi(argv[1]) : 4000000;
  int reps = argc > 2 ? atoi(argv[2]) : 5;
  Datos d(n);
  double vs, vsec, vtask;
  double ts = medir(d, secuencial, reps, &vs);
  double tsec = medir(d, con_sections, reps, &vsec);
  double ttask = medir(d, con_tasks, reps, &vtask);
  // costo de cada función por separado (secuencial): da el camino crítico del DAG
  d.reset();
  double t0 = omp_get_wtime(), t1;
  d.mn = minimo(d.x.data(), n);
  d.mx = maximo(d.x.data(), n);
  t1 = omp_get_wtime();
  double t_mm = t1 - t0; t0 = t1;
  calculo_y(d.y.data(), d.x.data(), n);
  t1 = omp_get_wtime(); double t_y = t1 - t0; t0 = t1;
  calculo_z(d.z.data(), d.mn, d.mx, n);
  t1 = omp_get_wtime(); double t_z = t1 - t0; t0 = t1;
  calculo_x(d.x.data(), d.y.data(), n);
  t1 = omp_get_wtime(); double t_x = t1 - t0;
  printf("hilos=%d n=%d  [min+max=%.4f y=%.4f z=%.4f x=%.4f s]\n", omp_get_max_threads(), n, t_mm, t_y, t_z, t_x);
  printf("secuencial  %.4f s  v=%.6f\n", ts, vs);
  printf("sections    %.4f s  v=%.6f  speedup=%.2f  correcto=%d\n", tsec, vsec, ts / tsec, vsec == vs);
  printf("tasks       %.4f s  v=%.6f  speedup=%.2f  correcto=%d\n", ttask, vtask, ts / ttask, vtask == vs);
  return 0;
}
