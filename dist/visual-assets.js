const base='./assets/jay-alammar/';
export const architectureViews={
  encoder:{file:'Transformer_encoder.png',width:792,height:411},
  pair:{file:'Transformer_decoder.png',width:879,height:279},
  full:{file:'transformer_resideual_layer_norm_3.png',width:1415,height:804}
};

export function initializeVisualAssets(doc,i18n){
  const view=doc.defaultView,figure=doc.querySelector('#architecture-visual'),image=figure.querySelector('img'),enlarge=figure.querySelector('[data-enlarge]');
  const buttons=[...doc.querySelectorAll('[data-architecture]')];
  let selected='pair';
  function renderArchitecture(){
    const data=architectureViews[selected],src=base+data.file;
    if(image.getAttribute('src')!==src)image.src=src;
    image.width=data.width;image.height=data.height;image.alt=i18n.t(`visual.${selected}Alt`);
    figure.dataset.view=selected;
    doc.querySelector('#architecture-caption-title').textContent=i18n.t(`visual.${selected}Title`);
    doc.querySelector('#architecture-caption').textContent=i18n.t(`visual.${selected}Caption`);
    Object.assign(enlarge.dataset,{enlarge:src,imageTitle:i18n.t(`visual.${selected}Title`),imageWidth:String(data.width),imageHeight:String(data.height)});
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.architecture===selected));
  }
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>{selected=button.dataset.architecture;renderArchitecture();});
    button.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'?(index+1)%buttons.length:event.key==='ArrowLeft'?(index+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:null;
      if(next!==null){event.preventDefault();buttons[next].focus();buttons[next].click();}
    });
  });

  const animation=doc.querySelector('#decoding-image'),stage=doc.querySelector('.decoding-stage'),toggle=doc.querySelector('#decoding-toggle'),status=doc.querySelector('#decoding-status'),animationEnlarge=doc.querySelector('#decoding-figure [data-enlarge]');
  let playing=false,failed=false,phase='idle',preludeTimer;
  function clearPrelude(){if(preludeTimer){view.clearTimeout(preludeTimer);preludeTimer=undefined;}}
  function renderAnimationText(){
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.textContent=i18n.t(playing?'decoding.stop':'decoding.play');
    stage.dataset.phase=phase;
    status.textContent=i18n.t(failed?'decoding.error':phase==='prelude'?'decoding.preludeStatus':playing?'decoding.playing':'decoding.idle');
  }
  function setPlaying(next){
    clearPrelude();
    playing=next;failed=false;
    const src=playing?animation.dataset.animation:animation.dataset.poster;
    if(animation.getAttribute('src')!==src)animation.src=src;
    animationEnlarge.dataset.enlarge=src;
    phase=playing?'prelude':'idle';
    renderAnimationText();
    if(playing)preludeTimer=view.setTimeout(()=>{if(playing){phase='animation';preludeTimer=undefined;renderAnimationText();}},1800);
  }
  toggle.addEventListener('click',()=>setPlaying(!playing));
  animation.addEventListener('error',()=>{
    if(!playing)return;
    setPlaying(false);failed=true;renderAnimationText();
  });
  view.addEventListener('pagehide',()=>setPlaying(false));
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&playing)setPlaying(false);});
  // Language updates only text, keeping the chosen view and GIF playback intact.
  i18n.subscribe(()=>{renderArchitecture();renderAnimationText();});
  renderArchitecture();renderAnimationText();
}
