import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {messages,storageKey,createI18n,translate} from '../dist/i18n.js';
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
test('Both language catalogs have matching keys and interpolation parameters',()=>{
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.vi).sort());
  for(const key of Object.keys(messages.en)){
    assert.ok(messages.en[key].length&&messages.vi[key].length,key);
    const parameters=value=>[...value.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort();
    assert.deepEqual(parameters(messages.en[key]),parameters(messages.vi[key]),key);
  }
});
test('The delivered HTML defaults to English before JavaScript runs',()=>{
  const dom=new JSDOM(html),doc=dom.window.document;
  assert.equal(doc.documentElement.lang,'en');assert.equal(doc.querySelector('h2').textContent,'Motivation');
  assert.equal(doc.querySelector('[data-language="en"]').getAttribute('aria-pressed'),'true');
  for(const node of doc.querySelectorAll('[data-i18n]')){
    const expected=doc.createElement('template');expected.innerHTML=translate('en',node.dataset.i18n);
    assert.equal(node.innerHTML,expected.innerHTML);
  }
  dom.window.close();
});
test('English is the first-visit default; a saved Vietnamese preference survives reload',()=>{
  for(const stored of [null,'fr','en','vi']){
    const dom=new JSDOM(html,{url:'https://example.com'}),doc=dom.window.document;
    Object.defineProperty(dom.window.navigator,'language',{value:'vi-VN'});
    if(stored)dom.window.localStorage.setItem(storageKey,stored);
    const i18n=createI18n(doc);
    assert.equal(i18n.language,stored==='vi'?'vi':'en');
    doc.querySelector('[data-language="vi"]').click();assert.equal(i18n.language,'vi');
    assert.equal(dom.window.localStorage.getItem(storageKey),'vi');
    assert.equal(createI18n(doc).language,'vi');
    dom.window.close();
  }
});
test('Language switching still works when browser storage is unavailable',()=>{
  const dom=new JSDOM(html,{url:'https://example.com'}),doc=dom.window.document;
  Object.defineProperty(dom.window,'localStorage',{get(){throw new Error('Storage unavailable');}});
  const i18n=createI18n(doc);assert.equal(i18n.language,'en');
  i18n.setLanguage('vi');assert.equal(doc.documentElement.lang,'vi');assert.equal(doc.querySelector('h2').textContent,'Động lực phát triển');
  i18n.setLanguage('en');assert.equal(doc.querySelector('h2').textContent,'Motivation');dom.window.close();
});
