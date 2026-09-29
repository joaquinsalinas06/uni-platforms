/*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnología (UTEC)
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    Envia una submatriz de una matriz en rank 0 al rank 1
* 		Input: ninguno
* 		Output: la submatriz en rank 1
* 		Nota:  debe ejecutarse en 2 procesos
* contenido:   código fuente enMPI-C++
 *************************************************/
# include <iostream>
# include <mpi.h>

int main ( int argc, char *argv[] )
{
  int rank,N=3,M=6,stride=6;
  int p;

  MPI_Init ( &argc, &argv );
  MPI_Comm_rank ( MPI_COMM_WORLD, &rank );
  MPI_Comm_size ( MPI_COMM_WORLD, &p );
  MPI_Status status;

double A[N][M];
/*
| 0 | 1 | 2 | 3 �4 | 5 |
| 0 | 1 | 2 | 3 �4 | 5 |
| 0 | 1 | 2 | 3 �4 | 5 |
*/

// 1. Declare y defina tipo MPI (vector de un bloque de 2x3)
MPI_Datatype block_type;
MPI_Type_vector(2,3,stride,MPI_DOUBLE,&block_type);
MPI_Type_commit(&block_type);

if (rank==0) {
printf("rank: %d \n",rank);
for (int i=0; i<N;i++) { 
for (int j=0; j<M;j++) {
	A[i][j]=j;
	printf("%f ",A[i][j]);}
printf("\n");
}
// 2. Envie bloque de rank 0 a 1
MPI_Send(&A[0][0],1,block_type,1,0,MPI_COMM_WORLD);
}

else if (rank==1) {
double subdominio[N][M];
// 3. Recibe bloque de rank 0
MPI_Recv(&subdominio[0][0],1,block_type,0,0,MPI_COMM_WORLD,&status);

printf("rank: %d \n",rank);
for (int i=0; i<N;i++) { 
for (int j=0; j<M;j++) {
	printf("%f ",subdominio[i][j]);}
printf("\n");
}
}
// 4. Libere memoria
MPI_Type_free(&block_type);

MPI_Finalize();
}
