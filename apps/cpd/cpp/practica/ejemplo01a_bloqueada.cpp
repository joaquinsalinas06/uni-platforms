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
* objetivo:    Comunicacion Ciclica - no ciclica
* contenido:   codigo fuente en MPI-C++
 *************************************************/
#include <mpi.h>
#include <stdio.h>
#include <iostream>
using namespace std;

int main(int argc, char **argv) {
  int numtasks, rank, next, prev, tag1=1, tag2=2, N=1<<5;
  int sbuf[N], rbuf[N];
  double t0,t1;
  MPI_Status status;
  MPI_Init(&argc, &argv);                   // Initialize MPI
  MPI_Comm_rank(MPI_COMM_WORLD, &rank); // Rank of the processor
  MPI_Comm_size(MPI_COMM_WORLD, &numtasks); // Total number of processors

prev=rank-1;
next=rank+1;
if(rank==0) prev=numtasks-1;
if(rank==(numtasks-1)) next=0;

t0=MPI_Wtime();

// COMUNICACION CICLICA
// 1. Cada proceso envía el buffer a su vecino dereco
// y recibe de su vecino izquierdo
MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
MPI_Recv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &status);

// 2. Utilice send sincrónic, ¿Qué sucede?
// Se bloquea/cuelga (deadlock): MPI_Ssend no retorna hasta que el receptor
// haga el Recv correspondiente, pero todos los procesos están en Ssend primero
//MPI_Ssend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
//MPI_Recv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &status);

// 3. Invierta el orden de Send/Recv, ¿qué sucede?
// Con Ssend también se bloquea: todos quedan esperando en Recv primero
//MPI_Recv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &status);
//MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);

// NO-CICLICA
// 4. Todos los procesos envian menos el ultimo.
// Todos los procesos reciben, menos el maestro
/*
if(rank<numtasks-1)
	MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
if(rank>0)
	MPI_Recv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &status);
*/
t1=MPI_Wtime();

if (rank==0) cout<<"Tiempo (s): "<<t1-t0<<endl;

MPI_Finalize();

}
