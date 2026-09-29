/*************************************************
 * Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
 * de la Universidad de Ingeniería y Tecnología (UTEC)
 * Material es de libre uso, entendiendo que debe contener este encabezado
 * UTEC no se responsabiliza del uso particular del código
 *
 * Autor:       Jose Fiestas (UTEC)
 * contacto:    jfiestas@utec.edu.pe
 * objetivo:    Estructura básica de un programa enMPI
 *              Impresion en paralelo
 * contenido:   código fuente enMPI-C++
 *************************************************/
#include <mpi.h>

#include <iostream>
using namespace std;

int main(int argc, char* argv[]) {
  // declaracion de variables
  int ierr, rank, size, dato = 10;
  // inicializa MPI (esta parte es estandar para los ejercicios de clase)
  ierr = MPI_Init(&argc, &argv);
  MPI_Comm_size(MPI_COMM_WORLD, &size);
  MPI_Comm_rank(MPI_COMM_WORLD, &rank);

  // 1. ejecuta la impresion solo si MPI_Init resulto (use MPI_SUCCESS)
  if (ierr == MPI_SUCCESS)
    cout << "Peekaboo! desde " << rank << " de un total de " << size << endl;
  // 2. modifica el valor de dato solo para que el proceso 2 tenga dato=20
  if (rank == 2)
    dato = 20;

  // finaliza MPI
  MPI_Finalize();
}
