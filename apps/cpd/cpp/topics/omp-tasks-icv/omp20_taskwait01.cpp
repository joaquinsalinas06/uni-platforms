#include <omp.h>
  #include <stdio.h>
  #include <unistd.h>

  int main()
 {
omp_set_num_threads(8);
   #pragma omp parallel 
   #pragma omp single
   {
//#pragma omp taskgroup
//{
    #pragma omp task
   {
       printf ("Task 1, hilo %i\n",omp_get_thread_num());

       #pragma omp task
     {
       printf ("Task 2, hilo %i\n",omp_get_thread_num());
     }
       #pragma omp task
     {
       printf ("Task 4, hilo %i\n",omp_get_thread_num());
     }
   }

    #pragma omp task
   {
       printf ("Task 5, hilo %i\n",omp_get_thread_num());
	}	
//} // taskgroup
   #pragma omp taskwait

     #pragma omp task
    {
       printf ("Task 3, hilo %i\n",omp_get_thread_num());
     }
   }

  return 0;
  }
