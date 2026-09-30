import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRich } from './rich-text.ts';

test('markdown en línea + KaTeX, sin HTML crudo', () => {
  const h = renderRich('**Dato:** $V_{out} = 5$ y `analogRead()` <b>x</b>\n\n- uno\n- *dos*');
  assert.match(h, /<strong>Dato:<\/strong>/);
  assert.match(h, /class="katex"/);
  assert.match(h, /<code>analogRead\(\)<\/code>/);
  assert.match(h, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(h, /<ul class="rich-list list-disc"><li>uno<\/li><li><em>dos<\/em><\/li><\/ul>/);
  assert.match(renderRich('$$\\frac{1}{RC}$$'), /katex-display/);
  assert.equal(renderRich('V_out e I_in, 2*3*4'), '<p>V_out e I_in, 2*3*4</p>');
  assert.equal(renderRich('a\nb'), '<p>a<br>b</p>');
});
