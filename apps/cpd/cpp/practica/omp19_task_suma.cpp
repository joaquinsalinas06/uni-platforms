#include<iostream>
#include<omp.h>
using namespace std;
#define ARR_SIZE 120
int a[ARR_SIZE];

int main(){
int i, sum=0;
for(i=0; i<ARR_SIZE;i++) a[i]=1;
#pragma omp parallel num_threads(4)
{
	#pragma omp for schedule(static)
	for(i=0; i<ARR_SIZE;i+=10){
		int j, start=i,end=i+10-1;

	#pragma omp task  
	{
	int psum=0;
	printf("sum( %d, %d) con hilo %d de %d\n", start,end,omp_get_thread_num(), omp_get_num_threads());
	for(j=start;j<=end;j++){
		psum+= a[j];
	}
	
	#pragma omp critical
	{
	sum+=psum;
	}
	}
}	
}
printf("sum %d \n",sum);
}

