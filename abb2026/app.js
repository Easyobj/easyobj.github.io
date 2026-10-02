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
        resolve({src,ok:true});
      };
      im.onerror = () => resolve({src,ok:false});
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
    },
    6:{
      type:'single',
      title:'机器人激光焊接演示站',
      hero:'assets/home/layer_12.webp',
      intro:[
        '该工作站由 ABB 机器人渠道合作伙伴——厦门航天思尔特打造，搭载 ABB IRB 1300 工业机器人，展示了面向金属工件的自动化连接需求，结合焊缝位置规划焊接路径，并集成机器人、激光焊接头与工装夹具的一体化工艺。',
        '请问下图中哪一款机器人是 IRB 1300？'
      ],
      correct:'D',
      options:[
        ['A','选项 A','assets/scene6/option-a.png'],
        ['B','选项 B','assets/scene6/option-b.png'],
        ['C','选项 C','assets/scene6/option-c.png'],
        ['D','选项 D','assets/scene6/option-d.png']
      ]
    },
    7:{
      type:'social',
      title:'社交媒体关注站',
      hero:'assets/home/layer_15.webp',
      intro:['关注 ABB 机器人官方社交媒体账号，解锁更多机器人资讯与精彩内容。'],
      channels:[
        {name:'微博',image:'assets/social/weibo.png',instruction:'搜索“ABB机器人”，进入官方微博并点击关注。'},
        {name:'抖音',image:'assets/social/douyin.png',instruction:'打开抖音搜索“ABB机器人”，进入官方账号并点击关注。'},
        {name:'B站',image:'assets/social/bilibili.png',instruction:'搜索“ABB机器人官方”，进入官方账号并点击关注。'}
      ]
    }
  };
  const homeView = $('#homeView');
  const interactionView = $('#interactionView');
  const ui = $('#interactionUI');
  const backBtn = $('#interactionBack');
  const toast = $('#toast');
  const appRoot = $('#app');
  const STORAGE_KEY = 'abb-robotics-h5-progress-v1';
  let homeScrollY = 0;
  let currentScene = null;
  let currentState = null;

  function readProgress(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  let progress = readProgress();
  function getSceneProgress(id){ return progress[id] || {}; }
  function saveSceneProgress(id, value){
    progress[id] = {...getSceneProgress(id), ...value};
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { showToast('浏览器未允许本机保存，本次进度仅在当前页面有效'); }
  }

  /* ---------- Loading：仅加载首屏关键资源 ---------- */
  const loader = $('#loader'), bar = $('#loaderBar'), pct = $('#loaderPct');
  document.body.classList.add('booting');
  let loaded = 0;
  let failedCritical = 0;
  const totalCritical = CRITICAL_HOME_ASSETS.length;
  const done = () => {
    bar.style.width='100%'; pct.textContent='100%';
    setTimeout(()=>{
      loader.classList.add('hide');
      document.body.classList.remove('booting');
      document.body.classList.add('ready');
      startReveal();
      preloadDeferredHome();
      if(failedCritical) showToast(`有 ${failedCritical} 项关键资源加载失败，请刷新重试`);
    },120);
  };
  const tick = result => {
    loaded += 1;
    if(!result.ok) failedCritical += 1;
    const p = Math.min(100, Math.round(loaded/totalCritical*100));
    bar.style.width = p+'%'; pct.textContent=p+'%';
    if(loaded >= totalCritical) done();
  };
  CRITICAL_HOME_ASSETS.forEach(src => preloadImage(src,{decode:true}).then(tick));

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
      setTimeout(()=>{
        revealTargets.forEach(el=>{
          const rect=el.getBoundingClientRect();
          if(rect.top<window.innerHeight*1.25&&rect.bottom>0)el.classList.add('in');
        });
      },900);
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
      history.pushState(toInteraction ? {view:'interaction',scene:currentScene,fromHome:true}:{view:'home'}, '', toInteraction ? `#scene-${currentScene}` : '#home');
    }
  }

  function openScene(id, {push=true}={}){
    if(id >=1 && id <=7){
      homeScrollY = window.scrollY;
      currentScene = id;
      renderInteraction(id);
      setView('interaction',{push});
      window.scrollTo(0,0);
    }
  }

  function closeInteraction({fromPop=false}={}){
    currentScene = null;
    ui.innerHTML = '';
    setView('home',{push:!fromPop});
    requestAnimationFrame(()=>window.scrollTo(0,homeScrollY));
  }

  backBtn.addEventListener('click',()=>{
    if(history.state?.fromHome){
      history.back();
      return;
    }
    closeInteraction({fromPop:true});
    history.replaceState({view:'home'},'', '#home');
  });
  window.addEventListener('popstate',e=>{
    const st=e.state;
    if(st?.view==='interaction' && st.scene){ openScene(Number(st.scene), {push:false}); }
    else closeInteraction({fromPop:true});
  });

  $$('.scene[data-scene]').forEach(el=>el.addEventListener('click',()=>openScene(Number(el.dataset.scene))));

  function renderInteraction(id){
    const data=DATA[id];
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
    else if(data.type==='textarea') renderTextarea(id,data,card);
    else renderSocial(data,card);

    if(data.tip){
      const tip=document.createElement('div');
      tip.className='interaction-tip';
      tip.innerHTML=`<span class="tip-icon" aria-hidden="true"></span><span><span class="tip-label">温馨提示：</span>${data.tip}</span>`;
      ui.append(tip);
    }
  }

  function addResultBadge(btn,text){
    const badge=document.createElement('span');
    badge.className='result-badge';
    badge.textContent=text;
    btn.append(badge);
  }

  function renderChoice(id,data,card){
    const saved=getSceneProgress(id);
    currentState.selected = data.type==='multi' ? new Set(Array.isArray(saved.selected)?saved.selected:[]) : (saved.selected || null);
    currentState.submitted=Boolean(saved.submitted);

    const options=document.createElement('div');
    const hasImages=data.options.some(([, ,src])=>Boolean(src));
    options.className=`quiz-options${hasImages?' image-options':''}`;
    options.setAttribute('role',data.type==='single'?'radiogroup':'group');
    options.setAttribute('aria-label',data.type==='single'?'请选择一个答案':'请选择一个或多个答案');
    options.innerHTML=data.options.map(([k,t,src])=>src
      ? `<button class="quiz-option image-option pressable" type="button" role="${data.type==='single'?'radio':'checkbox'}" aria-label="${t}" aria-checked="false" data-key="${k}"><span class="image-option__media"><img src="${src}" alt=""></span><span class="image-option__label">${t}</span></button>`
      : `<button class="quiz-option pressable" type="button" role="${data.type==='single'?'radio':'checkbox'}" aria-checked="false" data-key="${k}">${k}. ${t}</button>`).join('');
    const submit=document.createElement('button');
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='保存答案';
    card.append(options,submit);

    const isSelected=key=>data.type==='single'?currentState.selected===key:currentState.selected.has(key);
    const syncSelection=()=>{
      $$('.quiz-option',options).forEach(btn=>{
        const selected=isSelected(btn.dataset.key);
        btn.classList.toggle('selected',selected && !currentState.submitted);
        btn.setAttribute('aria-checked',String(selected));
      });
      submit.disabled=currentState.submitted || (data.type==='single'?!currentState.selected:currentState.selected.size===0);
    };
    const revealResults=()=>{
      $$('.quiz-option',options).forEach(btn=>{
        const key=btn.dataset.key;
        const selected=isSelected(key);
        btn.classList.remove('selected');
        btn.disabled=true;
        if(data.type==='single'){
          if(key===data.correct){btn.classList.add('correct');addResultBadge(btn,selected?'回答正确':'正确答案');}
          else if(selected){btn.classList.add('wrong');addResultBadge(btn,'您的选择');}
        }else if(data.correct.includes(key)&&selected){
          btn.classList.add('correct');addResultBadge(btn,'选择正确');
        }else if(selected&&!data.correct.includes(key)){
          btn.classList.add('wrong');addResultBadge(btn,'选择错误');
        }else if(data.correct.includes(key)){
          btn.classList.add('missed');addResultBadge(btn,'正确答案');
        }
      });
      submit.disabled=true;
      submit.textContent='已保存至本机';
    };

    syncSelection();
    if(currentState.submitted) revealResults();

    options.addEventListener('click',e=>{
      if(currentState.submitted) return;
      const btn=e.target.closest('[data-key]'); if(!btn) return;
      const key=btn.dataset.key;
      if(data.type==='single') currentState.selected=key;
      else currentState.selected.has(key)?currentState.selected.delete(key):currentState.selected.add(key);
      saveSceneProgress(id,{selected:data.type==='single'?currentState.selected:[...currentState.selected],submitted:false});
      syncSelection();
    });
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      saveSceneProgress(id,{selected:data.type==='single'?currentState.selected:[...currentState.selected],submitted:true});
      revealResults();
      const ok=data.type==='single'
        ? currentState.selected===data.correct
        : currentState.selected.size===data.correct.length&&data.correct.every(v=>currentState.selected.has(v));
      showToast(ok?'回答正确，已保存至本机':'答案已保存至本机，页面已标出正确项');
    });
  }

  function renderJudge(id,data,card){
    const saved=getSceneProgress(id);
    currentState.selected=Array.isArray(saved.selected)&&saved.selected.length===data.correct.length?saved.selected:Array(data.correct.length).fill(null);
    currentState.submitted=Boolean(saved.submitted);
    const wrap=document.createElement('div');
    wrap.className='judge-list';
    wrap.innerHTML=data.questions.map((q,i)=>`
      <div class="judge-item">
        <div class="judge-q">${q}</div>
        <div class="judge-row" role="radiogroup" aria-label="第 ${i+1} 题">
          <button class="judge-btn pressable" type="button" role="radio" aria-checked="false" data-i="${i}" data-v="true"><span class="judge-box" aria-hidden="true"></span>正确</button>
          <button class="judge-btn pressable" type="button" role="radio" aria-checked="false" data-i="${i}" data-v="false"><span class="judge-box" aria-hidden="true"></span>错误</button>
        </div>
      </div>`).join('');
    const submit=document.createElement('button');
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='保存答案';
    card.append(wrap,submit);

    const syncSelection=()=>{
      $$('[data-i]',wrap).forEach(btn=>{
        const i=Number(btn.dataset.i),v=btn.dataset.v==='true';
        const selected=currentState.selected[i]===v;
        btn.classList.toggle('selected',selected && !currentState.submitted);
        btn.setAttribute('aria-checked',String(selected));
      });
      submit.disabled=currentState.submitted||currentState.selected.some(v=>v===null);
    };
    const revealResults=()=>{
      data.correct.forEach((ans,i)=>{
        $$(`[data-i="${i}"]`,wrap).forEach(btn=>{
          const value=btn.dataset.v==='true';
          const selected=currentState.selected[i]===value;
          btn.classList.remove('selected');
          btn.disabled=true;
          if(value===ans){btn.classList.add('correct-answer');addResultBadge(btn,selected?'回答正确':'正确答案');}
          else if(selected){btn.classList.add('wrong-answer');addResultBadge(btn,'您的选择');}
        });
      });
      submit.disabled=true;
      submit.textContent='已保存至本机';
    };

    syncSelection();
    if(currentState.submitted) revealResults();
    wrap.addEventListener('click',e=>{
      if(currentState.submitted)return;
      const b=e.target.closest('[data-i]'); if(!b)return;
      const i=Number(b.dataset.i), v=b.dataset.v==='true'; currentState.selected[i]=v;
      saveSceneProgress(id,{selected:[...currentState.selected],submitted:false});
      syncSelection();
    });
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      let score=0;
      data.correct.forEach((ans,i)=>{if(currentState.selected[i]===ans)score++;});
      saveSceneProgress(id,{selected:[...currentState.selected],submitted:true,score});
      revealResults();
      showToast(`已完成 ${score}/${data.correct.length} 题，结果已保存至本机`);
    });
  }

  function renderTextarea(id,data,card){
    const saved=getSceneProgress(id);
    currentState.submitted=Boolean(saved.submitted);
    const wrap=document.createElement('div');
    wrap.className='answer-wrap';
    wrap.innerHTML=`<label class="answer-label" for="answerText">您的回答：</label>
      <textarea id="answerText" class="answer-textarea" maxlength="${data.maxLength}" placeholder=""></textarea>
      <div class="answer-count"><span>0</span> / ${data.maxLength}</div>`;
    const submit=document.createElement('button');
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='保存回答';
    card.append(wrap,submit);
    const ta=$('textarea',wrap), count=$('.answer-count span',wrap);
    ta.value=typeof saved.answer==='string'?saved.answer:'';
    count.textContent=ta.value.length;
    submit.disabled=currentState.submitted||!ta.value.trim();
    if(currentState.submitted){ta.disabled=true;submit.textContent='已保存至本机';}
    ta.addEventListener('input',()=>{
      count.textContent=ta.value.length;
      submit.disabled=!ta.value.trim();
      saveSceneProgress(id,{answer:ta.value,submitted:false});
    });
    ta.addEventListener('focus',()=>setTimeout(()=>ta.scrollIntoView({block:'center',behavior:'smooth'}),180));
    submit.addEventListener('click',()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      saveSceneProgress(id,{answer:ta.value,submitted:true});
      ta.disabled=true;submit.disabled=true;submit.textContent='已保存至本机';showToast('您的回答已保存至本机');
    });
  }

  function renderSocial(data,card){
    const list=document.createElement('div');
    list.className='social-list';
    list.setAttribute('role','list');
    list.innerHTML=data.channels.map(channel=>`
      <article class="social-card" role="listitem">
        <img class="social-card__logo" src="${channel.image}" alt="${channel.name}">
        <div><h2>${channel.name}</h2><p>${channel.instruction}</p></div>
      </article>`).join('');
    const note=document.createElement('p');
    note.className='social-note';
    note.textContent='源稿未包含可核验的账号链接，因此本页提供准确的站内搜索指引，不会跳转到未经确认的账号。';
    card.append(list,note);
  }

  /* ---------- Modal ---------- */
  const modal=$('#modal'), sheet=$('.sheet',modal), kicker=$('#modalKicker'), modalTitle=$('#modalTitle'), modalBody=$('#modalBody');
  let lastModalTrigger=null;
  function openModal(k,t,html){
    lastModalTrigger=document.activeElement instanceof HTMLElement?document.activeElement:null;
    kicker.textContent=k;modalTitle.textContent=t;modalBody.innerHTML=html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    appRoot.inert=true;
    requestAnimationFrame(()=>sheet.focus());
  }
  function closeModal(){
    if(!modal.classList.contains('open'))return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    appRoot.inert=false;
    const returnTarget=lastModalTrigger;
    lastModalTrigger=null;
    setTimeout(()=>{modalBody.innerHTML='';returnTarget?.focus();},220);
  }
  $$('[data-close]',modal).forEach(x=>x.addEventListener('click',closeModal));
  document.addEventListener('keydown',e=>{
    if(!modal.classList.contains('open'))return;
    if(e.key==='Escape'){closeModal();return;}
    if(e.key!=='Tab')return;
    const focusable=$$('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',sheet);
    if(!focusable.length){e.preventDefault();sheet.focus();return;}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  $('[data-action="rules"]').addEventListener('click',()=>openModal('ACTIVITY','体验说明','<ol class="rule-list"><li><i>1</i><span>浏览展区并完成 01～06 的互动题目。</span></li><li><i>2</i><span>07 为社交媒体关注指引，不计入本机答题进度。</span></li><li><i>3</i><span>当前进度仅保存在本机浏览器，不会上传到服务器。</span></li><li><i>4</i><span>正式活动时间、奖项、抽奖与兑奖条件以活动现场通知为准。</span></li></ol>'));
  $('[data-action="prize"]').addEventListener('click',()=>{
    const completed=Array.from({length:6},(_,i)=>Boolean(getSceneProgress(i+1).submitted)).filter(Boolean).length;
    const ready=completed===6;
    openModal('PRIZE','兑奖中心',`<div class="progress-summary"><b>互动完成进度</b><strong>${completed} / 6</strong><div class="progress-track" aria-label="已完成 ${completed} 个，共 6 个"><span style="width:${completed/6*100}%"></span></div></div><div class="empty"><b>${ready?'已完成全部互动':'尚未完成全部互动'}</b><p>${ready?'源稿中的下一步为抽奖与兑奖。当前版本没有奖品库存、随机抽奖或工作人员核销接口，因此不会生成虚假的中奖结果；请由活动现场工作人员操作。':'完成 01～06 后可查看现场抽奖与兑奖安排。当前进度只保存在本机。'}</p></div>`);
  });

  let toastTimer;
  function showToast(msg){
    clearTimeout(toastTimer);
    toast.textContent=msg;
    toast.classList.add('show');
    toastTimer=setTimeout(()=>{
      toast.classList.remove('show');
      setTimeout(()=>{if(!toast.classList.contains('show'))toast.textContent='';},200);
    },2200);
  }

  // 初始化 SPA 路由：直接刷新 #scene-N 时仍能恢复互动页；返回首页不触发 Loading。
  const routeMatch = location.hash.match(/^#scene-([1-7])$/);
  if(routeMatch){
    const id = Number(routeMatch[1]);
    history.replaceState({view:'interaction',scene:id,fromHome:false},'', location.hash);
    currentScene = id;
    renderInteraction(id);
    setView('interaction',{push:false});
    window.scrollTo(0,0);
  }else{
    history.replaceState({view:'home'},'', '#home');
  }

  // 字体缓存：Service Worker 只做运行时缓存，不预下载 Bold。
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('Service Worker 注册失败',error)));
  }
})();
