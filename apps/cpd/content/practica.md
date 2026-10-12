---
title: "Ejemplos y ejercicios de laboratorio"
items:
  - level: 1
    statement: "Trace este programa MPI mínimo (\"Peekaboo\"): explique qué imprime cada proceso y por qué el orden de las líneas impresas no está garantizado al ejecutar con `mpirun -np 4 ./ejemplo01`."
    hints:
      - "Todos los procesos ejecutan el mismo binario (SPMD): la única diferencia entre ellos es el valor de `rank` que cada uno obtiene de `MPI_Comm_rank`."
      - "La impresión sólo ocurre si `ierr == MPI_SUCCESS`, es decir si `MPI_Init` no falló."
    solution: "Cada uno de los 4 procesos imprime \"Peekaboo! desde <rank> de un total de <size>\", con size=4. El orden entre procesos no está determinado porque se ejecutan concurrentemente y no hay sincronización entre las impresiones."
    cppFile: "ejemplo01.cpp"

  - level: 1
    statement: "Implemente la comunicación punto a punto faltante: el proceso 0 debe enviar el entero `numero=5` al proceso 1 con tag 999, y el proceso 1 debe recibirlo e imprimir un mensaje confirmando el dato recibido. Además, incluya un `MPI_Abort` que detenga la ejecución si el programa corre en más de 2 procesos."
    hints:
      - "`MPI_Abort(MPI_COMM_WORLD, -1)` termina todos los procesos del comunicador; llámelo sólo desde donde detecta la condición de error, después de avisar por `stderr`."
      - "El tag (999) permite distinguir este mensaje de otros enviados entre el mismo par de procesos — en la Participación siguiente se envía un array con un tag distinto (998)."
    solution: "if(size>2){ if(rank==0){ fprintf(stderr,\"Mas de 2 procesos\"); MPI_Abort(MPI_COMM_WORLD,-1);} } else { if(rank==0){ numero=5; MPI_Send(&numero,1,MPI_INT,1,999,MPI_COMM_WORLD);} else if(rank==1){ MPI_Recv(&numero,1,MPI_INT,0,999,MPI_COMM_WORLD,&estado);} }"
    cppFile: "ejemplo02.cpp"

  - level: 2
    statement: "Participación: extienda el ejemplo anterior para enviar un array de 10 enteros del proceso 0 al proceso 1 (tag 998), y en el proceso 1 use `MPI_Get_count` para imprimir cuántos elementos realmente llegaron."
    hints:
      - "`MPI_Get_count(&status, MPI_INT, &count)` lee del objeto `status` cuántos elementos del tipo dado se recibieron — no hace falta que el receptor conozca de antemano el tamaño exacto."
      - "Use un tag distinto al del envío del entero simple, para no confundir ambos mensajes en el mismo par de procesos."
    solution: "if(rank==0){ for(i=0;i<10;i++) arr_numero[i]=i; MPI_Send(arr_numero,10,MPI_INT,1,998,MPI_COMM_WORLD);} else if(rank==1){ MPI_Recv(arr_numero,10,MPI_INT,0,998,MPI_COMM_WORLD,&estado); MPI_Get_count(&estado,MPI_INT,&count);}"
    cppFile: "ejemplo02.cpp"

  - level: 2
    statement: "Envíe la segunda mitad de un vector de 10 floats (posiciones 5 a 9) desde el proceso 0 al proceso 1, de modo que el proceso 1 la reciba en las posiciones 0 a 4 de su propio vector local. El programa debe ejecutarse en exactamente 2 procesos."
    hints:
      - "El puntero `&vector[5]` apunta al inicio de la segunda mitad — un `MPI_Send` con `count=5` a partir de ahí basta, sin copiar nada manualmente."
      - "El proceso receptor puede recibir en `&vector[0]` aunque el emisor haya enviado desde `&vector[5]`: source y destino no tienen que compartir offsets."
    solution: "MPI_Send(&vector[5],5,MPI_FLOAT,1,0,MPI_COMM_WORLD); // en rank 0\nMPI_Recv(&vector[0],5,MPI_FLOAT,0,0,MPI_COMM_WORLD,&status); // en rank 1"
    cppFile: "ejemplo01_count.cpp"

  - level: 2
    statement: "Envíe la fila `f=1` de una matriz `A[6][6]` de floats desde el proceso 0 al proceso 1, de modo que el proceso 1 reciba esa fila en la misma posición de su propia matriz local (inicializada en 0). El programa debe ejecutarse en 2 procesos."
    hints:
      - "En C, una matriz se almacena por filas: `A[f]` ya es un puntero contiguo a los M elementos de esa fila, sin necesidad de un tipo derivado."
      - "Compare esto con enviar una columna: ahí sí hace falta un tipo derivado (ver los ejercicios de `MPI_Type_vector` más abajo), porque una columna no es contigua en memoria."
    solution: "MPI_Send(A[f],M,MPI_FLOAT,1,0,MPI_COMM_WORLD); // rank 0\nMPI_Recv(A[f],M,MPI_FLOAT,0,0,MPI_COMM_WORLD,&status); // rank 1"
    cppFile: "ejemplo02_send_row.cpp"

  - level: 3
    statement: "Complete un programa que difunda un entero desde el maestro (rank 0) a todos los procesos con `MPI_Bcast`, luego cada proceso multiplique el valor recibido por su propio rank, y finalmente se recolecte la suma de todos los resultados en el maestro con `MPI_Reduce`. Imprima el resultado sólo desde el maestro."
    hints:
      - "`MPI_Bcast` necesita que **todos** los procesos —incluido el root— hagan la misma llamada; el root aporta el dato válido y el resto un buffer donde recibirlo."
      - "`MPI_Reduce(&data, &resultado, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD)` combina los `data` de todos los procesos en `resultado`, disponible sólo en el rank 0."
    solution: "if(rank==0) data=5;\nMPI_Bcast(&data,1,MPI_INT,0,MPI_COMM_WORLD);\ndata*=rank;\nMPI_Reduce(&data,&resultado,1,MPI_INT,MPI_SUM,0,MPI_COMM_WORLD);\nif(rank==0) cout<<\"resultado: \"<<resultado<<endl;"
    cppFile: "ejemplo01-bcast-reduce.cpp"

  - level: 2
    statement: "Reimplemente `MPI_Bcast` a mano usando sólo `MPI_Send`/`MPI_Recv`: el maestro (rank 0) fija `numero=4` y lo envía uno por uno a todos los demás procesos en un bucle; cada proceso no-maestro lo recibe con `MPI_ANY_TAG` e imprime el valor recibido."
    hints:
      - "El bucle del maestro va de `i=1` hasta `size-1` — el propio maestro no necesita enviarse el dato a sí mismo, ya lo tiene."
      - "Este broadcast manual cuesta O(#procesos) llamadas desde la raíz; compare con la colectiva `MPI_Bcast`, que la librería puede optimizar a O(log2(#procesos)) — ver /topics/mpi-collectives/bcast."
    solution: "if(rank==0){ numero=4; for(i=1;i<size;i++) MPI_Send(&numero,1,MPI_INT,i,999,MPI_COMM_WORLD);} else { MPI_Recv(&numero,1,MPI_INT,0,MPI_ANY_TAG,MPI_COMM_WORLD,&estado);}"
    cppFile: "ejemplo03.cpp"

  - level: 2
    statement: "Reimplemente `MPI_Reduce` a mano usando sólo `MPI_Send`/`MPI_Recv`: cada proceso no-maestro envía su valor local `buf=5` al maestro (tag 777), y el maestro suma su propio valor más el de todos los demás en la variable `res`, imprimiendo el resultado final."
    hints:
      - "El maestro empieza con `res` inicializado en su propio `buf` (5) y suma un `MPI_Recv` por cada uno de los `size-1` procesos restantes."
      - "Compare el costo de este bucle de recepciones contra `MPI_Reduce`, que la librería puede optimizar internamente (ver /topics/mpi-collectives/algorithms/reduce)."
    solution: "if(my_rank==0){ int res=5; for(int i=1;i<size;i++){ MPI_Recv(&rbuf,1,MPI_INT,i,777,MPI_COMM_WORLD,&stat); res+=rbuf;} } else { MPI_Send(&buf,1,MPI_INT,0,777,MPI_COMM_WORLD);}"
    cppFile: "ejemplo04.cpp"

  - level: 3
    statement: "Complete un programa que reparta un elemento por proceso desde un array `data_global` (generado en el maestro con `data_global[i]=2*i+1`) usando `MPI_Scatter`, cada proceso duplique su valor local, y luego se recolecten todos los valores modificados de vuelta al array del maestro con `MPI_Gather`."
    hints:
      - "El array `data_global` debe tener tamaño `size` (un elemento por proceso) y sólo necesita existir con datos válidos en el rank 0 antes del `MPI_Scatter`."
      - "`MPI_Gather` reordena automáticamente los aportes según el rank de cada proceso — el elemento del rank i termina en la posición i del array reunido."
    solution: "if(rank==0) for(i=0;i<size;i++) data_global[i]=2*i+1;\nMPI_Scatter(data_global,1,MPI_INT,&data_local,1,MPI_INT,0,MPI_COMM_WORLD);\ndata_local*=2;\nMPI_Gather(&data_local,1,MPI_INT,data_global,1,MPI_INT,0,MPI_COMM_WORLD);"
    cppFile: "ejemplo02-scatt-gath.cpp"

  - level: 3
    statement: "Extienda el scatter/gather anterior al caso de varios elementos por proceso: genere un array de tamaño `10*size` en el maestro, repártalo con `MPI_Scatter` (10 elementos por proceso), haga que cada proceso calcule `rank*rank` en su porción local, y recolecte todo de vuelta con `MPI_Gather`. Mida el tiempo de la sección paralela con `MPI_Wtime`."
    hints:
      - "El tamaño del array por proceso (10) debe coincidir en el `sendcnt` del Scatter y el `sendcnt` del Gather — son parámetros independientes que deben mantenerse consistentes a mano."
      - "Tome el tiempo inicial (`t0`) justo antes del Scatter y el final (`tf`) después del Gather, sólo desde el rank 0, para medir el costo de la sección paralela completa."
    solution: "MPI_Scatter(data_global,10,MPI_INT,data_local,10,MPI_INT,0,MPI_COMM_WORLD);\nfor(i=0;i<10;i++) data_local[i]=rank*rank;\nMPI_Gather(data_local,10,MPI_INT,data_global,10,MPI_INT,0,MPI_COMM_WORLD);"
    cppFile: "ejemplo02-scatt-gath-array.cpp"

  - level: 4
    statement: "Distribuya las filas de una matriz `A[16][8]` entre los procesos disponibles usando `MPI_Scatter` (N/p filas por proceso), haga que cada proceso multiplique por 2 los valores de su submatriz local, y recolecte las submatrices modificadas de vuelta en la matriz original del maestro con `MPI_Gather`."
    hints:
      - "El `sendcnt`/`recvcnt` de una submatriz de `fil_pproc` filas y M columnas es `fil_pproc * M` elementos — no `fil_pproc` ni `M` por separado."
      - "Como en C una matriz se almacena por filas, un bloque de filas consecutivas sí es contiguo en memoria y puede tratarse como un array plano de `fil_pproc*M` elementos, sin necesidad de un tipo derivado."
    solution: "elem_pproc = N*M/size; fil_pproc = N/size;\nMPI_Scatter(A,fil_pproc*M,MPI_DOUBLE,Al,fil_pproc*M,MPI_DOUBLE,0,MPI_COMM_WORLD);\nfor(i=0;i<fil_pproc;i++) for(j=0;j<M;j++) Al[i][j]*=2;\nMPI_Gather(Al,fil_pproc*M,MPI_DOUBLE,A,fil_pproc*M,MPI_DOUBLE,0,MPI_COMM_WORLD);"
    cppFile: "ejemplo03_matrices.cpp"

  - level: 3
    statement: "Complete un programa donde cada proceso aporta su propio rank a un `MPI_Allreduce` con `MPI_SUM`, de modo que **todos** los procesos (no sólo un root) terminen con la suma total de todos los ranks."
    hints:
      - "`MPI_Allreduce` no tiene parámetro `root`: todos los procesos deben proveer los mismos argumentos de count/datatype/op, y todos reciben el resultado combinado."
      - "Compare con `MPI_Reduce` + `MPI_Bcast` manual: `MPI_Allreduce` logra el mismo efecto en una sola llamada que la librería puede optimizar internamente."
    solution: "MPI_Allreduce(&me,&sum,1,MPI_INT,MPI_SUM,MPI_COMM_WORLD);\nprintf(\"proceso %i: sum = %i\\n\",me,sum); // mismo valor impreso desde todos los procesos"
    cppFile: "ejemplo03-allreduce.cpp"

  - level: 5
    statement: "Ejercicio de práctica (cálculo de π por integración numérica): calcule el valor de π en paralelo mediante la fórmula de aproximación $\\pi = \\int_0^1 \\frac{4}{1+x^2}dx \\approx \\frac{1}{n}\\sum_{i=1}^{n} \\frac{4}{1+\\left(\\frac{i-0.5}{n}\\right)^2}$. Use `MPI_Bcast` para distribuir la cantidad de intervalos `n` a todos los procesos, varíe `n` de $10^2$ a $10^6$ en potencias de 10, asigne correctamente el rango de iteración a cada proceso según su rank, use `MPI_Reduce` para sumar el cálculo parcial de cada proceso en el maestro, calcule el error respecto al valor real de π (3.1415926535897932384626433), y mida los tiempos con `MPI_Wtime` para distintas combinaciones de `n` y `p` (con $10^2<n<10^6$, $1<p<8$), graficando el tiempo en función de `p`."
    hints:
      - "El rango de iteración del proceso `mpi_rank` es `(n/mpi_size * mpi_rank) + 1` hasta `(n/mpi_size * (mpi_rank+1))` inclusive — cada proceso suma sólo su porción de la sumatoria completa."
      - "El resultado final es `global_sum / n`, no `global_sum` directamente; el error es `pi_real - resultado`."
      - "Mida el tiempo (`MPI_Wtime`) sólo alrededor del bucle de cómputo/comunicación paralela, desde el rank 0, para poder comparar entre configuraciones de p."
    solution: "MPI_Bcast(&n,1,MPI_INT,0,MPI_COMM_WORLD);\nfor(i=(n/mpi_size*mpi_rank)+1; i<=(n/mpi_size*(mpi_rank+1)); ++i)\n    local_sum += 4/(1+pow((i-0.5)/n,2));\nMPI_Reduce(&local_sum,&global_sum,1,MPI_DOUBLE,MPI_SUM,0,MPI_COMM_WORLD);\nif(mpi_rank==0){ result=global_sum/n; error=pi-result; }"
    cppFile: "ejemplo03-PI-reduce.cpp"

  - level: 5
    statement: "Ejercicio de práctica (promedio de 1000 números vía Scatter/Gather): calcule el promedio de los números de un array `n[1000]`. Genere el array con números aleatorios entre 0 y 100 en el maestro, asigne a cada proceso una cantidad equivalente de números con `MPI_Scatter`, haga que cada proceso calcule el promedio de su propia muestra, agrupe esos promedios parciales en un array con `MPI_Gather` en el nodo principal, y calcule ahí el promedio global. Haga variar el número de procesos p de 2 a 40, midiendo y graficando el tiempo de ejecución en función de p."
    hints:
      - "El tamaño del array (1000) debe ser divisible por la cantidad de procesos para que `MPI_Scatter` reparta partes iguales — de no serlo, hay que ajustar el tamaño o rellenar (padding) el array."
      - "El promedio global **no** es directamente el promedio de los promedios parciales si las porciones tienen tamaños distintos — con porciones iguales sí lo es, pero conviene verificarlo explícitamente."
    cppFile: "ejemplo02-scatt-gath-array.cpp"

  - level: 4
    statement: "Analice el patrón de comunicación cíclica de un anillo bloqueante: cada proceso envía (`MPI_Send`) a su vecino derecho y recibe (`MPI_Recv`) de su vecino izquierdo. Explique por qué usar `MPI_Ssend` en vez de `MPI_Send` produce un deadlock, y por qué invertir el orden (Recv antes que Send en todos los procesos) también se bloquea."
    hints:
      - "`MPI_Ssend` no retorna hasta que el receptor haya iniciado su `MPI_Recv` correspondiente — si todos los procesos llaman a `Ssend` primero, todos quedan esperando a que otro llame a `Recv`, pero nadie llega ahí."
      - "Invertir a Recv-primero-luego-Send tiene el mismo problema simétrico: todos esperan datos que nadie ha enviado todavía."
    solution: "El deadlock ocurre porque la dependencia circular Send→espera-de-Recv se repite en los p procesos sin que ninguno rompa el ciclo. La solución (ver ejemplo01b_bloqueada.cpp) es que un proceso distinguido invierta su orden: Recv antes que Send."
    cppFile: "ejemplo01a_bloqueada.cpp"

  - level: 4
    statement: "Complete la versión sin deadlock del anillo cíclico bloqueante: el proceso rank 0 debe primero recibir de su vecino izquierdo y luego enviar a su vecino derecho, mientras que todos los demás procesos primero envían y luego reciben. Mida el tiempo total con `MPI_Wtime`."
    hints:
      - "Sólo el rank 0 necesita el orden invertido (Recv, Send); el resto usa el orden natural (Send, Recv) — eso alcanza para romper el ciclo de espera mutua."
      - "Verifique que el resultado es el mismo que en la versión con deadlock, sólo que esta sí termina de ejecutarse."
    solution: "if(rank==0){ MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD,&stats[0]); MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD);} else { MPI_Send(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD); MPI_Recv(sbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD,&stats[0]);}"
    cppFile: "ejemplo01b_bloqueada.cpp"

  - level: 4
    statement: "Reescriba el anillo cíclico usando comunicación no bloqueante: cada proceso inicia un envío sincrónico no bloqueante (`MPI_Issend`) hacia su vecino derecho, continúa de inmediato con un `MPI_Recv` bloqueante desde su vecino izquierdo, y sólo al final completa el envío con `MPI_Wait`. Explique por qué esta versión no produce deadlock aunque use el modo sincrónico."
    hints:
      - "`MPI_Issend` retorna inmediatamente sin esperar a que el receptor inicie su `Recv` — el `MPI_Wait` posterior es el único punto donde realmente se espera esa condición, y para entonces todos los procesos ya están recibiendo."
      - "Compare el resultado con la variante comentada en el código (Send bloqueado + Irecv no bloqueado) — ambas rompen el ciclo, pero por razones distintas."
    solution: "MPI_Issend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD,&request);\nMPI_Recv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD,&status);\nMPI_Wait(&request,&status);"
    cppFile: "ejemplo01c_nobloqueada.cpp"

  - level: 4
    statement: "Complete un anillo totalmente no bloqueante: cada proceso inicia simultáneamente un `MPI_Irecv` desde su vecino izquierdo y un `MPI_Isend` hacia su vecino derecho, imprime el dato local antes de completarse la comunicación (para verificar que aún no llegó), y luego usa `MPI_Waitall` para esperar ambas operaciones antes de imprimir el dato ya actualizado."
    hints:
      - "Inicie primero el `Irecv` y después el `Isend` — declarar el receptor antes ayuda a que la implementación evite copias intermedias, como señala el material de mpi-blocking-nonblocking."
      - "`MPI_Waitall(2, reqs, stats)` espera ambas operaciones (`reqs[0]` del Irecv y `reqs[1]` del Isend) en una sola llamada, en vez de dos `MPI_Wait` separados."
    solution: "MPI_Irecv(rbuf,N,MPI_INT,prev,tag1,MPI_COMM_WORLD,&reqs[0]);\nMPI_Isend(sbuf,N,MPI_INT,next,tag1,MPI_COMM_WORLD,&reqs[1]);\n// ... trabajo/impresión intermedia ...\nMPI_Waitall(2,reqs,stats);"
    cppFile: "ejemplo01d_nobloqueada.cpp"

  - level: 3
    statement: "Defina y use un tipo `MPI_Type_contiguous` de 2 enteros (`buff_type`) para transportar un par de sumas parciales (`i`, `j`) alrededor de un anillo de procesos, acumulando en `sum` los valores recibidos de cada vecino en cada una de las `size` vueltas del anillo."
    hints:
      - "`MPI_Type_contiguous(2, MPI_INT, &buff_type)` agrupa los dos campos consecutivos del struct `{int i; int j;}` en un único tipo derivado — no hace falta enviar `i` y `j` por separado."
      - "No olvide `MPI_Type_commit(&buff_type)` antes de usarlo en `MPI_Issend`/`MPI_Recv`, y `MPI_Type_free(&buff_type)` al finalizar."
    solution: "MPI_Type_contiguous(2,MPI_INT,&buff_type);\nMPI_Type_commit(&buff_type);\nfor(i=0;i<size;i++){\n  MPI_Issend(&snd_buf,1,buff_type,right,17,MPI_COMM_WORLD,&request);\n  MPI_Recv(&rcv_buf,1,buff_type,left,17,MPI_COMM_WORLD,&status);\n  MPI_Wait(&request,&status);\n  snd_buf=rcv_buf; sum.i+=rcv_buf.i; sum.j+=rcv_buf.j;\n}"
    cppFile: "ejemplo04_contiguous.cpp"

  - level: 3
    statement: "Defina un tipo `MPI_Type_vector` para extraer la columna `col=6` de una matriz `A[10][10]` de floats, envíela del proceso 0 al proceso 1, y en el proceso 1 imprima los 10 valores recibidos en esa misma columna de su matriz local."
    hints:
      - "Los parámetros son `count=10` (diez elementos en la columna), `blocklength=1` (cada bloque es un elemento), `stride=10` (diez elementos por fila de una matriz `10x10`)."
      - "El puntero de envío/recepción es `&A[0][col]`, el primer elemento de la columna — el tipo derivado se encarga de saltar entre filas."
    solution: "MPI_Type_vector(10,1,10,MPI_FLOAT,&col_type);\nMPI_Type_commit(&col_type);\nif(my_rank==0) MPI_Send(&A[0][col],1,col_type,1,0,MPI_COMM_WORLD);\nelse MPI_Recv(&A[0][col],1,col_type,0,0,MPI_COMM_WORLD,&status);"
    cppFile: "ejemplo05_vector.cpp"

  - level: 4
    statement: "Adapte el ejercicio anterior para enviar una columna (`col=5`) de una matriz en el proceso 0 y recibirla como la primera **fila** de una matriz distinta en el proceso 1 (es decir, el tipo derivado sólo se usa en el lado emisor; el receptor recibe con un tipo contiguo simple, ya que una fila sí es contigua)."
    hints:
      - "El tipo `MPI_Type_vector` de la columna sólo hace falta declararlo en el proceso que envía; el proceso que recibe puede usar `MPI_FLOAT` con `count=10` porque su fila destino sí es contigua en memoria."
      - "Los dos procesos igual deben declarar y confirmar el tipo derivado si el código es común a ambos (SPMD), aunque sólo uno lo use realmente para enviar."
    solution: "MPI_Type_vector(10,1,10,MPI_FLOAT,&col_type); MPI_Type_commit(&col_type);\nif(my_rank==0) MPI_Send(&A[0][col],1,col_type,1,0,MPI_COMM_WORLD);\nelse MPI_Recv(&A[0][0],10,MPI_FLOAT,0,0,MPI_COMM_WORLD,&status);"
    cppFile: "ejemplo06_vector.cpp"

  - level: 5
    statement: "Defina un tipo `MPI_Type_vector` que describa un bloque de 2 filas por 3 columnas dentro de una matriz `A[3][6]` (stride=6, es decir, el ancho total de la matriz), envíe ese bloque del proceso 0 al proceso 1, y verifique en el proceso 1 que el subdominio recibido coincide con el bloque original."
    hints:
      - "Un bloque 2x3 dentro de una matriz de 6 columnas por fila es `MPI_Type_vector(2, 3, 6, MPI_DOUBLE, &block_type)`: 2 bloques (filas) de 3 elementos cada uno, con 6 elementos de stride entre el inicio de una fila y la siguiente."
      - "El bloque recibido en el proceso 1 queda ubicado en las mismas posiciones relativas `[0][0]` a `[1][2]` de su matriz `subdominio`, aunque el resto de esa matriz quede sin inicializar."
    solution: "MPI_Type_vector(2,3,stride,MPI_DOUBLE,&block_type);\nMPI_Type_commit(&block_type);\nif(rank==0) MPI_Send(&A[0][0],1,block_type,1,0,MPI_COMM_WORLD);\nelse if(rank==1) MPI_Recv(&subdominio[0][0],1,block_type,0,0,MPI_COMM_WORLD,&status);"
    cppFile: "ejemplo07_vector.cpp"

  - level: 5
    statement: "Defina un tipo `MPI_Type_create_struct` para un `struct {int i; float f;}`, usando `MPI_Get_address` y `MPI_Aint_diff` para calcular el desplazamiento real del segundo campo (respetando el padding que el compilador pueda insertar), y haga circular ese struct por un anillo de procesos, acumulando la suma de sus dos campos en cada vuelta."
    hints:
      - "Nunca asuma que el desplazamiento del segundo campo es `sizeof(int)` — el compilador puede insertar padding; siempre consulte las direcciones reales con `MPI_Get_address` y reste con `MPI_Aint_diff`."
      - "`array_of_blocklengths = {1,1}`, `array_of_types = {MPI_INT, MPI_FLOAT}`, y `array_of_displacements = {0, MPI_Aint_diff(dir_f, dir_i)}`."
    solution: "MPI_Get_address(&snd_buf.i,&first_var_address);\nMPI_Get_address(&snd_buf.f,&second_var_address);\narray_of_displacements[0]=0;\narray_of_displacements[1]=MPI_Aint_diff(second_var_address,first_var_address);\narray_of_types[0]=MPI_INT; array_of_types[1]=MPI_FLOAT;\nMPI_Type_create_struct(2,array_of_blocklengths,array_of_displacements,array_of_types,&send_recv_type);\nMPI_Type_commit(&send_recv_type);"
    cppFile: "ejemplo08-struct.cpp"

  - level: 1
    statement: Escriba una región paralela con 4 hilos en la que cada hilo imprima `Peekaboo desde el hilo = <id>`. Primero declare `id` como variable **compartida** y fuerce la condición de carrera con `sleep(1)`; luego resuélvala con la cláusula `private`. Explique qué impresiones aparecen en cada caso.
    hints:
    - 'Con `id` compartida hay **una sola** ubicación de memoria para los 4 hilos: todos escriben ahí y luego imprimen lo que haya al momento de despertar.'
    - '`omp_set_num_threads(4)` fija el número de hilos de la siguiente región; `omp_get_thread_num()` devuelve el id del hilo (0 es el master).'
    - '`#pragma omp parallel private(id)` le da a cada hilo su propia copia de `id`, sin inicializar.'
    solution: "#pragma omp parallel private(id)\n{\n  id = omp_get_thread_num();\n  sleep(1);\n  printf(\"Peekaboo desde el hilo = %d \\n\", id);\n}\nCon `id` compartida varios hilos imprimen el id del último que escribió (se repiten valores). Con `private(id)` se imprimen exactamente 0,1,2,3 (en orden indeterminado)."
    cppFile: omp01_hello.cpp
  - level: 1
    statement: 'Con `N = 16` iteraciones y 4 hilos, use `#pragma omp for` para sumar dos vectores `c[i] = a[i] + b[i]` e imprima, en cada iteración, el hilo que la ejecutó. Compare `schedule(static)`, `schedule(static, 3)`, `schedule(dynamic)` y `schedule(dynamic, 3)`: ¿qué iteraciones ejecuta cada hilo en cada caso?'
    hints:
    - '`static` sin chunk divide las iteraciones en 4 bloques contiguos e iguales, uno por hilo, antes de ejecutar.'
    - '`static, 3` reparte bloques de 3 en rueda: los hilos 0 y 1 reciben un segundo bloque porque 16 no es múltiplo de 12.'
    - '`dynamic` entrega un bloque cuando el hilo termina el anterior: el reparto cambia entre corridas.'
    solution: 'static: hilo0→0..3, hilo1→4..7, hilo2→8..11, hilo3→12..15.

      static,3: hilo0→{0..2,12..14}, hilo1→{3..5,15}, hilo2→{6..8}, hilo3→{9..11}.

      dynamic / dynamic,3: asignación no determinista, cada hilo toma el siguiente bloque libre; conviene cuando el costo por iteración es desigual.'
    cppFile: omp02_for.cpp
  - level: 2
    statement: Use `sections` con 2 hilos para que una sección calcule `c = a + b` y la otra `d = a * b` sobre vectores de 100 elementos. ¿Se puede usar `nowait` en el `sections`? ¿Por qué?
    hints:
    - Cada `section` se ejecuta **una sola vez** y por un solo hilo; con 2 hilos y 2 secciones, uno ejecuta cada una (aunque un mismo hilo podría ejecutar ambas).
    - '`sections` tiene una barrera implícita al final; `nowait` la elimina.'
    - 'Piense qué hay justo después del `sections`: ¿algún código lee `c` o `d` antes de que termine la región paralela?'
    solution: "#pragma omp parallel num_threads(2) shared(a,b,c,d) private(i,id)\n{\n#pragma omp sections nowait\n {\n#pragma omp section\n  for (i=0;i<N;i++) c[i]=a[i]+b[i];\n#pragma omp section\n  for (i=0;i<N;i++) d[i]=a[i]*b[i];\n }\n}\nSí se puede usar `nowait`: no hay código dentro de la región que dependa de `c` ni `d`, y la región paralela termina con su propia barrera."
    cppFile: omp03_sections.cpp
  - level: 2
    statement: Genere una región paralela en la que sólo **un** hilo (con `single nowait`) ejecute `a=10; b[id]=a;` donde `id` es el identificador del hilo que entró al `single`. Después de la región, imprima `b`. ¿Qué posiciones de `b` cambian y quién decide cuál?
    hints:
    - '`single` lo ejecuta **un** hilo cualquiera, no necesariamente el master; el estándar no dice cuál.'
    - El arreglo `b` se inicializa en -1; sólo la posición `id` del hilo ganador debería ser 10.
    - '`nowait` evita que los demás hilos esperen en la barrera del `single`, pero la región paralela igualmente termina con una barrera.'
    solution: "#pragma omp parallel\n{\n#pragma omp single nowait\n { a=10; id=omp_get_thread_num(); b[id]=a; }\n}\nSólo cambia `b[id]` del hilo que ejecutó el bloque; cuál fue lo decide el runtime (el primero que llega)."
    cppFile: omp04_single.cpp
  - level: 2
    statement: Cuente cuántos ceros tiene un arreglo `b` de 1024 elementos en paralelo. Escriba la versión con un contador privado `cnt` por hilo y un `critical` **fuera** del bucle para sumar en `cnt_t`. ¿Por qué es mejor que poner `critical` dentro del `for`?
    hints:
    - Cada hilo cuenta en su variable privada, sin ninguna sincronización, durante el bucle.
    - El `critical` sólo debe ejecutarse una vez por hilo, para sumar el parcial al total.
    - Compare cuántas veces entra un hilo a la sección crítica en cada versión.
    solution: "#pragma omp parallel private(cnt)\n{\n int cnt = 0;\n#pragma omp for\n for(int i=0;i<n;i++) if(b[i]==0) cnt++;\n#pragma omp critical\n cnt_t += cnt;\n}\nDentro del `for`, el `critical` se ejecutaría tantas veces como ceros haya (serializa); fuera, p veces (una por hilo): el costo de sincronización baja de O(n) a O(p)."
    cppFile: omp05_critical_conteo.cpp
  - level: 2
    statement: Calcule el producto escalar de dos vectores de 32 elementos (a=1.0, b=2.0) con `parallel for` y `reduction(+:result)` con `schedule(dynamic)`. ¿Qué valor final obtiene? ¿Qué pasa con los parciales que se imprimen dentro del bucle?
    hints:
    - Cada hilo trabaja con una copia privada de `result` inicializada en 0.
    - Los parciales impresos dentro del bucle son los de **cada copia privada**, no el total.
    - Al terminar el bucle se suman las copias privadas al `result` compartido.
    solution: '#pragma omp parallel for schedule(dynamic) reduction(+:result)

      for(i=0;i<n;i++) result += a[i]*b[i];

      Resultado final: 64 (32 productos de 1.0·2.0). Los parciales por hilo varían según el reparto; sólo el valor final es independiente del schedule.'
    cppFile: omp06_reduction.cpp
  - level: 2
    statement: 'Compare `private(i,j)` y `firstprivate(i,j)` en la región paralela: `i=1, j=2` antes; dentro `i=3; j=j+2;`. ¿Qué valores se imprimen dentro y después de la región en cada caso?'
    hints:
    - '`private` crea una copia **sin inicializar**: `j + 2` usaría basura.'
    - '`firstprivate` inicializa cada copia con el valor del original antes de entrar.'
    - En ambos casos los **originales** `i` y `j` no cambian al salir de la región.
    solution: 'firstprivate: dentro, cada hilo imprime i=3, j=4; después de la región: i=1, j=2.

      private: dentro i=3 pero j = (basura)+2 (no determinista); después: i=1, j=2.'
    cppFile: omp08_private.cpp
  - level: 2
    statement: Paralelice `for (i=0; i<n-1; i++) a[i] = b[i] + b[i+1];` y luego ejecute `a[i] = b[i];` fuera de la región. ¿Qué cláusula necesita para que `i` valga `n-1` al salir, igual que en el programa secuencial?
    hints:
    - Una variable `private` no devuelve su valor al original al terminar la región.
    - La cláusula debe copiar al original el valor de la **última** iteración (en orden secuencial).
    - Va en la directiva `omp for`.
    solution: "#pragma omp parallel\n{\n#pragma omp for lastprivate(i)\n for (i=0;i<n-1;i++) a[i]=b[i]+b[i+1];\n}\na[i]=b[i];  /* i == n-1 */"
    cppFile: omp09_lastprivate.cpp
  - level: 3
    statement: Calcule el máximo de `work(i)` para `i = 0..2^20-1` en paralelo. Compare (a) `critical` **dentro** del bucle y (b) cada hilo con `pmax` privado y un `critical` **fuera** del bucle. ¿Cuántas entradas a la sección crítica hay en cada caso y cuál versión escala?
    hints:
    - En (a) cada iteración compite por el cerrojo.
    - En (b) cada hilo calcula su máximo local sin sincronizar y sólo combina una vez.
    - Mida con `omp_get_wtime()` y varíe el número de hilos.
    solution: "(a) 2^20 entradas al critical: la región queda serializada, sin speedup.\n(b) p entradas (una por hilo): el costo de sincronización es O(p) y el bucle escala como O(n/p).\n#pragma omp parallel private(pmax)\n{ pmax=0;\n#pragma omp for\n for(i=0;i<n;i++){ r=work(i); pmax=(r>pmax?r:pmax); }\n#pragma omp critical\n mx=(pmax>mx?pmax:mx); }"
    cppFile: omp11_critical_max.cpp
  - level: 3
    statement: Calcule pi con la regla del rectángulo (2^20 pasos) repartiendo los índices en rueda (`i = id; i += nthrds`). Combine los parciales con `atomic` y con `critical`. ¿Por qué hay que inicializar `sum` en cada hilo?
    hints:
    - Cada hilo acumula `sum += 4.0/(1.0+x*x)` en una variable **local** y suma `sum*step` a `pi` una sola vez.
    - '`atomic` basta porque la actualización es una única operación `pi += ...`.'
    - 'Una variable local no inicializada contiene basura: el resultado dependería de la pila.'
    solution: "#pragma omp parallel\n{ int i,id=omp_get_thread_num(),nt=omp_get_num_threads(); double x,sum=0;\n for(i=id;i<num_steps;i+=nt){ x=(i+0.5)*step; sum+=4.0/(1.0+x*x); }\n#pragma omp atomic\n pi += sum*step; }\nCon `sum=0` el resultado converge a 3.14159... y es el mismo con `critical`."
    cppFile: omp12_atomic_pi.cpp
  - level: 2
    statement: 'Para una matriz `A[4][16]` compare tres paralelizaciones del doble bucle: (1) `parallel for` sólo en `i`, (2) `parallel for` anidado en `i` y `j` con `omp_set_nested(1)`, (3) `parallel for collapse(2)`. ¿Cuántas unidades de trabajo reparte cada una?'
    hints:
    - En (1) sólo hay N = 4 iteraciones para repartir.
    - 'En (2) se crean regiones paralelas dentro de regiones paralelas: más overhead.'
    - '`collapse(2)` fusiona los dos bucles en un espacio de N·M iteraciones.'
    solution: '(1) 4 unidades: con más de 4 hilos algunos quedan ociosos.

      (2) 4 regiones externas × 16 internas con dos niveles de creación de hilos (overhead).

      (3) 64 unidades en una sola región: mejor balance y menor overhead.

      #pragma omp parallel for collapse(2)

      for(int i=0;i<N;i++) for(int j=0;j<M;j++) A[i][j]=i+j;'
    cppFile: omp15_collapse_3.cpp
  - level: 2
    statement: Cree tres tareas (`t1`, `t2`, `t3`) dentro de `parallel num_threads(3)` + `single`, cada una imprimiendo el hilo que la ejecuta. Dibuje al menos tres asignaciones posibles tarea→hilo. ¿Se puede predecir la salida?
    hints:
    - El hilo que ejecuta `single` **crea** las tareas; cualquier hilo libre puede **ejecutarlas**.
    - Una tarea puede ejecutarse inmediatamente o quedar diferida.
    - El orden de impresión no está determinado.
    solution: "#pragma omp parallel num_threads(3)\n#pragma omp single\n{\n#pragma omp task\n printf(\"t1 hilo %d\\n\",omp_get_thread_num());\n#pragma omp task\n printf(\"t2 hilo %d\\n\",omp_get_thread_num());\n#pragma omp task\n printf(\"t3 hilo %d\\n\",omp_get_thread_num());\n}\nPosibles: cada tarea en un hilo distinto; t1 y t2 en el mismo hilo y t3 en otro; las tres en un solo hilo. La salida no es predecible."
    cppFile: omp17_task01.cpp
  - level: 3
    statement: 'Prediga la salida de dos programas con tareas: (A) `task depend(out: x) x=2;` seguido de `task depend(in: x) print(x)`, y (B) el mismo par pero con el orden de creación **invertido** (`in` primero, `out` después), con `int x = 1`. Justifique con el tipo de dependencia.'
    hints:
    - 'En (A) es lectura tras escritura (RAW): la lectura espera a la escritura.'
    - En (B) la tarea `out` depende de las tareas `in` **anteriores** sobre `x` (WAR).
    - Las dependencias se establecen por el orden de **creación** de las tareas.
    solution: '(A) imprime `x = 2`. (B) imprime `x = 1`: la escritura espera a la lectura previa, así que el print ocurre antes de `x = 2`.'
    cppFile: omp22_task_dep_2.cpp
  - level: 3
    statement: En el programa de las tareas A, B, C, D, E, F (B crea C y D, hace `taskwait`, crea E; el padre hace `taskwait` y luego imprime F), indique **qué impresiones están garantizadas en orden** y cuál no. Después añada un `taskgroup` para garantizar que F salga después de E.
    hints:
    - El `taskwait` del padre espera a sus tareas **hijas** (A y B), no a las nietas.
    - E es hija de B, es decir, nieta del padre.
    - '`taskgroup` espera a todas las tareas creadas dentro, incluidas las descendientes.'
    solution: 'Garantizado: B antes que C y D; C y D antes que E; A y B antes que F. NO garantizado: E antes que F (E es nieta). Solución: encerrar la creación de A y B en `#pragma omp taskgroup { ... }` antes de imprimir F.'
    cppFile: omp21_taskwait02.cpp
  - level: 3
    statement: 'Dibuje el DAG de tareas del programa con `depend` (T1: out a; T2: out b, con una tarea anidada T5: in b, out c; T3: in a,b out c; T4: in c). ¿Cuál es el camino crítico y qué problema hay con T3 y T5?'
    hints:
    - Cada `depend` en una tarea crea aristas desde las tareas **hermanas** anteriores que escribieron esa variable.
    - 'T5 es hija de T2: sus dependencias no la conectan con T3 ni T4.'
    - Dos tareas sin dependencia entre sí que escriben `c` forman una carrera.
    solution: 'Aristas: T1→T3 (a), T2→T3 (b), T3→T4 (c). Camino crítico: T1→T3→T4 (3 tareas). T5 no tiene aristas hacia T3/T4: T3 y T5 escriben `c` sin orden (carrera); sólo coinciden en el resultado porque a+b = b+3 = 3.'
    cppFile: omp22_task_dep_5.cpp
  - level: 3
    statement: Sume los 120 elementos de un arreglo (todos 1) creando una tarea por bloque de 10 elementos dentro de un `for` con `schedule(static)` y combine los parciales con `critical`. ¿Qué valor obtiene y cuántas tareas se crean?
    hints:
    - Cada tarea calcula `psum` de su bloque `[start, end]`.
    - Combinar `psum` en `sum` requiere exclusión mutua.
    - Hay 120/10 = 12 bloques.
    solution: '12 tareas; cada una suma 10 elementos y hace `#pragma omp critical sum += psum;`. Resultado: 120.'
    cppFile: omp19_task_suma.cpp
  - level: 4
    statement: El programa de los 5 filósofos (cada uno toma primero su tenedor izquierdo y luego el derecho con `omp_set_lock`) a veces se cuelga. Explique por qué y modifíquelo para que **nunca** se bloquee.
    hints:
    - Piense en lo que pasa si los 5 hilos toman su tenedor izquierdo antes de que alguno pida el derecho.
    - 'Es una espera circular: cada uno retiene un lock y espera el del vecino.'
    - 'Rompa la simetría: fije un orden total de los locks.'
    solution: 'Deadlock: ciclo de espera F0→F1→F2→F3→F4→F0. Solución por jerarquía de recursos: pedir siempre primero el lock de menor índice:

      int first=left<right?left:right, second=left<right?right:left;

      omp_set_lock(&forks[first]); omp_set_lock(&forks[second]); eat(id); omp_unset_lock(&forks[second]); omp_unset_lock(&forks[first]);'
    cppFile: omp29_filosofos.cpp
  - level: 2
    statement: Escriba un programa híbrido MPI+OpenMP donde cada proceso abra una región paralela de 4 hilos e imprima `hilo i de np, proceso r de numprocs`. Con `mpirun -np 2`, ¿cuántas líneas se imprimen? ¿Qué cambia en una máquina con 8 núcleos por nodo si se usan 2 procesos × 4 hilos en vez de 1 × 8?
    hints:
    - '`MPI_Init`/`MPI_Finalize` encierran todo; `#pragma omp parallel` va entre ambos.'
    - El total de hilos es procesos × hilos por proceso.
    - En ambas combinaciones se usan los 8 núcleos; cambia cuántos procesos hay con halo propio.
    solution: '2 procesos × 4 hilos = 8 líneas. 2×4 vs 1×8: se usan los mismos 8 núcleos; con 1×8 hay menos procesos (menos halos y mensajes) pero más sincronización de hilos y mayor exposición a efectos NUMA.'
    cppFile: omp30_hibrido_mpi_omp.cpp

---

Ejercicios de laboratorio de todo el curso, organizados de menor a mayor
dificultad dentro de cada bloque temático: primero comunicación punto a
punto y estructura básica de un programa MPI, luego las operaciones
colectivas, después comunicación bloqueante vs. no bloqueante en anillo, y
después los tipos de datos derivados, y por último la unidad de memoria compartida: regiones paralelas OpenMP, reparto de trabajo, sincronización y alcance de datos, tareas, modelo de memoria y paralelismo híbrido. El código completo de cada item
vive en `cpp/practica/`.
</content>
