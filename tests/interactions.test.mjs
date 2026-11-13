import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {getAttention,tokens} from '../dist/attention.js';

test('The visual introduction and optional deep exploration respond correctly',async(t)=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{url:'http://localhost:5173/'});
  const {window}=dom;
  const q=(s)=>window.document.querySelector(s);
  const qa=(s)=>[...window.document.querySelectorAll(s)];
  globalThis.document=window.document;
  globalThis.location=window.location;
  globalThis.innerHeight=900;
  globalThis.scrollY=0;
  globalThis.addEventListener=window.addEventListener.bind(window);
  let viewportWidth=1200;
  globalThis.matchMedia=(query)=>({matches:query.includes('reduced-motion')||(query.includes('max-width')&&viewportWidth<=680)});
  await import('../dist/app.js');

  await t.test('Main experience is an introduction; technical panels start closed',()=>{
    assert.equal(q('.sidebar'),null);
    assert.equal(qa('.story-nav a').length,3);
    assert.equal(qa('[data-intro-token]').length,8);
    for(const id of ['architecture-details','attention','decoder','tradeoffs']){
      assert.equal(q('#'+id).open,false);
    }
    assert.ok(q('#step-numbers').closest('details'));
    assert.equal(qa('#head-exhibit .connection-weight').length,0);
  });
  await t.test('Intro token and head selection synchronize across the whole page',()=>{
    q('[data-intro-token="1"]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    assert.equal(q('[data-intro-token="1"]').getAttribute('aria-pressed'),'true');
    assert.equal(q('[data-token="1"]').getAttribute('aria-pressed'),'true');
    const initial=q('#head-exhibit').innerHTML;
    q('[data-story-head="3"]').click();
    assert.equal(q('#head-select').value,'3');
    assert.equal(q('[data-story-head="3"]').getAttribute('aria-pressed'),'true');
    assert.notEqual(q('#head-exhibit').innerHTML,initial);
    q('[data-intro-token="5"]').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  });
  await t.test('The complete sentence fits the mobile diagram and returns to one row on desktop',()=>{
    viewportWidth=360;window.dispatchEvent(new window.Event('resize'));
    assert.equal(q('#intro-constellation svg').getAttribute('viewBox'),'0 0 560 350');
    for(const rect of qa('#intro-constellation .intro-token rect')){
      assert.ok(Number(rect.getAttribute('x'))>=0);
      assert.ok(Number(rect.getAttribute('x'))+Number(rect.getAttribute('width'))<=560);
      assert.ok(Number(rect.getAttribute('y'))+Number(rect.getAttribute('height'))<=350);
    }
    viewportWidth=1200;window.dispatchEvent(new window.Event('resize'));
    assert.equal(q('#intro-constellation svg').getAttribute('viewBox'),'0 0 1080 315');
  });
  await t.test('Every head connection begins at a visible query and reaches its target with the correct weight',()=>{
    for(const tokenIndex of [5,3,1]){
      q(`[data-intro-token="${tokenIndex}"]`).dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
      for(let head=0;head<8;head++){
        q(`[data-story-head="${head}"]`).click();
        const source=q('#head-exhibit .head-query rect');
        assert.ok(source,'Head illustration must include the visible source token');
        assert.equal(q('#head-exhibit .head-query-value').textContent,tokens[tokenIndex]);
        const sourceX=Number(source.getAttribute('x'))+Number(source.getAttribute('width'));
        const sourceY=Number(source.getAttribute('y'))+Number(source.getAttribute('height'))/2;
        const edges=qa('#head-exhibit .head-edge');
        assert.equal(edges.length,8);
        edges.forEach((edge,i)=>{
          const target=q(`#head-exhibit .head-target[data-token-index="${i}"] rect`);
          const endX=Number(target.getAttribute('x'));
          const endY=Number(target.getAttribute('y'))+Number(target.getAttribute('height'))/2;
          assert.ok(edge.getAttribute('d').startsWith(`M${sourceX} ${sourceY}C`));
          assert.ok(edge.getAttribute('d').endsWith(`${endX} ${endY}`));
          assert.ok(Math.abs(Number(edge.dataset.weight)-getAttention(head).weights[tokenIndex][i])<1e-12);
        });
      }
    }
    for(const width of [1440,1024,768,680,390,320]){
      viewportWidth=width;window.dispatchEvent(new window.Event('resize'));
      const bounds=q('#head-exhibit svg').getAttribute('viewBox').split(' ').map(Number);
      assert.equal(qa('#head-exhibit .head-target').length,8);
      for(const rect of qa('#head-exhibit rect')){
        assert.ok(Number(rect.getAttribute('x'))>=0);
        assert.ok(Number(rect.getAttribute('y'))>=0);
        assert.ok(Number(rect.getAttribute('x'))+Number(rect.getAttribute('width'))<=bounds[2]);
        assert.ok(Number(rect.getAttribute('y'))+Number(rect.getAttribute('height'))<=bounds[3]);
      }
    }
    viewportWidth=1200;window.dispatchEvent(new window.Event('resize'));
  });
  await t.test('The introductory journey pauses, resumes, finishes, replays and resets',async()=>{
    q('#play-journey').click();
    assert.ok(q('#journey-exhibit').classList.contains('is-playing'));
    q('#play-journey').click();
    assert.ok(!q('#journey-exhibit').classList.contains('is-playing'));
    await new Promise(resolve=>setTimeout(resolve,60));
    assert.equal(qa('.journey-token').length,0);
    q('#play-journey').click();
    await new Promise(resolve=>setTimeout(resolve,230));
    assert.equal(qa('.journey-token').length,4);
    assert.ok(q('#journey-status').textContent.includes('<EOS>'));
    assert.ok(!q('#journey-exhibit').classList.contains('is-playing'));
    q('#play-journey').click();
    assert.equal(qa('.journey-token').length,0);
    q('#reset-journey').click();
    assert.equal(q('#reset-journey').disabled,true);
    assert.ok(!q('#journey-exhibit').classList.contains('is-playing'));
  });

  await t.test('Every architecture block opens its explanation with keyboard or click',()=>{
    q('#architecture-details').open=true;
    for(const el of qa('.arch-block')){
      el.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
      assert.equal(el.getAttribute('aria-pressed'),'true');
      assert.ok(q('#component-panel h3').textContent.length>0);
      assert.ok(q('#component-panel .component-equation').textContent.length>0);
    }
  });
  await t.test('A link into a collapsed lab opens its containing disclosure',()=>{
    q('#attention').open=false;
    q('[data-component="self"]').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
    q('#component-panel a').click();
    assert.equal(q('#attention').open,true);
  });
  await t.test('Attention updates from calculated data and shows 64 matrix cells',()=>{
    q('[data-token="5"]').click();
    q('#head-select').value='0';q('#head-select').dispatchEvent(new window.Event('change'));
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
