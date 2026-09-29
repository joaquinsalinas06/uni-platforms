 /*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnoloia (UTEC),T
* adaptado sobre los ejemplos del curso
* MPI de Edinburgh Parallel Computing Centre (EPCC).
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del códigod
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    Comunicacion Ciclica, desbloqueo
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
  MPI_Status stats[4];
  MPI_Init(&argc, &argv);                   // Initialize MPI
  MPI_Comm_rank(MPI_COMM_WORLD, &rank); // Rank of the processor
  MPI_Comm_size(MPI_COMM_WORLD, &numtasks); // Total number of processors

prev=rank-1;
next=rank+1;
if(rank==0) prev=numtasks-1;
if(rank==(numtasks-1)) next=0;

int* buf = new int[N]{0};
t0=MPI_Wtime();

// COMUNICACION CICLICA
// 1. Un proceso (e.g. el maestro) rompe el bloqueo, si primero recibe
//  y luego envia el mensaje
if(rank==0){
MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
}
else{
MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
}

// 2. Pruebelo con send sincronico
//if(rank==0){
//MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
//MPI_Ssend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
//}
//else{
//MPI_Ssend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
//MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
//}

// 3. Cada segundo proceso invierte el orden
/*
if(rank%2==0){
MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
} else {
MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD, &stats[0]);
MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);
}
*/
t1=MPI_Wtime();

if (rank==0) cout<<"Tiempo (s): "<<t1-t0<<endl;

MPI_Finalize();

}
