/*
* @@name:	parallel.1c
* @@type:	C
* @@compilable:	yes
* @@linkable:	yes
* @@expect:	success
*/
#include <omp.h>
#include <iostream>

void subdomain(float *x, int istart, int ipoints)
{
  int i;

  for (i = 0; i < ipoints; i++) {
      x[istart+i] = (istart+i)*3.14159;
printf("thread: %d i: %d istart+i: %d x: %f\n ",omp_get_thread_num(),i,istart+i,x[istart+i]);
  }
  }

void sub(float *x, int npoints)
{
    int iam, nt, ipoints, istart;

//#pragma omp parallel num_threads(3) default(shared) private(iam,nt,ipoints,istart)
#pragma omp parallel default(shared) private(iam,nt,ipoints,istart)
    {
        iam = omp_get_thread_num();
        nt =  omp_get_num_threads();
        ipoints = npoints / nt;    // size of partition 
        istart = iam * ipoints;  // starting array index 
        if (iam == nt-1)     // last thread may do more 
          ipoints = npoints - istart;
        subdomain(x, istart, ipoints);
    }
}

int main()
{
int N=20;
    //float array[10000];
    float array[N];
    sub(array, N);
    return 0;
}
