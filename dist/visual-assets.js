const base='./assets/jay-alammar/';
export const architectureViews={
  encoder:{file:'Transformer_encoder.png',width:792,height:411},
  pair:{file:'Transformer_decoder.png',width:879,height:279},
  full:{file:'transformer_resideual_layer_norm_3.png',width:1415,height:804}
};

export function initializeVisualAssets(doc,i18n){
  const figure=doc.querySelector('#architecture-visual'),image=figure.querySelector('img'),enlarge=figure.querySelector('[data-enlarge]');
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

  // The decoding GIF loads directly, so it starts from its first frame without a Play action.
  i18n.subscribe(renderArchitecture);
  renderArchitecture();
}
