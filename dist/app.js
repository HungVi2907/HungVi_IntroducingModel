import {tokens,inputs,getAttention,causalMask} from './attention.js';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const fmt = (n) => n.toFixed(2);
const percent = (n) => (n*100).toFixed(1)+'%';
const state = {token:5,head:0,step:0,view:'connections',generated:0};
let attention = getAttention();
const journey = {count:0,playing:false,timer:null};

// Three quiet navigation links replace the numbered lesson outline.
const chapterLinks = $$('.story-nav a');
const sections = ['idea','architecture','explore'].map(id=>document.getElementById(id));
function updateReadingPosition() {
  let current = null;
  for (const section of sections) if (section.getBoundingClientRect().top<innerHeight*.36) current=section;
  chapterLinks.forEach(link => {
    const active = !!current && link.hash==='#'+current.id;
    link.classList.toggle('active',active);
    if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll',updateReadingPosition,{passive:true});
addEventListener('resize',updateReadingPosition);
updateReadingPosition();

function revealTarget(hash) {
  if(!hash || hash==='#')return;
  const target=document.getElementById(decodeURIComponent(hash.slice(1)));
  if(!target)return;
  for(let node=target;node&&node!==document.body;node=node.parentElement){
    if(node.tagName==='DETAILS')node.open=true;
  }
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link)revealTarget(link.hash);
});
addEventListener('hashchange',()=>revealTarget(location.hash));
revealTarget(location.hash);

// Sequential versus parallel illustration.
const sequenceWords = ['The','cat','is','sleeping'];
function sequenceSVG(parallel) {
  const xs=[39,119,199,279];
  const edges = parallel ? xs.flatMap((x,i)=>xs.slice(i+1).map((end,j)=>`<path class="sequence-edge" data-edge="${i}-${i+j+1}" d="M${x} 51Q${(x+end)/2} ${8-(j*10)} ${end} 51"/>`)).join('') : xs.slice(0,-1).map((x,i)=>`<path class="sequence-edge" data-edge="${i}-${i+1}" d="M${x+31} 68H${xs[i+1]-31}"/><path d="M${xs[i+1]-35} 64L${xs[i+1]-30} 68L${xs[i+1]-35} 72" fill="none" stroke="#bdcbb2"/>`).join('');
  return `<svg viewBox="0 0 320 110" role="img" aria-label="${parallel?'Các token kết nối trực tiếp với nhau':'Các token được xử lý lần lượt'}">${edges}${xs.map((x,i)=>`<rect class="sequence-token" data-index="${i}" x="${x-31}" y="51" width="62" height="34" rx="5"/><text class="sequence-text" x="${x}" y="72">${sequenceWords[i]}</text>`).join('')}</svg>`;
}
$('#rnn-demo').innerHTML=sequenceSVG(false);
$('#parallel-demo').innerHTML=sequenceSVG(true);
let comparisonTimer;
$('#run-comparison').addEventListener('click',()=>{
  clearInterval(comparisonTimer);
  $$('.sequence-token,.sequence-edge').forEach(el=>el.classList.remove('active'));
  const btn=$('#run-comparison');btn.disabled=true;
  let index=0;
  $('#comparison-status').textContent='RNN đi lần lượt; Self-Attention kết nối các vị trí trong cùng một lớp.';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=()=>{
    $$('#parallel-demo .sequence-token,#parallel-demo .sequence-edge').forEach(el=>el.classList.add('active'));
    const current=$(`#rnn-demo [data-index="${index}"]`);if(current)current.classList.add('active');
    if(index>0){const edge=$(`#rnn-demo [data-edge="${index-1}-${index}"]`);if(edge)edge.classList.add('active');}
    index++;
    if(index>=4){clearInterval(comparisonTimer);btn.disabled=false;btn.innerHTML='<span aria-hidden="true">↺</span> Xem lại minh họa';$('#comparison-status').textContent='Cùng một chuỗi: xử lý nối tiếp và trao đổi trực tiếp.';}
  };
  comparisonTimer=setInterval(tick,reduced?20:650);tick();
});

// Original encoder–decoder architecture. All sublayers use Post-LN.
const components={
 embedding:{label:'Token thành vector',english:'Input / Output Embedding',description:'Mỗi token được tra trong một bảng embedding học được để lấy vector. Trong mô hình gốc, vector embedding được nhân với √d_model trước khi cộng thông tin vị trí.',equation:'Vector đầu vào = Embedding(token) × √d_model',kind:'embedding',link:'#attention',linkText:'Khám phá biểu diễn trong Attention ↗'},
 position:{label:'Thêm thông tin vị trí',english:'Sinusoidal Positional Encoding',description:'Attention tự nó không mã hóa thứ tự chuỗi. Các tín hiệu sin và cos có tần số khác nhau được cộng vào embedding tại từng vị trí, ở cả Encoder và Decoder.',equation:'X = Embedding × √d_model + PE',kind:'position',link:'#attention',linkText:'Tiếp tục đến Self-Attention ↗'},
 self:{label:'Trao đổi ngữ cảnh',english:'Multi-Head Self-Attention · Encoder',description:'Mỗi vị trí trong Encoder có thể nhìn tất cả vị trí của chuỗi nguồn. Q, K, V được chiếu từ cùng biểu diễn đầu vào của lớp. Các head tính song song rồi được ghép và chiếu lại.',equation:'MultiHead = Concat(head₁, …, head₈)Wᴼ',kind:'self',link:'#attention',linkText:'Thử Self-Attention từng bước ↗'},
 norm:{label:'Giữ đường truyền thông tin',english:'Residual Connection + Layer Normalization',description:'Đầu vào x đi theo một nhánh tắt và được cộng với đầu ra sublayer, sau đó mới chuẩn hóa theo các chiều đặc trưng ở từng vị trí. Paper gốc đặt LayerNorm sau phép cộng (Post-LN).',equation:'LayerNorm(x + Dropout(Sublayer(x)))',kind:'norm',link:'#architecture',linkText:'Chọn một khối khác để khám phá ↑'},
 ffn:{label:'Biến đổi từng vị trí',english:'Position-wise Feed-Forward Network',description:'Cùng một mạng hai lớp tuyến tính với ReLU ở giữa được áp dụng riêng cho từng vị trí. Nó biến đổi các đặc trưng, không trộn trực tiếp thông tin giữa token. Mỗi lớp Transformer có bộ trọng số FFN riêng.',equation:'FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂',kind:'ffn',link:'#attention',linkText:'Quay về nơi các token trao đổi thông tin ↗'},
 masked:{label:'Chỉ nhìn những gì đã có',english:'Masked Multi-Head Self-Attention · Decoder',description:'Các vị trí trong chuỗi đích chỉ được nhìn chính mình và các vị trí trước đó. Điểm ở các cột tương lai bị đặt thành −∞ trước Softmax, nên trọng số tương ứng bằng 0.',equation:'softmax(QKᵀ / √d_k + causal mask)V',kind:'masked',link:'#decoder',linkText:'Thử bật / tắt causal mask ↗'},
 cross:{label:'Kết nối với câu nguồn',english:'Encoder–Decoder Attention · Cross-Attention',description:'Q đến từ biểu diễn Decoder ở sublayer trước đó. K và V được chiếu từ đầu ra cuối của Encoder. Nhờ vậy, mỗi vị trí Decoder có thể tổng hợp thông tin từ toàn bộ câu nguồn.',equation:'Q ← Decoder · K, V ← Encoder',kind:'cross',link:'#decoder',linkText:'Quan sát Decoder sinh từng token ↗'},
 linear:{label:'Từ vector đến điểm số',english:'Linear Projection to Vocabulary',description:'Vector đầu ra Decoder được chiếu thành một điểm số (logit) cho mỗi token trong từ vựng. Đây chưa phải xác suất; bước Softmax tiếp theo sẽ chuẩn hóa các điểm số.',equation:'logits = hW_vocab + b',kind:'linear',link:'#decoder',linkText:'Xem phân bố token đầu ra ↗'},
 softmax:{label:'Chọn token tiếp theo',english:'Vocabulary Softmax',description:'Softmax chuyển các logits thành phân bố xác suất trên từ vựng. Sau khi chọn token, ta nối token đó vào chuỗi Decoder và tiếp tục, cho đến token kết thúc hoặc giới hạn độ dài.',equation:'P(token tiếp theo) = softmax(logits)',kind:'softmax',link:'#decoder',linkText:'Tự sinh câu từng bước ↗'}
};
function block(id,x,y,w,label,decoder=false,h=35){return `<g class="arch-block ${decoder?'decoder-block':''}" data-component="${id}" role="button" tabindex="0" aria-label="Khám phá ${label}" aria-pressed="false"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${decoder?'#fcf2e4':'#edf3e6'}" stroke="${decoder?'#e2cdb0':'#c9d9bd'}"/><text x="${x+w/2}" y="${y+h/2+4}">${label}</text></g>`;}
function archLine(x,y1,y2){return `<path class="arch-line" d="M${x} ${y1}V${y2}"/>`;}
function residual(x,y1,y2){return `<path class="arch-residual" d="M${x+18} ${y1}H${x}V${y2}H${x+18}"/><circle cx="${x+18}" cy="${y1}" r="2" fill="#a3b393"/>`;}
$('#architecture-svg').innerHTML=`<svg viewBox="0 0 680 700" role="group" aria-label="Kiến trúc Transformer gốc. Dữ liệu đi từ dưới lên. Chọn khối để xem giải thích."><defs><marker id="arch-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#9ba992"/></marker></defs>
<rect x="35" y="244" width="253" height="273" rx="9" fill="#f1f6ec90" stroke="#bacdad" stroke-dasharray="4 4"/><rect x="375" y="121" width="253" height="396" rx="9" fill="#fcf2e450" stroke="#dac3a3" stroke-dasharray="4 4"/>
<text class="arch-title" x="162" y="225">Encoder <tspan style="font-size:calc(10px * var(--text-scale))" fill="#8d9e80">×6</tspan></text><text class="arch-title" x="502" y="574" style="fill:#ab8150">Decoder ×6</text>
${block('softmax',410,20,185,'Softmax',true)}${block('linear',410,75,185,'Linear',true)}
${block('norm',70,264,185,'Add & Norm')}${block('ffn',70,324,185,'Feed Forward')}${block('norm',70,384,185,'Add & Norm')}${block('self',70,454,185,'Multi-Head Attention')}
${block('norm',410,144,185,'Add & Norm',true)}${block('ffn',410,204,185,'Feed Forward',true)}${block('norm',410,264,185,'Add & Norm',true)}${block('cross',410,324,185,'Cross-Attention',true)}${block('norm',410,384,185,'Add & Norm',true)}${block('masked',410,454,185,'Masked Self-Attention',true)}
${block('embedding',70,588,185,'Input Embedding')}${block('embedding',410,588,185,'Output Embedding',true)}
${[162,502].map(x=>`${archLine(x,588,561)}<circle cx="${x}" cy="550" r="12" fill="#f9fbf5" stroke="#a7bd95"/><text class="arch-small" x="${x}" y="554" style="font-size:calc(16px * var(--text-scale))">+</text>${archLine(x,538,491)}${archLine(x,635,625)}`).join('')}
${block('position',5,535,112,'Positional',false,30)}<path class="arch-line" d="M117 550H148"/>${block('position',345,535,112,'Positional',true,30)}<path class="arch-line" d="M457 550H488"/>
${archLine(162,454,421)}${archLine(162,384,361)}${archLine(162,324,301)}
${archLine(502,454,421)}${archLine(502,384,361)}${archLine(502,324,301)}${archLine(502,264,241)}${archLine(502,204,181)}${archLine(502,144,112)}${archLine(502,75,57)}
${residual(52,504,401)}${residual(52,372,281)}${residual(392,504,401)}${residual(392,372,281)}${residual(392,252,161)}
<path class="arch-line" d="M162 264V188H321V342H408"/><text class="arch-small" x="323" y="179">K, V</text><text class="arch-small" x="517" y="375">Q</text><text class="arch-small" x="162" y="657">Tokens nguồn</text><text class="arch-small" x="502" y="657">Tokens đích (dịch 1 vị trí)</text><text class="arch-small" x="502" y="690">↑ token đã biết / đã sinh</text>
</svg>`;
function componentDemo(kind){
  if(kind==='position') return `<svg viewBox="0 0 260 100"><path d="M5 50Q21 0 37 50T69 50T101 50T133 50T165 50T197 50T229 50T261 50" fill="none" stroke="#8eac72" stroke-width="2"/><path d="M5 50Q69 -10 133 50T261 50" fill="none" stroke="#bdcda7" stroke-width="2"/><text x="130" y="92">sin / cos · nhiều tần số</text></svg>`;
  if(kind==='norm')return `<svg viewBox="0 0 260 100"><rect x="78" y="16" width="100" height="32" rx="4" fill="#dfeacf"/><text x="128" y="37">Sublayer(x)</text><path d="M128 4V16M128 48V66M128 66H40V4H128M128 66V84" stroke="#8ea77b" fill="none"/><circle cx="128" cy="66" r="10" fill="#f4f7ef" stroke="#8ea77b"/><text x="128" y="70">+</text><text x="128" y="98">LayerNorm</text></svg>`;
  if(kind==='ffn')return `<svg viewBox="0 0 260 100"><text x="25" y="49">512</text><path d="M49 45H77M178 45H208" stroke="#9cb384"/><rect x="79" y="10" width="98" height="70" rx="5" fill="#dce9cd"/><text x="128" y="41" class="demo-strong">2048</text><text x="128" y="60">ReLU</text><text x="232" y="49">512</text><text x="128" y="99">Même mạng cho mỗi vị trí</text></svg>`.replace('Même','Cùng');
  if(kind==='masked')return `<svg viewBox="0 0 260 100">${Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>`<rect x="${90+j*20}" y="${5+i*20}" width="16" height="16" rx="2" fill="${j<=i?'#a9c390':'#e0e6d7'}"/>`).join('')).join('')}<text x="130" y="99">Chặn các vị trí tương lai</text></svg>`;
  if(kind==='embedding')return `<svg viewBox="0 0 260 100"><rect x="10" y="30" width="52" height="34" rx="4" fill="#fff" stroke="#c7d8b7"/><text x="36" y="51">cat</text><path d="M72 47H101" stroke="#9cb384"/>${[.2,.8,.5,.9].map((v,i)=>`<rect x="${116+i*28}" y="20" width="23" height="55" rx="3" fill="rgba(74,120,49,${v})"/>`).join('')}<text x="170" y="96">Vector học được</text></svg>`;
  if(kind==='cross')return `<svg viewBox="0 0 260 100"><rect x="9" y="12" width="88" height="28" rx="4" fill="#dce9cd"/><text x="53" y="30">Encoder</text><rect x="158" y="12" width="93" height="28" rx="4" fill="#e7d8bf"/><text x="204" y="30">Decoder</text><path d="M53 40L130 73M204 40L130 73" stroke="#9eae8a"/><text x="66" y="64">K, V</text><text x="194" y="64">Q</text><rect x="80" y="72" width="100" height="27" rx="4" fill="#dce9cd"/><text x="130" y="89">Attention</text></svg>`;
  if(kind==='softmax'||kind==='linear')return `<svg viewBox="0 0 260 100">${[.72,.17,.08,.03].map((v,i)=>`<text x="33" y="${17+i*24}">${['Tôi','Bạn','Ta','…'][i]}</text><rect x="60" y="${5+i*24}" width="${v*220}" height="14" rx="2" fill="${i===0?'#80a56a':'#cadbbb'}"/><text x="230" y="${17+i*24}">${Math.round(v*100)}%</text>`).join('')}</svg>`;
  return `<svg viewBox="0 0 260 100">${[35,95,155,215].map((x,i)=>`<path d="M130 12Q${x} 33 ${x} 67" fill="none" stroke="#96b17b" stroke-width="${[2,4,1,3][i]}"/><rect x="${x-26}" y="65" width="52" height="27" rx="4" fill="#e0ead5"/><text x="${x}" y="83">${['The','cat','is','tired'][i]}</text>`).join('')}<circle cx="130" cy="12" r="6" fill="#4b7a3d"/></svg>`;
}
function selectComponent(id){
  const c=components[id];
  $$('.arch-block').forEach(el=>{const active=el.dataset.component===id;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
  const firstSentence=c.description.indexOf('. ');
  const short=firstSentence<0?c.description:c.description.slice(0,firstSentence+1);
  const rest=firstSentence<0?'':c.description.slice(firstSentence+2);
  $('#component-panel').innerHTML=`<span class="component-index">BÊN TRONG TRANSFORMER</span><div class="component-title-group"><h3>${c.label}</h3><p class="component-english">${c.english}</p></div><p class="component-description">${short}</p><div class="component-demo">${componentDemo(c.kind)}<p class="component-demo-label">MINH HỌA CƠ CHẾ</p></div><details class="component-more"><summary>Tìm hiểu thêm <span>+</span></summary><p>${rest}</p><p class="component-equation">${c.equation}</p></details><a class="text-link" href="${c.link}">${c.linkText}</a>`;
}
$$('.arch-block').forEach(el=>{el.addEventListener('click',()=>selectComponent(el.dataset.component));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectComponent(el.dataset.component);}});});
selectComponent('self');

