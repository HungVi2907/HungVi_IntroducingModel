import {tokens,getAttention,causalMask} from './attention.js';
import {initializeImageViewer} from './image-viewer.js';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const view=document.defaultView;
initializeImageViewer(document);

// One navigation entry for each section in the supplied outline.
function updateNavigation(){
  let current=null;
  for(const section of $$('main>section'))if(section.getBoundingClientRect().top<view.innerHeight*.3)current=section.id;
  $$('.site-header nav a').forEach(link=>{
    const active=link.hash==='#'+current;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
}
view.addEventListener('scroll',updateNavigation,{passive:true});view.addEventListener('resize',updateNavigation);updateNavigation();

// Motivation: processing time steps versus direct connections within a layer.
function comparisonSVG(parallel){
  const xs=[50,150,250,350],words=['The','cat','is','tired'];
  const edges=parallel?xs.flatMap((x,i)=>xs.slice(i+1).map((end,j)=>`<path class="sequence-edge" d="M${x} 60Q${(x+end)/2} ${20-j*10} ${end} 60"/>`)).join(''):xs.slice(0,-1).map((x,i)=>`<path class="sequence-edge" data-edge="${i}" d="M${x+43} 75H${xs[i+1]-43}"/><path d="M${xs[i+1]-47} 71L${xs[i+1]-43} 75L${xs[i+1]-47} 79" fill="none" stroke="#b2c3a4"/>`).join('');
  return `<svg viewBox="0 0 400 110" role="img" aria-label="${parallel?'Các vị trí kết nối trực tiếp qua Self-Attention':'RNN và LSTM truyền biểu diễn qua các bước nối tiếp'}">${edges}${xs.map((x,i)=>`<rect class="sequence-token" data-index="${i}" x="${x-43}" y="60" width="86" height="30" rx="5"/><text class="sequence-text" x="${x}" y="80">${words[i]}</text>`).join('')}</svg>`;
}
$('#rnn-visual').innerHTML=comparisonSVG(false);$('#parallel-visual').innerHTML=comparisonSVG(true);
let comparisonTimer;
$('#run-comparison').addEventListener('click',()=>{
  view.clearTimeout(comparisonTimer);
  $$('.comparison-figure .active').forEach(node=>node.classList.remove('active'));
  const button=$('#run-comparison');button.disabled=true;
  $('#comparison-status').textContent='RNN đi lần lượt; Self-Attention kết nối trực tiếp các vị trí.';
  let index=0;
  const tick=()=>{
    $$('#parallel-visual .sequence-token,#parallel-visual .sequence-edge').forEach(node=>node.classList.add('active'));
    $(`#rnn-visual [data-index="${index}"]`).classList.add('active');
    if(index>0)$(`#rnn-visual [data-edge="${index-1}"]`).classList.add('active');
    index++;
    if(index===4){button.disabled=false;button.textContent='↺ Xem lại';$('#comparison-status').textContent='Attention hỗ trợ tính nhiều vị trí song song khi huấn luyện.';}
  };
  if(view.matchMedia('(prefers-reduced-motion: reduce)').matches){while(index<4)tick();}
  else{const advance=()=>{tick();if(index<4)comparisonTimer=view.setTimeout(advance,400);};advance();}
});
view.addEventListener('pagehide',()=>{view.clearTimeout(comparisonTimer);$('#run-comparison').disabled=false;});

// The single Attention demo uses deterministic, illustrative weights.
const state={token:5,head:0};
const percent=n=>(n*100).toFixed(1)+'%';
const vector=row=>'['+row.map(value=>value.toFixed(2)).join(', ')+']';
$('#token-selector').innerHTML=tokens.map((token,i)=>`<button type="button" data-token="${i}" aria-pressed="${i===state.token}" aria-label="Chọn ${token}, vị trí ${i+1}">${token}</button>`).join('');
function attentionSVG(data){
  const row=data.weights[state.token],max=Math.max(...row);
  const edges=row.map((weight,i)=>`<path class="attention-link" data-weight="${weight}" data-target="${i}" d="M150 190C245 190 255 ${35+i*44} 350 ${35+i*44}" stroke-width="${1+weight/max*5}" opacity="${.18+weight/max*.62}"/>`).join('');
  const targets=tokens.map((token,i)=>`<g class="target-node ${i===state.token?'current':''}" data-target-index="${i}"><title>${token} (${i+1}): ${percent(row[i])}</title><rect x="350" y="${17+i*44}" width="190" height="36" rx="6" fill="rgba(116,155,83,${.06+row[i]/max*.18})"/><text x="445" y="${42+i*44}">${token}</text><circle cx="350" cy="${35+i*44}" r="3"/></g>`).join('');
  return `<svg viewBox="0 0 560 380" role="img" aria-label="Kết nối Attention từ ${tokens[state.token]}, vị trí ${state.token+1}, tại head ${state.head+1}"><title>${tokens.map((token,i)=>`${token} (${i+1}): ${percent(row[i])}`).join('; ')}</title>${edges}${targets}<text class="query-caption" x="85" y="145">TOKEN ĐANG CHỌN</text><g class="query-node ${tokens[state.token].length>6?'long-query':''}"><rect x="20" y="164" width="130" height="52" rx="8"/><text x="85" y="199">${tokens[state.token]}</text><circle cx="150" cy="190" r="4"/></g></svg>`;
}
function renderAttention(){
  const data=getAttention(state.head),t=state.token;
  $$('[data-token]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.token)===t)));
  $('#attention-status').textContent=`Token “${tokens[t]}” · Head ${state.head+1} / 8`;
  $('#attention-graph').innerHTML=attentionSVG(data);
  $('#attention-calculations').innerHTML=`<div class="calculation-layout"><table><caption>Vector tại token “${tokens[t]}”</caption><tbody>${[['Q',data.q[t]],['K',data.k[t]],['V',data.v[t]],['Đầu ra',data.output[t]]].map(([label,row])=>`<tr><th scope="row">${label}</th><td><code>${vector(row)}</code></td></tr>`).join('')}</tbody></table><table><caption>Trọng số sau Softmax</caption><tbody>${tokens.map((token,i)=>`<tr><th scope="row">${token} (${i+1})</th><td>${percent(data.weights[t][i])}</td></tr>`).join('')}<tr class="total-row"><th scope="row">Tổng</th><td id="weight-total">${data.weights[t].reduce((a,b)=>a+b,0).toFixed(4)}</td></tr></tbody></table></div><p class="calculation-note">Đầu ra = tổng các V nhân trọng số tương ứng. Demo dùng vector đầu vào 4 chiều và d<sub>k</sub> = 3 cho dễ đọc; bản base gốc dùng d<sub>model</sub> = 512 và d<sub>k</sub> = d<sub>v</sub> = 64. Các số đã được làm tròn.</p>`;
}
$('#token-selector').addEventListener('click',event=>{const button=event.target.closest('[data-token]');if(button){state.token=Number(button.dataset.token);renderAttention();}});
$('#head-select').addEventListener('change',event=>{state.head=Number(event.target.value);renderAttention();});
renderAttention();

function renderMask(){
  const enabled=$('#mask-enabled').checked,labels=['BOS','Tôi','thích','học'];
  $('#mask-grid').innerHTML='<span>Q ↓ K →</span>'+labels.map(label=>`<span>${label}</span>`).join('')+causalMask(4).map((row,i)=>`<span>${labels[i]}</span>${row.map((allowed,j)=>{const blocked=enabled&&!allowed;return `<div class="mask-cell ${blocked?'blocked':''}" role="img" aria-label="${labels[i]} ${blocked?'không được':'được'} nhìn ${labels[j]}">${blocked?'−∞':'✓'}</div>`;}).join('')}`).join('');
  $('#mask-message').textContent=enabled?'Các vị trí tương lai bị chặn trước Softmax.':'Đang tắt mask để so sánh. Decoder gốc phải dùng causal mask.';
}
$('#mask-enabled').addEventListener('change',renderMask);renderMask();

function renderComplexity(){
  const n=Number($('#length-slider').value);
  $('#sequence-length').textContent=n;$('#pair-count').textContent=n*n;$('#length-output').textContent=n;
  $('#complexity-grid').style.gridTemplateColumns=`repeat(${n},1fr)`;
  $('#complexity-grid').innerHTML=Array.from({length:n*n},(_,i)=>`<span class="${Math.floor(i/n)===i%n?'diagonal':''}"></span>`).join('');
}
$('#length-slider').addEventListener('input',renderComplexity);renderComplexity();
