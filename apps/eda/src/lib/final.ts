/** Ancla de un ejercicio de /final: el prefijo "(L3)" / "(S5a)" de su enunciado. */
export const ancla = (statement: string) => statement.match(/^\((\w+)\)/)?.[1];
