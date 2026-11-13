import test from 'node:test';
import assert from 'node:assert/strict';
import {softmax,getAttention,causalMask,inputs} from '../dist/attention.js';
test('Softmax is stable for large logits and masks future positions to zero',()=>{
  const values=softmax([10000,10001,-Infinity]);
  assert.ok(values.every(Number.isFinite));
  assert.ok(Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.equal(values[2],0);
  assert.ok(values[1]>values[0]);
});
test('All heads produce normalized weights and the exact weighted sum of values',()=>{
  for(let h=0;h<8;h++){
    const a=getAttention(h);
    for(let i=0;i<inputs.length;i++){
      assert.ok(Math.abs(a.weights[i].reduce((sum,w)=>sum+w,0)-1)<1e-12);
      for(let d=0;d<4;d++){
        const expected=a.v.reduce((sum,v,j)=>sum+a.weights[i][j]*v[d],0);
        assert.ok(Math.abs(expected-a.output[i][d])<1e-12);
        assert.ok(Number.isFinite(expected));
      }
      for(let j=0;j<inputs.length;j++)assert.ok(Math.abs(a.raw[i][j]/Math.sqrt(3)-a.scores[i][j])<1e-12);
    }
  }
  assert.notDeepEqual(getAttention(0).weights,getAttention(1).weights);
});
test('Causal mask allows precisely the current and past positions',()=>{
  const mask=causalMask(4);
  assert.deepEqual(mask,[[true,false,false,false],[true,true,false,false],[true,true,true,false],[true,true,true,true]]);
});
