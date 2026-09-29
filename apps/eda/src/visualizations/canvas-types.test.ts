import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NODE_STATES,
  NODE_W,
  boxWidth,
  resolveState,
  resolveEdgeState,
  nodeStyle,
  edgeStyle,
} from './canvas-types.ts';

test('sin `state` explícito, el nodo hereda el comportamiento de hoy (activo si está en highlight)', () => {
  assert.equal(resolveState({ id: 'n1' }, ['n1']), 'active');
  assert.equal(resolveState({ id: 'n1' }, []), 'idle');
});

test('`state` explícito gana sobre highlight — retrocompatibilidad de familias nuevas', () => {
  assert.equal(resolveState({ id: 'n1', state: 'muted' }, ['n1']), 'muted');
});

test('igual para aristas: sin `state`, se deriva de si un extremo está en highlight', () => {
  assert.equal(resolveEdgeState({ from: 'a', to: 'b' }, ['a']), 'active');
  assert.equal(resolveEdgeState({ from: 'a', to: 'b' }, []), 'idle');
  assert.equal(resolveEdgeState({ from: 'a', to: 'b', state: 'muted' }, ['a']), 'muted');
});

test('la regla del color: var(--accent) aparece EXACTAMENTE en nodeStyle("active") y en ningún otro estado', () => {
  for (const state of NODE_STATES) {
    const visual = nodeStyle(state);
    const mentionsAccent = visual.fill.includes('--accent') || visual.stroke.includes('--accent');
    assert.equal(mentionsAccent, state === 'active', `estado "${state}" no debería tocar --accent`);
  }
});

test('los siete estados producen siete combinaciones visuales distintas entre sí', () => {
  const tuples = NODE_STATES.map((s) => {
    const v = nodeStyle(s);
    return JSON.stringify([v.fill, v.stroke, v.strokeWidth, v.dash ?? null, v.opacity, v.double ?? false]);
  });
  assert.equal(new Set(tuples).size, NODE_STATES.length, 'dos estados quedaron indistinguibles sin color');
});

test('no-regresión del árbol: idle/active son exactamente lo que hoy hardcodea el canvas', () => {
  const idle = nodeStyle('idle');
  assert.equal(idle.fill, 'var(--paper)');
  assert.equal(idle.stroke, 'var(--rule)');
  assert.equal(idle.strokeWidth, 1.5);
  assert.equal(idle.text, 'var(--ink)');

  const active = nodeStyle('active');
  assert.equal(active.fill, 'var(--accent)');
  assert.equal(active.stroke, 'var(--accent)');
  assert.equal(active.text, 'var(--accent-ink)');
});

test('`marked` usa --marked (ámbar) y `answer` usa --answer (carmesí) — nunca --accent', () => {
  const marked = nodeStyle('marked');
  assert.ok(marked.fill.includes('--marked') && !marked.fill.includes('--accent'));
  assert.ok(marked.text.includes('--marked-ink'));

  const answer = nodeStyle('answer');
  assert.ok(answer.fill.includes('--answer') && !answer.fill.includes('--accent'));
  assert.ok(answer.text.includes('--answer-ink'));
});

test('edgeStyle: una arista sólo se pinta de accent cuando está activa, nunca por su `kind`', () => {
  const kinds: Array<'tree' | 'shared' | 'pointer'> = ['tree', 'shared', 'pointer'];
  for (const kind of kinds) {
    assert.ok(!edgeStyle(kind, 'idle').stroke.includes('--accent'));
    assert.ok(!edgeStyle(kind, 'muted').stroke.includes('--accent'));
    assert.ok(edgeStyle(kind, 'active').stroke.includes('--accent'));
  }
});

test('edgeStyle: tree es sólida, shared es discontinua — la diferencia que exige path copying', () => {
  assert.equal(edgeStyle('tree', 'idle').dash, undefined);
  assert.equal(edgeStyle('shared', 'idle').dash, '4 3');
});

test('boxWidth crece con el texto y nunca es menor que el mínimo', () => {
  assert.equal(boxWidth('9'), NODE_W);
  assert.ok(boxWidth('(15,-2)') > NODE_W);
});
