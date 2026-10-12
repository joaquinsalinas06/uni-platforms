#include <iostream>
using namespace std;

#ifdef _OPENMP
  #include <omp.h>
#else
  #define omp_get_thread_num() 0
#endif

int main()
{
   int n = 10, i, id=0, a, b[n];
   for (i=0; i<n; i++)
       b[i] = -1;
// Genere una region paralela en la que se modifique 
// el valor del array b en la posicion i
// donde i es el id del hilo que ocupa la region single

#pragma omp parallel  
{
#pragma omp single nowait
{
      a = 10;
      id=omp_get_thread_num();
      b[id]=a;
      cout<<"constructor Single ejecutado por el hilo "<<id<<endl;
}
} 
cout<<"Fin de la region en paralelo: "<<endl;
   for (i=0; i<n; i++)
   cout<<"b["<<i<<"]"<<"= "<<b[i]<<endl;

}
