/*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnología (UTEC)
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    comunicacion punto a punto
*              Impresion en paralelo
* contenido:   codigo fuente en MPI-C++
 *************************************************/
#include <iostream>
#include <mpi.h>
using namespace std;

int main(int argc, char **argv) {
int rank,size,numero,arr_numero[10],count;
MPI_Status estado;
MPI_Init(&argc,&argv);
MPI_Comm_rank(MPI_COMM_WORLD,&rank);
MPI_Comm_size(MPI_COMM_WORLD,&size);

//cout<<numero<<endl;

// 1. incluya un MPI_Abort si se ejecuta el codigo en mas de dos procesos

if(size>2){ 
if(rank==0){
fprintf(stderr, "Mas de 2 procesos");
MPI_Abort(MPI_COMM_WORLD,-1);
}
}
else{

// 2. imprima un mensaje indicando el dato que 
// envia el proceso 0 al 1, y un mensaje desde el proceso 1 cuando reciba el dato
if(rank==0){
numero=5;
MPI_Send(&numero,1,MPI_INT,1,999,MPI_COMM_WORLD);
printf("Envio numero %d hacia el rank %d\n ",numero,rank);
}
else if(rank==1){
MPI_Recv(&numero,1,MPI_INT,0,999,MPI_COMM_WORLD,&estado);
printf("Recibo numero %d desde el rank %d\n ",numero,rank);
}

// 3.Participacion: Envie un array

if(rank==0){
for(int i=0;i<10;i++) arr_numero[i]=i;
MPI_Send(arr_numero,10,MPI_INT,1,998,MPI_COMM_WORLD);
printf("Envio array hacia el rank 1\n");
}
else if(rank==1){
MPI_Recv(arr_numero,10,MPI_INT,0,998,MPI_COMM_WORLD,&estado);
MPI_Get_count(&estado,MPI_INT,&count);
printf("Recibo array de %d elementos desde el rank 0\n",count);
}

} // else

MPI_Finalize();

}
