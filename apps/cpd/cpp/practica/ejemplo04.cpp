/*************************************************
* Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
* de la Universidad de Ingeniería y Tecnología (UTEC)
* Material es de libre uso, entendiendo que debe contener este encabezado
* UTEC no se responsabiliza del uso particular del código
*
* Autor:       Jose Fiestas (UTEC)
* contacto:    jfiestas@utec.edu.pe
* objetivo:    comunicacion colectiva
*              (reduccion)
* contenido:   codigo fuente en MPI-C++
 *************************************************/
#include <mpi.h>  
#include <iostream>
using namespace std;

int main(int argc, char **argv) {

  int my_rank; 
  int size, i,ti,buf=5,rbuf;
  MPI_Status stat;
  
  MPI_Init(&argc, &argv); /*inicio MPI */
  MPI_Comm_rank(MPI_COMM_WORLD, &my_rank); /*determina el rank del proceso*/
  MPI_Comm_size(MPI_COMM_WORLD, &size); /*determina el numero de procesos*/
  cout<<"Imprimiendo desde el rank "<<my_rank<<" que tiene el buf = "<<buf<<endl;

// Implemente Reduce utilizando MPI_Send, MPI_Recv
// sume los valores de buf de cada proceso en el maestro
// no olvide incluir al maestro, e imprima el resultado
if (my_rank ==0) {
          int res=5;
  for(int i=1;i<size;i++){
          MPI_Recv(&rbuf,1,MPI_INT,i,777,MPI_COMM_WORLD,&stat);
  		res+=rbuf;}
  cout<<"Imprimiendo desde el rank "<<my_rank<<" que recibe res= "<<res<<endl;
  }
    else {
          MPI_Send(&buf,1,MPI_INT,0,777,MPI_COMM_WORLD);
          cout<<"Enviando desde el rank "<<my_rank<<" el buf= "<<buf<<endl;
    }

MPI_Finalize();  /* salida MPI */
  
}