// Attention interactions; every number comes from the same matrix calculation.
$('#token-selector').innerHTML=tokens.map((token,i)=>`<button data-token="${i}" aria-label="Chọn token ${token}, vị trí ${i+1}" aria-pressed="${i===state.token}" class="${i===state.token?'selected':''}">${token}</button>`).join('');
$$('[data-token]').forEach(el=>el.addEventListener('click',()=>{state.token=Number(el.dataset.token);renderAttention();}));
$('#head-select').addEventListener('change',e=>{state.head=Number(e.target.value);attention=getAttention(state.head);renderAttention();});
$$('[data-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.view;renderAttention();}));
$$('[data-step]').forEach(el=>el.addEventListener('click',()=>{state.step=Number(el.dataset.step);renderAttention();}));
$('#previous-step').addEventListener('click',()=>{if(state.step>0)state.step--;renderAttention();});
$('#next-step').addEventListener('click',()=>{state.step=(state.step+1)%4;renderAttention();});
function renderConnections(showWeights=true){
  const xs=tokens.map((_,i)=>i*95+47.5),source=xs[state.token];
  const weights=attention.weights[state.token],max=Math.max(...weights);
  return `<svg viewBox="0 0 760 ${showWeights?176:150}" role="img" aria-label="Trọng số attention từ token ${tokens[state.token]}, head ${state.head+1}"><title>${tokens.map((t,i)=>`${t} vị trí ${i+1}: ${percent(weights[i])}`).join('; ')}</title>${xs.map((x,i)=>`<path class="connection-path" d="M${source} 2C${source} 62 ${x} 45 ${x} 105" stroke-width="${1+weights[i]/max*5}" opacity="${.15+weights[i]/max*.65}"/>`).join('')}${xs.map((x,i)=>`<g><rect class="connection-target ${i===state.token?'selected-target':''}" x="${x-40}" y="106" width="80" height="35" rx="5"/><text class="connection-label" x="${x}" y="128">${tokens[i]}</text>${showWeights?`<text class="connection-weight" x="${x}" y="163">${percent(weights[i])}</text>`:''}</g>`).join('')}</svg>`;
}
function renderMatrix(){
  const max=Math.max(...attention.weights.flat());
  return `<div class="heatmap-wrapper"><div class="heatmap" role="group" aria-label="Ma trận trọng số attention. Hàng truy vấn, cột khóa."><span>Q ↓ K →</span>${tokens.map(t=>`<span>${t}</span>`).join('')}${attention.weights.map((row,i)=>`<span class="${i===state.token?'row-selected':''}">${tokens[i]}</span>${row.map((w,j)=>{const level=w/max;return `<button class="${i===state.token?'selected-row':''}" data-row="${i}" title="${tokens[i]} (${i+1}) → ${tokens[j]} (${j+1}): ${percent(w)}" aria-label="${tokens[i]}, vị trí ${i+1}, chú ý đến ${tokens[j]}, vị trí ${j+1}: ${percent(w)}" style="background:rgba(41,102,77,${.05+level*.85});color:${level>.55?'white':'#416043'}">${percent(w)}</button>`;}).join('')}`).join('')}</div></div>`;
}
function vectorRow(label,values){return `<div class="vector-row"><span class="vector-label">${label}</span><div class="vector-values">${values.map(v=>`<span class="vector-cell">${fmt(v)}</span>`).join('')}</div>`;}
function scoreRows(values,weights=false){
  const max=Math.max(...values.map(Math.abs),.01);
  return values.map((v,i)=>`<div class="score-row"><span>${tokens[i]}</span><div class="score-track"><div class="score-fill" style="width:${Math.abs(v)/max*100}%;background:${v<0?'#cfaa79':'#86a871'}"></div></div><span class="score-value">${weights?percent(v):fmt(v)}</span></div>`).join('');
}
function renderStep(){
  const t=state.token, token=tokens[t];
  const explanations=[
    ['BA PHÉP CHIẾU HỌC ĐƯỢC',`Từ “${token}” đến Q, K, V`,`Q dùng để truy vấn; K dùng để so khớp; V mang thông tin sẽ được tổng hợp. Cả ba được tạo bằng các phép chiếu tuyến tính riêng từ biểu diễn đầu vào. Đây là vector ở head ${state.head+1}, vị trí ${t+1}.`],
    ['SO KHỚP VÀ CHIA HỆ SỐ',`“${token}” liên quan đến từng vị trí ra sao?`,`Nhân Q của vị trí đang chọn với K của mỗi vị trí. Chia điểm cho √d_k để giữ thang điểm phù hợp. Lab dùng d_k = 3. Các điểm có thể âm và chưa phải xác suất.`],
    ['ĐIỂM SỐ → TRỌNG SỐ','Softmax tạo một phân bố',`Softmax biến các điểm đã chia hệ số thành các trọng số không âm. Tổng trọng số của một hàng bằng 1. Đổi token để xem hàng khác; đổi head để dùng bộ ma trận chiếu khác.`],
    ['TỔNG CÓ TRỌNG SỐ',`Biểu diễn mới cho “${token}”`,`Nhân từng vector V với trọng số tương ứng rồi cộng lại. Đây là đầu ra của một head. Trong mô hình đầy đủ, đầu ra từ 8 head được ghép rồi chiếu qua Wᴼ.`]
  ];
  const [kicker,title,desc]=explanations[state.step];
  $('#step-explanation').innerHTML=`<span class="step-kicker">${kicker}</span><h3>${title}</h3><p>${desc}</p>`;
  let numbers='';
  if(state.step===0)numbers=`<p class="numeric-caption">Vector tại token đang chọn · làm tròn 2 chữ số</p>${vectorRow('Q',attention.q[t])}${vectorRow('K',attention.k[t])}${vectorRow('V',attention.v[t])}`;
  if(state.step===1)numbers=`<p class="numeric-caption">Q · Kᵀ / √3 · chiều dài thanh = độ lớn điểm</p>${scoreRows(attention.scores[t])}`;
  if(state.step===2)numbers=`${scoreRows(attention.weights[t],true)}<div class="weight-total">Σ trọng số = ${attention.weights[t].reduce((a,b)=>a+b,0).toFixed(4)} · Các phần trăm được làm tròn</div>`;
  if(state.step===3)numbers=`<p class="numeric-caption">o = Σᵢ attentionᵢ × Vᵢ</p>${vectorRow('o',attention.output[t])}<p class="numeric-caption" style="margin-top:20px">Ví dụ một số hạng từ token “${tokens[1]}”:</p>${vectorRow('V₂',attention.v[1])}${vectorRow('×α',attention.v[1].map(v=>v*attention.weights[t][1]))}<p class="numeric-caption">α = ${percent(attention.weights[t][1])} · Cộng cả 8 số hạng để có o.</p>`;
  $('#step-numbers').innerHTML=numbers;
  $('#step-progress').textContent=`Bước ${state.step+1} / 4`;
  $('#previous-step').disabled=state.step===0;
  $('#next-step').innerHTML=state.step===3?'Xem lại <span>↺</span>':'Bước tiếp <span>→</span>';
}
function renderAttention(){
  $$('[data-token]').forEach(el=>{const active=Number(el.dataset.token)===state.token;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
  $$('[data-view]').forEach(el=>{const active=el.dataset.view===state.view;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
  $$('[data-step]').forEach(el=>{const active=Number(el.dataset.step)===state.step;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  $('#attention-visual').innerHTML=state.view==='matrix'?renderMatrix():renderConnections();
  $$('[data-row]').forEach(el=>el.addEventListener('click',()=>{state.token=Number(el.dataset.row);renderAttention();}));
  renderStep();
  $('#projection-data').textContent=`Head ${state.head+1} · ma trận mô phỏng\nX[${state.token+1}] = [${inputs[state.token].map(fmt).join(', ')}]\n\nWQ (4 × 3)\n${attention.wq.map(row=>row.map(fmt).join('  ')).join('\n')}\n\nWK (4 × 3)\n${attention.wk.map(row=>row.map(fmt).join('  ')).join('\n')}\n\nWV (4 × 4)\n${attention.wv.map(row=>row.map(fmt).join('  ')).join('\n')}`;
  renderStory();
}

// The introduction shows the same attention data without numerical machinery.
function renderStory(){
  const narrow=matchMedia('(max-width:680px)').matches;
  const xs=narrow?[70,205,350,490,70,205,350,490]:[65,185,305,445,605,745,865,1005];
  const ys=tokens.map((_,i)=>narrow?(i<4?130:270):218);
  const source=xs[state.token],weights=attention.weights[state.token],max=Math.max(...weights);
  const focused=document.activeElement?.dataset?.introToken;
  const arcs=xs.map((x,i)=>{
    if(i===state.token)return '';
    const high=narrow?Math.max(40,Math.min(ys[state.token],ys[i])-55-Math.abs(source-x)*.13):220-Math.min(245,60+Math.abs(source-x)*.32);
    return `<path class="intro-arc" d="M${source} ${ys[state.token]}C${source} ${high} ${x} ${high} ${x} ${ys[i]}" stroke-width="${1+weights[i]/max*4}" opacity="${.13+weights[i]/max*.65}"/>`;
  }).join('');
  const makeWords=(interactive)=>tokens.map((token,i)=>{
    const w=Math.max(75,token.length*(narrow?12:15)+26),x=xs[i],y=ys[i];
    const control=interactive?`data-intro-token="${i}" role="button" tabindex="0" aria-label="Chọn token ${token}, vị trí ${i+1}" aria-pressed="${i===state.token}"`:'';
    return `<g class="intro-token ${i===state.token?'selected':''}" ${control}><circle class="intro-node" cx="${x}" cy="${y}" r="3"/><rect x="${x-w/2}" y="${y+18}" width="${w}" height="49" rx="7"/><text x="${x}" y="${y+50}">${token}</text></g>`;
  }).join('');
  const figure=(interactive)=>`<svg viewBox="0 0 ${narrow?'560 350':'1080 315'}" role="${interactive?'group':'img'}" aria-label="${interactive?'Chọn một token để khám phá các kết nối Attention':'Phân bố kết nối tại head '+(state.head+1)} trong câu The cat is sleeping because it is tired"><text class="intro-figure-label" x="${narrow?280:540}" y="24">SELF-ATTENTION</text>${arcs}${makeWords(interactive)}</svg>`;
  $('#intro-constellation').innerHTML=figure(true);
  if(focused!==undefined)$(`[data-intro-token="${focused}"]`)?.focus();
  $('#intro-caption').textContent=state.token===5?'Trong câu này, “it” có thể chỉ “the cat”.':`“${tokens[state.token]}” kết hợp thông tin từ các vị trí khác để tạo biểu diễn theo ngữ cảnh.`;
  $$('[data-story-head]').forEach(el=>{const active=Number(el.dataset.storyHead)===state.head;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
  $('#story-head-label').textContent=`Head ${String(state.head+1).padStart(2,'0')} / 08`;
  $('#head-source').textContent=`Đang quan sát token “${tokens[state.token]}”`;
  $('#head-exhibit').innerHTML=narrow?figure(false):renderConnections(false);
  $('#head-select').value=String(state.head);
}
function chooseIntroToken(event){
  const token=event.target.closest('[data-intro-token]');
  if(!token)return;
  state.token=Number(token.dataset.introToken);renderAttention();
}
$('#intro-constellation').addEventListener('click',chooseIntroToken);
$('#intro-constellation').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();chooseIntroToken(event);}});
$$('[data-story-head]').forEach(el=>el.addEventListener('click',()=>{state.head=Number(el.dataset.storyHead);attention=getAttention(state.head);renderAttention();}));
addEventListener('resize',renderStory);
renderAttention();

// Causal mask and illustrative autoregressive generation.
const target=['Tôi','thích','học','<EOS>'];
const predictions=[
  [['Tôi',.72],['Bạn',.16],['Ta',.08],['Khác',.04]],
  [['thích',.65],['yêu',.22],['đang',.09],['Khác',.04]],
  [['học',.81],['đọc',.10],['chơi',.06],['Khác',.03]],
  [['<EOS>',.88],['hỏi',.07],['nữa',.03],['Khác',.02]]
];
const escapeHTML=(value)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function renderMask(){
  const enabled=$('#mask-toggle').checked;
  const labels=['BOS','Tôi','thích','học'];
  const mask=causalMask(4),active=Math.min(state.generated,3);
  $('#mask-label').textContent=enabled?'Đang bật':'Đã tắt';
  $('#mask-warning').hidden=enabled;
  $('#mask-grid').innerHTML=`<span>Q ↓ K →</span>${labels.map(t=>`<span>${t}</span>`).join('')}${mask.map((row,i)=>`<span class="${i===active?'current':''}">${labels[i]}</span>${row.map((allowed,j)=>{const blocked=enabled&&!allowed;return `<div class="mask-cell ${blocked?'blocked':''} ${i===active?'current':''}" role="img" aria-label="${labels[i]} ${blocked?'không được':'được'} nhìn ${labels[j]}">${blocked?'−∞':'✓'}</div>`;}).join('')}`).join('')}`;
}
function renderDecoder(){
  $('#generated-tokens').innerHTML='<span class="generated-token bos">&lt;BOS&gt;</span>'+target.slice(0,state.generated).map((token,i)=>`<span class="generated-token ${i===state.generated-1?'latest':''} ${i===3?'eos':''}">${escapeHTML(token)}</span>`).join('');
  const finished=state.generated===4;
  $('#prediction-bars').innerHTML=finished?'<div class="note" style="margin-top:0"><p><strong>Tôi thích học</strong><br>Đã gặp &lt;EOS&gt; — dừng sinh câu.</p></div>':predictions[state.generated].map(([token,p],i)=>`<div class="prediction-row ${i===0?'winner':''}"><span>${escapeHTML(token)}</span><div class="prediction-track"><span style="width:${p*100}%"></span></div><span>${Math.round(p*100)}%</span></div>`).join('');
  $('#generate-token').disabled=finished;
  $('#generate-token').innerHTML=finished?'Đã hoàn thành <span>✓</span>':'Sinh token tiếp <span>→</span>';
  $('#generation-status').textContent=finished?'Kết thúc sau 4 bước, bao gồm token <EOS>.':state.generated===0?'Bắt đầu bằng token đặc biệt <BOS>.':`Bước ${state.generated}: thêm “${target[state.generated-1]}”, rồi đưa chuỗi trở lại Decoder.`;
  $('#reset-decoder').disabled=state.generated===0;
  renderMask();
}
$('#mask-toggle').addEventListener('change',renderMask);
$('#generate-token').addEventListener('click',()=>{if(state.generated<4)state.generated++;renderDecoder();});
$('#reset-decoder').addEventListener('click',()=>{state.generated=0;renderDecoder();});
renderDecoder();

// A short, pausable story: input → context → one target token at a time.
function renderJourney(){
  const finished=journey.count===target.length;
  $('#journey-exhibit').classList.toggle('is-playing',journey.playing);
  $('#encoder-stack').classList.toggle('working',journey.playing&&journey.count===0);
  $('#decoder-stack').classList.toggle('working',journey.playing&&journey.count>0);
  $('#journey-tokens').innerHTML=journey.count===0?'<span class="output-placeholder">Một câu mới đang chờ được tạo…</span>':target.slice(0,journey.count).map((token,i)=>`<span class="journey-token ${i===3?'end-token':''}">${escapeHTML(token)}</span>`).join('');
  $('#play-journey').innerHTML=journey.playing?'<span aria-hidden="true">Ⅱ</span> Tạm dừng':finished?'<span aria-hidden="true">↺</span> Xem lại':journey.count>0?'<span aria-hidden="true">▷</span> Tiếp tục':'<span aria-hidden="true">▷</span> Chạy một lượt';
  $('#reset-journey').disabled=journey.count===0&&!journey.playing;
  $('#journey-phase').textContent=finished?'Hoàn thành':journey.playing?(journey.count===0?'Encoder tạo ngữ cảnh':'Decoder đang tạo câu'):journey.count>0?'Tạm dừng':'Sẵn sàng';
  $('#journey-status').textContent=finished?'“Tôi thích học” — gặp <EOS>, dừng sinh câu.':journey.playing?(journey.count===0?'Encoder tạo biểu diễn cho câu nguồn.':`Đã tạo “${target.slice(0,journey.count).join(' ')}”. Decoder tiếp tục dự đoán.`):journey.count>0?'Có thể tiếp tục từ token đang dừng.':'Bấm chạy để theo dõi luồng dữ liệu.';
}
function tickJourney(){
  if(!journey.playing)return;
  journey.count++;
  if(journey.count===target.length)journey.playing=false;
  renderJourney();
  if(journey.playing)scheduleJourney();
}
function scheduleJourney(){journey.timer=setTimeout(tickJourney,matchMedia('(prefers-reduced-motion: reduce)').matches?40:1000);}
$('#play-journey').addEventListener('click',()=>{
  clearTimeout(journey.timer);
  if(journey.playing){journey.playing=false;renderJourney();return;}
  if(journey.count===target.length)journey.count=0;
  journey.playing=true;renderJourney();scheduleJourney();
});
$('#reset-journey').addEventListener('click',()=>{clearTimeout(journey.timer);journey.count=0;journey.playing=false;renderJourney();});
addEventListener('pagehide',()=>{clearTimeout(journey.timer);journey.playing=false;});
renderJourney();

function renderComplexity(){
  const n=Number($('#length-slider').value);
  $('#sequence-length').textContent=n;$('#pair-count').textContent=n*n;$('#length-output').textContent=n;
  $('#complexity-grid').style.gridTemplateColumns=`repeat(${n},1fr)`;
  $('#complexity-grid').innerHTML=Array.from({length:n*n},(_,i)=>`<span class="${Math.floor(i/n)===i%n?'diagonal':''}"></span>`).join('');
}
$('#length-slider').addEventListener('input',renderComplexity);
renderComplexity();
