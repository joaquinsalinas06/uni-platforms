/*
* @@name:	private.1c
* @@type:	C
* @@compilable:	yes
* @@linkable:	yes
* @@expect:	success
*/
#include <iostream>
#include <omp.h>

int main()
{
  int i, j;

  i = 1;
  j = 2;

// paralelice el bloque y mida el efecto de
// private, firsprivate
//#pragma omp parallel private(i,j)
#pragma omp parallel firstprivate(i,j)
  {
    i = 3;
    j = j + 2;
  printf("parallel i: %i j: %i \n",i,j);
  }

  printf("i: %i j: %i \n",i,j);

  return 0;
}
