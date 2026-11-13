const base='./assets/jay-alammar/';
export const referenceFigures=[
  {id:'black-box',group:'overview',label:'Bức tranh lớn',title:'Một đầu vào. Một câu mới.',file:'the_transformer_3.png',width:1127,height:294,alt:'Câu Je suis étudiant đi vào một khối Transformer và tạo ra câu I am a student.',caption:'Một câu đi vào, một câu dịch đi ra. Ở mức này, Transformer là một hộp xử lý.'},
  {id:'two-halves',group:'overview',label:'Hai thành phần',title:'Mở hộp: Encoder và Decoder.',file:'The_transformer_encoders_decoders.png',width:756,height:474,alt:'Khối Transformer được tách thành Encoders bên trái và Decoders bên phải, nối với chuỗi đầu vào và đầu ra.',caption:'Encoder xây dựng ngữ cảnh; Decoder dùng ngữ cảnh đó để tạo chuỗi đích.'},
  {id:'six-stacks',group:'overview',label:'6 + 6 lớp',title:'Một ý tưởng được xếp chồng.',file:'The_transformer_encoder_decoder_stack.png',width:1218,height:793,alt:'Sáu lớp Encoder và sáu lớp Decoder. Đầu ra Encoder cuối nối đến từng lớp Decoder.',caption:'Mô hình gốc có 6 lớp mỗi phía. Đầu ra Encoder cuối được dùng ở mỗi lớp Decoder.'},
  {id:'inside-encoder',group:'mechanism',label:'Trong một Encoder',title:'Theo đường đi của hai token.',file:'transformer_resideual_layer_norm.png',width:666,height:483,alt:'Hai vector Thinking và Machines được cộng positional encoding, đi qua Self-Attention, Add and Normalize, Feed Forward và Add and Normalize.',caption:'Đọc từ dưới lên: thêm vị trí → Attention → Add & Norm → FFN → Add & Norm.',note:'FFN dùng chung trọng số giữa các vị trí trong cùng lớp.'},
  {id:'residual-connections',group:'mechanism',label:'Kết nối hai phía',title:'Các nhánh tắt giữ dòng thông tin.',file:'transformer_resideual_layer_norm_3.png',width:1415,height:804,alt:'Hình rút gọn của Encoder và Decoder, gồm các nhánh residual, Add and Normalize và Encoder-Decoder Attention.',caption:'Hình rút gọn dùng 2 lớp để thấy các nhánh residual và kết nối giữa hai phía.',note:'Bản gốc có 6 lớp mỗi phía. Self-Attention ở Decoder phải có causal mask.'},
  {id:'decoding-loop',group:'mechanism',label:'Sinh từng token',title:'Token vừa sinh, đầu vào bước sau.',file:'transformer_decoding_2.gif',poster:'decoding-poster.png',width:1438,height:790,alt:'Minh họa decoding: Encoder tạo K và V, Decoder nhận các token trước đó, đi qua Linear và Softmax để sinh token tiếp theo.',caption:'Token vừa sinh được đưa lại vào Decoder để dự đoán token tiếp theo.',note:'Đây là minh họa suy luận, không phải phép dịch đang chạy trên trang.'}
];
const article='https://jalammar.github.io/illustrated-transformer/';
const license='https://creativecommons.org/licenses/by-nc-sa/4.0/';

