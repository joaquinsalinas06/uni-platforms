#include <omp.h>
#include <iostream>

int main()
{
omp_set_num_threads(8);
#pragma omp parallel 
#pragma omp single
{
#pragma omp task
{
    printf ("Task A, hilo %i\n",omp_get_thread_num());
}
#pragma omp task
{
    printf ("Task B, hilo %i\n",omp_get_thread_num());
    #pragma omp task
    {
            printf ("Task C, hilo %i\n",omp_get_thread_num());
    }
    #pragma omp task
    {
            printf ("Task D, hilo %i\n",omp_get_thread_num());
    }
    #pragma omp taskwait
    #pragma omp task
    {
            printf ("Task E, hilo %i\n",omp_get_thread_num());
    }
}
#pragma omp taskwait
printf ("Task F, hilo %i\n",omp_get_thread_num());

//#pragma omp taskwait
  // printf ("Task G, hilo %i\n",omp_get_thread_num());

}
  return 0;
}
