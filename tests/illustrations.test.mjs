import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {embeddingIllustration,multiHeadIllustration,architectureIllustration} from '../dist/illustrations.js';

test('All illustrations are accessible SVGs whose matrix cells fit inside the drawing',()=>{
  const figures=[embeddingIllustration(),embeddingIllustration(true),multiHeadIllustration(0),multiHeadIllustration(7,true),architectureIllustration(),architectureIllustration(true)];
  for(const svg of figures){
    const dom=new JSDOM(svg,{contentType:'image/svg+xml'});
    const doc=dom.window.document,root=doc.documentElement;
    assert.equal(root.localName,'svg');
    for(const id of root.getAttribute('aria-labelledby').split(' '))assert.ok(doc.getElementById(id)?.textContent.length);
    const [, ,w,h]=root.getAttribute('viewBox').split(' ').map(Number);
    for(const rect of doc.querySelectorAll('rect')){
      const x=Number(rect.getAttribute('x')),y=Number(rect.getAttribute('y'));
      assert.ok(x>=0&&y>=0);
      assert.ok(x+Number(rect.getAttribute('width'))<=w);
      assert.ok(y+Number(rect.getAttribute('height'))<=h);
    }
    dom.window.close();
  }
});
test('Eight heads remain parallel and the chosen head is identified in both layouts',()=>{
  for(const compact of [false,true])for(let active=0;active<8;active++){
    const dom=new JSDOM(multiHeadIllustration(active,compact),{contentType:'image/svg+xml'});
    const doc=dom.window.document;
    assert.equal(doc.querySelectorAll('[data-figure-head]').length,8);
    assert.equal(doc.querySelectorAll('[data-active="true"]').length,1);
    assert.equal(Number(doc.querySelector('[data-active="true"]').getAttribute('data-figure-head')),active);
    dom.window.close();
  }
});
test('The architecture retains six layers on each side and context for every decoder layer',()=>{
  for(const compact of [false,true]){
    const dom=new JSDOM(architectureIllustration(compact),{contentType:'image/svg+xml'});
    const doc=dom.window.document;
    assert.equal(doc.querySelectorAll('#encoder-stack .overview-layer').length,6);
    assert.equal(doc.querySelectorAll('#decoder-stack .overview-layer').length,6);
    assert.equal(doc.querySelectorAll('.overview-cross-edge').length,6);
    dom.window.close();
  }
});