export function initializeReferenceGalleries(doc=document){
  const galleries=new Map();
  const dialog=doc.getElementById('reference-lightbox');
  let returnFocus;
  function stopAnimation(gallery){
    gallery.playing=false;
    if(gallery.selected.poster)gallery.image.src=base+gallery.selected.poster;
    gallery.playButton.setAttribute('aria-pressed','false');
    gallery.playButton.textContent='▷ Phát ảnh động';
  }
  function select(gallery,index,focus=false){
    stopAnimation(gallery);
    gallery.index=index;gallery.selected=gallery.figures[index];
    const f=gallery.selected;
    gallery.image.src=base+(f.poster||f.file);
    gallery.image.alt=f.alt;
    gallery.image.width=f.width;gallery.image.height=f.height;
    gallery.title.textContent=f.title;
    gallery.caption.textContent=f.caption;
    gallery.note.textContent=f.note||'';gallery.note.hidden=!f.note;
    gallery.playButton.hidden=!f.poster;
    gallery.original.href='https://jalammar.github.io/images/t/'+f.file;
    gallery.tabs.forEach((tab,i)=>{
      const active=i===index;
      tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    });
    gallery.panel.setAttribute('aria-labelledby',gallery.tabs[index].id);
    if(focus)gallery.tabs[index].focus();
  }
  for(const root of doc.querySelectorAll('[data-reference-gallery]')){
    const group=root.dataset.referenceGallery,figures=referenceFigures.filter(f=>f.group===group);
    const tablist=root.querySelector('[role="tablist"]');
    for(const f of figures){
      const button=doc.createElement('button');
      button.type='button';button.setAttribute('role','tab');button.id=group+'-tab-'+f.id;
      button.setAttribute('aria-controls',group+'-reference-panel');
      const thumbnail=doc.createElement('img');
      thumbnail.src=base+(f.poster||f.file);thumbnail.alt='';thumbnail.loading='lazy';thumbnail.width=84;thumbnail.height=54;
      const label=doc.createElement('span');label.textContent=f.label;
      button.append(thumbnail,label);tablist.append(button);
    }
    const gallery={root,figures,index:0,selected:figures[0],playing:false,
      tabs:[...tablist.querySelectorAll('[role="tab"]')],
      panel:root.querySelector('[role="tabpanel"]'),image:root.querySelector('.reference-main-image'),
      title:root.querySelector('.reference-image-title'),caption:root.querySelector('.reference-image-caption'),
      note:root.querySelector('.reference-image-note'),playButton:root.querySelector('.reference-play'),
      original:root.querySelector('.reference-original')};
    gallery.tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>select(gallery,i));
      tab.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%figures.length;
        if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+figures.length-1)%figures.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=figures.length-1;
        if(next!==undefined){event.preventDefault();select(gallery,next,true);}
      });
    });
    gallery.playButton.addEventListener('click',()=>{
      if(!gallery.selected.poster)return;
      if(gallery.playing){stopAnimation(gallery);return;}
      gallery.playing=true;gallery.image.src=base+gallery.selected.file;
      gallery.playButton.setAttribute('aria-pressed','true');gallery.playButton.textContent='Ⅱ Dừng ảnh động';
    });
    root.querySelector('.reference-enlarge').addEventListener('click',event=>{
      stopAnimation(gallery);
      returnFocus=event.currentTarget;
      const f=gallery.selected,image=dialog.querySelector('img');
      image.src=base+(f.poster||f.file);image.alt=f.alt;image.width=f.width;image.height=f.height;
      dialog.style.setProperty('--reference-natural-width',f.width+'px');
      dialog.querySelector('#reference-lightbox-title').textContent=f.title;
      dialog.querySelector('.lightbox-original').href='https://jalammar.github.io/images/t/'+f.file;
      dialog.classList.remove('is-zoomed');
      dialog.querySelector('#reference-zoom-toggle').setAttribute('aria-pressed','false');
      dialog.querySelector('#reference-zoom-toggle').textContent='Phóng to';
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    });
    for(let parent=root.parentElement;parent;parent=parent.parentElement){
      if(parent.tagName==='DETAILS'){
        const disclosure=parent;
        disclosure.addEventListener('toggle',()=>{if(!disclosure.open)stopAnimation(gallery);});
      }
    }
    select(gallery,0);galleries.set(group,gallery);
  }
  function close(){
    if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');returnFocus?.focus();}
  }
  doc.getElementById('reference-lightbox-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>returnFocus?.focus());
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  doc.getElementById('reference-zoom-toggle').addEventListener('click',event=>{
    const zoomed=dialog.classList.toggle('is-zoomed');
    event.currentTarget.setAttribute('aria-pressed',String(zoomed));
    event.currentTarget.textContent=zoomed?'Vừa khung':'Phóng to';
  });
  const stopAll=()=>{for(const gallery of galleries.values())stopAnimation(gallery);};
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stopAll();});
  return {galleries,stopAll,close};
}

export const referenceCredit={author:'Jay Alammar',article,license};
