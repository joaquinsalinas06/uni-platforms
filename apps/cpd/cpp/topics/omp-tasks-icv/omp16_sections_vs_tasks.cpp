#include<iostream>
#include<omp.h>
using namespace std;

int main(){

#pragma omp parallel //num_threads(3)
{

#pragma omp sections
{
#pragma omp section
printf("s1: impresion random desde el hilo: %d\n", omp_get_thread_num());

#pragma omp section
printf("s2: impresion random desde el hilo: %d\n", omp_get_thread_num());

#pragma omp section
printf("s3: impresion random desde el hilo: %d\n", omp_get_thread_num());
}

}
}

/*
sections:
     tiempo
0 ----s1----
1 ----s2----
2 ----s3----

     tiempo
0 ----s1----
0 ----s2----
1 ----s3----
 
    tiempo
1 ----s1----
1 ----s2----
1 ----s3----

. . .

*/


