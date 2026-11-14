export const storageKey='transformer-language';
export const messages={
  en:{
    'meta.title':'Transformer — An Attention-Based Deep Learning Model',
    'meta.description':'Explore Transformer in five parts: motivation, Encoder–Decoder architecture, Self-Attention, advantages and limitations, and applications.',
    'skip':'Skip to content',
    'nav.aria':'Five content sections','nav.motivation':'Motivation','nav.architecture':'Architecture','nav.working':'Mechanism','nav.tradeoffs':'Pros & cons','nav.applications':'Applications',
    'language.aria':'Page language','language.enAria':'Switch to English','language.viAria':'Switch to Vietnamese',
    'intro.subtitle':'An Attention-Based Deep Learning Model',
    'section.motivation.label':'01 · BACKGROUND','section.motivation.title':'Motivation',
    'section.architecture.label':'02 · THE ORIGINAL MODEL','section.architecture.title':'Core idea and architecture',
    'section.working.label':'03 · SELF-ATTENTION','section.working.title':'Working principle',
    'section.tradeoffs.label':'04 · TRADE-OFFS','section.tradeoffs.title':'Advantages and limitations',
    'section.applications.label':'05 · USE CASES','section.applications.title':'Applications',
    'motivation.p1':'Before 2017, RNNs and LSTMs were widely used in natural language processing. However, they process tokens sequentially, making parallel computation difficult and increasing training time for long sequences.',
    'motivation.p2':'RNNs also struggle to learn long-range dependencies because of <em>vanishing gradients</em>. LSTMs improve memory through gates and memory cells, but their processing remains sequential.',
    'motivation.p3':'Transformer was introduced in <em>Attention Is All You Need</em> (2017) to process sequences more efficiently without the <em>recurrence</em> used by RNNs and LSTMs.',
    'comparison.rnnHeading':'RNN / LSTM <span>Sequential</span>','comparison.parallelHeading':'Self-Attention <span>Direct connections</span>',
    'comparison.play':'▷ Play illustration','comparison.runningButton':'▷ Playing…','comparison.again':'↺ Replay',
    'comparison.idle':'See how positions exchange information.','comparison.running':'RNNs proceed step by step; Self-Attention connects positions directly.','comparison.complete':'Attention supports parallel computation across positions during training.',
    'comparison.rnnAria':'RNNs and LSTMs pass representations through sequential steps','comparison.parallelAria':'Positions connect directly through Self-Attention',
    'architecture.intro':'The key innovation was not inventing attention, but <strong>making attention the central component instead of recurrence</strong>. Self-Attention lets tokens exchange information directly with relevant tokens in the sequence; many positions can be processed in parallel during training.',
    'architecture.alt':'The original Encoder–Decoder architecture: six Encoders process the source sentence; the final Encoder output connects to each of six Decoder layers to produce the target sentence.',
    'architecture.captionTitle':'The original Transformer: Encoder–Decoder','architecture.caption':'Six layers on each side. The final Encoder output provides context to every Decoder layer.',
    'architecture.imageTitle':'The original Encoder–Decoder architecture',
    'image.enlarge':'Enlarge ↗',
    'image.creditFull':'Image: <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener noreferrer">Jay Alammar · The Illustrated Transformer</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>.',
    'image.creditShort':'Image: <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener noreferrer">Jay Alammar</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>.',
    'component.encoder':'Receives the input sentence and builds a context-aware representation for each token.',
    'component.decoder':'Uses the Encoder output and preceding target tokens to predict the next token.',
    'component.heads':'Models different relationships between tokens at the same time. The original base model uses eight heads.',
    'component.ffn':'Transforms each token representation after attention, using the same weights across positions within a layer.',
    'component.position':'Adds order information because attention alone does not represent token positions.',
    'stack.summary':'See the six-layer stacks <span aria-hidden="true">+</span>',
    'visual.viewsAria':'Architecture detail level','visual.encoderTab':'1. Encoder','visual.pairTab':'2. Encoder–Decoder','visual.fullTab':'3. Full connections',
    'visual.encoderTitle':'Inside an Encoder',
    'visual.encoderCaption':'Read upward: Self-Attention mixes information between tokens, then the Feed-Forward Network transforms each position. This simplified view omits residual connections and LayerNorm.',
    'visual.encoderAlt':'A simplified Encoder: input enters Self-Attention, then a Feed-Forward Neural Network, and exits at the top.',
    'visual.pairTitle':'The Decoder also attends to the source',
    'visual.pairCaption':'The arrow carries Encoder representations into Encoder–Decoder Attention. Decoder Self-Attention uses a causal mask; both attention blocks are multi-head in the original model. Residual connections and LayerNorm are omitted here.',
    'visual.pairAlt':'Simplified Encoder and Decoder: Encoder Self-Attention and Feed Forward connect to the Decoder, which contains masked Self-Attention, Encoder–Decoder Attention and Feed Forward.',
    'visual.fullTitle':'Follow the connections through the layers',
    'visual.fullCaption':'Dotted paths show residual connections; Add & Norm combines addition with LayerNorm. Decoder Self-Attention is masked. Two layers per side are illustrated; the original model has six per side.',
    'visual.fullAlt':'Two Encoder and Decoder layers with positional encoding, residual paths, Add and Normalize, Encoder–Decoder Attention, and the final Linear and Softmax. Decoder layer two is collapsed.',
    'decoding.title':'Translation, one token at a time',
    'decoding.caption':'Watch “Je suis étudiant” become “I am a student”. Each predicted token becomes part of the Decoder input for the next step.',
    'decoding.alt':'Animated translation: the Encoder represents Je suis étudiant; the Decoder repeatedly uses the source representation and previous outputs to generate I am a student.',
    'decoding.play':'▷ Play decoding','decoding.stop':'■ Stop animation','decoding.idle':'Static preview · the animation begins at decoding step 1.','decoding.playing':'Playing · follow the decoding steps and output tokens at the top.','decoding.error':'The animation could not load. Select Play decoding to try again.',
    'decoding.step1Title':'Encode the source','decoding.step1Body':'The Encoder builds source representations once.',
    'decoding.step2Title':'Predict the next token','decoding.step2Body':'The Decoder attends to the source and earlier target tokens; Linear + Softmax produces probabilities.',
    'decoding.step3Title':'Feed the token back','decoding.step3Body':'Append the chosen token and repeat until an end-of-sequence token.',
    'working.example':'In <span class="example-sentence" lang="en">“The cat is sleeping because <strong>it</strong> is tired.”</span>, “it” refers to “the cat”. Self-Attention lets the model compare “it” with other tokens to build a more context-aware representation.',
    'working.projections':'Each token is transformed into three vectors through learned projections:',
    'working.query':'Represents the information being sought.','working.key':'Helps assess how relevant information is.','working.value':'Contains the information to be aggregated.',
    'working.formulaAria':'Attention of Q, K, V equals softmax of Q times K transpose divided by the square root of d k, multiplied by V',
    'working.explain':'The model compares Q with each K to compute relevance scores, applies Softmax to turn scores into weights, then takes a weighted sum of the V vectors. Multi-Head Attention performs this process across multiple heads to learn different relationships.',
    'attention.heading':'Select a token to explore its connections','attention.headLabel':'Attention head','attention.headAria':'Select an attention head','attention.tokenGroupAria':'Tokens in the example sentence',
    'attention.caption':'Thicker lines indicate larger weights. These illustrative values do not come from a trained model; a high attention weight alone does not prove that a model understands a relationship.',
    'attention.summary':'Inspect Q, K, V and the output for the selected token <span aria-hidden="true">+</span>',
    'attention.chooseAria':'Select {token}, position {position}','attention.svgAria':'Attention connections from {token}, position {position}, in head {head}',
    'attention.connection':'{token}, position {position}: {weight}','attention.queryCaption':'SELECTED TOKEN',
    'attention.status':'Token “{token}” · Head {head} / 8','attention.vectorCaption':'Vectors for token “{token}”','attention.weightsCaption':'Weights after Softmax','attention.output':'Output','attention.total':'Total',
    'attention.note':'Output = the sum of each V multiplied by its weight. The demo uses 4-dimensional input vectors and d<sub>k</sub> = 3 for readability; the original base model uses d<sub>model</sub> = 512 and d<sub>k</sub> = d<sub>v</sub> = 64. Displayed values are rounded.',
    'decoder.note':'In the Decoder, Self-Attention uses a <strong>causal mask</strong> to prevent access to future tokens. During inference, tokens are still generated one at a time.',
    'mask.summary':'Illustrate the Decoder mask <span aria-hidden="true">+</span>',
    'mask.explanation':'Each row can attend only to its own position and earlier positions. Future scores are set to −∞ before Softmax.',
    'mask.toggle':'Enable causal mask','mask.gridAria':'Attention mask: rows are query positions, columns are positions being attended to',
    'mask.enabled':'Future positions are blocked before Softmax.','mask.disabled':'Mask disabled for comparison. The original Decoder must use a causal mask.',
    'mask.allowed':'{source} can attend to {target}','mask.blocked':'{source} cannot attend to {target}',
    'mask.word1':'I','mask.word2':'like','mask.word3':'learning',
    'external.heading':'Interactive visualization: Transformer Explainer',
    'external.note':'This site illustrates <strong>decoder-only GPT-2</strong>, not the complete Encoder–Decoder architecture of the original paper.',
    'external.link':'Open Transformer Explainer ↗',
    'tradeoffs.advantages':'Advantages','tradeoffs.advantage1':'Better support for parallel computation during training than RNNs and LSTMs.','tradeoffs.advantage2':'Direct connections between distant tokens.',
    'tradeoffs.limitations':'Limitations','tradeoffs.limitation1':'Standard Self-Attention has computation and memory costs that grow quadratically with sequence length.','tradeoffs.limitation2':'Large models require substantial computing resources.',
    'complexity.heading':'Every token attends to every token','complexity.tokens':'tokens','complexity.pairs':'position pairs','complexity.length':'Sequence length','complexity.note':'Double the sequence length → four times as many attention pairs.',
    'applications.translationTitle':'Machine translation','applications.translationBody':'Turns a source sentence into a target sentence using an Encoder–Decoder architecture.',
    'applications.classificationTitle':'Text classification','applications.classificationBody':'Supports topic classification, sentiment analysis, and other language-understanding tasks.',
    'applications.modelsTitle':'Language models','applications.modelsBody':'The foundation of BERT and GPT. BERT is Encoder-based; GPT uses a Decoder to generate text.',
    'footer.paper':'Original paper ↗','footer.top':'Back to top ↑',
    'viewer.title':'Illustration','viewer.close':'Close enlarged image','viewer.zoom':'Zoom in','viewer.fit':'Fit to view','viewer.instruction':'Scroll or swipe to explore the enlarged image.'
  },
  vi:{
    'meta.title':'Transformer — Mô hình Deep Learning dựa trên Attention',
    'meta.description':'Giới thiệu Transformer theo 5 phần: động lực, kiến trúc Encoder–Decoder, Self-Attention, ưu nhược điểm và ứng dụng.',
    'skip':'Đến nội dung',
    'nav.aria':'Năm phần nội dung','nav.motivation':'Động lực','nav.architecture':'Kiến trúc','nav.working':'Cơ chế','nav.tradeoffs':'Ưu & nhược','nav.applications':'Ứng dụng',
    'language.aria':'Ngôn ngữ trang','language.enAria':'Chuyển sang tiếng Anh','language.viAria':'Chuyển sang tiếng Việt',
    'intro.subtitle':'Mô hình Deep Learning dựa trên Attention',
    'section.motivation.label':'01 · MOTIVATION','section.motivation.title':'Động lực phát triển',
    'section.architecture.label':'02 · CORE IDEA & ARCHITECTURE','section.architecture.title':'Ý tưởng và kiến trúc',
    'section.working.label':'03 · WORKING PRINCIPLE','section.working.title':'Nguyên lý hoạt động',
    'section.tradeoffs.label':'04 · ADVANTAGES & LIMITATIONS','section.tradeoffs.title':'Ưu điểm và hạn chế',
    'section.applications.label':'05 · APPLICATIONS','section.applications.title':'Ứng dụng',
    'motivation.p1':'Trước năm 2017, RNN và LSTM được sử dụng rộng rãi trong xử lý ngôn ngữ tự nhiên. Tuy nhiên, chúng phải xử lý các token lần lượt theo thứ tự, khiến việc tính toán song song gặp khó khăn và thời gian huấn luyện tăng khi chuỗi dài.',
    'motivation.p2':'RNN cũng khó học các mối quan hệ xa do hiện tượng <em>vanishing gradient</em>. LSTM cải thiện khả năng ghi nhớ bằng các cổng và bộ nhớ, nhưng vẫn có tính tuần tự.',
    'motivation.p3':'Transformer được giới thiệu trong bài báo <em>Attention Is All You Need</em> (2017) nhằm xử lý chuỗi hiệu quả hơn mà không cần cơ chế hồi quy (<em>recurrence</em>) của RNN/LSTM.',
    'comparison.rnnHeading':'RNN / LSTM <span>Tuần tự</span>','comparison.parallelHeading':'Self-Attention <span>Kết nối trực tiếp</span>',
    'comparison.play':'▷ Xem minh họa','comparison.runningButton':'▷ Đang chạy…','comparison.again':'↺ Xem lại',
    'comparison.idle':'Quan sát cách các vị trí trao đổi thông tin.','comparison.running':'RNN đi lần lượt; Self-Attention kết nối trực tiếp các vị trí.','comparison.complete':'Attention hỗ trợ tính nhiều vị trí song song khi huấn luyện.',
    'comparison.rnnAria':'RNN và LSTM truyền biểu diễn qua các bước nối tiếp','comparison.parallelAria':'Các vị trí kết nối trực tiếp qua Self-Attention',
    'architecture.intro':'Điểm khác biệt cốt lõi không phải là phát minh ra attention, mà là <strong>dùng attention làm thành phần trung tâm thay cho recurrence</strong>. Nhờ Self-Attention, các token có thể trao đổi thông tin trực tiếp với những token liên quan trong chuỗi; khi huấn luyện, nhiều vị trí có thể được xử lý song song.',
    'architecture.alt':'Kiến trúc Encoder–Decoder: sáu Encoder nhận câu nguồn; đầu ra Encoder cuối nối tới từng lớp trong sáu Decoder để tạo câu đích.',
    'architecture.captionTitle':'Transformer gốc: Encoder–Decoder','architecture.caption':'6 lớp mỗi phía. Đầu ra Encoder cuối cung cấp ngữ cảnh cho từng lớp Decoder.',
    'architecture.imageTitle':'Kiến trúc Encoder–Decoder gốc','image.enlarge':'Phóng lớn ↗',
    'image.creditFull':'Ảnh: <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener noreferrer">Jay Alammar · The Illustrated Transformer</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>.',
    'image.creditShort':'Ảnh: <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener noreferrer">Jay Alammar</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>.',
    'component.encoder':'Tiếp nhận câu đầu vào và tạo biểu diễn có ngữ cảnh cho từng token.',
    'component.decoder':'Dựa vào đầu ra Encoder và các token đích trước đó để dự đoán token tiếp theo.',
    'component.heads':'Xem xét nhiều kiểu quan hệ giữa các token cùng lúc. Bản base gốc dùng 8 head.',
    'component.ffn':'Biến đổi biểu diễn của từng token sau attention, với cùng trọng số ở các vị trí trong một lớp.',
    'component.position':'Bổ sung thông tin thứ tự vì attention tự nó không biểu diễn vị trí token.',
    'stack.summary':'Xem các chồng gồm sáu lớp <span aria-hidden="true">+</span>',
    'visual.viewsAria':'Mức chi tiết của kiến trúc','visual.encoderTab':'1. Encoder','visual.pairTab':'2. Encoder–Decoder','visual.fullTab':'3. Đầy đủ kết nối',
    'visual.encoderTitle':'Bên trong một Encoder',
    'visual.encoderCaption':'Đọc từ dưới lên: Self-Attention trao đổi thông tin giữa các token, rồi Feed-Forward Network biến đổi từng vị trí. Hình đơn giản này lược bỏ nhánh residual và LayerNorm.',
    'visual.encoderAlt':'Encoder đơn giản: đầu vào đi qua Self-Attention, rồi Feed-Forward Neural Network và đi ra ở phía trên.',
    'visual.pairTitle':'Decoder còn nhìn vào câu nguồn',
    'visual.pairCaption':'Mũi tên đưa biểu diễn từ Encoder vào Encoder–Decoder Attention. Self-Attention của Decoder dùng causal mask; cả hai khối attention đều là multi-head trong mô hình gốc. Hình này lược bỏ nhánh residual và LayerNorm.',
    'visual.pairAlt':'Encoder và Decoder đơn giản: Encoder gồm Self-Attention và Feed Forward; Decoder gồm Self-Attention có mask, Encoder–Decoder Attention và Feed Forward.',
    'visual.fullTitle':'Theo dòng kết nối qua các lớp',
    'visual.fullCaption':'Đường chấm thể hiện nhánh residual; Add & Norm gồm phép cộng và LayerNorm. Self-Attention của Decoder có mask. Hình minh họa hai lớp mỗi phía; mô hình gốc có sáu lớp mỗi phía.',
    'visual.fullAlt':'Hai lớp Encoder và Decoder với positional encoding, nhánh residual, Add and Normalize, Encoder–Decoder Attention, cuối cùng là Linear và Softmax. Lớp Decoder thứ hai được thu gọn.',
    'decoding.title':'Dịch câu, từng token một',
    'decoding.caption':'Quan sát “Je suis étudiant” thành “I am a student”. Mỗi token được dự đoán sẽ trở thành một phần đầu vào của Decoder ở bước tiếp theo.',
    'decoding.alt':'Ảnh động dịch câu: Encoder biểu diễn Je suis étudiant; Decoder liên tục dùng biểu diễn câu nguồn và các đầu ra trước đó để sinh I am a student.',
    'decoding.play':'▷ Xem quá trình giải mã','decoding.stop':'■ Dừng ảnh động','decoding.idle':'Ảnh xem trước · ảnh động bắt đầu từ bước giải mã số 1.','decoding.playing':'Đang phát · theo dõi các bước giải mã và token đầu ra ở phía trên.','decoding.error':'Chưa tải được ảnh động. Nhấn Xem quá trình giải mã để thử lại.',
    'decoding.step1Title':'Mã hóa câu nguồn','decoding.step1Body':'Encoder tạo biểu diễn câu nguồn một lần.',
    'decoding.step2Title':'Dự đoán token tiếp theo','decoding.step2Body':'Decoder nhìn câu nguồn và các token đích trước đó; Linear + Softmax tạo phân phối xác suất.',
    'decoding.step3Title':'Đưa token trở lại','decoding.step3Body':'Nối token đã chọn vào đầu vào và lặp lại đến token kết thúc chuỗi.',
    'working.example':'Trong câu <span class="example-sentence" lang="en">“The cat is sleeping because <strong>it</strong> is tired.”</span>, “it” liên quan đến “the cat”. Self-Attention cho phép mô hình đối chiếu “it” với những token khác để tạo biểu diễn phù hợp hơn với ngữ cảnh.',
    'working.projections':'Mỗi token được biến đổi thành ba vector qua các phép chiếu học được:',
    'working.query':'Biểu diễn thông tin đang tìm kiếm.','working.key':'Dùng để đánh giá mức liên quan.','working.value':'Chứa thông tin sẽ được tổng hợp.',
    'working.formulaAria':'Attention Q K V bằng softmax của Q nhân K chuyển vị chia căn d k, rồi nhân V',
    'working.explain':'Mô hình so sánh Q với các K để tính điểm liên quan, dùng Softmax chuyển điểm thành trọng số, rồi lấy tổng có trọng số của các V. Multi-Head Attention thực hiện quá trình này qua nhiều head để học các mối quan hệ khác nhau.',
    'attention.heading':'Chọn một token để xem các kết nối','attention.headLabel':'Attention head','attention.headAria':'Chọn attention head','attention.tokenGroupAria':'Các token trong câu ví dụ',
    'attention.caption':'Nét đậm hơn → trọng số lớn hơn. Dữ liệu mô phỏng để giải thích cơ chế, không lấy từ mô hình đã huấn luyện; attention cao không tự chứng minh mô hình hiểu đúng một quan hệ.',
    'attention.summary':'Xem Q, K, V và kết quả tại token đang chọn <span aria-hidden="true">+</span>',
    'attention.chooseAria':'Chọn {token}, vị trí {position}','attention.svgAria':'Kết nối Attention từ {token}, vị trí {position}, tại head {head}',
    'attention.connection':'{token}, vị trí {position}: {weight}','attention.queryCaption':'TOKEN ĐANG CHỌN',
    'attention.status':'Token “{token}” · Head {head} / 8','attention.vectorCaption':'Vector tại token “{token}”','attention.weightsCaption':'Trọng số sau Softmax','attention.output':'Đầu ra','attention.total':'Tổng',
    'attention.note':'Đầu ra = tổng các V nhân trọng số tương ứng. Demo dùng vector đầu vào 4 chiều và d<sub>k</sub> = 3 cho dễ đọc; bản base gốc dùng d<sub>model</sub> = 512 và d<sub>k</sub> = d<sub>v</sub> = 64. Các số đã được làm tròn.',
    'decoder.note':'Trong Decoder, Self-Attention có <strong>causal mask</strong> để không nhìn thấy token tương lai. Khi suy luận, mô hình vẫn sinh từng token lần lượt.',
    'mask.summary':'Minh họa mặt nạ của Decoder <span aria-hidden="true">+</span>',
    'mask.explanation':'Mỗi hàng chỉ được nhìn chính vị trí đó và các vị trí trước. Các điểm ở tương lai được đặt thành −∞ trước Softmax.',
    'mask.toggle':'Bật causal mask','mask.gridAria':'Mặt nạ attention, hàng là vị trí truy vấn và cột là vị trí được nhìn',
    'mask.enabled':'Các vị trí tương lai bị chặn trước Softmax.','mask.disabled':'Đang tắt mask để so sánh. Decoder gốc phải dùng causal mask.',
    'mask.allowed':'{source} được nhìn {target}','mask.blocked':'{source} không được nhìn {target}',
    'mask.word1':'Tôi','mask.word2':'thích','mask.word3':'học',
    'external.heading':'Trực quan hóa tương tác: Transformer Explainer',
    'external.note':'Trang này minh họa <strong>GPT-2 dạng decoder-only</strong>, không phải toàn bộ Encoder–Decoder của paper gốc.',
    'external.link':'Mở Transformer Explainer ↗',
    'tradeoffs.advantages':'Ưu điểm','tradeoffs.advantage1':'Hỗ trợ xử lý song song tốt hơn RNN/LSTM trong huấn luyện.','tradeoffs.advantage2':'Kết nối trực tiếp các token ở xa nhau.',
    'tradeoffs.limitations':'Hạn chế','tradeoffs.limitation1':'Self-Attention tiêu chuẩn có chi phí tính toán và bộ nhớ tăng theo bình phương độ dài chuỗi.','tradeoffs.limitation2':'Các mô hình lớn cần nhiều tài nguyên.',
    'complexity.heading':'Mỗi token nhìn mọi token','complexity.tokens':'token','complexity.pairs':'cặp vị trí','complexity.length':'Độ dài chuỗi','complexity.note':'Gấp đôi độ dài → gấp bốn số cặp attention.',
    'applications.translationTitle':'Dịch máy','applications.translationBody':'Chuyển một câu nguồn thành câu đích bằng kiến trúc Encoder–Decoder.',
    'applications.classificationTitle':'Phân loại văn bản','applications.classificationBody':'Phân loại chủ đề, phân tích cảm xúc và các tác vụ hiểu văn bản.',
    'applications.modelsTitle':'Mô hình ngôn ngữ','applications.modelsBody':'Nền tảng cho BERT và GPT. BERT thiên về Encoder; GPT dùng Decoder để sinh văn bản.',
    'footer.paper':'Paper gốc ↗','footer.top':'Về đầu trang ↑',
    'viewer.title':'Hình minh họa','viewer.close':'Đóng ảnh phóng lớn','viewer.zoom':'Phóng to','viewer.fit':'Vừa khung','viewer.instruction':'Cuộn hoặc vuốt để xem ảnh khi phóng to.'
  }
};

