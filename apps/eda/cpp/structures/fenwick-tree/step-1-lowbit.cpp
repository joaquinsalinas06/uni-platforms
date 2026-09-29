// Fenwick tree — concepto de apoyo (supportConcept), NO material del curso.
// Paso 1: el truco entero de la estructura es esta funcion de una linea.
#include <iostream>

using namespace std;

int lowbit(int i) {
  return i & (-i);
}

int main() {
  // lowbit aisla el bit 1 mas bajo de i.
  if (!(lowbit(1) == 1))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 0001 -> 0001
  if (!(lowbit(2) == 2))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 0010 -> 0010
  if (!(lowbit(3) == 1))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 0011 -> 0001
  if (!(lowbit(4) == 4))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 0100 -> 0100
  if (!(lowbit(6) == 2))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 0110 -> 0010
  if (!(lowbit(12) == 4))
    cout << "Verificacion fallida en linea " << __LINE__ << endl;  // 1100 -> 0100
  cout << "OK: lowbit(i) aisla el bit 1 mas bajo de i (verificado para i=1,2,3,4,6,12)\n";
}
