#ifdef _OPENMP
#include <omp.h>
#endif
#include <stdio.h>
int main()
{
int n=1<<10,cnt=0,cnt_t=0,f=1, a[n]={0},b[n]={0};

for(int i=n/2;i<n;i++){
	a[i]=i;
	b[i]=2*i;
}

#ifdef _OPENMP
double t1=omp_get_wtime();
#endif
// paralelice el conteo de la cantidad de ceros
// del array b
#pragma omp parallel private(cnt)
{
int cnt=0;
#pragma omp for 
for(int i=0;i<n;i++){
	if(b[i]==0){
//#pragma omp critical
 	cnt++;
	}
} // for
#pragma omp critical
cnt_t+=cnt;
} // parallel
#ifdef _OPENMP
double t2=omp_get_wtime()-t1;
#endif
//for(int i=0;i<n;i++)
//	printf("%i %i\n",a[i],b[i]);
printf("\n cnt_t: %i",cnt_t);
printf("\ntiempo: %f",t2);
}

