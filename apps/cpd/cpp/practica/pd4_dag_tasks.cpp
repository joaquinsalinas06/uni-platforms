// PD04: ejercicios "DAG-OMP" con tasks y cláusulas depend.
//   g++ -O2 -fopenmp pd4_dag_tasks.cpp
#include <cstdio>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cmath>
#include <omp.h>
using namespace std;
typedef vector<double> V;

// ---------- PD04 2025-I, ejercicio 2 (min/max/z/y/x/v) ----------
static double minimo(const V &x) { return *min_element(x.begin(), x.end()); }
static double maximo(const V &x) { return *max_element(x.begin(), x.end()); }
static void calculo_z(V &z, double mn, double mx) { for (size_t i = 0; i < z.size(); i++) z[i] = (mx - mn) * i; }
static void calculo_y(V &y, const V &x) { for (size_t i = 0; i < y.size(); i++) y[i] = x[i] * 2; }
static void calculo_x(V &x, const V &y) { for (size_t i = 0; i < x.size(); i++) x[i] += y[i]; }
static void calculo_v(V &v, const V &z, const V &x) { for (size_t i = 0; i < v.size(); i++) v[i] = z[i] + x[i]; }

double ej2_tasks(V x, int n) {
  V y(n), z(n), v(n); double mn, mx;
#pragma omp parallel
#pragma omp single
  {
#pragma omp task depend(in : x) depend(out : mn)
    mn = minimo(x);
#pragma omp task depend(in : x) depend(out : mx)
    mx = maximo(x);
#pragma omp task depend(in : mn, mx) depend(out : z)
    calculo_z(z, mn, mx);
#pragma omp task depend(in : x) depend(out : y)
    calculo_y(y, x);
#pragma omp task depend(in : y) depend(inout : x)       // escribe x: espera a las lecturas previas (min, max, y)
    calculo_x(x, y);
#pragma omp task depend(in : z, x) depend(out : v)
    calculo_v(v, z, x);
  }                                                       // barrera implícita de parallel: todo terminado
  return accumulate(v.begin(), v.end(), 0.0);
}
double ej2_sections(V x, int n) {
  V y(n), z(n), v(n); double mn, mx;
#pragma omp parallel
  {
#pragma omp sections                                      // 1.er bloque: lo que LEE x
    {
#pragma omp section
      mn = minimo(x);
#pragma omp section
      mx = maximo(x);
#pragma omp section
      calculo_y(y, x);
    }                                                     // barrera implícita (espera a las 3, aunque z sólo necesita mn y mx)
#pragma omp sections                                      // 2.º bloque: z (usa mn,mx) y x (usa y, escribe x)
    {
#pragma omp section
      calculo_z(z, mn, mx);
#pragma omp section
      calculo_x(x, y);
    }
#pragma omp single
    calculo_v(v, z, x);
  }
  return accumulate(v.begin(), v.end(), 0.0);
}

// ---------- PD04 2025-II S1, ejercicio 3: sistema() ----------
static void ini(V &A, V &B) { for (size_t i = 0; i < A.size(); i++) { A[i] = i + 1; B[i] = 2 * i + 1; } }
static double tarea_1(const V &A) { return accumulate(A.begin(), A.end(), 0.0); }
static double tarea_2(const V &B) { return accumulate(B.begin(), B.end(), 0.0) / B.size(); }
static double suma_prefijos_s1(const V &B, double a) { V p(B); partial_sum(B.begin(), B.end(), p.begin()); return p.back() + a; }
static double suma_prefijos_s2(const V &B, double a, double b) { V p(B); partial_sum(B.begin(), B.end(), p.begin()); return p[p.size() / 2] * a + b; }
double sistema(int n) {
  V A(n), B(n); double a, b, s1, s2, z = 0;
#pragma omp parallel
#pragma omp single
  {
#pragma omp task depend(out : A, B)
    ini(A, B);
#pragma omp task depend(in : A) depend(out : a)
    a = tarea_1(A);
#pragma omp task depend(in : B) depend(out : b)
    b = tarea_2(B);
#pragma omp task depend(in : B, a) depend(out : s1)
    s1 = suma_prefijos_s1(B, a);
#pragma omp task depend(in : B, a, b) depend(out : s2)
    s2 = suma_prefijos_s2(B, a, b);
#pragma omp task depend(in : s1, s2) depend(out : z)
    z = s1 + s2;
  }
  return z;
}
double sistema_sec(int n) {
  V A(n), B(n); ini(A, B);
  double a = tarea_1(A), b = tarea_2(B), s1 = suma_prefijos_s1(B, a), s2 = suma_prefijos_s2(B, a, b);
  return s1 + s2;
}

