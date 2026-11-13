import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {initializeReferenceGalleries,referenceFigures} from '../dist/reference-gallery.js';

test('The six supplied figures have local, valid image assets and source attribution',async()=>{
  const metadata=JSON.parse(await readFile(new URL('../dist/assets/jay-alammar/sources.json',import.meta.url),'utf8'));
  assert.equal(referenceFigures.length,6);
  for(const f of referenceFigures){
    const bytes=await readFile(new URL('../dist/assets/jay-alammar/'+f.file,import.meta.url));
    if(f.file.endsWith('.png')){
      assert.equal(bytes.subarray(1,4).toString(),'PNG');
      assert.equal(bytes.readUInt32BE(16),f.width);assert.equal(bytes.readUInt32BE(20),f.height);
    }else{
      assert.ok(bytes.subarray(0,6).toString().startsWith('GIF8'));
      assert.equal(bytes.readUInt16LE(6),f.width);assert.equal(bytes.readUInt16LE(8),f.height);
      assert.ok((await readFile(new URL('../dist/assets/jay-alammar/'+f.poster,import.meta.url))).length>24);
    }
    const source=metadata.images.find(image=>image.file===f.file);
    assert.equal(source.author,'Jay Alammar');
    assert.equal(source.license,'https://creativecommons.org/licenses/by-nc-sa/4.0/');
    assert.ok(f.alt.length>25&&f.caption.length>20);
  }
});

test('Reference galleries support keyboard selection, opt-in animation and a zoom dialog',async(t)=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{url:'http://localhost:5173/'}),{window}=dom,doc=window.document;
  window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  const controller=initializeReferenceGalleries(doc);
  const overview=controller.galleries.get('overview'),mechanism=controller.galleries.get('mechanism');
  const dialog=doc.querySelector('#reference-lightbox');
  await t.test('Both galleries start on static images, with correctly associated tabs',()=>{
    assert.equal(controller.galleries.size,2);
    for(const gallery of [overview,mechanism]){
      assert.equal(gallery.tabs.length,3);
      assert.equal(gallery.tabs.filter(tab=>tab.getAttribute('aria-selected')==='true').length,1);
      assert.ok(!gallery.image.src.endsWith('.gif'));
      assert.equal(gallery.playButton.hidden,true);
      assert.equal(gallery.panel.getAttribute('aria-labelledby'),gallery.tabs[0].id);
    }
  });
  await t.test('Keyboard arrows wrap and update the image, caption, source and focus',()=>{
    overview.tabs[0].dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
    assert.equal(overview.index,2);assert.equal(doc.activeElement,overview.tabs[2]);
    assert.ok(overview.image.src.endsWith('The_transformer_encoder_decoder_stack.png'));
    assert.ok(overview.original.href.endsWith(overview.selected.file));
    assert.equal(overview.caption.textContent,overview.selected.caption);
    overview.tabs[2].dispatchEvent(new window.KeyboardEvent('keydown',{key:'Home',bubbles:true}));
    assert.equal(overview.index,0);
  });
  await t.test('Animation loads only after pressing play and stops on selection or disclosure closure',()=>{
    const parent=doc.getElementById('architecture-details');parent.open=true;
    mechanism.tabs[2].click();
    assert.ok(mechanism.image.src.endsWith('decoding-poster.png'));
    assert.equal(mechanism.playButton.hidden,false);
    mechanism.playButton.click();assert.ok(mechanism.image.src.endsWith('.gif'));
    assert.equal(mechanism.playButton.getAttribute('aria-pressed'),'true');
    mechanism.playButton.click();assert.ok(mechanism.image.src.endsWith('decoding-poster.png'));
    mechanism.playButton.click();mechanism.tabs[0].click();
    assert.equal(mechanism.playing,false);assert.ok(!mechanism.image.src.endsWith('.gif'));
    mechanism.tabs[2].click();mechanism.playButton.click();
    parent.open=false;parent.dispatchEvent(new window.Event('toggle'));
    assert.equal(mechanism.playing,false);assert.ok(mechanism.image.src.endsWith('decoding-poster.png'));
  });
  await t.test('The image dialog zooms, closes with Escape and returns focus to its trigger',()=>{
    const trigger=overview.root.querySelector('.reference-enlarge');trigger.focus();trigger.click();
    assert.equal(dialog.open,true);
    assert.ok(dialog.querySelector('img').src.endsWith(overview.selected.file));
    const zoom=doc.getElementById('reference-zoom-toggle');zoom.click();
    assert.ok(dialog.classList.contains('is-zoomed'));assert.equal(zoom.getAttribute('aria-pressed'),'true');
    dialog.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert.equal(dialog.open,false);assert.equal(doc.activeElement,trigger);
  });
  await t.test('Opening a large image also stops GIF playback',()=>{
    mechanism.tabs[2].click();mechanism.playButton.click();
    mechanism.root.querySelector('.reference-enlarge').click();
    assert.equal(mechanism.playing,false);
    assert.ok(dialog.querySelector('img').src.endsWith('decoding-poster.png'));
    doc.getElementById('reference-lightbox-close').click();assert.equal(dialog.open,false);
  });
  controller.stopAll();dom.window.close();
});
