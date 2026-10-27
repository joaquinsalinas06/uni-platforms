// PD5 2026-I, ejercicio 1: Tsunami (ecuación de onda hiperbólica con perturbación).
// Descomposición de dominio 1D en bloques iguales + intercambio de halo con MPI_Send / MPI_Recv.
//
// Compilar:  mpicxx -O2 -std=c++17 pd5_onda_mpi.cpp -o pd5_onda_mpi
// Ejecutar:  mpirun -np 4 ./pd5_onda_mpi K tpoints nsteps [salida.csv] [verificar=1]
//   K        amplitud de la perturbación  0.01 * sin(K * (i/180))
//   tpoints  puntos de la onda (debe ser múltiplo de p)
//   nsteps   pasos de tiempo
// Base: pd5-onda_sec.cpp (J. Fiestas). Dos diferencias deliberadas con ese código:
//   1) i/180 se hace en doble precisión: en el original `K * i / 180` es división entera.
//   2) las fronteras siguen el enunciado: 0.1*sin(j) a la izquierda y 0.1*cos(j) a la derecha
//      (j = índice global del punto), en vez de las fijadas a 0.0 en el código entregado.
#include <mpi.h>

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <vector>

static const double PI = 3.14159265;
static const double DTIME = 0.3, C = 1.0, DX = 1.0;
static const double SQTAU = (C * DTIME / DX) * (C * DTIME / DX);

static inline double forzante(int K, int gi) { return 0.01 * std::sin(K * (gi / 180.0)); }

// Referencia secuencial (misma recurrencia que pd5-onda_sec.cpp, con las dos correcciones de arriba).
static void onda_secuencial(int K, int tpoints, int nsteps, std::vector<double>& out) {
  std::vector<double> v(tpoints + 2), o(tpoints + 2), nw(tpoints + 2);
  for (int j = 1; j <= tpoints; j++) v[j] = std::sin(2.0 * PI * (j - 1) / (tpoints - 1.0));
  o = v;
  for (int s = 0; s < nsteps; s++) {
    for (int j = 1; j <= tpoints; j++) {
      if (j == 1) nw[j] = 0.1 * std::sin(1.0);
      else if (j == tpoints) nw[j] = 0.1 * std::cos((double)tpoints);
      else nw[j] = 2.0 * v[j] - o[j] + SQTAU * (v[j - 1] - 2.0 * v[j] + v[j + 1]) + forzante(K, j);
    }
    o = v;
    v = nw;
  }
  out.assign(v.begin() + 1, v.begin() + 1 + tpoints);
}

int main(int argc, char** argv) {
  MPI_Init(&argc, &argv);
  int rank, p;
  MPI_Comm_rank(MPI_COMM_WORLD, &rank);
  MPI_Comm_size(MPI_COMM_WORLD, &p);

  int K = argc > 1 ? atoi(argv[1]) : 10;
  int tpoints = argc > 2 ? atoi(argv[2]) : 1024;
  int nsteps = argc > 3 ? atoi(argv[3]) : 800;
  const char* csv = (argc > 4 && argv[4][0]) ? argv[4] : nullptr;
  int verificar = argc > 5 ? atoi(argv[5]) : 1;
  if (tpoints % p != 0) {
    if (rank == 0) fprintf(stderr, "tpoints (%d) debe ser multiplo de p (%d)\n", tpoints, p);
    MPI_Finalize();
    return 1;
  }

  const int n = tpoints / p;            // puntos propios; local[0] y local[n+1] son el halo
  const int izq = rank - 1, der = rank + 1;
  std::vector<double> a(n + 2), b(n + 2), c(n + 2);
  double *vals = a.data(), *old = b.data(), *nw = c.data();
  for (int j = 1; j <= n; j++) vals[j] = std::sin(2.0 * PI * (rank * n + j - 1) / (tpoints - 1.0));
  for (int j = 0; j <= n + 1; j++) old[j] = vals[j];

  MPI_Barrier(MPI_COMM_WORLD);
  double t0 = MPI_Wtime();
  for (int s = 0; s < nsteps; s++) {
    // Intercambio de halo. Orden par/impar para que Send/Recv bloqueantes nunca formen un ciclo.
    // tag 0 = mensaje hacia la derecha, tag 1 = mensaje hacia la izquierda.
    if (rank % 2 == 0) {
      if (der < p) {
        MPI_Send(&vals[n], 1, MPI_DOUBLE, der, 0, MPI_COMM_WORLD);
        MPI_Recv(&vals[n + 1], 1, MPI_DOUBLE, der, 1, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
      }
      if (izq >= 0) {
        MPI_Send(&vals[1], 1, MPI_DOUBLE, izq, 1, MPI_COMM_WORLD);
        MPI_Recv(&vals[0], 1, MPI_DOUBLE, izq, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
      }
    } else {
      MPI_Recv(&vals[0], 1, MPI_DOUBLE, izq, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
      MPI_Send(&vals[1], 1, MPI_DOUBLE, izq, 1, MPI_COMM_WORLD);
      if (der < p) {
        MPI_Recv(&vals[n + 1], 1, MPI_DOUBLE, der, 1, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
        MPI_Send(&vals[n], 1, MPI_DOUBLE, der, 0, MPI_COMM_WORLD);
      }
    }
    for (int j = 1; j <= n; j++) {
      int gi = rank * n + j;            // índice global 1..tpoints
      if (gi == 1) nw[j] = 0.1 * std::sin(1.0);
      else if (gi == tpoints) nw[j] = 0.1 * std::cos((double)tpoints);
      else nw[j] = 2.0 * vals[j] - old[j] + SQTAU * (vals[j - 1] - 2.0 * vals[j] + vals[j + 1]) + forzante(K, gi);
    }
    double* t = old;                    // rotación de punteros: old <- vals <- nw
    old = vals;
    vals = nw;
    nw = t;
  }
  double mi = MPI_Wtime() - t0, tmax;
  MPI_Reduce(&mi, &tmax, 1, MPI_DOUBLE, MPI_MAX, 0, MPI_COMM_WORLD);

  std::vector<double> global;
  if (rank == 0) global.resize(tpoints);
  MPI_Gather(&vals[1], n, MPI_DOUBLE, global.data(), n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

  if (rank == 0) {
    double amp = 0;
    for (double x : global) amp = std::max(amp, std::fabs(x));
    double dif = -1;
    if (verificar) {
      std::vector<double> ref;
      onda_secuencial(K, tpoints, nsteps, ref);
      dif = 0;
      for (int j = 0; j < tpoints; j++) dif = std::max(dif, std::fabs(ref[j] - global[j]));
    }
    if (csv) {
      FILE* f = fopen(csv, "w");
      for (int j = 0; j < tpoints; j++) fprintf(f, "%.6f,%.9g\n", (j + 1.0) / tpoints, global[j]);
      fclose(f);
    }
    printf("RESULT p=%d K=%d tpoints=%d nsteps=%d tiempo=%.6f amplitud_max=%.4f dif_vs_sec=%.3g\n", p, K, tpoints, nsteps,
           tmax, amp, dif);
  }
  MPI_Finalize();
  return 0;
}
