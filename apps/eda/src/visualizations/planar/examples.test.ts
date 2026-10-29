import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapFaces, mapSegments, mapLesson, parityLesson, rayLesson, sweepLesson, crossingLesson } from './examples.ts';
import { planarResult, polygonQuery, rayHits } from '../../../../../packages/visualizations/src/planar/layout.ts';
import { visualizationSchema } from '../../lib/schemas.ts';

test('source map classifies original three queries and infinite face without approximating polygons', () => {
  for(const [query, face] of [[[8,4],'B'],[[4,12],'A'],[[19,4],'C'],[[28,18],undefined]] as const){
    assert.deepEqual(mapFaces.filter(f=>polygonQuery([...query],f.vertices).location==='dentro').map(f=>f.id),face?[face]:[]);
  }
  assert.equal(polygonQuery([8,4],[[0,0],[8,0],[8,10],[0,4]]).location,'frontera');
});
test('source ray map keeps shared-vertex tie and actual sloped impact height', () => {
  const hits=rayHits([8,4],mapSegments);
  assert.equal(hits.filter(h=>h.distance===6).length,2);
  assert.ok(Math.abs(rayHits([19,4],mapSegments)[0].point[1]-77/6)<1e-8);
});
test('all shared lessons satisfy the authoring contract',()=>{
  for(const lesson of [mapLesson,parityLesson,rayLesson,sweepLesson,crossingLesson]) assert.equal(visualizationSchema.safeParse(lesson).success,true);
  assert.equal(planarResult(sweepLesson.steps[2].planar).hits.length,2);
});
test('invalid planar scenes fail at build boundary',()=>{
  assert.equal(visualizationSchema.safeParse({type:'planar',steps:[{note:'missing'}]}).success,false);
  assert.equal(visualizationSchema.safeParse({type:'planar',steps:[{note:'bad bounds',planar:{bounds:[1,0,0,1]}}]}).success,false);
  assert.equal(visualizationSchema.safeParse({type:'planar',steps:[{note:'missing query',planar:{bounds:[0,0,1,1],mode:'ray'}}]}).success,false);
});
