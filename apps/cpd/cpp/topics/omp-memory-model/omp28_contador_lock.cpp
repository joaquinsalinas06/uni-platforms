#include <omp.h>
#include <stdio.h>
int main()
{
int x;
x = 0;
omp_set_num_threads(8);
omp_lock_t writelock;
omp_init_lock(&writelock);
double t1=omp_get_wtime();
#pragma omp parallel shared(x) 
  {
for (int i=0;i<100000;i++){
  omp_set_lock(&writelock);
  x = x + 1;
  omp_unset_lock(&writelock);
}
  }  /* end of parallel section */
omp_destroy_lock(&writelock);
double t2=omp_get_wtime();
printf("valor de x : %i  \n",x);
printf("tiempo: %f8",(t2-t1));
}

