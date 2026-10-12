#include<iostream>
#include<omp.h>
using namespace std;

#define ARR_SIZE 1<<20
#define MAX_ITER 1000
int main(){

int i, sum=0, prod=1;
int a[ARR_SIZE];
double t1, t2;


for(int i=0;i<ARR_SIZE;i++) a[i]=1; 

t1=omp_get_wtime();
//for(int i=0;i<MAX_ITER;i++){
#pragma omp parallel num_threads(4) default(shared)
{
	int psum=0, pprod=1;
	#pragma omp for schedule(static)
	for(int i=0;i<ARR_SIZE;i++) {
		psum+=a[i];
		pprod*=a[i];
	}
	#pragma omp critical
{
	sum+=psum;
//	printf("psum: %d, sum: %d\n",psum,sum);
}	
	#pragma omp critical
{
	prod*=pprod;
//	printf("pprod: %d, prod: %d\n",pprod,prod);
}
}
//}
t2=omp_get_wtime();
//printf("tiempo: %f8",(t2-t1)/MAX_ITER);
printf("tiempo: %f8\n",(t2-t1));
printf("sum: %d, prod: %d",sum,prod);
}
