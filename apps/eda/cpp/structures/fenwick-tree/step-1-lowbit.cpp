// Fenwick tree — concepto de apoyo (supportConcept), NO material del curso.
// Paso 1: el truco entero de la estructura es esta funcion de una linea.
#include <cassert>
#include <iostream>

int lowbit(int i) { return i & (-i); }

int main() {
    // lowbit aisla el bit 1 mas bajo de i.
    assert(lowbit(1) == 1);   // 0001 -> 0001
    assert(lowbit(2) == 2);   // 0010 -> 0010
    assert(lowbit(3) == 1);   // 0011 -> 0001
    assert(lowbit(4) == 4);   // 0100 -> 0100
    assert(lowbit(6) == 2);   // 0110 -> 0010
    assert(lowbit(12) == 4);  // 1100 -> 0100
    std::cout << "OK: lowbit(i) aisla el bit 1 mas bajo de i (verificado para i=1,2,3,4,6,12)\n";
}
