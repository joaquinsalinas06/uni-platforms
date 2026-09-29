/*************************************************
 * Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
 * de la Universidad de Ingeniería y Tecnología (UTEC)
 * Material es de libre uso, entendiendo que debe contener este encabezado
 * UTEC no se responsabiliza del uso particular del código
 *
 * Autor:       Jose Fiestas (UTEC)
 * contacto:    jfiestas@utec.edu.pe
 * objetivo:    Allreduce
 * contenido:   código fuente enMPI-C++
  *************************************************/
#include <mpi.h>
#include <iostream>
#include <stdlib.h>
using namespace std;

int main(int argc, char *argv[]) {
    	int   me, numprocs;
	int sum;
	
    MPI_Init(&argc,&argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &me);
    MPI_Comm_size(MPI_COMM_WORLD, &numprocs);

// 1. Envie el rank de cada proceso al maestro 
// sume los valores en cada proceso 
MPI_Allreduce(&me,&sum,1,MPI_INT,MPI_SUM,MPI_COMM_WORLD);
 
// 2. Imprima el resultado desde cada proceso
printf("proceso %i: sum = %i\n",me,sum);    

    MPI_Finalize();
}
    
