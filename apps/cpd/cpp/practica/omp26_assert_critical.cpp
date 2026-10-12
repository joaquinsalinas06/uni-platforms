#include<iostream>
#include<cassert>
#include<omp.h>
using namespace std;

class C{
int x=0;
int y=0;
public:
void f(){
x=1;
y=1;
}
void g(){
int a=y; 
int b=x;
assert(b>=a);}
};

int main(){
int i=1;
while(true){
C c;
#pragma omp parallel 
{
#pragma omp critical
c.f();
#pragma omp critical
c.g();
}
if(++i%1000==0) cout<<i<<endl;
}
}
