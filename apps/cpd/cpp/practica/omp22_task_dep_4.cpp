/*
* @@name:	task_dep.3c
* @@type:	C
* @@compilable:	yes
* @@linkable:	yes
* @@expect:	success
*/
#include <stdio.h>
#include <omp.h>
int main()
{
   int x;
   #pragma omp parallel
   #pragma omp single
   {
      #pragma omp task shared(x) depend(out: x)
         x = 2;
      #pragma omp task shared(x) depend(in: x)
	printf("x+1= %d\n",x+1);
      #pragma omp task shared(x) depend(in: x)
	printf("x+2= %d\n",x+2);
   }
   return 0;
}
