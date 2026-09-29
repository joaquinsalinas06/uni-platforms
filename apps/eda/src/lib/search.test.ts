import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, rank } from './search.ts';

test('normalize quita acentos y mayúsculas', () => {
  assert.equal(normalize('Montículo Binómico'), 'monticulo binomico');
  assert.equal(normalize('  Árbol  '), 'arbol');
});

test('rank: sin query, no hay resultados (no se abre el buscador con la lista entera)', () => {
  assert.deepEqual(rank([{ title: 'Insert', kind: 'operation' as const }], ''), []);
});

test('rank: coincidencia de prefijo antes que interna', () => {
  const items = [
    { title: 'Extract-min', kind: 'operation' as const },
    { title: 'Montículo Binario', kind: 'topic' as const },
  ];
  // "min" es prefijo de ninguno, pero está al inicio de "min..." en ningún caso;
  // probamos con "bin": prefijo de "Binario" via subcadena en "Montículo Binario"
  // (posición > 0) vs prefijo real en un tercer item.
  const withPrefix = [{ title: 'Binomial', kind: 'topic' as const }, ...items];
  const result = rank(withPrefix, 'bin');
  assert.equal(result[0].title, 'Binomial'); // prefijo real
});

test('rank: temas antes que operaciones cuando ambos matchean igual de bien', () => {
  const items = [
    { title: 'Insert', kind: 'operation' as const },
    { title: 'Insertion sort tree', kind: 'topic' as const },
  ];
  const result = rank(items, 'insert');
  assert.equal(result[0].kind, 'topic');
});

test('rank: sin acentos en la búsqueda encuentra títulos con acento', () => {
  const items = [{ title: 'Montículo Binómico', kind: 'topic' as const }];
  assert.equal(rank(items, 'monticulo').length, 1);
});

test('rank: ninguna coincidencia da lista vacía', () => {
  const items = [{ title: 'Insert', kind: 'operation' as const }];
  assert.deepEqual(rank(items, 'xyz'), []);
});
