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
---

Ejercicios de laboratorio de todo el curso, organizados de menor a mayor
dificultad dentro de cada bloque temático: primero comunicación punto a
punto y estructura básica de un programa MPI, luego las operaciones
colectivas, después comunicación bloqueante vs. no bloqueante en anillo, y
por último los tipos de datos derivados. El código completo de cada item
vive en `cpp/practica/`.
</content>
