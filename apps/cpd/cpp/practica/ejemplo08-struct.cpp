/*************************************************
 * Este archivo fue escrito como ejemplo en el curso Computacion Paralela y Distribuida,
 * de la Universidad de Ingeniería y Tecnología (UTEC)
 * Material es de libre uso, entendiendo que debe contener este encabezado
 * UTEC no se responsabiliza del uso particular del código
 *
 * Autor:       Jose Fiestas (UTEC)
 * contacto:    jfiestas@utec.edu.pe
 * objetivo:    Envia un objeto consistente en un int+float
 *		a través de un anillo de size nodo y se acumulan sus valores en cada proceso
 * 		Input: ninguno
 * 		Output: la suma de los atributos del los objetos en cada proceso
 * 		Nota:  debe ejecutarse en 2 procesos
 * contenido:   código fuente enMPI-C++
 *************************************************/
#include <mpi.h>
#include <stdio.h>

using namespace std;

int main(int argc, char* argv[]) {
  int my_rank, size;
  int i, right, left;

  struct buff {
    int i;
    float f;
  } snd_buf, rcv_buf, sum;

  // 1. Declare los argumentos del nuevo tipo
  int array_of_blocklengths[2];
  MPI_Aint array_of_displacements[2], first_var_address, second_var_address;
  MPI_Datatype array_of_types[2], send_recv_type;

  MPI_Status status;
  MPI_Request request;

  MPI_Init(&argc, &argv);
  MPI_Comm_rank(MPI_COMM_WORLD, &my_rank);
  MPI_Comm_size(MPI_COMM_WORLD, &size);
  right = (my_rank + 1) % size;
  left = (my_rank - 1 + size) % size;

  // 2. Defina array_of_blocklengths, array_of_displacements, array_of_types
  array_of_blocklengths[0] = 1;
  array_of_blocklengths[1] = 1;

  MPI_Get_address(&snd_buf.i, &first_var_address);
  MPI_Get_address(&snd_buf.f, &second_var_address);

  array_of_displacements[0] = (MPI_Aint)0;
  array_of_displacements[1] = MPI_Aint_diff(second_var_address, first_var_address);

  array_of_types[0] = MPI_INT;
  array_of_types[1] = MPI_FLOAT;

  // 3. Defina el nuevo tipo
  MPI_Type_create_struct(2, array_of_blocklengths, array_of_displacements, array_of_types,
                         &send_recv_type);
  MPI_Type_commit(&send_recv_type);

  sum.i = 0;
  sum.f = 0;
  snd_buf.i = my_rank;
  snd_buf.f = 10 * my_rank;  // Step 1 = init

  // 4. Realice la comunicación de anllo
  for (i = 0; i < size; i++) {
    MPI_Issend(&snd_buf, 1, send_recv_type, right, 17, MPI_COMM_WORLD, &request);
    MPI_Recv(&rcv_buf, 1, send_recv_type, left, 17, MPI_COMM_WORLD, &status);
    MPI_Wait(&request, &status);
    snd_buf = rcv_buf;
    sum.i += rcv_buf.i;
    sum.f += rcv_buf.f;
  }

  printf("PE%i:\tSum = %i\t%f\n", my_rank, sum.i, sum.f);

  // 5. Libere memoria
  MPI_Type_free(&send_recv_type);
  MPI_Finalize();
}
