#include <iostream>
#ifdef _OPENMP
#include<omp.h>
#endif
#define CHUNKSIZE 3
#define N 1<<4
using namespace std;

int main(int argc, char *argv[])
{
int i, id=0;
float a[N], b[N], c[N];

for (i=0; i < N; i++){
  	a[i] = 2.0*i;
	b[i] = i * 1.0;
}

 printf("hilo /contador: \n");
#pragma omp parallel private(id)
{
// particione N equitativamente entre hilos (puede usar nowait?)
#pragma omp for schedule(static) private(i)
// particione N equitativamente entre hilos pero con un CHUNKSIZE
//#pragma omp for schedule(static,CHUNKSIZE) private(i) nowait
// particione N en forma dinamica
//#pragma omp for schedule(dynamic) private(i)
// particione N en forma dinamica pero con un CHUNKSIZE
//#pragma omp for schedule(dynamic,CHUNKSIZE) private(i)
for (i=0; i < N; i++){
#ifdef _OPENMP
id=omp_get_thread_num();
#endif
	c[i] = a[i] + b[i];
 	printf(" %i \t %i\n",id,i);
  }
//#pragma omp for 
//for (i=0; i < N; i++) c[i]*=2; 
}  /* end of parallel section */


printf("Suma de vectores: \n");
for (i=0; i < N; i++)
	cout<<a[i]<<"\t"<<b[i]<<"\t"<<c[i]<<endl;

}
