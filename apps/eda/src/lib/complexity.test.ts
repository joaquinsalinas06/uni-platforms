import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeComplexity, growthWeight } from './complexity.ts';

test('normaliza Θ/Ω a O y "log" a "lg" — la notación real del curso', () => {
  assert.equal(normalizeComplexity('Θ(lg n)'), 'O(lg n)');
  assert.equal(normalizeComplexity('Θ(n)'), 'O(n)');
  assert.equal(normalizeComplexity('O(log n)'), 'O(lg n)');
});

test('growthWeight reconoce las cotas reales del contenido (antes caían todas al default)', () => {
  assert.equal(growthWeight('O(1)'), 1);
  assert.equal(growthWeight('Θ(1)'), 1);
  assert.equal(growthWeight('Θ(lg n)'), 2);
  assert.equal(growthWeight('O(lg n)'), 2);
  assert.equal(growthWeight('Θ(n)'), 7);
});

test('growthWeight: mayor notación de crecimiento, mayor peso', () => {
  assert.ok(growthWeight('O(1)') < growthWeight('O(lg n)'));
  assert.ok(growthWeight('O(lg n)') < growthWeight('O(n)'));
  assert.ok(growthWeight('O(n)') < growthWeight('O(n lg n)'));
});

test('una notación no cubierta cae al peso medio, sin reventar', () => {
  assert.equal(growthWeight('O(D(n) + t(H))'), 5);
});
