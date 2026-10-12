#include<iostream>
#include<cassert>
#include<omp.h>
using namespace std;

class C{
int x=0;
int y=0;
public:
void f(){
x=1; // A
y=1; // B
}
void g(){
int a=y; // C
int b=x; // D
assert(b>=a);
}
};

int main(){
int i=1;
while(true){
C c;
#pragma omp parallel  
{
#pragma omp sections 
{
#pragma omp section
c.f();
#pragma omp section
c.g();

}
}
if(++i%1000==0) cout<<i<<endl;
}
}
