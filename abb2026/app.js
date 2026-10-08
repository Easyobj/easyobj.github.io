(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const HOME_ASSETS = Array.from({length:17},(_,i)=>`assets/home/layer_${i+1}.webp`);
  const PRIZE_IMAGE_BY_CODE = Object.freeze({
    'canvas-bag':'assets/prizes/canvas-bag.png',
    'blind-box':'assets/prizes/blind-box.png',
    'robot-phone-stand':'assets/prizes/robot-phone-stand.png',
    'mouse-pad':'assets/prizes/mouse-pad.png',
    'fe-car-model':'assets/prizes/fe-car-model.png',
    'abb-power-strip':'assets/prizes/abb-power-strip.png',
    'notebook':'assets/prizes/notebook.png'
  });
  const PRIZE_ITEMS = (window.ABB_PRIZE_PLAN?.items||[]).map(item=>({
    ...item,
    image:PRIZE_IMAGE_BY_CODE[item.code]||''
  })).filter(item=>item.image);
  const STATIC_ASSETS = [
    'favicon.svg',
    'assets/ui/abb-robotics-loader-v5931.png',
    'assets/fonts/ABBvoice_CNSG_Rg.woff2',
    'assets/fonts/ABBvoice_CNSG_Bd.woff2',
    ...HOME_ASSETS,
    ...['a','b','c','d'].map(key=>`assets/scene6/option-${key}-psd-v598.webp`),
    'assets/social/weibo.png','assets/social/douyin.png','assets/social/bilibili.png','assets/social/social-guide.webp',
    ...Object.values(PRIZE_IMAGE_BY_CODE),
    'assets/states/result-correct.webp','assets/states/result-fail.webp','assets/states/all-complete.webp',
    'assets/states/lottery.webp','assets/states/lottery-win.webp','assets/states/lottery-lose.webp','assets/states/activity-ended.webp',
    'assets/ui/interaction-background-v595.webp','assets/ui/tip-v595.webp'
  ];

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

  async function preloadStaticAsset(src){
    if(/\.(?:png|jpe?g|webp|svg)$/i.test(src))return preloadImage(src,{decode:true});
    try{
      const response=await fetch(src,{cache:'force-cache'});
      if(!response.ok)throw new Error(String(response.status));
      await response.arrayBuffer();
      return {src,ok:true};
    }catch{return {src,ok:false};}
  }


  const DATA = {
    1:{
      type:'multi',
      title:'PoWa应用展示区',
      hero:'assets/home/layer_2.webp',
      intro:[
        '自去年ABB机器人在中国市场率先发布高速PoWa协作机器人系列以来，该系列凭借卓越的工业级性能收获广泛市场认可。今年工博会，ABB机器人持续拓展PoWa产品矩阵，涵盖各负载型号。',
        '在ABB 机器人协作机器人专区，您可以看到 PoWa 机器人实现以下哪三种应用？'
      ],
      note:'（多选）',
      options:[['A','上下料'],['B','喷涂'],['C','焊接'],['D','码垛'],['E','组装']]
    },
    2:{
      type:'single',
      title:'搭载OmniCore™ Eyemotion的一体化压铸件检测方案',
      titleLines:['搭载OmniCore™','Eyemotion的一体化','压铸件检测方案'],
      hero:'assets/home/layer_4.webp',
      intro:[
        '依托 ABB机器人日益丰富的物理AI工具链，AI 视觉模型经过训练、部署并持续迭代优化，机器人能够对大型汽车一体化压铸铸件展开高速、高精度的表面缺陷检测。',
        '在物理 AI 赋能的一体化压铸件检测方案中，ABB 机器人使用到的软件方案是？'
      ],
      note:'（单选）',
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
      tip:'可进入 ABB机器人 Connected Care 展区寻找答案噢！'
    },
    4:{
      type:'textarea',
      title:'机器人视觉AI绘画师',
      hero:'assets/home/layer_8.webp',
      intro:[
        '在今年的展台，我们能看到一台可自主移动、能现场拍照、实时手绘人像的智能艺术机器人。它由ABB机器人渠道合作伙伴领志科技打造，集成了AGV自主移动、机器视觉感知、AI图像结构化算法与ABB YuMi机器人的灵活控制，实现了“人像采集—图像重构—机械手绘”的全流程自动化闭环，打破了传统设备固定作业的局限，让艺术创作不再受场地束缚。',
        '这样“AGV + 视觉 + 机械臂”的结合，您还希望能够应用到什么行业或应用中？'
      ],
      maxLength:200
    },
    5:{
      type:'single',
      title:'制药机说明书与包装盒上料站',
      titleLines:['制药机说明书与包装盒','上料站'],
      hero:'assets/home/layer_10.webp',
      intro:['如果您在制药厂工作，希望实现制药机说明书和包装盒的自动上料，以下哪种方案是最优的解决方案？'],
      options:[['A','使用单一吸盘抓取所有物料'],['B','使用CRB 1810机器人 + 真空/气动复合抓手 + 多功能物料小车'],['C','人工上料'],['D','使用AGV小车替代机器人']],
      tip:'您可前往 ABB机器人渠道合作伙伴华太机器人的料箱识别机器人解决方案展区，寻找答案噢！'
    },
    6:{
      type:'single',
      title:'机器人激光焊接演示站',
      hero:'assets/home/layer_12.webp',
      intro:[
        '该工作站由ABB机器人渠道合作伙伴——厦门航天思尔特打造，搭载ABB IRB 1300工业机器人，展示了面向金属工件的自动化连接需求，结合焊缝位置规划焊接路径，并集成机器人、激光焊接头与工装夹具的一体化工艺。',
        '请问下图中哪一款机器人是IRB 1300？'
      ],
      options:[
        ['A','选项 A','assets/scene6/option-a-psd-v598.webp'],
        ['B','选项 B','assets/scene6/option-b-psd-v598.webp'],
        ['C','选项 C','assets/scene6/option-c-psd-v598.webp'],
        ['D','选项 D','assets/scene6/option-d-psd-v598.webp']
      ]
    },
    7:{
      type:'social',
      title:'社交媒体关注站',
      hero:'assets/home/layer_15.webp',
      intro:['关注 ABB 机器人官方社交媒体账号，解锁更多机器人资讯与精彩内容。'],
      channels:[
        {name:'微博',image:'assets/social/weibo.png',imageAlt:'微博',instruction:'搜索“ABB机器人”，核对官方认证后关注'},
        {name:'抖音',image:'assets/social/douyin.png',imageAlt:'抖音',instruction:'搜索“ABB机器人”，核对官方认证后关注'},
        {name:'哔哩哔哩',image:'assets/social/bilibili.png',imageAlt:'哔哩哔哩',instruction:'搜索“ABB机器人”，核对官方认证后关注'}
      ]
    }
  };
  const homeView = $('#homeView');
  const interactionView = $('#interactionView');
  const badgeView = $('#badgeView');
  const statusView = $('#statusView');
  const ui = $('#interactionUI');
  const backBtn = $('#interactionBack');
  const statusStage = $('#statusStage');
  const statusArtwork = $('#statusArtwork');
  const statusAction = $('#statusAction');
  const statusBack = $('#statusBack');
  const statusSafety = $('#statusSafety');
  const statusPrize = $('#statusPrize');
  const statusRedemption = $('#statusRedemption');
  const lotteryMachine = $('#lotteryMachine');
  const lotteryNotice = $('#lotteryNotice');
  const badgeBack = $('#badgeBack');
  const badgePageSummary = $('#badgePageSummary');
  const badgePageGrid = $('#badgePageGrid');
  const badgePageAction = $('#badgePageAction');
  const toast = $('#toast');
  const appRoot = $('#app');
  const STORAGE_KEY = 'abb-robotics-h5-progress-v1';
  const runtime = Object.freeze({
    release:'development',
    serverRendered:false,
    ...(window.ABB_RUNTIME || {})
  });
  const renderedState = window.ABB_SERVER_STATE && typeof window.ABB_SERVER_STATE === 'object'
    ? window.ABB_SERVER_STATE
    : null;
  const pageState = {
    serverRendered:Boolean(runtime.serverRendered && renderedState),
    user:renderedState?.user||null,
    draw:renderedState?.draw||null,
    claimConfirmation:renderedState?.claimConfirmation||null,
    drawPaused:Boolean(renderedState?.drawPaused),
    activity:renderedState?.activity||null,
    drawWindow:renderedState?.drawWindow||null,
    lotteryAvailability:renderedState?.lotteryAvailability||null,
    badgeSummary:renderedState?.badgeSummary||null,
    flash:renderedState?.flash||null
  };
  const voucherClockStart=performance.now();
  const voucherWallStart=Date.now();
  const voucherServerTime=Number(renderedState?.serverTime);
  const navigation=performance.getEntriesByType('navigation')[0];
  const voucherLoadElapsed=navigation?.responseStart>0?Math.max(0,voucherClockStart-navigation.responseStart):0;
  let homeScrollY = 0;
  let currentScene = null;
  let currentState = null;
  let currentStatus = null;
  const animateNewDraw=Boolean(pageState.serverRendered&&pageState.draw&&pageState.flash?.code==='draw_created');
  let newDrawAnimationStarted=false;

  const STATUS_VIEWS = {
    'result-correct':{asset:'result-correct.webp',alt:'恭喜回答正确',action:'收下徽章'},
    'result-fail':{asset:'result-fail.webp',alt:'很遗憾，本次回答未通过',action:'返回首页'},
    'all-complete':{asset:'all-complete.webp',alt:'恭喜您已全部通关',action:'参与抽奖'},
    'lottery':{asset:'lottery.webp',alt:'幸运老虎机抽奖',action:'立即抽奖',safety:'交互预览 · 正式活动由服务器校验资格和实时库存'},
    'lottery-win':{asset:'lottery-win.webp',alt:'中奖结果设计预览',action:'兑换礼品',safety:'设计预览 · 不代表真实中奖或奖品库存'},
    'lottery-lose':{asset:'lottery-lose.webp',alt:'未中奖结果设计预览',safety:'设计稿预览 · 正式活动有库存时 100% 中奖；暂停或库存不足会显示对应状态，不产生随机未中奖记录。'},
    'activity-ended':{asset:'activity-ended.webp',alt:'今日活动已结束'}
  };

  function readProgress(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if(!parsed || typeof parsed !== 'object')return {};
      let migrated=false;
      for(let id=1;id<=6;id++){
        const saved=parsed[id];
        if(!saved || (pageState.serverRendered && typeof saved.passed==='boolean'))continue;
        // Static previews never grade or grant badges. PHP records override
        // browser drafts in the real activity; legacy drafts cannot grant access.
        saved.passed=false;
        saved.submitted=false;
        migrated=true;
      }
      if(migrated)localStorage.setItem(STORAGE_KEY,JSON.stringify(parsed));
      return parsed;
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

  function serverProgressToLocal(serverProgress){
    const merged={};
    for(let id=1;id<=6;id++){
      const remote=serverProgress?.[String(id)];
      const draft=getSceneProgress(id);
      if(!remote){
        merged[id]={...draft,submitted:false,passed:false};
        continue;
      }
      const value={submitted:Boolean(remote.submitted),passed:Boolean(remote.passed)};
      if(id===4)value.answer=typeof remote.answer==='string'?remote.answer:'';
      else value.selected=remote.answer;
      merged[id]=value;
    }
    progress=merged;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{}
  }

  if(pageState.serverRendered)serverProgressToLocal(renderedState.progress||{});

  function savedLabel(){return pageState.serverRendered?'已提交':'已保存至本机';}

  function submitServerForm(action,fields={}){
    const form=$('#serverActionForm');
    if(!form)throw new Error('页面提交功能暂不可用，请刷新后重试。');
    const key=action==='answer'?`answer-${fields.station}`:action;
    const token=renderedState?.formChallenges?.[key];
    if(!token)throw new Error('提交凭证不可用，请稍后刷新页面。已保存进度不会丢失。');
    const values={action,station:'',answer_json:'',...fields,form_token:token};
    Object.entries(values).forEach(([name,value])=>{
      const input=form.elements.namedItem(name);
      if(input)input.value=String(value);
    });
    form.submit();
  }

  async function submitAnswer(station,answer){
    if(!pageState.serverRendered)throw new Error('当前为设计预览，不执行判题；请在正式微信活动页面提交。');
    submitServerForm('answer',{station,answer_json:JSON.stringify(answer)});
    return new Promise(()=>{});
  }

  /* ---------- Loading：首次进入前完整加载活动素材 ---------- */
  const loader = $('#loader'), bar = $('#loaderBar'), pct = $('#loaderPct'), loaderRetry=$('#loaderRetry');
  document.body.classList.add('booting');
  async function loadAllAssets(){
    let loaded=0;
    loaderRetry.hidden=true;
    bar.style.width='0%';pct.textContent='0%';
    const results=await Promise.all(STATIC_ASSETS.map(src=>preloadStaticAsset(src).then(result=>{
      loaded+=1;
      const value=Math.round(loaded/STATIC_ASSETS.length*100);
      bar.style.width=`${value}%`;pct.textContent=`${value}%`;
      return result;
    })));
    const failed=results.filter(result=>!result.ok);
    if(failed.length){
      pct.textContent=`${failed.length} 项素材加载失败`;
      loaderRetry.hidden=false;
      return;
    }
    if(document.fonts){
      await Promise.all([
        document.fonts.load('400 16px "ABBvoice CNSG"'),
        document.fonts.load('700 16px "ABBvoice CNSG"')
      ]);
    }
    bar.style.width='100%';pct.textContent='100%';
    setTimeout(()=>{
      loader.classList.add('hide');
      document.body.classList.remove('booting');
      document.body.classList.add('ready');
      startReveal();
      if(animateNewDraw)startNewDrawAnimation();
    },120);
  }
  loaderRetry.addEventListener('click',loadAllAssets);
  loadAllAssets();

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
  function activateView(name){
    [[homeView,'home'],[interactionView,'interaction'],[badgeView,'badges'],[statusView,'status']].forEach(([view,key])=>{
      const active=name===key;
      view.classList.toggle('is-active',active);
      view.setAttribute('aria-hidden',active?'false':'true');
    });
  }

  function setView(name, {push=true}={}){
    const toInteraction = name === 'interaction';
    activateView(toInteraction?'interaction':'home');
    if(push){
      history.pushState(toInteraction ? {view:'interaction',scene:currentScene,fromHome:true}:{view:'home'}, '', toInteraction ? `#scene-${currentScene}` : '#home');
    }
  }

  function prizeByCode(code){
    return PRIZE_ITEMS.find(item=>item.code===code)||null;
  }

  function prizeCell(item){
    return `<span class="lottery-reel__item"><img src="${item.image}" alt="${escapeHtml(item.name)}"></span>`;
  }

  function renderLotteryMachine(){
    if(!lotteryMachine||!PRIZE_ITEMS.length)return;
    lotteryMachine.className='lottery-machine';
    lotteryMachine.removeAttribute('aria-busy');
    lotteryMachine.innerHTML=[0,1,2].map(index=>`<span class="lottery-reel"><span class="lottery-reel__track">${prizeCell(PRIZE_ITEMS[index%PRIZE_ITEMS.length])}</span></span>`).join('');
  }

  function spinLotteryMachine(finalCodes,{preview=false,onComplete}={}){
    if(!lotteryMachine||!PRIZE_ITEMS.length){if(onComplete)onComplete();return 0;}
    const codes=Array.isArray(finalCodes)?finalCodes:[finalCodes,finalCodes,finalCodes];
    lotteryMachine.className=`lottery-machine is-spinning${preview?' is-preview':''}`;
    lotteryMachine.setAttribute('aria-busy','true');
    const tracks=codes.map((code,reelIndex)=>{
      const target=prizeByCode(code)||PRIZE_ITEMS[(reelIndex+3)%PRIZE_ITEMS.length];
      const turns=22+reelIndex*5;
      const sequence=Array.from({length:turns},(_,index)=>PRIZE_ITEMS[(index+reelIndex*2)%PRIZE_ITEMS.length]);
      sequence.push(target);
      return {sequence,target};
    });
    lotteryMachine.innerHTML=tracks.map(({sequence})=>`<span class="lottery-reel"><span class="lottery-reel__track">${sequence.map(prizeCell).join('')}</span></span>`).join('');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const durations=tracks.map((_,index)=>reduced?80:(preview?900+index*260:1450+index*430));
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      $$('.lottery-reel__track',lotteryMachine).forEach((track,index)=>{
        track.style.transition=`transform ${durations[index]}ms cubic-bezier(.12,.74,.18,1)`;
        track.style.transform=`translate3d(0,${-(tracks[index].sequence.length-1)*2.04}rem,0)`;
      });
    }));
    const total=Math.max(...durations)+260;
    setTimeout(()=>{
      lotteryMachine.classList.remove('is-spinning');
      lotteryMachine.removeAttribute('aria-busy');
      if(onComplete)onComplete();
    },total);
    return total;
  }

  function startNewDrawAnimation(){
    if(newDrawAnimationStarted||!animateNewDraw||!pageState.draw)return;
    newDrawAnimationStarted=true;
    const winner=pageState.draw.prize?.code;
    statusBack.disabled=true;
    statusAction.disabled=true;
    lotteryNotice.hidden=true;
    spinLotteryMachine(winner,{onComplete:()=>{
      statusBack.disabled=false;
      showStatus('lottery-win',{push:false});
      history.replaceState({view:'status',kind:'lottery-win',scene:null,fromHome:false},'','#lottery-win');
      if(pageState.flash?.message)showToast(pageState.flash.message);
    }});
  }

  function showStatus(kind,{push=true}={}){
    const config=STATUS_VIEWS[kind];
    if(!config)return;
    currentStatus=kind;
    statusStage.dataset.status=kind;
    delete statusStage.dataset.lotteryState;
    delete statusStage.dataset.redemptionState;
    statusArtwork.src=`assets/states/${config.asset}`;
    statusArtwork.alt=config.alt;
    statusAction.hidden=!config.action;
    statusAction.setAttribute('aria-label',config.action||'');
    statusAction.textContent=kind==='all-complete'?config.action:'';
    const realPrize=kind==='lottery-win'&&pageState.serverRendered&&pageState.draw;
    const realPrizeImage=realPrize?PRIZE_IMAGE_BY_CODE[pageState.draw.prize.code]||'':'';
    statusPrize.hidden=!realPrize;
    statusPrize.innerHTML=realPrize?`${realPrizeImage?`<img class="status-prize__image" src="${realPrizeImage}" alt="">`:''}<strong>${escapeHtml(pageState.draw.prize.name)}</strong>`:'';
    statusRedemption.hidden=true;
    statusRedemption.textContent='';
    lotteryMachine.hidden=kind!=='lottery';
    if(kind==='lottery')renderLotteryMachine();
    lotteryNotice.hidden=kind!=='lottery';
    lotteryNotice.textContent='7 种奖品 · 按实时库存抽取';
    statusArtwork.alt=realPrize?'中奖结果，礼品以您的实际中奖记录为准':config.alt;
    const hasArtworkClose=kind==='lottery-win'||kind==='lottery-lose'||kind==='activity-ended';
    statusBack.textContent=hasArtworkClose?'×':'‹';
    statusBack.setAttribute('aria-label',hasArtworkClose?'关闭结果并返回首页':'返回首页');
    let safety=config.safety||'';
    if(!pageState.serverRendered && ['result-correct','result-fail','all-complete'].includes(kind))safety='设计预览 · 不执行判题、不记录活动资格';
    if(pageState.serverRendered&&kind==='lottery'){
      statusStage.dataset.lotteryState='available';
      safety='';
      if(pageState.drawPaused){statusStage.dataset.lotteryState='paused';safety='新增抽奖已暂停；已有中奖记录仍可查看并继续现场核销。';}
      else if(!pageState.draw&&pageState.drawWindow&&!pageState.drawWindow.open){statusStage.dataset.lotteryState='closed';safety='当前未到开放时间或活动已结束，不能新增抽奖；具体日期请查看活动通知。';}
    }
    if(kind==='lottery-win')safety=pageState.serverRendered
      ? '礼品仅限中奖当天现场领取。请由现场工作人员核对中奖页面，点击“兑换礼品”确认核销后发放礼品。'
      : '设计预览 · 正式中奖后由现场工作人员在参与者手机上确认核销并发放礼品。';
    if(pageState.serverRendered&&kind==='lottery'&&!pageState.draw&&pageState.lotteryAvailability){
      if(!pageState.drawPaused&&(!pageState.drawWindow||pageState.drawWindow.open)){
        statusStage.dataset.lotteryState=pageState.lotteryAvailability.available?'available':'unavailable';
        safety=pageState.lotteryAvailability.available?(!pageState.drawWindow?.testing?'':'当前为发布前测试，正式奖品结果以活动发布后为准。'):pageState.lotteryAvailability.message;
      }
      statusAction.disabled=!pageState.lotteryAvailability.available;
      statusAction.textContent=pageState.lotteryAvailability.available?'':'暂不可抽';
    } else {statusAction.disabled=false;}
    statusSafety.hidden=!safety;
    statusSafety.textContent=safety;
    activateView('status');
    if(push)history.pushState({view:'status',kind,scene:currentScene,fromHome:true},'',`#${kind}`);
    window.scrollTo(0,0);
    updateClaimAvailability();
  }

  function progressSummary(){
    const items=Array.from({length:6},(_,i)=>getSceneProgress(i+1));
    const submitted=items.filter(item=>Boolean(item.submitted)).length;
    const badges=items.filter(item=>Boolean(item.passed)).length;
    return {submitted,badges,eligible:badges>=5};
  }

  function openScene(id, {push=true}={}){
    if(id >=1 && id <=7){
      homeScrollY = window.scrollY;
      currentScene = id;
      const saved=id<=6?getSceneProgress(id):null;
      if(saved?.submitted){
        showStatus(saved.passed?'result-correct':'result-fail',{push});
        return;
      }
      renderInteraction(id);
      setView('interaction',{push});
      window.scrollTo(0,0);
    }
  }

  function closeInteraction({fromPop=false}={}){
    currentScene = null;
    currentStatus = null;
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
    else if(st?.view==='status' && STATUS_VIEWS[st.kind]){currentScene=Number(st.scene)||null;showStatus(st.kind,{push:false});}
    else if(st?.view==='badges'){showBadgeCenter({push:false});}
    else closeInteraction({fromPop:true});
  });

  badgeBack.addEventListener('click',()=>{
    if(history.state?.fromHome){history.back();return;}
    closeInteraction({fromPop:true});
    history.replaceState({view:'home'},'', '#home');
  });

  statusBack.addEventListener('click',()=>closeInteraction());
  statusAction.addEventListener('click',async()=>{
    if(currentStatus==='result-correct'){
      const summary=progressSummary();
      if(summary.eligible||summary.submitted===6)showBadgeCenter();
      else closeInteraction();
      return;
    }
    if(currentStatus==='result-fail'){
      if(progressSummary().submitted===6)showBadgeCenter();
      else closeInteraction();
      return;
    }
    if(currentStatus==='all-complete'){
      showStatus('lottery');
      return;
    }
    if(currentStatus==='lottery'){
      if(!pageState.serverRendered){
        statusAction.disabled=true;
        lotteryNotice.hidden=true;
        const previewCodes=PRIZE_ITEMS.slice(3,6).map(item=>item.code);
        spinLotteryMachine(previewCodes,{preview:true,onComplete:()=>{
          statusAction.disabled=false;
          lotteryNotice.hidden=false;
          openModal('LOTTERY','老虎机交互预览','<div class="availability">这里演示真实转轮交互，但不会生成中奖结果。正式活动会先由服务器校验资格、实时库存并写入唯一中奖记录，再让三列转轮停在实际奖品上。</div>');
        }});
        return;
      }
      if(pageState.draw){showStatus('lottery-win');return;}
      if(!pageState.lotteryAvailability?.available){showToast(pageState.lotteryAvailability?.message||'很遗憾，当前奖品不足！');return;}
      if(!renderedState?.formChallenges?.draw){showToast('抽奖凭证不可用，请刷新后重试。');return;}
      statusAction.disabled=true;
      statusAction.textContent='抽奖中…';
      statusAction.classList.add('is-submitting');
      lotteryNotice.hidden=true;
      lotteryMachine.classList.add('is-starting');
      setTimeout(()=>submitServerForm('draw'),180);
      return;
    }
    if(currentStatus==='lottery-win'){
      if(!pageState.serverRendered||!pageState.draw){showToast('这是设计预览，不代表真实中奖结果');return;}
      showRedemptionReminder();
    }
  });

  $$('.scene[data-scene]').forEach(el=>el.addEventListener('click',()=>openScene(Number(el.dataset.scene))));

  function renderInteraction(id){
    const data=DATA[id];
    ui.className=`interaction-ui ui-scene-${id}`;
    $('#interactionStage').dataset.scene=String(id);
    ui.innerHTML='';
    currentState={submitted:false};

    const head=document.createElement('header');
    head.className='interaction-head';
    const title=document.createElement('h1');
    title.className='interaction-title';
    (data.titleLines||[data.title]).forEach((line,index)=>{
      if(index)title.append(document.createElement('br'));
      const parts=line.split('™');
      parts.forEach((part,partIndex)=>{
        title.append(document.createTextNode(part));
        if(partIndex<parts.length-1){const mark=document.createElement('sup');mark.className='trademark';mark.textContent='™';title.append(mark);}
      });
    });
    const hero=document.createElement('img');
    hero.className='interaction-hero';hero.src=data.hero;hero.alt='';
    head.append(title,hero);

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
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='提交';
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
        if(selected){btn.classList.add(saved.passed?'correct':'wrong');addResultBadge(btn,saved.passed?'回答正确':'您的选择');}
      });
      submit.disabled=true;
      submit.textContent=savedLabel();
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
    submit.addEventListener('click',async()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      const answer=data.type==='single'?currentState.selected:[...currentState.selected];
      submit.disabled=true;submit.textContent='提交中…';
      try{
        const result=await submitAnswer(id,answer);
        saveSceneProgress(id,{selected:answer,submitted:true,passed:Boolean(result.passed)});
        revealResults();
        showStatus(result.passed?'result-correct':'result-fail');
      }catch(error){
        currentState.submitted=false;
        submit.textContent='提交';
        syncSelection();
        showToast(error?.message||'提交失败，请重试');
      }
    });
  }

  function renderJudge(id,data,card){
    const saved=getSceneProgress(id);
    currentState.selected=Array.isArray(saved.selected)&&saved.selected.length===data.questions.length?saved.selected:Array(data.questions.length).fill(null);
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
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='提交';
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
      data.questions.forEach((_,i)=>{
        $$(`[data-i="${i}"]`,wrap).forEach(btn=>{
          const value=btn.dataset.v==='true';
          const selected=currentState.selected[i]===value;
          btn.classList.remove('selected');
          btn.disabled=true;
          if(selected){btn.classList.add(saved.passed?'correct-answer':'wrong-answer');addResultBadge(btn,saved.passed?'回答正确':'您的选择');}
        });
      });
      submit.disabled=true;
      submit.textContent=savedLabel();
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
    submit.addEventListener('click',async()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      const answer=[...currentState.selected];
      submit.disabled=true;submit.textContent='提交中…';
      try{
        const result=await submitAnswer(id,answer);
        saveSceneProgress(id,{selected:answer,submitted:true,passed:Boolean(result.passed)});
        revealResults();
        showStatus(result.passed?'result-correct':'result-fail');
      }catch(error){
        currentState.submitted=false;
        submit.textContent='提交';
        syncSelection();
        showToast(error?.message||'提交失败，请重试');
      }
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
    submit.className='quiz-submit pressable'; submit.type='button'; submit.textContent='提交';
    card.append(wrap,submit);
    const ta=$('textarea',wrap), count=$('.answer-count span',wrap);
    ta.value=typeof saved.answer==='string'?saved.answer:'';
    count.textContent=ta.value.length;
    submit.disabled=currentState.submitted||!ta.value.trim();
    if(currentState.submitted){ta.disabled=true;submit.textContent=savedLabel();}
    ta.addEventListener('input',()=>{
      count.textContent=ta.value.length;
      submit.disabled=!ta.value.trim();
      saveSceneProgress(id,{answer:ta.value,submitted:false});
    });
    ta.addEventListener('focus',()=>setTimeout(()=>ta.scrollIntoView({block:'center',behavior:'smooth'}),180));
    submit.addEventListener('click',async()=>{
      if(submit.disabled||currentState.submitted)return;
      currentState.submitted=true;
      ta.disabled=true;submit.disabled=true;submit.textContent='提交中…';
      try{
        const result=await submitAnswer(id,ta.value);
        saveSceneProgress(id,{answer:ta.value,submitted:true,passed:Boolean(result.passed)});
        submit.textContent=savedLabel();
        showStatus(result.passed?'result-correct':'result-fail');
      }catch(error){
        currentState.submitted=false;
        ta.disabled=false;submit.disabled=false;submit.textContent='提交';
        showToast(error?.message||'提交失败，请重试');
      }
    });
  }

  function renderSocial(data,card){
    const art=document.createElement('img');
    art.className='social-guide-art';
    art.src='assets/social/social-guide.webp';
    art.alt='';
    const list=document.createElement('div');
    list.className='social-list';
    list.setAttribute('role','list');
    list.innerHTML=data.channels.map(channel=>`
      <article class="social-card" role="listitem">
        <img class="social-card__logo" src="${channel.image}" alt="${channel.imageAlt || channel.name}">
        <div><h2>${channel.name}</h2><p>${channel.instruction}</p></div>
      </article>`).join('');
    const note=document.createElement('p');
    note.className='social-note';
    note.textContent='请在对应平台搜索“ABB机器人”，核对官方认证后关注。当前未提供可核验的官方主页链接。';
    card.append(art,list,note);
  }

  /* ---------- Modal ---------- */
  const modal=$('#modal'), sheet=$('.sheet',modal), kicker=$('#modalKicker'), modalTitle=$('#modalTitle'), modalBody=$('#modalBody');
  let lastModalTrigger=null;
  let modalCloseTimer;
  let claimExpiryTimer;
  let claimCleanup;
  function claimRemaining(confirmation){
    if(!confirmation||!window.ABBClaimCode)return 0;
    const elapsed=Math.max(performance.now()-voucherClockStart,Date.now()-voucherWallStart,0)+voucherLoadElapsed;
    return Math.min(window.ABBClaimCode.remaining(Number(confirmation.expiresAt),voucherServerTime,elapsed),awardRemaining());
  }
  function awardRemaining(){
    if(!pageState.draw)return 0;
    const elapsed=Math.max(performance.now()-voucherClockStart,Date.now()-voucherWallStart,0)+voucherLoadElapsed;
    const deadline=Number(pageState.draw.redeemBy);
    if(!Number.isFinite(deadline)||!Number.isFinite(voucherServerTime))return 0;
    return Math.max(0,Math.ceil(deadline-voucherServerTime-elapsed/1000));
  }
  let awardExpiryTimer;
  function updateClaimAvailability(){
    const draw=pageState.draw;
    if(!pageState.serverRendered||currentStatus!=='lottery-win'||!draw)return;
    const remaining=awardRemaining();
    const unavailable=Boolean(draw.redeemedAt)||remaining===0;
    statusStage.dataset.redemptionState=draw.redeemedAt?'redeemed':remaining===0?'expired':'claimable';
    statusSafety.hidden=false;
    statusSafety.textContent=draw.redeemedAt?'该奖品已核销并领取，请勿重复兑换。':remaining?'礼品仅限中奖当天现场领取。请由现场工作人员核对中奖页面，点击“兑换礼品”确认核销后发放礼品。':'当天领取期限已过，不能领取或再次抽奖。';
    statusAction.hidden=unavailable;
    statusAction.disabled=unavailable;
    statusAction.textContent='';
    statusRedemption.hidden=!unavailable;
    statusRedemption.textContent=draw.redeemedAt?'已核销':'已过期';
    if(remaining===0){const button=$('#claimConfirmButton');if(button){button.disabled=true;button.textContent='当天领取期限已过';}}
    clearTimeout(awardExpiryTimer);
    if(remaining&&!draw.redeemedAt)awardExpiryTimer=setTimeout(updateClaimAvailability,remaining*1000);
  }

  function showRedemptionReminder(){
    openModal('PRIZE','兑奖提醒',`<div class="redemption-dialog"><p class="redemption-reminder">关注ABB机器人其他社交媒体账号才能兑奖哦</p><button class="claim-button" id="redemptionContinue" type="button">继续兑奖</button><button class="secondary-button" id="redemptionCancel" type="button">暂不兑奖</button></div>`);
    $('#redemptionContinue').addEventListener('click',showStaffRedemptionConfirm);
    $('#redemptionCancel').addEventListener('click',closeModal);
  }

  function showStaffRedemptionConfirm(){
    openModal('STAFF','工作人员核销确认',`<div class="redemption-dialog"><p>请现场工作人员核对参与者本人、中奖页面和礼品。礼品交给参与者后，再选择“是”。</p><p class="redemption-warning">确认后将记录为已核销，不能重复领取。</p><div class="redemption-actions"><button class="secondary-button" id="redemptionNo" type="button">否</button><button class="claim-button" id="redemptionYes" type="button">是，确认核销</button></div></div>`);
    $('#redemptionNo').addEventListener('click',closeModal);
    $('#redemptionYes').addEventListener('click',event=>{
      try{event.currentTarget.disabled=true;submitServerForm('redeem');}
      catch(error){event.currentTarget.disabled=false;showToast(error.message);}
    });
  }
  function showClaimVoucher(){
    const draw=pageState.draw;
    if(!pageState.serverRendered||!draw)return;
    const confirmation=pageState.claimConfirmation;
    const expired=!draw.redeemedAt&&awardRemaining()===0;
    const active=!expired&&claimRemaining(confirmation)>0;
    const combined=active?window.ABBClaimCode.format(confirmation.code):'';
    const deadline='<p class="claim-hint">礼品仅限当天现场本人领取。</p>';
    const content=draw.redeemedAt
      ? '<p>该奖品已完成核销，请勿重复领取。</p>'
      : expired ? '<p>领取期限已过，不能生成核销码或再次抽奖，未领取库存保持锁定。</p>'
      : `<p>请本人现场打开自己的微信活动页面，工作人员核对资格后领取。不接受截图或代领。</p>${active?`<div class="claim-code-display"><span>核销码</span><code class="claim-code" id="liveClaimCode">${escapeHtml(combined)}</code><button class="claim-button" id="claimCopyButton" type="button">复制核销码</button></div><p id="claimCodeState" class="claim-hint" aria-live="polite">请向现场工作人员出示当前核销码。</p>`:'<p class="claim-hint">到领取现场后生成 4 位数字核销码。</p>'}<button class="claim-button" id="claimConfirmButton" type="button">${active?'刷新核销码':'生成核销码'}</button><p class="claim-hint">将完整核销码交给现场工作人员输入。刷新后旧码立即失效，请勿转发；工作人员核验后再确认核销。</p>`;
    openModal('PRIZE','本人领取核销码',`<div class="empty claim-voucher"><b>${escapeHtml(draw.prize.name)}</b>${deadline}${content}</div>`);
    $('#claimConfirmButton')?.addEventListener('click',event=>{
      try{event.currentTarget.disabled=true;submitServerForm('claim');}
      catch(error){event.currentTarget.disabled=false;showToast(error.message);}
    });
    if(active){
      $('#claimCopyButton').addEventListener('click',async()=>{
        if(claimRemaining(confirmation)===0){showToast('核销码已过期，请重新生成。');return;}
        try{
          if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
          await navigator.clipboard.writeText(combined);
          showToast('核销码已复制，请交给现场工作人员。');
        }catch{
          const range=document.createRange();range.selectNodeContents($('#liveClaimCode'));
          const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);
          showToast('请长按已选中的核销码复制，或由工作人员直接输入。');
        }
      });
      const update=()=>{
        const remaining=claimRemaining(confirmation);
        const label=$('#claimCodeState');
        if(!label)return;
        if(!remaining){
          label.textContent='核销码已过期，请重新生成。';
          $('#liveClaimCode').textContent='已过期';
          $('#claimCopyButton').disabled=true;
          const ended=awardRemaining()===0;
          $('#claimConfirmButton').textContent=ended?'领取期限已过':'重新生成核销码';
          $('#claimConfirmButton').disabled=ended;
          clearTimeout(claimExpiryTimer);
        }
      };
      update();claimExpiryTimer=setTimeout(update,Math.max(1,claimRemaining(confirmation))*1000);
      document.addEventListener('visibilitychange',update);
      window.addEventListener('pageshow',update);
      window.addEventListener('focus',update);
      claimCleanup=()=>{
        document.removeEventListener('visibilitychange',update);
        window.removeEventListener('pageshow',update);
        window.removeEventListener('focus',update);
      };
    }
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }
  function openModal(k,t,html){
    clearTimeout(modalCloseTimer);
    clearTimeout(claimExpiryTimer);
    claimCleanup?.();claimCleanup=null;
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
    clearTimeout(claimExpiryTimer);
    claimCleanup?.();claimCleanup=null;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    appRoot.inert=false;
    const returnTarget=lastModalTrigger;
    lastModalTrigger=null;
    clearTimeout(modalCloseTimer);
    modalCloseTimer=setTimeout(()=>{modalBody.innerHTML='';returnTarget?.focus();},220);
  }
  $$('[data-close]',modal).forEach(x=>x.addEventListener('click',closeModal));

  function showBadgeCenter({push=true}={}){
    const summary=progressSummary();
    const cards=Array.from({length:6},(_,index)=>{
      const id=index+1;
      const saved=getSceneProgress(id);
      const lit=Boolean(saved.passed);
      const state=lit?'已点亮':saved.submitted?'未点亮':'未作答';
      return `<span class="badge-state badge-state--${id} ${lit?'is-lit':'is-dim'}" role="img" aria-label="${String(id).padStart(2,'0')} ${escapeHtml(DATA[id].title)}，${state}"></span>`;
    }).join('');
    $('#badgePageTitle').textContent=summary.badges===6?'恭喜您已全部通关':'我的徽章';
    badgePageSummary.innerHTML=`已点亮 <strong>${summary.badges}</strong> / 6 枚徽章`;
    badgePageGrid.innerHTML=cards;
    badgePageAction.classList.toggle('has-button',Boolean(pageState.draw||summary.eligible));
    if(pageState.draw)badgePageAction.innerHTML='<button class="badge-primary" id="badgePrimary" type="button">查看中奖礼品</button>';
    else if(summary.eligible)badgePageAction.innerHTML='<button class="badge-primary" id="badgePrimary" type="button">参与抽奖</button>';
    else if(summary.submitted===6)badgePageAction.innerHTML='<p class="badge-unavailable">需要至少点亮 5 枚徽章才可抽奖。</p>';
    else badgePageAction.innerHTML=`<p class="badge-unavailable">还需完成 ${6-summary.submitted} 道题。每题只有一次作答机会。</p>`;
    activateView('badges');
    if(push)history.pushState({view:'badges',fromHome:true},'','#badges');
    window.scrollTo(0,0);
    $('#badgePrimary')?.addEventListener('click',()=>{
      const target=pageState.draw?'lottery-win':'lottery';
      showStatus(target);
    });
  }

  lotteryNotice.addEventListener('click',()=>{$('[data-action="rules"]').click();});
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
  $('[data-action="rules"]').addEventListener('click',()=>{
    const storageRule=pageState.serverRendered
      ? '答题结果提交并保存到活动服务器；浏览器只保留未提交草稿。'
      : '当前为 Pages 演示模式，进度只保存在本机浏览器。';
    const plan=window.ABB_PRIZE_PLAN;
    const prizeTable=plan?`<section class="prize-plan-summary"><h3>今年奖品计划</h3><p>按后台设置的活动开始和结束时间发奖，每日限额 ${escapeHtml(String(plan.daily))} 份，合计 ${escapeHtml(String(plan.total))} 份。下表为活动奖品计划，领取以现场核验为准。</p><table class="prize-plan"><thead><tr><th>奖品</th><th>总量</th><th>每日</th></tr></thead><tbody>${plan.items.map(p=>`<tr><td><span class="prize-plan__item"><img src="${PRIZE_IMAGE_BY_CODE[p.code]||''}" alt="">${escapeHtml(p.name)}</span></td><td>${escapeHtml(String(p.total))}</td><td>${escapeHtml(String(p.daily))}</td></tr>`).join('')}</tbody></table></section>`:'';
    openModal('ACTIVITY','活动规则与奖品',`<ol class="rule-list"><li><i>1</i><span>浏览展区完成 01～06 的互动题目，07 不计入答题进度。每题只有一次作答机会，再次进入会直接显示本题结果。</span></li><li><i>2</i><span>点亮至少 5 枚徽章后，即可参与抽奖。</span></li><li><i>3</i><span>同一微信账号整个活动只能中奖一次，次日不能再次抽奖；过期未领也不恢复机会。${storageRule}</span></li><li><i>4</i><span>礼品仅限中奖当天现场领取。参与者点击“兑换礼品”后，由现场工作人员在参与者手机上核对并确认核销，随后发放礼品。</span></li><li><i>5</i><span>兑奖前请关注 ABB 机器人其他社交媒体账号；核销确认后不能重复领取。</span></li><li><i>6</i><span>活动开始与结束时间由后台运营管理员设置，不固定持续天数。${pageState.drawWindow?.startsAt&&pageState.drawWindow?.endsAtText?`时间：${escapeHtml(pageState.drawWindow.startsAt)} 至 ${escapeHtml(pageState.drawWindow.endsAtText)}（活动时区）。`:'具体活动时间请查看正式活动通知。'}</span></li></ol>${prizeTable}`);
  });
  $('[data-action="prize"]').addEventListener('click',()=>{
    homeScrollY=window.scrollY;
    showBadgeCenter();
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
  const statusRoute=location.hash.match(/^#(result-correct|result-fail|all-complete|lottery|lottery-win|lottery-lose|activity-ended)$/);
  const badgeRoute=location.hash==='#badges';
  const routeMatch = location.hash.match(/^#scene-([1-7])$/);
  if(statusRoute){
    const kind=statusRoute[1];
    const routeScene=Number(new URLSearchParams(location.search).get('scene'))||null;
    currentScene=routeScene;
    history.replaceState({view:'status',kind,scene:routeScene,fromHome:false},'',location.hash);
    showStatus(animateNewDraw&&kind==='lottery-win'?'lottery':kind,{push:false});
  }else if(badgeRoute){
    history.replaceState({view:'badges',fromHome:false},'',location.hash);
    showBadgeCenter({push:false});
  }else if(routeMatch){
    const id = Number(routeMatch[1]);
    history.replaceState({view:'interaction',scene:id,fromHome:false},'', location.hash);
    openScene(id,{push:false});
  }else{
    history.replaceState({view:'home'},'', '#home');
  }

  if(pageState.serverRendered&&pageState.activity?.code==='ended'&&!statusRoute)showStatus('activity-ended',{push:false});
  if(pageState.serverRendered&&pageState.flash?.message&&!animateNewDraw)setTimeout(()=>showToast(pageState.flash.message),300);
  if(pageState.serverRendered&&pageState.draw){
    updateClaimAvailability();
    document.addEventListener('visibilitychange',updateClaimAvailability);
    window.addEventListener('pageshow',updateClaimAvailability);
  }

  // 字体缓存：Service Worker 只做运行时缓存，不预下载 Bold。
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('Service Worker 注册失败',error)));
  }
})();
