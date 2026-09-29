 /*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnoloia (UTEC),
* adaptado sobre los ejemplos del curso
* MPI de Edinburgh Parallel Computing Centre (EPCC).
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    Comunicacion no-bloqueada
* contenido:   codigo fuente en MPI-C++
 *************************************************/
#include <mpi.h>
#include <iostream>
using namespace std;

int main(int argc, char **argv) {
  int numtasks, rank, next, prev,  tag1=1, tag2=2, N=1;//<<1;
  int sbuf[N], rbuf[N];
  double t0,t1;
  MPI_Status stats[2];
  MPI_Init(&argc, &argv);                   // Initialize MPI
  MPI_Comm_rank(MPI_COMM_WORLD, &rank); // Rank of the processor
  MPI_Comm_size(MPI_COMM_WORLD, &numtasks); // Total number of processors
  MPI_Request reqs[4];

prev=rank-1;
next=rank+1;
if(rank==0) prev=numtasks-1;
if(rank==(numtasks-1)) next=0;

sbuf[0]=10;
rbuf[0]=0;

t0=MPI_Wtime();
MPI_Irecv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD,&reqs[0]);
MPI_Isend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD, &reqs[1]);

printf("1.rank %d tiene dato: %d \n ",rank,rbuf[0]);

MPI_Waitall(2,reqs,stats);

printf("2.rank %d tiene dato: %d \n ",rank,rbuf[0]);

t1=MPI_Wtime();

if (rank==0) printf("Tiempo (s): %f \n",t1-t0);

MPI_Finalize();

}