// ---------- PD04 2025-II S2, ejercicio 3: OpArr ----------
static void suma_de_prefijos(V &A) { partial_sum(A.begin(), A.end(), A.begin()); }
static void quicksort_(V &B) { sort(B.begin(), B.end()); }
static void scan_left(V &C, double x) { double acc = x; for (double &c : C) { acc += c; c = acc; } }
double OpArr(V A, V B, V C, int n, double x) {
  double s1 = 0, s2 = 0, a, res = 0;
#pragma omp parallel
#pragma omp single
  {
#pragma omp task depend(inout : A)
    suma_de_prefijos(A);                                              // T1
#pragma omp task depend(inout : B)
    quicksort_(B);                                                    // T2
#pragma omp task depend(inout : C)
    scan_left(C, x);                                                  // T3
#pragma omp task depend(inout : A) depend(in : B) depend(out : s1)    // T4: A tras T1, B tras T2
    for (int i = 0; i < n; i++) {
      s1 = 0;
      for (int j = 0; j < n; j++) s1 += A[j] * B[j];
      for (int j = 0; j < n; j++) A[j] *= s1;
    }
#pragma omp task depend(inout : C) depend(in : B) depend(out : s2)    // T5: C tras T3, B tras T2
    for (int i = 0; i < n; i++) {
      s2 = 0;
      for (int j = 0; j < n; j++) s2 += B[j] * C[j];
      for (int j = 0; j < n; j++) C[j] *= s2;
    }
#pragma omp task depend(in : s1, s2, C) depend(out : res)             // T6: cálculo final
    { a = s1 / s2; for (int i = 0; i < n; i++) res += a * C[i]; }
  }
  return res;
}
double OpArr_sec(V A, V B, V C, int n, double x) {
  suma_de_prefijos(A); quicksort_(B); scan_left(C, x);
  double s1 = 0, s2 = 0, res = 0;
  for (int i = 0; i < n; i++) {
    s1 = 0;
    for (int j = 0; j < n; j++) s1 += A[j] * B[j];
    for (int j = 0; j < n; j++) A[j] *= s1;
  }
  for (int i = 0; i < n; i++) {
    s2 = 0;
    for (int j = 0; j < n; j++) s2 += B[j] * C[j];
    for (int j = 0; j < n; j++) C[j] *= s2;
  }
  double a = s1 / s2; for (int i = 0; i < n; i++) res += a * C[i];
  return res;
}

// ---------- PD04 2026-I, ejercicio 2 ----------
static double calcula_a(const V &v, double x) { double s = x; for (double e : v) s += e; return s; }
static double calcula_b(const V &v, double a) { V w(v); sort(w.begin(), w.end()); return w[w.size() / 2] + a * 1e-3; }
static double calcula_c(const V &v, double x) { V w(v); sort(w.begin(), w.end()); return w.front() + x; }
static double calcula_d(const V &v, double y) { V w(v); sort(w.begin(), w.end()); return w.back() * y; }
static double calcula_e(const V &v, double x) { double s = 0; for (double e : v) s += e * x; return s; }
static int f_(double x, double y, double vi) { return (int)fabs(fmod(x + y + vi, 5.0)); }
int ejercicio_2(int n, const V &v, double &x, double &y) {
  double a, b, c, d, e; int k = 0;
#pragma omp parallel
#pragma omp single
  {
#pragma omp task depend(out : a)
    a = calcula_a(v, x);
#pragma omp task depend(in : a) depend(out : b)
    b = calcula_b(v, a);
#pragma omp task depend(out : c)
    c = calcula_c(v, x);
#pragma omp task depend(out : d)
    d = calcula_d(v, y);
#pragma omp task depend(out : e)
    e = calcula_e(v, x);
#pragma omp taskwait                                   // x, y se actualizan en la ÚLTIMA tarea (no modifican el O(n))
    x += a + b + c;
    y += c + d + e;
#pragma omp taskloop reduction(+ : k)                  // el bucle final también en paralelo
    for (int i = 0; i < n; i++) { int j = f_(x, y, v[i]); if (j > 0 && j < 4) k++; }
  }
  return k;
}

int main() {
  int n = 1000; V x(n); for (int i = 0; i < n; i++) x[i] = sin(i) * 10;
  printf("2025-I ej2: tasks=%.6f sections=%.6f\n", ej2_tasks(x, n), ej2_sections(x, n));
  printf("2025-II S1 ej3: sistema tasks=%.6f sec=%.6f\n", sistema(n), sistema_sec(n));
  // n pequeño y valores < 1 para que las multiplicaciones repetidas del enunciado no desborden
  int m = 6; V A(m), B(m), C(m); for (int i = 0; i < m; i++) { A[i] = 0.3 / (i + 1); B[i] = 0.5 + 0.1 * cos(i); C[i] = 0.4 / (i + 2); }
  printf("2025-II S2 ej3: OpArr tasks=%.9e sec=%.9e\n", OpArr(A, B, C, m, 0.0), OpArr_sec(A, B, C, m, 0.0));
  double x2 = 1.0, y2 = 2.0; int k = ejercicio_2(n, x, x2, y2);
  printf("2026-I ej2: k=%d x=%.4f y=%.4f\n", k, x2, y2);
}
