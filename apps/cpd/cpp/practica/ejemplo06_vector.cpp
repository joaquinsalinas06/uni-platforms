/*************************************************
 * Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
 * de la Universidad de Ingeniería y Tecnología (UTEC)
 * Material es de libre uso, entendiendo que debe contener este encabezado
 * UTEC no se responsabiliza del uso particular del código
 *
 * Autor:       Jose Fiestas (UTEC)
 * contacto:    jfiestas@utec.edu.pe
 * objetivo:    Envia una columna de una matriz en rank 0
 *		 a una fila de una matriz en rank 1
 * 		Input: ninguno
 * 		Output: la fila en rank 1
 * 		Nota:  debe ejecutarse en 2 procesos
 * contenido:   código fuente enMPI-C++
 *************************************************/
#include <mpi.h>

#include <iostream>
using namespace std;

int main(int argc, char* argv[]) {
  int p;
  int my_rank;
  int i, j, col = 5;
  float A[10][10];
  MPI_Status status;

  // 1. Declare tipo MPI
  MPI_Datatype col_type;

  MPI_Init(&argc, &argv);
  MPI_Comm_rank(MPI_COMM_WORLD, &my_rank);

  // 2. Defina tipo vector (columna 1)
  MPI_Type_vector(10, 1, 10, MPI_FLOAT, &col_type);
  MPI_Type_commit(&col_type);

  if (my_rank == 0) {
    for (i = 0; i < 10; i++)
      for (j = 0; j < 10; j++)
        A[i][j] = (float)i;
    // 3. Envie la columna al proceso 1
    MPI_Send(&A[0][col], 1, col_type, 1, 0, MPI_COMM_WORLD);
  } else { /* my_rank = 1 */
    for (i = 0; i < 10; i++)
      for (j = 0; j < 10; j++)
        A[i][j] = 0.0;
    // 4. Reciba la columa en la primera fila en proceso 1
    MPI_Recv(&A[0][0], 10, MPI_FLOAT, 0, 0, MPI_COMM_WORLD, &status);
    for (j = 0; j < 10; j++)
      printf("%3.1f ", A[0][j]);
    printf("\n");
  }
  MPI_Type_free(&col_type);
  MPI_Finalize();
} /* main */
