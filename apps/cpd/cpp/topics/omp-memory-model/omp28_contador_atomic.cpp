#include <omp.h>
#include <stdio.h>
int main()
{
int x;
x = 0;
omp_set_num_threads(8);
double t1=omp_get_wtime();
#pragma omp parallel shared(x) 
  {
for (int i=0;i<100000;i++)  
  #pragma omp atomic 
  x = x + 1;
  }  /* end of parallel section */
double t2=omp_get_wtime();
printf("valor de x : %i  \n",x);
printf("tiempo: %f8",(t2-t1));
}

