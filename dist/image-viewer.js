export function initializeImageViewer(doc,i18n){
  const dialog=doc.getElementById('image-dialog'),image=doc.getElementById('enlarged-image'),zoom=doc.getElementById('image-zoom');
  let trigger;
  function updateText(){
    zoom.textContent=i18n.t(dialog.classList.contains('zoomed')?'viewer.fit':'viewer.zoom');
    if(trigger&&dialog.open){image.alt=trigger.dataset.imageTitle;doc.getElementById('image-dialog-title').textContent=trigger.dataset.imageTitle;}
  }
  i18n.subscribe(updateText);updateText();
  function close(){
    if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');trigger?.focus();}
  }
  for(const button of doc.querySelectorAll('[data-enlarge]'))button.addEventListener('click',()=>{
    trigger=button;
    image.src=button.dataset.enlarge;image.alt=button.dataset.imageTitle;
    image.width=Number(button.dataset.imageWidth);image.height=Number(button.dataset.imageHeight);
    doc.getElementById('image-dialog-title').textContent=button.dataset.imageTitle;
    dialog.style.setProperty('--natural-image-width',button.dataset.imageWidth+'px');
    dialog.classList.remove('zoomed');zoom.setAttribute('aria-pressed','false');updateText();
    dialog.querySelector('.image-dialog-viewport').scrollTop=0;dialog.querySelector('.image-dialog-viewport').scrollLeft=0;
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  });
  zoom.addEventListener('click',()=>{const active=dialog.classList.toggle('zoomed');zoom.setAttribute('aria-pressed',String(active));updateText();});
  doc.getElementById('image-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>trigger?.focus());
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  return {close};
}
