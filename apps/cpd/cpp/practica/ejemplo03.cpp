/*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnología (UTEC)
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    comunicacion colectiva
*              (Broadcast)
* contenido:   codigo fuente en MPI-C++
 *************************************************/
#include <mpi.h>
#include <iostream>
using namespace std;

int main(int argc, char **argv) {
int rank,size,numero=555,conteo;
MPI_Status estado;
MPI_Init(&argc,&argv);
MPI_Comm_rank(MPI_COMM_WORLD,&rank);
MPI_Comm_size(MPI_COMM_WORLD,&size);

// 1. Como en el ejemplo02, pero realice el envío
// de datos del maestro a todos los procesos (Broadcast)

if(rank==0){
numero=4;
// envio al resto de procesos
for(int i=1;i<size;i++)
	MPI_Send(&numero,1,MPI_INT,i,999,MPI_COMM_WORLD);
	
printf("Imprimiendo desde el rank %d que envia el numero %d \n ",rank,numero);
}
else{
// Recibo desde el maestro
	MPI_Recv(&numero,1,MPI_INT,0,MPI_ANY_TAG,MPI_COMM_WORLD,&estado);
printf("Imprimiendo desde el rank %d que recibe el numero %d \n ",rank,numero);
}

MPI_Finalize();

}
