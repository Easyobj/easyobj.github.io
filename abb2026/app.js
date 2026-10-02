(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const HOME_ASSETS = Array.from({length:17},(_,i)=>`assets/home/layer_${i+1}.webp`);
  const CRITICAL_HOME_ASSETS = [
    'assets/home/layer_1.webp',   // background
    'assets/home/layer_14.webp',  // saucer
    'assets/home/layer_2.webp',   // scene 01
    'assets/home/layer_3.webp',   // badge 01
    'assets/home/layer_4.webp',   // scene 02
    'assets/home/layer_5.webp',   // badge 02
    'assets/home/layer_16.webp'   // rules button
  ];
  const DEFERRED_HOME_ASSETS = HOME_ASSETS.filter(src => !CRITICAL_HOME_ASSETS.includes(src));

  function preloadImage(src, {decode=false}={}){
    return new Promise(resolve => {
      const im = new Image();
      im.onload = async () => {
        if(decode && im.decode){
          try { await im.decode(); } catch {}
        }
        resolve(src);
      };
      im.onerror = () => resolve(src);
      im.src = src;
    });
  }

  function preloadDeferredHome(){
    const run = () => DEFERRED_HOME_ASSETS.forEach(src => preloadImage(src));
    if('requestIdleCallback' in window){
      requestIdleCallback(run, {timeout:1800});
    } else {
      setTimeout(run, 500);
    }
  }


  const DATA = {
    1:{
      type:'multi',
      title:'PoWa应用展示区',
      hero:'assets/home/layer_2.webp',
      intro:[
        '自去年ABB机器人在中国市场率先发布高速PoWa协作机器人系列以来，该系列凭借卓越的工业级性能收获广泛市场认可。今年工博会，ABB机器人持续拓展PoWa产品矩阵，涵盖各负载型号。',
        '在ABB机器人协作机器人专区，您可以看到 PoWa 机器人实现以下哪三种应用？'
      ],
      note:'（多选）',
      correct:['A','C','D'],
      options:[['A','上下料'],['B','喷涂'],['C','焊接'],['D','码垛'],['E','组装']]
    },
    2:{
      type:'single',
      title:'搭载OmniCore™ EyeMotion的一体化压铸件检测方案',
      hero:'assets/home/layer_4.webp',
      intro:[
        '依托 ABB机器人日益丰富的物理AI工具链，AI 视觉模型经过训练、部署并持续迭代优化，机器人能够对大型汽车一体化压铸件展开高速、高精度的表面缺陷检测。',
        '在物理 AI 赋能的一体化压铸件检测方案中，ABB 机器人使用到的软件方案是？'
      ],
      note:'（单选）',
      correct:'C',
      options:[['A','PickMaster® Lite & Wizard简易编程软件'],['B','PickMaster® Lite & RobotStudio HyperReality'],['C','OmniCore EyeMotion & AI Robot Trainer'],['D','OmniCore EyeMotion & 高速定位软件']]
    },
    3:{
      type:'judge',
      title:'ABB机器人原装备品备件',
      hero:'assets/home/layer_6.webp',
      intro:['ABB原装备品备件是保障机器人稳定运行、延长使用寿命的重要一环。以下说法，你觉得是对还是错？'],
      questions:[
        'ABB原装备件只提供6个月质保。',
        'ABB在全球有3大配送中心，保证备件及时供应。',
        '使用非原装备件也能获得ABB最佳的性能和总拥有成本。',
        'ABB备件带有激光刻字和OIOC技术，便于验证真伪。',
        'ABB原装备件旨在最大程度提高机器人的可靠性和正常运行时间。'
      ],
      correct:[false,true,false,true,true],
      tip:'可进入 ABB机器人 Connected Care 展区寻找答案哦！'
    },
    4:{
      type:'textarea',
      title:'机器人视觉AI绘画师',
      hero:'assets/home/layer_8.webp',
      intro:[
        '在今年的展台，我们能看到一台可自主移动、能现场拍照、实时手绘人像的智能艺术机器人。它由 ABB 机器人渠道合作伙伴领志科技打造，集成了 AGV 自主移动、机器视觉感知、AI 图像结构化算法与 ABB YuMi 机器人协灵活控制，实现了“人像采集—图像重构—机械手绘”的全流程自动化闭环，打破了传统设备固定作业的局限，让艺术创作不再受场地束缚。',
        '这样“AGV + 视觉 + 机械臂”的结合，您还希望能够应用到什么行业或应用中？'
      ],
      maxLength:200
    },
    5:{
      type:'single',
      title:'制药机说明书与包装盒上料站',
      hero:'assets/home/layer_10.webp',
      intro:['如果您在制药厂工作，希望实现制药机说明书和包装盒的自动上料，以下哪种方案是最优的解决方案？'],
      correct:'B',
      options:[['A','使用单一吸盘抓取所有物料'],['B','使用CRB 1810机器人 + 真空/气动复合抓手 + 多功能物料小车'],['C','人工上料'],['D','使用AGV小车替代机器人']],
      tip:'您可前往 ABB机器人渠道合作伙伴华太机器人的料箱识别机器人解决方案展区，寻找答案哦！'
    }
  };
  const homeView = $('#homeView');
  const interactionView = $('#interactionView');
  const stage = $('#interactionStage');
  const ui = $('#interactionUI');
  const backBtn = $('#interactionBack');
  const toast = $('#toast');
  let homeScrollY = 0;
  let currentScene = null;
  let currentState = null;

  /* ---------- Loading：仅加载首屏关键资源 ---------- */
  const loader = $('#loader'), bar = $('#loaderBar'), pct = $('#loaderPct');
  document.body.classList.add('booting');
  let loaded = 0;
  const totalCritical = CRITICAL_HOME_ASSETS.length;
  const done = () => {
    bar.style.width='100%'; pct.textContent='100%';
    setTimeout(()=>{
      loader.classList.add('hide');
      document.body.classList.remove('booting');
      document.body.classList.add('ready');
      startReveal();
      preloadDeferredHome();
    },120);
  };
  const tick = () => {
    loaded += 1;
    const p = Math.min(100, Math.round(loaded/totalCritical*100));
    bar.style.width = p+'%'; pct.textContent=p+'%';
    if(loaded >= totalCritical) done();
  };
  CRITICAL_HOME_ASSETS.forEach(src => preloadImage(src).then(tick));

  /* ---------- 首页动效：进入视口才入场；离开视口暂停持续动画 ---------- */
  let revealObserver, motionObserver;
  function startReveal(){
    const revealTargets = $$('.js-reveal');
    if('IntersectionObserver' in window){
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('in');
          revealObserver.unobserve(el);
        });
      }, {root:null, rootMargin:'22% 0px', threshold:0.01});
      revealTargets.forEach(el => revealObserver.observe(el));

      motionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-motion-active', entry.isIntersecting));
      }, {root:null, rootMargin:'16% 0px', threshold:0.01});
      $$('.scene,.saucer').forEach(el => motionObserver.observe(el));
    } else {
      revealTargets.forEach(el=>el.classList.add('in'));
      $$('.scene,.saucer').forEach(el=>el.classList.add('is-motion-active'));
    }
  }

  function press(el,on){ if(el && !el.disabled) el.classList.toggle('is-pressed',on); }
  document.addEventListener('pointerdown',e=>{const el=e.target.closest('.scene,.utility,.pressable'); if(el) press(el,true)});
  ['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,e=>{
    const el=e.target.closest?.('.scene,.utility,.pressable');
    if(!el) return;
    press(el,false);
    if(el.classList.contains('scene')){el.classList.remove('is-released'); void el.offsetWidth; el.classList.add('is-released'); setTimeout(()=>el.classList.remove('is-released'),260)}
  },true));

  /* ---------- SPA view switching ---------- */
  function setView(name, {push=true}={}){
    const toInteraction = name === 'interaction';
    homeView.classList.toggle('is-active', !toInteraction);
    interactionView.classList.toggle('is-active', toInteraction);
    homeView.setAttribute('aria-hidden', toInteraction ? 'true':'false');
    interactionView.setAttribute('aria-hidden', toInteraction ? 'false':'true');
    if(push){
      history.pushState(toInteraction ? {view:'interaction',scene:currentScene}:{view:'home'}, '', toInteraction ? `#scene-${currentScene}` : '#home');
    }
  }

  function openScene(id, {push=true}={}){
    if(id >=1 && id <=5){
      homeScrollY = window.scrollY;
      currentScene = id;
      renderInteraction(id);
      setView('interaction',{push});
      window.scrollTo(0,0);
    } else if(id===6){
      openModal('SCENE 06','机器人激光焊接演示站','06 的正式互动稿尚未接入；首页点击与整体微动已保留。');
    } else if(id===7){
      openModal('SCENE 07','社交媒体关注站','关注 ABB Robotics 的内容渠道。', true);
    }
  }

  function closeInteraction({fromPop=false}={}){
    currentScene = null;
    ui.innerHTML = '';
    setView('home',{push:!fromPop});
    requestAnimationFrame(()=>window.scrollTo(0,homeScrollY));
  }

  backBtn.addEventListener('click',()=>history.back());
  window.addEventListener('popstate',e=>{
    const st=e.state;
    if(st?.view==='interaction' && st.scene){ openScene(Number(st.scene), {push:false}); }
    else closeInteraction({fromPop:true});
  });

  $$('.scene[data-scene]').forEach(el=>el.addEventListener('click',()=>openScene(Number(el.dataset.scene))));

  function renderInteraction(id){
    const data=DATA[id];
    const ratio = id===3 ? 3118/1563 : 2780/1563;
    stage.style.height = `${7.5*ratio}rem`;
    ui.className=`interaction-ui ui-scene-${id}`;
    ui.innerHTML='';
    currentState={submitted:false};

    const head=document.createElement('header');
    head.className='interaction-head';
    head.innerHTML=`<h1 class="interaction-title">${data.title}</h1><img class="interaction-hero" src="${data.hero}" alt="">`;

    const card=document.createElement('section');
    card.className='interaction-card';
    const copy=document.createElement('div');
    copy.className='interaction-copy';
    data.intro.forEach((txt,i)=>{
      const p=document.createElement('p');
      if(i===data.intro.length-1) p.classList.add('question');
      p.textContent=txt;
      if(i===data.intro.length-1 && data.note){
        const note=document.createElement('span');
        note.className='question-note';
        note.textContent=' '+data.note;
        p.append(note);
      }
      copy.append(p);
    });
    card.append(copy);
    ui.append(head,card);

    if(data.type==='single' || data.type==='multi') renderChoice(id,data,card);
    else if(data.type==='judge') renderJudge(id,data,card);
    else renderTextarea(id,data,card);

    if(data.tip){
      const tip=document.createElement('div');
      tip.className='interaction-tip';
      tip.innerHTML=`<span class="tip-icon" aria-hidden="true"></span><span><span class="tip-label">温馨提示：</span>${data.tip}</span>`;
      ui.append(tip);
    }
  }

  function renderChoice(id,data,card){
    currentState.selected = data.type==='multi' ? new Set() : null;
    const options=document.createElement('div'); options.className='quiz-options';
    options.innerHTML=data.options.map(([k,t])=>`<button class="quiz-option pressable" type="button" data-key="${k}">${k}. ${t}</button>`).join('');
    const submit=document.createElement('button'); submit.className='quiz-submit pressable'; submit.type='button'; submit.disabled=true; submit.textContent='提交';
    card.append(options,submit);
    options.addEventListener('click',e=>{
      if(currentState.submitted) return;
      const btn=e.target.closest('[data-key]'); if(!btn) return;
      const key=btn.dataset.key;
      if(data.type==='single'){
        currentState.selected=key;
        $$('.quiz-option',options).forEach(x=>x.classList.toggle('selected',x.dataset.key===key));
      }else{
        currentState.selected.has(key)?currentState.selected.delete(key):currentState.selected.add(key);
        btn.classList.toggle('selected',currentState.selected.has(key));
      }
      submit.disabled = data.type==='single' ? !currentState.selected : currentState.selected.size===0;
    });
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true; submit.disabled=true; submit.textContent='已提交';
      if(data.type==='single'){
        $$('.quiz-option',options).forEach(btn=>{const k=btn.dataset.key;if(k===data.correct)btn.classList.add('correct');if(k===currentState.selected&&k!==data.correct)btn.classList.add('wrong')});
        showToast(currentState.selected===data.correct?'回答正确':'已提交，绿色为正确答案');
      }else{
        $$('.quiz-option',options).forEach(btn=>{const k=btn.dataset.key;if(data.correct.includes(k)&&currentState.selected.has(k))btn.classList.add('correct');else if(currentState.selected.has(k)&&!data.correct.includes(k))btn.classList.add('wrong');else if(data.correct.includes(k)&&!currentState.selected.has(k))btn.classList.add('missed')});
        const ok=currentState.selected.size===data.correct.length&&data.correct.every(v=>currentState.selected.has(v));
        showToast(ok?'全部选择正确':'已提交，绿色/描边为正确项');
      }
    });
  }

  function renderJudge(id,data,card){
    currentState.selected=Array(data.correct.length).fill(null);
    const wrap=document.createElement('div');
    wrap.className='judge-list';
    wrap.innerHTML=data.questions.map((q,i)=>`
      <div class="judge-item">
        <div class="judge-q">${q}</div>
        <div class="judge-row">
          <button class="judge-btn pressable" type="button" data-i="${i}" data-v="true"><span class="judge-box"></span>正确</button>
          <button class="judge-btn pressable" type="button" data-i="${i}" data-v="false"><span class="judge-box"></span>错误</button>
        </div>
      </div>`).join('');
    const submit=document.createElement('button');
    submit.className='quiz-submit pressable'; submit.type='button'; submit.disabled=true; submit.textContent='提交';
    card.append(wrap,submit);
    wrap.addEventListener('click',e=>{
      if(currentState.submitted)return;
      const b=e.target.closest('[data-i]'); if(!b)return;
      const i=Number(b.dataset.i), v=b.dataset.v==='true'; currentState.selected[i]=v;
      $$(`[data-i="${i}"]`,wrap).forEach(x=>x.classList.toggle('selected',(x.dataset.v==='true')===v));
      submit.disabled=currentState.selected.some(v=>v===null);
    });
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true; submit.disabled=true; submit.textContent='已提交';
      let score=0;
      data.correct.forEach((ans,i)=>{
        if(currentState.selected[i]===ans)score++;
        $$(`[data-i="${i}"]`,wrap).forEach(b=>{
          const v=b.dataset.v==='true';
          if(v===ans)b.classList.add('correct-answer');
          if(v===currentState.selected[i]&&v!==ans)b.classList.add('wrong-answer');
        });
      });
      showToast(`已完成 ${score}/${data.correct.length} 题`);
    });
  }

  function renderTextarea(id,data,card){
    const wrap=document.createElement('div');
    wrap.className='answer-wrap';
    wrap.innerHTML=`<label class="answer-label" for="answerText">您的回答：</label>
      <textarea id="answerText" class="answer-textarea" maxlength="${data.maxLength}" placeholder=""></textarea>
      <div class="answer-count"><span>0</span> / ${data.maxLength}</div>`;
    const submit=document.createElement('button');
    submit.className='quiz-submit pressable'; submit.type='button'; submit.disabled=true; submit.textContent='提交';
    card.append(wrap,submit);
    const ta=$('textarea',wrap), count=$('.answer-count span',wrap);
    ta.addEventListener('input',()=>{count.textContent=ta.value.length; submit.disabled=!ta.value.trim()});
    ta.addEventListener('focus',()=>setTimeout(()=>ta.scrollIntoView({block:'center',behavior:'smooth'}),180));
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;ta.disabled=true;submit.disabled=true;submit.textContent='已提交';showToast('您的回答已提交');
    });
  }

  /* ---------- Modal ---------- */
  const modal=$('#modal'), kicker=$('#modalKicker'), modalTitle=$('#modalTitle'), modalBody=$('#modalBody');
  function openModal(k,t,d,social=false){
    kicker.textContent=k;modalTitle.textContent=t;
    modalBody.innerHTML=`<p class="sheet__desc">${d}</p>${social?'<div class="social-row"><button class="social-btn">微博</button><button class="social-btn">抖音</button><button class="social-btn">B站</button></div>':''}`;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  }
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
  $$('[data-close]',modal).forEach(x=>x.addEventListener('click',closeModal));
  $('[data-action="rules"]').addEventListener('click',()=>{kicker.textContent='ACTIVITY';modalTitle.textContent='活动规则';modalBody.innerHTML='<ol class="rule-list"><li><i>1</i><span>浏览展区并完成互动任务。</span></li><li><i>2</i><span>按活动现场最终规则参与答题与兑奖。</span></li><li><i>3</i><span>正式活动时间、奖项和兑奖条件可继续接入后台配置。</span></li></ol>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')});
  $('[data-action="prize"]').addEventListener('click',()=>{kicker.textContent='PRIZE';modalTitle.textContent='兑奖中心';modalBody.innerHTML='<div class="empty"><b>兑奖中心</b><p>当前为前端展示状态，后续可接入登录、积分、奖品库存与核销接口。</p></div>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')});

  let toastTimer;
  function showToast(msg){clearTimeout(toastTimer);toast.textContent=msg;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)}

  // 初始化 SPA 路由：直接刷新 #scene-N 时仍能恢复互动页；返回首页不触发 Loading。
  const routeMatch = location.hash.match(/^#scene-([1-5])$/);
  if(routeMatch){
    const id = Number(routeMatch[1]);
    history.replaceState({view:'interaction',scene:id},'', location.hash);
    currentScene = id;
    renderInteraction(id);
    setView('interaction',{push:false});
    window.scrollTo(0,0);
  }else{
    history.replaceState({view:'home'},'', '#home');
  }

  // 字体缓存：Service Worker 只做运行时缓存，不预下载 Bold。
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
})();
