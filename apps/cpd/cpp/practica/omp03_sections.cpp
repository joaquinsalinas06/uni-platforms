#include<iostream>
#ifdef _OPENMP
#include <omp.h>
#endif
using namespace std;
#define N     100

int main()
{ 
int i,id=0;
float a[N], b[N], c[N], d[N];
/* inicializar arrays */
for (i=0; i < N; i++) {
  a[i] = i * 1;
  b[i] = i + 2;  }

#pragma omp parallel num_threads(2) shared(a,b,c,d) private(i,id)
  {
// 1. genere una seccion para sumar los arrays
//    y otra para multiplicar sus elementos
// se puede usar nowait?
#pragma omp sections nowait
{ 
#pragma omp section
{
   for (i=0; i < N; i++){
      	c[i] = a[i] + b[i];
#ifdef _OPENMP
	id=omp_get_thread_num();
#endif
    	printf("seccion 1. Hilo: %i it: %i \n ",id,i);
	    }
} // section 1
#pragma omp section
{
    for (i=0; i < N; i++){
      	d[i] = a[i] * b[i];

#ifdef _OPENMP
	id=omp_get_thread_num();
#endif
    	printf("seccion 2. Hilo: %i it: %i \n ",id,i);
} // section 2
	    }
	    }// sections
  }  /* end of parallel section */

//for (i=0; i < N; i++)
//	cout<<a[i]<<"\t"<<b[i]<<"\t"<<c[i]<<"\t"<<d[i]<<endl;
}

