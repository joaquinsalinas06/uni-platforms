import { test } from 'node:test';
import assert from 'node:assert/strict';
import { polygonQuery, rayHits, sweepOrder, planarResult, planarLayout, planeGeometry, type PlanarInput } from './layout.ts';

test('parity distinguishes concave interior, exterior, edges and vertices', () => {
  const polygon: [number,number][] = [[0,0],[8,0],[8,8],[4,4],[0,8]];
  assert.equal(polygonQuery([2,3], polygon).location, 'dentro');
  assert.equal(polygonQuery([4,7], polygon).location, 'fuera');
  assert.equal(polygonQuery([8,4], polygon).location, 'frontera');
  assert.equal(polygonQuery([4,4], polygon).location, 'frontera');
  assert.equal(polygonQuery([-1,4], polygon).hits.length, 2);
  assert.equal(polygonQuery([-1,8], polygon).hits.length, 0);
});
test('nearest upward impact excludes segments below and outside x, handles collinearity and ties', () => {
  const segments = [
    { id:'below', from:[0,1],to:[8,1] }, { id:'sloped',from:[0,3],to:[8,7] },
    { id:'outside',from:[9,3],to:[10,3] }, {id:'vertical',from:[4,8],to:[4,10]},
  ] as PlanarInput['segments'];
  assert.deepEqual(rayHits([4,4],segments!).map(h=>[h.id,h.point]), [['sloped',[4,5]],['vertical',[4,8]]]);
  assert.deepEqual(rayHits([4,9],segments!).map(h=>[h.id,h.distance]), [['vertical',0]]);
  assert.equal(rayHits([4,11],segments!).length,0);
  assert.equal(rayHits([4,4],[{id:'right',from:[8,0],to:[8,8]}],'right')[0].distance,4);
});
test('sweep endpoints include queries before deactivation and order changes at a crossing', () => {
  const p: PlanarInput={ bounds:[0,0,5,5],mode:'sweep',segments:[{id:'a',from:[0,0],to:[4,4]},{id:'b',from:[0,4],to:[4,0]}],sweepX:1 };
  assert.deepEqual(sweepOrder(p).map(s=>s.id),['a','b']);
  assert.deepEqual(sweepOrder({...p,sweepX:3}).map(s=>s.id),['b','a']);
  assert.equal(sweepOrder({...p,sweepX:4}).length,2);
  assert.equal(sweepOrder({...p,sweepX:4,sweepAfter:true}).length,0);
});
test('range and dominance include boundary points', () => {
  const p: PlanarInput={bounds:[-3,-3,6,6],points:[{id:'a',x:0,y:0},{id:'b',x:4,y:4},{id:'c',x:5,y:-1}],mode:'range',range:[0,0,4,4]};
  assert.deepEqual(planarResult(p).selected,['a','b']);
  assert.deepEqual(planarResult({...p,mode:'dominance',query:{x:4,y:4}}).selected,['a','b']);
});
test('layout keeps equal coordinate scales, finite geometry and in-bounds annotations at mobile/desktop sizes',()=>{
  for(const width of [280,640,760]){
    const p: PlanarInput={bounds:[-3,-2,12,10],mode:'ray',query:{x:4,y:3},segments:[{id:'A',label:'A',from:[0,6],to:[10,8]}]};
    const g=planeGeometry(p.bounds,width);
    assert.ok(Math.abs((g.px(2)-g.px(1))-(g.py(1)-g.py(2)))<1e-8);
    const frame=planarLayout(p,width);
    assert.ok(frame.paths!.every(p=>!p.d.includes('NaN')));
    assert.ok(frame.annotations!.every(a=>a.x>=0&&a.x<=width&&a.y>=0&&a.y<=frame.height));
  }
});
