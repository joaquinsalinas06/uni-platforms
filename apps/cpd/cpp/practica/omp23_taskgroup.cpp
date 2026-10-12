#include <omp.h>
#include <cstdio>

int main() {
    omp_set_num_threads(4);

    #pragma omp parallel
    #pragma omp single
    {
        printf("Inicio (hilo %d)\n", omp_get_thread_num());

        // --- Grupo de tareas con sincronización conjunta ---
        #pragma omp taskgroup
        {
            #pragma omp task
            {
                printf("Tarea A (hilo %d)\n", omp_get_thread_num());
                #pragma omp task
                {
                    printf("Tarea A1 (hilo %d)\n", omp_get_thread_num());
                }
            }

            #pragma omp task
            {
                printf("Tarea B (hilo %d)\n", omp_get_thread_num());
                #pragma omp task
                {
                    printf("Tarea B1 (hilo %d)\n", omp_get_thread_num());
                }
            }
        } // <- Espera implícita: el grupo termina cuando A, B, A1, B1 terminan

        printf("Después del taskgroup (hilo %d)\n", omp_get_thread_num());

        // --- Otra tarea fuera del grupo ---
        #pragma omp task
        {
            printf("Tarea C (hilo %d)\n", omp_get_thread_num());
        }

        #pragma omp taskwait // espera solo la tarea C
        printf("Fin del programa (hilo %d)\n", omp_get_thread_num());
    }
}

