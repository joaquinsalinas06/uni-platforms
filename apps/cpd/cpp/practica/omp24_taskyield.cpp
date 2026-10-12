#include <omp.h>
#include <cstdio>
#include <unistd.h> // para sleep()

int main() {
    omp_set_num_threads(4);

    #pragma omp parallel
    #pragma omp single
    {
        printf("Inicio (hilo %d)\n", omp_get_thread_num());

        #pragma omp task
        {
            printf("Task A start (hilo %d)\n", omp_get_thread_num());
            for (int i = 0; i < 3; ++i) {
                printf("Task A paso %d (hilo %d)\n", i, omp_get_thread_num());
                sleep(1);                 // simulamos trabajo largo
                #pragma omp taskyield     // cede el procesador a otra tarea
            }
            printf("Task A end\n");
        }

        #pragma omp task
        {
            printf("Task B start (hilo %d)\n", omp_get_thread_num());
            sleep(2);
            printf("Task B end\n");
        }

        #pragma omp task
        {
            printf("Task C start (hilo %d)\n", omp_get_thread_num());
            sleep(1);
            printf("Task C end\n");
        }

        #pragma omp taskwait
        printf("Todas las tareas terminadas\n");
    }

    return 0;
}

