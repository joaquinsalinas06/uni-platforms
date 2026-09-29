/*************************************************
 * Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
 * de la Universidad de Ingeniería y Tecnología (UTEC)
 * Material es de libre uso, entendiendo que debe contener este encabezado
 * UTEC no se responsabiliza del uso particular del código
 *
 * Autor:       Jose Fiestas (UTEC)
 * contacto:    jfiestas@utec.edu.pe
 * objetivo:    Scatter-Gather
 * contenido:   código fuente enMPI-C++
  *************************************************/
#include <mpi.h>
#include <iostream>
using namespace std;

int main(int argc, char* argv[]){
int rank,size,data,resultado;
MPI_Init(&argc,&argv);
MPI_Comm_rank(MPI_COMM_WORLD,&rank);
MPI_Comm_size(MPI_COMM_WORLD,&size);
int data_global[size], data_local;

// 1. Genere un array en el maestro de tamaño igual a la cantidad
// total de procesos 
if(rank==0){
	for(int i=0;i<size;i++)
		data_global[i]=2*i+1;
	cout<<"Proceso "<<rank<<" tiene data ";
	for(int i=0;i<size;i++) cout<<data_global[i]<<", ";
	cout<<endl;
}
// 2. Distribuya (scatter) loe elementos del array
// uno a cada proceso
MPI_Scatter(data_global,1,MPI_INT,&data_local,1,MPI_INT,0,MPI_COMM_WORLD);

// 3. Modifique el valor de la data local (en cada proceso)
printf("proceso %d tiene data %d\n",rank,data_local);
data_local*=2;
printf("proceso %d duplica data %d\n",rank,data_local);

// 4. Recolecte (Gather) los resultados parciales por proceso en
// el array original del maestro
MPI_Gather(&data_local,1,MPI_INT,data_global,1,MPI_INT,0,MPI_COMM_WORLD);

// 5. Imprima el array desde el maestro
if(rank==0) {
	cout<<"Proceso "<<rank<<" tiene data ";
	for(int i=0;i<size;i++) cout<<data_global[i]<<", ";
	cout<<endl;
}
MPI_Finalize();

}
