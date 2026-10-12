#include <iostream>
#include <omp.h>
#include <unistd.h>  // para sleep

const int N = 5;  // Número de filósofos
omp_lock_t forks[N];

void think(int id) {
    std::cout << "Filósofo " << id << " está pensando...\n";
//    sleep(1);
}

void eat(int id) {
    std::cout << "Filósofo " << id << " está comiendo...\n";
  //  sleep(1);
}

int main() {
int id,left,right;

// Inicializar los locks (tenedores)
    for (int i = 0; i < N; ++i)
        omp_init_lock(&forks[i]);

    #pragma omp parallel num_threads(N) private(id,left,right)
    {
        id = omp_get_thread_num();
        left = id;
        right = (id + 1) % N;

        for (int i = 0; i < 30; ++i) {
            think(id);
// los filósofos toman primero el tenedor izquierdo, luego el derecho
	omp_set_lock(&forks[left]);
	omp_set_lock(&forks[right]);

            eat(id);

            omp_unset_lock(&forks[left]);
            omp_unset_lock(&forks[right]);
        }

        std::cout << "Filósofo " << id << " ha terminado.\n";
    }

    // Destruir los locks
    for (int i = 0; i < N; ++i)
        omp_destroy_lock(&forks[i]);

    return 0;
}