export function translate(language,key,values={}){
  const message=messages[language]?.[key]??messages.en[key];
  if(message===undefined)throw new Error('Missing translation: '+key);
  return message.replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
}
export function applyTranslations(doc,language){
  const lang=language==='vi'?'vi':'en';
  doc.documentElement.lang=lang;
  for(const node of doc.querySelectorAll('[data-i18n]'))node.innerHTML=translate(lang,node.dataset.i18n);
  for(const node of doc.querySelectorAll('[data-i18n-attr]')){
    for(const binding of node.dataset.i18nAttr.split(';')){
      const [attribute,key]=binding.trim().split(':');
      node.setAttribute(attribute,translate(lang,key));
    }
  }
  doc.title=translate(lang,'meta.title');
  for(const button of doc.querySelectorAll('[data-language]'))button.setAttribute('aria-pressed',String(button.dataset.language===lang));
}
export function createI18n(doc=document){
  let language='en';
  try{if(doc.defaultView.localStorage.getItem(storageKey)==='vi')language='vi';}catch{}
  const listeners=new Set();
  const api={
    get language(){return language;},
    t:(key,values)=>translate(language,key,values),
    subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);},
    setLanguage(next){
      const target=next==='vi'?'vi':'en';
      try{doc.defaultView.localStorage.setItem(storageKey,target);}catch{}
      if(target===language)return;
      language=target;applyTranslations(doc,language);
      for(const listener of listeners)listener(language);
    }
  };
  applyTranslations(doc,language);
  for(const button of doc.querySelectorAll('[data-language]'))button.addEventListener('click',()=>api.setLanguage(button.dataset.language));
  return api;
}
