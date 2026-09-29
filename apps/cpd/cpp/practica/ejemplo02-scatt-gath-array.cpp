#include <mpi.h>
#include <iostream>
using namespace std;

int main(int argc, char* argv[]){
int rank,size,data,resultado;
MPI_Init(&argc,&argv);
MPI_Comm_rank(MPI_COMM_WORLD,&rank);
MPI_Comm_size(MPI_COMM_WORLD,&size);
int data_global[10*size], data_local[10];

// 1. Genere un array en el maestro de tamaño n
// suficientente grande, multiplo de size
if(rank==0){
for(int i=0;i<10*size;i++)
           data_global[i]=2*i+1;
}
double t0=0.0, tf=0.0;
if(rank==0) t0=MPI_Wtime();

// 2. Distribuya (scatter) loe elementos del array
// entre los procesos
MPI_Scatter(data_global,10,MPI_INT,data_local,10,MPI_INT,0,MPI_COMM_WORLD);

// 3. Modifique el valor de la data local (en cada proceso)
for(int i=0;i<10;i++)
	data_local[i]=rank*rank;
// 4. Recolecte (Gather) los subarrays por proceso en
// el array original del maestro
MPI_Gather(data_local,10,MPI_INT,data_global,10,MPI_INT,0,MPI_COMM_WORLD);

// 5. Calcule los tiempos de ejecucion en paralelo
// desde el maestro
if(rank==0) {
tf=MPI_Wtime();
cout<<"Proceso "<<rank<<" tiene data ";
for(int i=0;i<10*size;i++)
cout<<data_global[i]<<", ";
cout<<endl;
cout<<"Tiempo paralelo: "<<(tf-t0)<<" s"<<endl;
}
MPI_Finalize();

}
