/*
* @@name:	nowait.2c
* @@type:	C
* @@compilable:	yes
* @@linkable:	no
* @@expect:	success
*/

#include <math.h>
#include <stdio.h>
#include <omp.h>

void nowait_example2(int n,float *a, float *b, float *c, float *y, float
*z)
{
   int i;
#pragma omp parallel
   {
#pragma omp for schedule(static) nowait 
   for (i=0; i<n; i++)
   {      c[i] = (a[i] + b[i]) / 2.0f;
//printf("1. thread: %d i: %d a_i: %f b_i: %f c_i %f\n",omp_get_thread_num(),i,a[i],b[i],c[i]);
   }
#pragma omp for schedule(static) nowait
   for (i=0; i<n; i++)
   {  z[i] = sqrtf(c[i]);
printf("2. thread: %d i: %d c_i: %f z_i %f\n",omp_get_thread_num(),i,c[i],z[i]);
   }
#pragma omp for schedule(static) nowait
   for (i=1; i<=n; i++)
   {    y[i] = z[i-1] + a[i];
printf("3. thread: %d i: %d a_i: %f z_i %f y_i %f\n",omp_get_thread_num(),i,a[i],z[i-1],y[i]);
   }
   }
}


int main(){
	int n=64,m=64,i;
	float a[n],b[n],c[n],y[m]={0},z[m];

	for (i=0; i<n; i++) {
		a[i]=2;
		b[i]=3.5;
	}
omp_set_num_threads(8);
	nowait_example2(n,a,b,c,y,z);
//for (i=0; i<n; i++)  printf("salida i %d c_i: %f\n",i,c[i]);
//for (i=0; i<n; i++)  printf("salida i %d z_i: %f\n",i,z[i]);
//for (i=0; i<n; i++)  printf("salida i %d y_i: %f\n",i,y[i]);
printf("%f, %f,%f, %f,%f, %f,%f, %f\n",c[9],c[17],c[25],c[33],c[41],c[49],c[57]);
printf("%f, %f,%f, %f,%f, %f,%f, %f\n",z[9],z[17],z[25],z[33],z[41],z[49],z[57]);
printf("%f, %f,%f, %f,%f, %f,%f, %f\n",z[9],y[17],y[25],y[33],y[41],y[49],y[57]);

}
