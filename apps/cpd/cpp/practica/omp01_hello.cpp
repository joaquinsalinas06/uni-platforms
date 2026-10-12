#include <iostream>
#include <unistd.h>
#ifdef _OPENMP
#include <omp.h>
#endif
using namespace std;

int main() {
int id=-1;
// 1. Genere una recion en paralelo 
// con variable compartida id
// 3. Resuelva la condicion de carrera ... clausula private 

#ifdef _OPENMP
omp_set_num_threads(4);
#endif

#pragma omp parallel private(id)    
{   
//int id;
// id es el nombre del hilo (hay condicion de carrera?)
#ifdef _OPENMP
id=omp_get_thread_num();
#endif
// 2. fuerce la condicion de carrera agregando sleep()
sleep(1);
printf("Peekaboo desde el hilo = %d \n",id);
}  
}

 

