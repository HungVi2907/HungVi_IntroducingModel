import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {getAttention,tokens} from '../dist/attention.js';

test('The rebuilt page follows the five-part outline and its focused interactions work',async(t)=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{url:'http://localhost:5173/'}),{window}=dom;
  const doc=window.document,$=selector=>doc.querySelector(selector),$$=selector=>[...doc.querySelectorAll(selector)];
  let reducedMotion=true;
  window.matchMedia=()=>({matches:reducedMotion});
  window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  globalThis.document=doc;
  await import('../dist/app.js');

  await t.test('Exactly five sections appear in the supplied order, without old parallel stories',()=>{
    const ids=['motivation','architecture','working-principle','tradeoffs','applications'];
    assert.deepEqual($$('main>section').map(section=>section.id),ids);
    assert.deepEqual($$('main>section').map(section=>section.dataset.sectionIndex),['1','2','3','4','5']);
    assert.deepEqual($$('.site-header nav a').map(link=>link.hash),ids.map(id=>'#'+id));
    assert.equal($$('.attention-demo').length,1);
    for(const selector of ['.reference-gallery','.heads-exhibit','#journey-exhibit','#intro-constellation','#visual-tour'])assert.equal($(selector),null);
    assert.equal($$('main img').length,2);
    assert.ok($('h1').textContent.includes('Mô hình Deep Learning dựa trên Attention'));
    assert.ok($('.external-explainer').textContent.includes('GPT-2 dạng decoder-only'));
    assert.ok($('.external-explainer').textContent.includes('không phải toàn bộ Encoder–Decoder'));
    assert.equal($('.external-explainer a').href,'https://poloclub.github.io/transformer-explainer/');
  });
  await t.test('Token and head changes update the actual attention data and preserve normalization',()=>{
    assert.equal($('#attention-graph .query-node text').textContent,'it');
    assert.equal($('#weight-total').textContent,'1.0000');
    $('[data-token="1"]').click();
    assert.equal($('#attention-graph .query-node text').textContent,'cat');
    assert.equal($('[data-token="1"]').getAttribute('aria-pressed'),'true');
    for(let head=0;head<8;head++){
      $('#head-select').value=String(head);$('#head-select').dispatchEvent(new window.Event('change'));
      const expected=getAttention(head).weights[1],edges=$$('#attention-graph .attention-link');
      assert.equal(edges.length,8);
      assert.equal($('#weight-total').textContent,'1.0000');
      for(let i=0;i<8;i++)assert.ok(Math.abs(Number(edges[i].dataset.weight)-expected[i])<1e-12);
      assert.ok(!/NaN|undefined|Infinity/.test($('#attention-calculations').textContent));
    }
  });
  await t.test('Every attention edge joins its visible query to its target inside the drawing',()=>{
    for(let token=0;token<tokens.length;token++){
      $(`[data-token="${token}"]`).click();
      const query=$('#attention-graph .query-node rect');
      const fromX=Number(query.getAttribute('x'))+Number(query.getAttribute('width'));
      const fromY=Number(query.getAttribute('y'))+Number(query.getAttribute('height'))/2;
      $$('#attention-graph .attention-link').forEach((edge,i)=>{
        const target=$(`#attention-graph [data-target-index="${i}"] rect`);
        const toX=Number(target.getAttribute('x')),toY=Number(target.getAttribute('y'))+Number(target.getAttribute('height'))/2;
        assert.ok(edge.getAttribute('d').startsWith(`M${fromX} ${fromY}C`));
        assert.ok(edge.getAttribute('d').endsWith(`${toX} ${toY}`));
      });
      for(const rect of $$('#attention-graph rect')){
        assert.ok(Number(rect.getAttribute('x'))>=0&&Number(rect.getAttribute('y'))>=0);
        assert.ok(Number(rect.getAttribute('x'))+Number(rect.getAttribute('width'))<=560);
        assert.ok(Number(rect.getAttribute('y'))+Number(rect.getAttribute('height'))<=380);
      }
    }
  });
  await t.test('The decoder mask correctly blocks the future and labels its disabled state',()=>{
    assert.equal($$('.mask-cell.blocked').length,6);
    $('#mask-enabled').click();assert.equal($$('.mask-cell.blocked').length,0);
    assert.ok($('#mask-message').textContent.includes('Decoder gốc phải dùng causal mask'));
    $('#mask-enabled').click();assert.equal($$('.mask-cell.blocked').length,6);
  });
  await t.test('Sequence length changes the number of attention pairs quadratically',()=>{
    assert.equal($('#pair-count').textContent,'64');
    $('#length-slider').value='16';$('#length-slider').dispatchEvent(new window.Event('input'));
    assert.equal($('#pair-count').textContent,'256');assert.equal($$('#complexity-grid>span').length,256);
    assert.equal($('#length-output').textContent,'16');
  });
  await t.test('Comparison respects reduced motion and can stop safely when leaving the page',()=>{
    $('#run-comparison').click();
    assert.equal($('#run-comparison').disabled,false);
    assert.equal($$('#rnn-visual .sequence-token.active').length,4);
    assert.equal($$('#parallel-visual .sequence-token.active').length,4);
    reducedMotion=false;$('#run-comparison').click();
    assert.equal($('#run-comparison').disabled,true);
    assert.equal($$('#rnn-visual .sequence-token.active').length,1);
    window.dispatchEvent(new window.Event('pagehide'));
    assert.equal($('#run-comparison').disabled,false);
  });
  await t.test('Image zoom closes with Escape and returns focus to each trigger',()=>{
    for(const trigger of $$('[data-enlarge]')){
      trigger.focus();trigger.click();
      assert.equal($('#image-dialog').open,true);
      assert.ok($('#enlarged-image').src.endsWith(trigger.dataset.enlarge.slice(1)));
      assert.equal($('#image-dialog-title').textContent,trigger.dataset.imageTitle);
      $('#image-zoom').click();assert.equal($('#image-zoom').getAttribute('aria-pressed'),'true');
      $('#image-dialog').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      assert.equal($('#image-dialog').open,false);assert.equal(doc.activeElement,trigger);
    }
  });
  await t.test('Local assets and navigation resolve, controls have names and IDs stay unique',async()=>{
    for(const a of $$('a[href^="#"]'))assert.ok($(a.hash));
    for(const node of $$('img[src],script[src],link[rel="stylesheet"]')){
      const src=node.getAttribute('src')||node.getAttribute('href');
      await access(new URL('../dist/'+src.replace(/^\.\//,''),import.meta.url));
    }
    for(const button of $$('button'))assert.ok(button.textContent.trim()||button.getAttribute('aria-label'));
    const ids=$$('[id]').map(node=>node.id);assert.equal(new Set(ids).size,ids.length);
    assert.ok($('a[href="https://arxiv.org/abs/1706.03762"]'));
    assert.ok($('a[href="https://jalammar.github.io/illustrated-transformer/"]'));
    assert.ok($('a[href="https://creativecommons.org/licenses/by-nc-sa/4.0/"]'));
  });
  dom.window.close();
});
