// Original, editable diagrams. Colored cells are symbolic, not measurements.
// Visual references: Jay Alammar's The Illustrated Transformer (2018).
// Architecture and computation follow Attention Is All You Need (2017).
const palette={ink:'#43515b',muted:'#85909a',line:'#a3afb6',x:'#8fbc75',q:'#ab79ce',k:'#e6a051',v:'#70a9dc',z:'#d88fb7'};
export const headColors=['#a481c3','#6ba4ca','#d99d62','#78ab7b','#c983a3','#8d9cc8','#67aaa6','#b0ac64'];
const escape=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function text(x,y,value,size=18,fill=palette.ink,anchor='middle',extra=''){
  return `<text x="${x}" y="${y}" font-family="Segoe UI,Arial,sans-serif" font-size="${size*1.15}" fill="${fill}" text-anchor="${anchor}" ${extra}>${escape(value)}</text>`;
}
function matrix(x,y,cols,rows,color,cw=18,ch=15,opacity=1){
  let s='';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    s+=`<rect x="${x+c*cw}" y="${y+r*ch}" width="${cw}" height="${ch}" fill="${color}" fill-opacity="${opacity*(.35+((r*3+c*2)%7)*.07)}" stroke="${color}" stroke-width=".8"/>`;
  }
  return s;
}
function arrow(d,id,extra=''){
  return `<path d="${d}" fill="none" stroke="${palette.line}" stroke-width="1.7" marker-end="url(#${id}-arrow)" ${extra}/>`;
}
function frame(id,w,h,title,description,body){
  return `<svg class="model-illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc><defs><marker id="${id}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="${palette.line}"/></marker></defs><rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
}

export function embeddingIllustration(compact=false){
  const width=compact?600:900,center=width/2;
  const xs=compact?[115,300,485]:[170,450,730],words=['I','love','learning'];
  let body='';
  words.forEach((word,i)=>{
    const x=xs[i];
    body+=text(x,56,word,24,palette.x);
    const half=compact?52:64;
    body+=matrix(x-half,103,4,1,palette.x,half/2,28);
    body+=text(x-half-28,123,'x'+(i+1),15,palette.x);
    body+=arrow(`M${x} 144V203`,'embedding');
    body+=arrow(`M${x} 284V333`,'embedding');
    body+=matrix(x-half,346,4,1,palette.v,half/2,28);
    body+=text(x-half-28,366,'z'+(i+1),15,palette.v);
  });
  body+=`<rect x="${compact?35:68}" y="207" width="${compact?530:764}" height="73" rx="8" fill="#eff5fb" stroke="#9bbbd3" stroke-width="1.5"/>`;
  body+=text(center,252,compact?'Self-Attention':'Self-Attention · trao đổi ngữ cảnh',23,'#5b83a4');
  body+=text(center,22,'Một vector cho mỗi token',14,palette.muted);
  body+=text(center,418,compact?'Biểu diễn có ngữ cảnh':'Biểu diễn mới mang thông tin ngữ cảnh',16,palette.muted);
  return frame('embedding',width,454,'Từ token đến biểu diễn ngữ cảnh','Ba token I, love, learning có vector đầu vào màu xanh lá. Chúng trao đổi thông tin qua Self-Attention để tạo các vector mới màu xanh lam. Các ô màu chỉ là biểu diễn rút gọn.',body);
}

export function multiHeadIllustration(active=0,compact=false){
  const id='multihead';
  let body='';
  const input=compact?{x:289,y:48}: {x:42,y:250};
  body+=text(compact?325:78,compact?29:225,'Cùng đầu vào X',compact?18:17,palette.x);
  body+=matrix(input.x,input.y,4,4,palette.x,18,19);
  if(compact){
    body+=`<path d="M325 126V139H35V191" fill="none" stroke="${palette.line}" stroke-width="1.7"/>`;
    body+=`<path d="M35 191V667M590 191V667" fill="none" stroke="${palette.line}" stroke-width="1.7"/>`;
    body+=text(325,162,'8 head song song',20,palette.muted);
  }else{
    body+=arrow('M123 288H214',id);
    body+=`<path d="M215 76V510M730 76V510" fill="none" stroke="${palette.line}" stroke-width="1.7"/>`;
    body+=text(397,31,'8 head song song',19,palette.muted);
  }
  for(let i=0;i<8;i++){
    const selected=i===active,c=headColors[i];
    const x=compact?65:270,y=compact?170+i*68:55+i*62,w=compact?310:250;
    const center=y+21,outX=compact?440:590;
    body+=`<g class="illustration-head ${selected?'selected-head':''}" data-figure-head="${i}" data-active="${selected}">`;
    body+=arrow(`M${compact?35:215} ${center}H${x-4}`,id);
    body+=`<rect class="head-module" x="${x}" y="${y}" width="${w}" height="42" rx="6" fill="${selected?'#f4f0fa':'#fafbfd'}" stroke="${c}" stroke-width="${selected?2.5:1.2}"/>`;
    body+=text(x+17,y+28,'Head '+String(i+1).padStart(2,'0'),compact?22:17,palette.ink,'start','font-weight="600"');
    const symbolStart=x+(compact?164:130);
    for(const [j,key] of ['q','k','v'].entries()){
      body+=text(symbolStart+j*(compact?44:35),y+27,key.toUpperCase(),16,palette[key]);
    }
    body+=arrow(`M${x+w} ${center}H${outX-8}`,id);
    body+=matrix(outX,y+7,4,2,c,17,14);
    body+=text(outX+88,y+45,'z'+(i+1),compact?17:15,c);
    body+=`<path d="M${outX+70} ${center}H${compact?590:730}" fill="none" stroke="${c}" stroke-width="${selected?2.5:1.2}"/>`;
    body+='</g>';
  }
  const concatX=compact?220:800,concatY=compact?745:250,cw=compact?22:17,ch=compact?16:19;
  if(compact){
    body+=arrow('M590 667V769H405',id);
    body+=text(308,724,'Ghép đầu ra · Concat',18,palette.z);
  }else{
    body+=arrow('M730 288H789',id);
    body+=text(868,225,'Ghép đầu ra',18,palette.z);
  }
  for(let i=0;i<8;i++)body+=matrix(concatX+i*cw,concatY,1,compact?3:4,headColors[i],cw,ch);
  if(compact){
    body+=arrow('M308 803V828',id);
    body+=matrix(285,837,4,3,palette.z,15,15);
    body+=text(250,867,'Wᴼ',20,palette.z);
    body+=arrow('M355 859H438',id);
    body+=matrix(450,837,4,3,palette.v,17,15);
    body+=text(484,822,'Đầu ra',18,palette.v);
  }else{
    body+=arrow('M946 288H990',id);
    body+=matrix(1000,232,4,6,palette.z,16,18);
    body+=text(1032,213,'Wᴼ',22,palette.z);
    body+=arrow('M1074 288H1110',id);
    body+=matrix(1120,250,4,4,palette.v,18,19);
    body+=text(1156,225,'Đầu ra',18,palette.v);
    body+=text(868,367,'Ghép rồi chiếu về cùng kích thước biểu diễn',13,palette.muted);
  }
  return frame(id,compact?650:1220,compact?920:595,'Multi-Head Attention: nhiều head song song, một đầu ra',`Cùng đầu vào X đi vào 8 head. Mỗi head dùng Q, K, V riêng. Các ma trận đầu ra z1 đến z8 được ghép theo chiều đặc trưng rồi nhân với W đầu ra. Đang làm nổi bật head ${active+1}. Màu sắc và các ô ma trận là ký hiệu minh họa.`,body);
}

export function architectureIllustration(compact=false){
  const id='modeloverview',width=compact?620:1000;
  const enc=compact?{x:36,w:220}: {x:135,w:260};
  const dec=compact?{x:364,w:220}: {x:625,w:260};
  const ex=enc.x+enc.w/2,dx=dec.x+dec.w/2,bus=compact?310:520;
  let body=text(enc.x,143,'Encoder',23,'#79a860','start')+text(dec.x,143,'Decoder',23,'#c5965c','start');
  body+=text(enc.x+enc.w,143,'6 lớp',14,palette.muted,'end')+text(dec.x+dec.w,143,'6 lớp',14,palette.muted,'end');
  for(const [kind,box,color,fill] of [['encoder',enc,'#a9c98d','#edf5e6'],['decoder',dec,'#dbbd96','#fcf1e5']]){
    body+=`<g id="${kind}-stack" class="overview-stack overview-${kind}">`;
    for(let i=0;i<6;i++){
      const y=184+i*41;
      body+=`<rect class="overview-layer" x="${box.x}" y="${y}" width="${box.w}" height="31" rx="5" fill="${fill}" stroke="${color}"/>`;
      body+=text(box.x+box.w/2,y+22,(kind==='encoder'?'Encoder ':'Decoder ')+(6-i),compact?18:17,kind==='encoder'?'#709655':'#ad8552');
    }
    for(let i=0;i<5;i++)body+=arrow(`M${box.x+box.w/2} ${225+i*41}V${215+i*41}`,id,'style="stroke-width:1"');
    body+='</g>';
  }
  // The final Encoder output supplies K/V to every Decoder layer.
  body+=`<path d="M${enc.x+enc.w} 199H${bus}V404" fill="none" stroke="#92a7b6" stroke-width="1.7"/>`;
  for(let i=0;i<6;i++)body+=arrow(`M${bus} ${199+i*41}H${dec.x-4}`,id,'class="overview-cross-edge"');
  body+=text(bus-13,176,'Ngữ cảnh',compact?13:16,'#7f9aa9');
  body+=arrow(`M${dx} 181V60`,id);
  body+=`<rect x="${dx-109}" y="16" width="218" height="42" rx="6" fill="#f3f6fb" stroke="#a9bfd6"/>`;
  body+=text(dx,44,'Token tiếp theo',compact?16:18,'#7596b5','middle','id="diagram-output-token"');
  const positions=[ex,dx];
  positions.forEach((cx,i)=>{
    body+=arrow(`M${cx} 484V424`,id);
    body+=matrix(cx-66,488,6,1,i===0?palette.x:palette.z,22,20);
    body+=text(cx,538,'Embedding + vị trí',compact?13:15,palette.muted);
    body+=text(cx,588,i===0?'I love learning':'Các token đã sinh',compact?16:19,i===0?'#7ea660':'#b987a3');
  });
  return frame(id,width,625,'Transformer gốc: 6 Encoder và 6 Decoder','Dữ liệu đi từ dưới lên. Câu nguồn được embedding, cộng thông tin vị trí, rồi đi qua 6 Encoder. Đầu ra Encoder cung cấp ngữ cảnh cho từng lớp trong 6 Decoder. Decoder nhận các token đích trước đó để dự đoán token tiếp theo. Các đường này thể hiện luồng thông tin ở mức tổng quan.',body);
}
