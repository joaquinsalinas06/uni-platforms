/* Paralelismo de dos loops anidados
 * usando collapse
 */

#include <omp.h>
#include <iostream>

int main() {
//    const int N = 1<<3, M = 1<<3;
    const int N = 1<<2, M = 1<<4;
    int A[N][M];

    #pragma omp parallel for collapse(2)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < M; j++) {
            A[i][j] = i + j;
            if (omp_get_thread_num() == 0) 
		    printf("Thread %d ejecuta (i=%d, j=%d)\n", omp_get_thread_num(), i, j);
        }
    }
}

