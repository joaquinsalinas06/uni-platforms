#include<iostream>
#include<omp.h>
using namespace std;

int main(){

#pragma omp parallel num_threads(8)
{
int j= omp_get_thread_num();

#pragma omp task
printf("%d\n", j);
}

}



