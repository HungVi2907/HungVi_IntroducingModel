// Small deterministic numerical example, not trained weights.
export const tokens = ['The', 'cat', 'is', 'sleeping', 'because', 'it', 'is', 'tired.'];
export const inputs = [[.2,1.1,.3,.4],[1.6,.2,.5,.1],[.1,.8,.4,.6],[.6,.1,1.3,.4],[.2,.5,.3,1.4],[1.4,.3,.6,.2],[.15,.75,.45,.65],[.7,.2,1.1,.5]];
export function softmax(values) {
  const max = Math.max(...values);
  const exps = values.map(value => Math.exp(value - max));
  const sum = exps.reduce((a,b) => a+b,0);
  return exps.map(value => value/sum);
}
export function project(matrix, weights) {
  return matrix.map(row => weights[0].map((_,j) => row.reduce((sum,value,k) => sum + value*weights[k][j],0)));
}
export function getAttention(head = 0) {
  const wq = Array.from({length:4},(_,i) => Array.from({length:3},(_,j) => Math.sin((i+1)*(j+2)+(head+1)*.7)*.8 + (i===j?.65:0)));
  const wk = Array.from({length:4},(_,i) => Array.from({length:3},(_,j) => wq[i][j]*.75 + Math.cos((head+2)*(i+j+1))*.25));
  const wv = Array.from({length:4},(_,i) => Array.from({length:4},(_,j) => Math.sin((i+2)*(j+1)+head)*.5+(i===j?.7:0)));
  const q = project(inputs,wq), k = project(inputs,wk), v = project(inputs,wv);
  const raw = q.map(query => k.map(key => query.reduce((sum,value,j) => sum+value*key[j],0)));
  const scores = raw.map(row => row.map(value => value/Math.sqrt(3)));
  const weights = scores.map(softmax);
  const output = project(weights,v);
  return {q,k,v,raw,scores,weights,output,wq,wk,wv};
}
export function causalMask(length) {
  return Array.from({length},(_,i) => Array.from({length},(_,j) => j<=i));
}
