/*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnología (UTEC)
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    comunicacion de submatrices entre procesos 
* contenido:   código fuente enMPI-C++
 *************************************************/
# include <iostream>
# include <mpi.h>
#define N 16
#define M 8
void imprimir_matriz(double A[][M]){
printf("Matriz A\n");
for (int i=0; i<N;i++) {
for (int j=0; j<M;j++) {
        printf("%f ",A[i][j]);
}
printf("\n");
}
}

int main ( int argc, char *argv[] )
{
int size, rank, i, j, elem_pproc, fil_pproc;
        double A[N][M], Al[N][M];
        MPI_Init(&argc, &argv);
 	MPI_Comm_size(MPI_COMM_WORLD, &size);
     	MPI_Comm_rank(MPI_COMM_WORLD, &rank);

if (rank==0) {
for (int i=0; i<N;i++) {
for (int j=0; j<M;j++) {
        A[i][j]=j;
}
}
printf("Matriz origen\n");
imprimir_matriz(A);
}
// 1. Envie N/p filas a cada proceso, donde se almacenan 
//    en submatriz Al
elem_pproc = N*M/size;
fil_pproc=N/size;
       MPI_Scatter(A,fil_pproc*M,MPI_DOUBLE,Al,fil_pproc*M,MPI_DOUBLE,0,MPI_COMM_WORLD);
	
 for (i=0;i<fil_pproc;i++)
 	for (j=0;j<M;j++){
	  	Al[i][j] *= 2;
}
// 2. Envie las submatrices desde cada proceso al maestro
       MPI_Gather(Al,fil_pproc*M,MPI_DOUBLE,A,fil_pproc*M,MPI_DOUBLE,0,MPI_COMM_WORLD);
if (rank==0) {
printf("Matriz destino\n");
imprimir_matriz(A);
}

MPI_Finalize();

}
