import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

test('The complete learning journey responds to token, head, stage, mask, decoding and length changes',async(t)=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{url:'http://localhost:5173/'});
  const {window}=dom;
  const q=(s)=>window.document.querySelector(s);
  const qa=(s)=>[...window.document.querySelectorAll(s)];
  globalThis.document=window.document;
  globalThis.innerHeight=900;
  globalThis.scrollY=0;
  globalThis.addEventListener=window.addEventListener.bind(window);
  globalThis.matchMedia=()=>({matches:true});
  await import('../dist/app.js');

  await t.test('Every architecture block opens its explanation with keyboard or click',()=>{
    for(const el of qa('.arch-block')){
      el.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
      assert.equal(el.getAttribute('aria-pressed'),'true');
      assert.ok(q('#component-panel h3').textContent.length>0);
      assert.ok(q('#component-panel .component-equation').textContent.length>0);
    }
  });
  await t.test('Attention updates from calculated data and shows 64 matrix cells',()=>{
    const initial=q('#step-numbers').textContent;
    q('[data-token="1"]').click();
    assert.equal(q('[data-token="1"]').getAttribute('aria-pressed'),'true');
    assert.notEqual(q('#step-numbers').textContent,initial);
    const firstHead=q('#step-numbers').textContent;
    q('#head-select').value='7';q('#head-select').dispatchEvent(new window.Event('change'));
    assert.notEqual(q('#step-numbers').textContent,firstHead);
    q('[data-view="matrix"]').click();
    assert.equal(qa('.heatmap button').length,64);
    q('.heatmap [data-row="3"]').click();
    assert.equal(q('[data-token="3"]').getAttribute('aria-pressed'),'true');
    for(let i=0;i<4;i++){
      q(`[data-step="${i}"]`).click();
      assert.equal(q('#step-progress').textContent,`Bước ${i+1} / 4`);
      assert.ok(!/NaN|undefined|Infinity/.test(q('#step-numbers').textContent));
    }
    q('#next-step').click();
    assert.equal(q('#step-progress').textContent,'Bước 1 / 4');
    assert.equal(q('#previous-step').disabled,true);
  });
  await t.test('Causal mask toggle and autoregressive ending/reset work',()=>{
    assert.equal(qa('.mask-cell.blocked').length,6);
    q('#mask-toggle').click();
    assert.equal(qa('.mask-cell.blocked').length,0);
    assert.equal(q('#mask-warning').hidden,false);
    q('#mask-toggle').click();
    assert.equal(qa('.mask-cell.blocked').length,6);
    for(let i=0;i<4;i++)q('#generate-token').click();
    assert.equal(q('#generate-token').disabled,true);
    assert.equal(qa('.generated-token').length,5);
    assert.ok(q('#generation-status').textContent.includes('<EOS>'));
    q('#reset-decoder').click();
    assert.equal(qa('.generated-token').length,1);
    assert.equal(q('#generate-token').disabled,false);
  });
  await t.test('Changing sequence length actually draws n² cells',()=>{
    q('#length-slider').value='24';q('#length-slider').dispatchEvent(new window.Event('input'));
    assert.equal(qa('#complexity-grid>span').length,576);
    assert.equal(q('#pair-count').textContent,'576');
  });
  await t.test('All local section links and control names are valid',()=>{
    for(const a of qa('a[href^="#"]')){
      if(a.hash)assert.ok(q(a.hash),`Missing target ${a.hash}`);
    }
    for(const el of qa('button,select,input'))assert.ok(el.textContent.trim()||el.getAttribute('aria-label')||el.id==='mask-toggle'||el.id==='length-slider');
    const ids=qa('[id]').map(el=>el.id);
    assert.equal(new Set(ids).size,ids.length);
  });
  await t.test('Comparison animation completes and can be replayed',async()=>{
    q('#run-comparison').click();
    await new Promise(resolve=>setTimeout(resolve,130));
    assert.equal(q('#run-comparison').disabled,false);
    assert.equal(qa('#rnn-demo .sequence-token.active').length,4);
    assert.equal(qa('#parallel-demo .sequence-token.active').length,4);
  });
  dom.window.close();
});
