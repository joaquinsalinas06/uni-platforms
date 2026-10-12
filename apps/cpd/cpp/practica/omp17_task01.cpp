#include<iostream>
#include<omp.h>
using namespace std;

int main(){

#pragma omp parallel num_threads(3)

{
#pragma omp single
{
#pragma omp task
printf("t1: impresion random desde el hilo: %d\n", omp_get_thread_num());
#pragma omp task
printf("t2: impresion random desde el hilo: %d\n", omp_get_thread_num());
#pragma omp task
printf("t3: impresion random desde el hilo: %d\n", omp_get_thread_num());

}
}

}

/*
tasks:
     tiempo
0 ----t1----
1 ----t2----
2 ----t3----

     tiempo
0 ----t1---- ---t2----
1 ----t3----
2 
     tiempo
0 --t1- ----t2---- 
1       -t1----
2 ----t3----
*/


