/* LIFE OS 9.1.1 — Calm Hierarchy runtime
   One consolidated runtime for stability, accessibility, PWA, feedback and page polish.
*/
(function(){
  'use strict';
  const VERSION='9.1.1';
  const root=document.documentElement;
  window.LIFE_BUILD={version:VERSION,name:'Calm Hierarchy Edition'};
  window.LIFE_SINGLE_FILE=false;
  root.dataset.lifeVersion=VERSION;
  root.dataset.lifeDesign='8.2';
  root.dataset.lifePolish='titanium-luxe';
  root.dataset.lifeVisualPlan=root.dataset.lifeVisualPlan||'FREE';

  const safeGet=(k,f='')=>{try{const v=localStorage.getItem(k);return v===null?f:v}catch(_){return f}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(_){return false}};


  /* Interaction watchdog: if a click stalls the main thread, fall back to a lighter visual mode for this session. */
  let interactionProbe=0;
  const enableInteractionSafeMode=()=>{
    if(root.classList.contains('life-interaction-safe')) return;
    root.classList.add('life-interaction-safe');
    try{sessionStorage.setItem('life_interaction_safe','1')}catch(_){ }
  };
  try{if(sessionStorage.getItem('life_interaction_safe')==='1')root.classList.add('life-interaction-safe')}catch(_){ }
  document.addEventListener('click',()=>{
    const started=performance.now();
    const seq=++interactionProbe;
    setTimeout(()=>{
      if(seq!==interactionProbe)return;
      const lag=performance.now()-started;
      if(lag>260)enableInteractionSafeMode();
    },32);
  },true);
  window.lifeEnableInteractionSafeMode=enableInteractionSafeMode;
  try{
    const coarse=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
    const lowMem=Number(navigator.deviceMemory||8)<=4;
    const lowCpu=Number(navigator.hardwareConcurrency||8)<=4;
    if(coarse||lowMem||lowCpu)enableInteractionSafeMode();
  }catch(_){ }
  window.lifeScheduleUI=function(fn){
    if(typeof fn!=='function')return;
    if(window.scheduler&&typeof window.scheduler.postTask==='function'){window.scheduler.postTask(fn,{priority:'user-blocking'}).catch(()=>setTimeout(fn,0));return;}
    requestAnimationFrame(()=>setTimeout(fn,0));
  };

  /* Premium visual morph: sweeps metallic PRO treatment across the interface. */
  let proSweepTimer=0;
  window.lifeTriggerProMorph=function(){
    try{
      root.classList.remove('life-pro-sweep-active');
      void root.offsetWidth;
      root.classList.add('life-pro-sweep-active');
      clearTimeout(proSweepTimer);
      proSweepTimer=setTimeout(()=>root.classList.remove('life-pro-sweep-active'),1350);
    }catch(_){ }
  };
  const isVisible=el=>{if(!el)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&el.getClientRects().length>0};
  try{if(!window.CSS)window.CSS={};if(typeof window.CSS.escape!=='function')window.CSS.escape=value=>String(value??'').replace(/[^a-zA-Z0-9_-]/g,ch=>'\\'+ch.codePointAt(0).toString(16)+' ')}catch(_){ }

  /* Diagnostics: keep only small technical messages, never content typed by the user. */
  const errorKey='life_runtime_errors_v2';
  const storeError=(kind,value)=>{
    try{
      const parsed=(()=>{try{return JSON.parse(safeGet(errorKey,'[]'))}catch(_){return []}})();
      const list=Array.isArray(parsed)?parsed:[];
      list.unshift({kind,message:String(value?.message||value||'Erro desconhecido').slice(0,320),at:new Date().toISOString(),path:location.pathname,build:VERSION});
      safeSet(errorKey,JSON.stringify(list.slice(0,20)));
    }catch(_){ }
  };
  addEventListener('error',e=>storeError('error',e.error||e.message));
  addEventListener('unhandledrejection',e=>storeError('promise',e.reason));

  /* Dynamic viewport variables for mobile browser chrome. */
  function syncViewport(){
    const vv=window.visualViewport;
    const h=vv?vv.height:innerHeight;
    const w=vv?vv.width:innerWidth;
    const top=vv?vv.offsetTop:0;
    root.style.setProperty('--life-vh',(h*.01)+'px');
    root.style.setProperty('--life-window-h',h+'px');
    root.style.setProperty('--life-window-w',w+'px');
    root.style.setProperty('--life-vv-top',top+'px');
  }
  syncViewport();
  addEventListener('resize',syncViewport,{passive:true});
  if(window.visualViewport){
    visualViewport.addEventListener('resize',syncViewport,{passive:true});
    visualViewport.addEventListener('scroll',syncViewport,{passive:true});
  }

  /* Device / input mode. */
  try{
    if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)root.classList.add('life-standalone');
    if(/iP(hone|od|ad)/.test(navigator.userAgent))root.classList.add('life-ios');
    if(matchMedia('(pointer:coarse)').matches)root.classList.add('life-touch');
  }catch(_){ }
  let keyboardMode=false;
  addEventListener('keydown',e=>{if(e.key==='Tab'&&!keyboardMode){keyboardMode=true;root.classList.add('life-keyboard')}} ,true);
  addEventListener('pointerdown',()=>{if(keyboardMode){keyboardMode=false;root.classList.remove('life-keyboard')}},{passive:true,capture:true});


  /* Accessible names for dynamic form controls. React owns behavior; this only fills missing names. */
  function lifeEnsureAccessibleNames(scope=document){
    try{
      scope.querySelectorAll('input,textarea,select').forEach(el=>{
        if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))return;
        if(el.id&&document.querySelector('label[for="'+CSS.escape(el.id)+'"]'))return;
        if(el.closest&&el.closest('label'))return;
        const placeholder=(el.getAttribute('placeholder')||'').trim();
        const title=(el.getAttribute('title')||'').trim();
        const name=(el.getAttribute('name')||'').replace(/[_-]+/g,' ').trim();
        const type=String(el.getAttribute('type')||'').toLowerCase();
        const fallback=el.tagName==='SELECT'?'Selecionar opção':type==='time'?'Selecionar horário':type==='date'?'Selecionar data':type==='number'?'Digite um valor':'Campo do LIFE';
        el.setAttribute('aria-label',placeholder||title||name||fallback);
      });
    }catch(_){ }
  }
  lifeEnsureAccessibleNames();

  /* Network status with a small non-blocking status pill. */
  let networkPill=null,networkTimer=0;
  function showNetwork(text,kind){
    if(!networkPill){
      networkPill=document.createElement('div');
      networkPill.id='life-network-pill';
      networkPill.setAttribute('role','status');
      networkPill.setAttribute('aria-live','polite');
      document.body.appendChild(networkPill);
    }
    networkPill.className='life-network-pill '+(kind||'');
    networkPill.textContent=text;
    requestAnimationFrame(()=>networkPill.classList.add('show'));
    clearTimeout(networkTimer);
    if(kind!=='offline') networkTimer=setTimeout(()=>networkPill&&networkPill.classList.remove('show'),2200);
  }
  function syncNetwork(initial=false){
    const online=navigator.onLine!==false;
    root.dataset.network=online?'online':'offline';
    root.classList.toggle('life-offline',!online);
    if(!initial)showNetwork(online?'Conexão restaurada':'Você está offline',online?'online':'offline');
  }
  syncNetwork(true);
  addEventListener('online',()=>syncNetwork(false));
  addEventListener('offline',()=>syncNetwork(false));


  let a11yIdle=0,a11yQueue=[];
  const flushA11y=()=>{a11yIdle=0;const batch=a11yQueue.splice(0);batch.forEach(node=>{try{lifeEnsureAccessibleNames(node)}catch(_){}});};
  const lifeA11yObserver=new MutationObserver(muts=>{
    for(const m of muts)for(const node of (m.addedNodes||[]))if(node&&node.nodeType===1)a11yQueue.push(node);
    if(!a11yQueue.length||a11yIdle)return;
    a11yIdle=(window.requestIdleCallback?requestIdleCallback(flushA11y,{timeout:260}):setTimeout(flushA11y,80));
  });
  lifeA11yObserver.observe(document.body,{childList:true,subtree:true});

  /* System-wide area DNA: each app keeps one LIFE language with its own restrained identity. */
  const areaDNA={
    'Hoje':{name:'Today OS',accent:'#ff8b3d',rgb:'255,139,61',symbol:'sunny'},
    'Tarefas':{name:'Action OS',accent:'#72a7ff',rgb:'114,167,255',symbol:'checklist'},
    'Notas':{name:'Notes OS',accent:'#c79cff',rgb:'199,156,255',symbol:'edit_note'},
    'Estudos':{name:'Study OS',accent:'#64d5ff',rgb:'100,213,255',symbol:'school'},
    'Guia de Estudos':{name:'Study OS',accent:'#64d5ff',rgb:'100,213,255',symbol:'school'},
    'Fitness':{name:'Fitness OS',accent:'#9be578',rgb:'155,229,120',symbol:'fitness_center'},
    'Receitas':{name:'Kitchen OS',accent:'#ffbd6b',rgb:'255,189,107',symbol:'restaurant'},
    'Finanças':{name:'Money OS',accent:'#63dfaa',rgb:'99,223,170',symbol:'account_balance_wallet'},
    'IA':{name:'LIFE AI',accent:'#b8a0ff',rgb:'184,160,255',symbol:'auto_awesome'},
    'Life':{name:'Planner OS',accent:'#ff8f7d',rgb:'255,143,125',symbol:'route'},
    'Evolução':{name:'Insights OS',accent:'#7ab8ff',rgb:'122,184,255',symbol:'insights'},
    'Biblioteca':{name:'Library OS',accent:'#9fa8ff',rgb:'159,168,255',symbol:'local_library'},
    'Favoritos':{name:'Launcher OS',accent:'#ff7fb1',rgb:'255,127,177',symbol:'favorite'},
    'Meu LIFE':{name:'Personal OS',accent:'#d7dde8',rgb:'215,221,232',symbol:'person'},
    'Archive':{name:'Archive OS',accent:'#a9b2bf',rgb:'169,178,191',symbol:'inventory_2'},
    'Perfil':{name:'Account OS',accent:'#e2bd89',rgb:'226,189,137',symbol:'account_circle'},
    'Configurações':{name:'Account OS',accent:'#aab4c2',rgb:'170,180,194',symbol:'settings'},
    'Tutorial':{name:'Academy OS',accent:'#7fc6ff',rgb:'127,198,255',symbol:'school'}
  };
  let areaAnnouncer=null;
  function announceArea(area){
    try{
      if(!areaAnnouncer){areaAnnouncer=document.createElement('div');areaAnnouncer.id='life-area-announcer';areaAnnouncer.className='life-sr-only';areaAnnouncer.setAttribute('aria-live','polite');areaAnnouncer.setAttribute('aria-atomic','true');document.body.appendChild(areaAnnouncer);}
      const meta=areaDNA[area]||{name:area};
      areaAnnouncer.textContent='Área '+(meta.name||area)+' aberta.';
    }catch(_){ }
  }

  /* Current app identity: title, data attribute and restrained enter transition. */
  const titleMap={
    'Hoje':'Today OS','Tarefas':'Action OS','Notas':'Notes OS','Estudos':'Study OS','Guia de Estudos':'Study OS','Fitness':'Fitness OS','Receitas':'Kitchen OS','Finanças':'Money OS','IA':'LIFE AI','Life':'Planner OS','Evolução':'Insights OS','Biblioteca':'Library OS','Favoritos':'Launcher OS','Meu LIFE':'Personal OS','Archive':'Archive OS','Perfil':'Account OS','Configurações':'Account OS','Tutorial':'Academy OS'
  };
  let lastArea='';
  function syncArea(){
    const app=document.querySelector('.v18[data-life-view], [data-life-view].v18');
    if(!app)return;
    const area=app.getAttribute('data-life-view')||'Hoje';
    if(area===lastArea)return;
    lastArea=area;
    root.dataset.lifeArea=area;
    const dna=areaDNA[area]||areaDNA['Hoje'];
    root.style.setProperty('--life-area-accent',dna.accent);
    root.style.setProperty('--life-area-rgb',dna.rgb);
    root.style.setProperty('--life-area-label', '"'+String(dna.name||area).toUpperCase().replace(/"/g,'')+'"');
    root.dataset.lifeAreaSymbol=dna.symbol||'';
    document.title='LIFE OS · '+(titleMap[area]||area);
    announceArea(area);
    app.classList.remove('life-exceptional-enter');
    requestAnimationFrame(()=>app.classList.add('life-exceptional-enter'));
    setTimeout(()=>app.classList.remove('life-exceptional-enter'),360);
  }

  /* Modal state + accessible focus management. */
  const modalSelectors=[
    '.v18-sheetwrap','.v18-overlay','.life-how-overlay','.life-ai-quickwrap','.life-ai-confirm','.life-notification-overlay','.life-pro-preview-overlay','.life-pro-paywall','.life-fit35-review-modal','.life-mobile-more','.life-commitments-overlay','#life-owner-panel[aria-hidden="false"]','.life-context-help-v68','.life-study-topic-modal','.v27-modal'
  ];
  let lastTopModal=null,lastFocus=null,modalRaf=0;
  function modalCandidates(){
    const all=[];
    modalSelectors.forEach(sel=>document.querySelectorAll(sel).forEach(x=>{if(isVisible(x)&&!all.includes(x))all.push(x)}));
    document.querySelectorAll('[role="dialog"]').forEach(x=>{if(isVisible(x)&&!all.includes(x))all.push(x)});
    return all;
  }
  function syncModal(){
    modalRaf=0;
    const list=modalCandidates();
    const top=list[list.length-1]||null;
    document.body.classList.toggle('life-modal-open',!!top);
    if(top){
      if(!top.hasAttribute('role'))top.setAttribute('role','dialog');
      top.setAttribute('aria-modal','true');
      if(top!==lastTopModal){
        lastFocus=document.activeElement;
        lastTopModal=top;
        setTimeout(()=>{
          if(!isVisible(top))return;
          const auto=top.querySelector('[autofocus],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),button:not([disabled]),a[href]');
          if(auto && !top.contains(document.activeElement))try{auto.focus({preventScroll:true})}catch(_){ }
        },50);
      }
    }else if(lastTopModal){
      const restore=lastFocus;
      lastTopModal=null;lastFocus=null;
      if(restore&&document.contains(restore)&&typeof restore.focus==='function')setTimeout(()=>{try{restore.focus({preventScroll:true})}catch(_){ }},30);
    }
  }
  let controlsQueue=[];
  const observer=new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='childList')for(const node of (r.addedNodes||[]))if(node&&node.nodeType===1)controlsQueue.push(node);
    }
    if(!modalRaf)modalRaf=setTimeout(()=>{
      modalRaf=0;syncModal();syncArea();
      const batch=controlsQueue.splice(0,24);batch.forEach(node=>enhanceControls(node));
      controlsQueue.length=0;
    },48);
  });
  // Do not observe every class/style mutation: React changes those constantly and it caused repeated full-DOM work.
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-hidden','data-life-view']});

  document.addEventListener('keydown',e=>{
    if(e.key==='Tab'){
      const list=modalCandidates(),top=list[list.length-1];
      if(top){
        const focusables=Array.from(top.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(isVisible);
        if(focusables.length){
          const first=focusables[0],last=focusables[focusables.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        }
      }
    }
    if(e.key==='Escape'){
      const list=modalCandidates(),top=list[list.length-1];
      if(!top)return;
      const btn=Array.from(top.querySelectorAll('[data-close],button[aria-label*="Fechar" i],button[aria-label*="close" i],.life-pro-paywall-close,.life-mobile-more-head button,.life-ai-quick-head>button,.lov-close')).find(isVisible);
      if(btn){e.preventDefault();btn.click();}
    }
  });

  /* Prevent disabled UI from leaking clicks and provide a consistent tactile press state. */
  let pressed=null;
  document.addEventListener('pointerdown',e=>{
    const b=e.target?.closest?.('button,[role="button"]');
    if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
    pressed=b;b.classList.add('life70-pressed');
  },{passive:true});
  const clearPressed=()=>{if(pressed){pressed.classList.remove('life70-pressed');pressed=null}};
  document.addEventListener('pointerup',clearPressed,{passive:true});
  document.addEventListener('pointercancel',clearPressed,{passive:true});
  const inferProSource=(button)=>{
    if(!button)return 'manual';
    const explicit=button.dataset?.lifeProSource||button.closest?.('[data-life-pro-source]')?.dataset?.lifeProSource;
    if(explicit)return explicit;
    const text=String(button.textContent||'').toLowerCase();
    if(text.includes('treino')||text.includes('fitness'))return text.includes('exerc')?'fitness_exercises':'treino_personalizado';
    if(text.includes('receita')||text.includes('cozinha')||text.includes('kitchen'))return 'recipe_finder';
    if(text.includes('estud')||text.includes('study')||text.includes('mapa'))return text.includes('mapa')?'estudos_knowledge_map':'estudos_mastery';
    if(text.includes('finan')||text.includes('money'))return 'financas_analise';
    if(text.includes('ai')||text.includes('memória')||text.includes('workspace'))return 'ai_workspace';
    const area=document.querySelector('.v18[data-life-view]')?.getAttribute('data-life-view')||'';
    return ({'Fitness':'treino_personalizado','Receitas':'recipe_finder','Estudos':'estudos_mastery','Finanças':'financas_analise','IA':'ai_workspace','Evolução':'area_Evolução','Biblioteca':'library_full','Archive':'archive','Meu LIFE':'meu_life','Life':'planner'})[area]||'header';
  };
  const looksLikeProButton=(button)=>{
    if(!button||button.closest('.life-pro-paywall,.life-pro-preview-overlay,.life-pro-activation'))return false;
    if(button.dataset?.lifeProSource)return true;
    const t=String(button.textContent||'').toUpperCase();
    return /(^|\s)(PRO|LIFE OS PRO)(\s|$|·|→)/.test(t)||t.includes('DESBLOQUEAR')||t.includes('CONHECER O PRO')||t.includes('VER TUDO DO PRO')||t.includes('RECURSO PRO');
  };
  const fallbackProCopy=(source)=>{
    const key=String(source||'header').toLowerCase();
    if(key.includes('treino')||key.includes('fitness'))return ['FITNESS OS PRO','Uma semana completa, personalizada e acompanhada.','Treinos, corrida/cardio, biblioteca de exercícios, progressão e conexão com Evolução.'];
    if(key.includes('recipe')||key.includes('nutrition')||key.includes('cozinha'))return ['KITCHEN OS PRO','Sua cozinha vira parte do planejamento.','Despensa, receitas compatíveis, compras, favoritos e planos alimentares conectados.'];
    if(key.includes('estudo')||key.includes('study')||key.includes('knowledge'))return ['STUDY OS PRO','Aprender com trilha, prática e domínio.','Mapa de conhecimento, revisão, testes, progresso e próximos passos claros.'];
    if(key.includes('financ')||key.includes('money'))return ['MONEY OS PRO','Do registro à decisão.','Orçamento, metas, análises, recorrências e biblioteca prática completa.'];
    if(key.includes('ai'))return ['LIFE AI PRO','IA com contexto do seu LIFE.','Workspace, memória permitida, planejamento e ações conectadas às outras áreas.'];
    if(key.includes('evol'))return ['INSIGHTS OS PRO','Veja o que realmente está mudando.','Histórico, comparações, tendências e evolução cruzando seus apps.'];
    if(key.includes('library')||key.includes('biblioteca'))return ['LIBRARY OS PRO','Todo o conteúdo em um só hub.','Guias, exercícios, programas, receitas e atalhos completos.'];
    return ['LIFE OS PRO','Veja como o LIFE fica quando o sistema inteiro é desbloqueado.','Apps completos, histórico, personalização, inteligência e conexões entre áreas.'];
  };
  const removeRuntimeProFallback=()=>document.querySelectorAll('.life-runtime-pro-fallback').forEach(x=>x.remove());
  const openRuntimeProPlans=(source)=>{
    removeRuntimeProFallback();
    const layer=document.createElement('div');
    layer.className='life-runtime-pro-fallback life-runtime-pro-plans';
    layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');
    layer.innerHTML='<section><button class="life-runtime-pro-close" type="button" aria-label="Fechar">×</button><small>LIFE OS / PRO</small><h2>Escolha depois de entender o que muda.</h2><p>O FREE continua com o básico. O PRO libera as microáreas, bibliotecas, histórico completo, personalização e conexões inteligentes.</p><div class="life-runtime-pro-compare"><article><b>FREE</b><strong>R$ 0</strong><span>Entrada essencial</span><span>Amostras dos apps</span><span>Dados preservados</span></article><article class="pro"><b>PRO</b><strong>R$ 29,90/mês</strong><span>Apps completos</span><span>IA + contexto + histórico</span><span>Fitness, Study, Money e Kitchen completos</span></article></div><footer><button class="ghost" type="button">CONTINUAR NO FREE</button><button class="primary" type="button">DESBLOQUEAR LIFE OS PRO →</button></footer></section>';
    document.body.appendChild(layer);
    const close=()=>layer.remove();
    layer.addEventListener('click',e=>{if(e.target===layer)close()});
    layer.querySelector('.life-runtime-pro-close').onclick=close;
    layer.querySelector('footer .ghost').onclick=close;
    layer.querySelector('footer .primary').onclick=()=>{try{if(typeof window.lifeStartProCheckout==='function')window.lifeStartProCheckout();else window.dispatchEvent(new CustomEvent('life:open-pro-plans',{detail:{source}}));}catch(err){storeError('pro-checkout-fallback',err)}};
  };
  const openRuntimeProPreview=(source)=>{
    removeRuntimeProFallback();
    const [eyebrow,title,text]=fallbackProCopy(source);
    const layer=document.createElement('div');
    layer.className='life-runtime-pro-fallback';
    layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');
    layer.innerHTML='<section><button class="life-runtime-pro-close" type="button" aria-label="Fechar">×</button><small></small><h2></h2><p></p><div class="life-runtime-pro-demo"><div><b>01</b><span>Abra o recurso completo</span></div><div><b>02</b><span>Personalize para sua rotina</span></div><div><b>03</b><span>Acompanhe e conecte com o LIFE</span></div></div><div class="life-runtime-pro-benefit"><b>NA PRÁTICA</b><span>Você vê a experiência antes de decidir assinar.</span></div><footer><button class="ghost" type="button">CONTINUAR NO FREE</button><button class="primary" type="button">VER PLANOS E ASSINAR →</button></footer></section>';
    layer.querySelector('small').textContent=eyebrow;
    layer.querySelector('h2').textContent=title;
    layer.querySelector('section>p').textContent=text;
    document.body.appendChild(layer);
    const close=()=>layer.remove();
    layer.addEventListener('click',e=>{if(e.target===layer)close()});
    layer.querySelector('.life-runtime-pro-close').onclick=close;
    layer.querySelector('footer .ghost').onclick=close;
    layer.querySelector('footer .primary').onclick=()=>{close();try{if(typeof window.lifeOpenProPlans==='function')window.lifeOpenProPlans(source);else window.dispatchEvent(new CustomEvent('life:open-pro-plans',{detail:{source}}));}catch(err){storeError('pro-plans-runtime',err)}setTimeout(()=>{if(!document.querySelector('.life-pro-paywall'))openRuntimeProPlans(source)},140)};
  };
  document.addEventListener('click',e=>{
    const disabled=e.target?.closest?.('[aria-disabled="true"],button:disabled');
    if(disabled){e.preventDefault();e.stopPropagation();return;}
    const b=e.target?.closest?.('button,[role="button"]');
    if(b&&!b.disabled){
      b.classList.add('life70-ack');setTimeout(()=>b.classList.remove('life70-ack'),260);
      try{if(navigator.vibrate&&matchMedia('(pointer:coarse)').matches)navigator.vibrate(5)}catch(_){ }
      if(b.dataset?.lifeProAction==='plans'){
        const source=inferProSource(b);
        try{if(typeof window.lifeOpenProPlans==='function')window.lifeOpenProPlans(source);else window.dispatchEvent(new CustomEvent('life:open-pro-plans',{detail:{source}}));}catch(err){storeError('pro-plans-fallback',err)}
        setTimeout(()=>{if(!document.querySelector('.life-pro-paywall'))openRuntimeProPlans(source)},140);
      }else if(looksLikeProButton(b)){
        const source=inferProSource(b);
        if(!b.dataset.lifeProSource)b.dataset.lifeProSource=source;
        try{if(typeof window.lifeOpenProPreview==='function')window.lifeOpenProPreview(source);else window.dispatchEvent(new CustomEvent('life:open-pro-preview',{detail:{source}}));}catch(err){storeError('pro-preview-fallback',err)}
        setTimeout(()=>{if(!document.querySelector('.life-pro-preview-overlay,.life-pro-paywall'))openRuntimeProPreview(source)},140);
      }
    }
  },true);

  /* Scroll polish. */
  let scrollRaf=0;
  function syncScroll(){scrollRaf=0;root.classList.toggle('life-scrolled',scrollY>24);root.style.setProperty('--life-scroll-y',Math.min(1,scrollY/420).toFixed(3));}
  addEventListener('scroll',()=>{if(!scrollRaf)scrollRaf=requestAnimationFrame(syncScroll)},{passive:true});
  syncScroll();

  /* Fine pointer ambient position, used only by subtle CSS lighting. */
  try{
    if(matchMedia('(pointer:fine)').matches){
      let px=innerWidth*.5,py=innerHeight*.2,raf=0;
      addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;root.style.setProperty('--life-pointer-x',px+'px');root.style.setProperty('--life-pointer-y',py+'px');});},{passive:true});
    }
  }catch(_){ }

  /* Keyboard shortcuts and authentication form quality. */
  addEventListener('keydown',e=>{
    const tag=(e.target?.tagName||'').toLowerCase();
    if(e.key==='/'&&!['input','textarea','select'].includes(tag)){
      const btn=document.querySelector('button[aria-label="Abrir busca global"]');
      if(btn){e.preventDefault();btn.click();}
    }
  });
  function authEnter(id,buttonId){const el=document.getElementById(id),btn=document.getElementById(buttonId);if(el&&btn&&!el.dataset.lifeEnter){el.dataset.lifeEnter='1';el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();btn.click();}})}}
  function enhanceAuth(){
    authEnter('la-password','la-login');authEnter('la-signup-password2','la-create-account');authEnter('la-recovery-email','la-send-recovery');authEnter('la-new-pass2','la-save-pass');
    document.querySelectorAll('[data-life-pass-toggle]').forEach(btn=>{
      if(btn.dataset.bound)return;btn.dataset.bound='1';
      btn.addEventListener('click',()=>{const input=document.getElementById(btn.dataset.lifePassToggle);if(!input)return;const showing=input.type==='text';input.type=showing?'password':'text';btn.setAttribute('aria-pressed',String(!showing));btn.querySelector('.material-symbols-rounded')?.replaceChildren(document.createTextNode(showing?'visibility':'visibility_off'));});
    });
  }

  /* Add missing accessible names to icon-only buttons without touching visible copy. */
  const iconLabels={close:'Fechar',search:'Buscar',add:'Adicionar',more_horiz:'Mais opções',more_vert:'Mais opções',settings:'Configurações',arrow_back:'Voltar',chevron_left:'Voltar',chevron_right:'Avançar',notifications:'Notificações',favorite:'Favoritos',delete:'Excluir',edit:'Editar',play_arrow:'Iniciar',pause:'Pausar'};
  function enhanceControls(scope=document){
    enhanceAuth();
    const buttons=[];
    if(scope&&scope.nodeType===1&&scope.matches?.('button'))buttons.push(scope);
    const q=scope&&scope.querySelectorAll?scope:document;
    q.querySelectorAll('button').forEach(btn=>buttons.push(btn));
    buttons.forEach(btn=>{
      if(btn.hasAttribute('aria-label')||String(btn.textContent||'').trim().length>18)return;
      const icon=btn.querySelector(':scope > .material-symbols-rounded,:scope > span.material-symbols-rounded');
      if(!icon)return;
      const key=String(icon.textContent||'').trim();
      if(iconLabels[key])btn.setAttribute('aria-label',iconLabels[key]);
    });
  }

  /* PWA install/update. */
  let installPrompt=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;dispatchEvent(new CustomEvent('life:pwa-ready'));});
  addEventListener('appinstalled',()=>{installPrompt=null;safeSet('life_pwa_installed','1');window.lifeProductEvent&&window.lifeProductEvent('pwa_installed',{});});
  window.lifeInstallPWA=async function(){
    if(matchMedia&&matchMedia('(display-mode: standalone)').matches)return true;
    if(!installPrompt)return false;
    try{installPrompt.prompt();const choice=await installPrompt.userChoice;installPrompt=null;return choice?.outcome==='accepted'}catch(e){storeError('pwa-install',e);return false}
  };
  if('serviceWorker' in navigator){
    const hadController=!!navigator.serviceWorker.controller;
    let reloaded=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!hadController||reloaded)return;
      reloaded=true;
      const key='life_sw_reload_8_4_2';
      try{if(sessionStorage.getItem(key)==='1')return;sessionStorage.setItem(key,'1')}catch(_){ }
      location.reload();
    });
    addEventListener('load',()=>{
      navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(reg=>{window.LIFE_SERVICE_WORKER=reg;reg.update().catch(()=>{});}).catch(err=>storeError('service-worker',err));
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{syncArea();syncModal();enhanceControls();});
  syncArea();syncModal();enhanceControls();
})();
